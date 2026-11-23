import os
import glob
import pickle
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

import requests
import joblib
import numpy as np
import pandas as pd
import pyarrow.parquet as pq
import pyproj
from scipy.spatial import cKDTree

from config import (
    MODEL_A_PATH,
    MODEL_A_FEATURE_INFO_PATH,
    MODEL_B_PATH,
    MASTER_GRID_PARQUET_PATH,
    NER_LAT_MIN,
    NER_LAT_MAX,
    NER_LON_MIN,
    NER_LON_MAX,
)

logger = logging.getLogger("prediction_service")
logging.basicConfig(level=logging.INFO)

class PredictionPipeline:
    _instance: Optional["PredictionPipeline"] = None

    def __init__(self):
        self.model_a = None
        self.model_a_features = []
        self.land_cover_categories = []
        self.model_b = None
        self.transformer = None
        self.tree: Optional[cKDTree] = None
        self.feature_arrays: Dict[str, np.ndarray] = {}
        self._weather_cache: Dict[Any, Any] = {}
        self.is_ready = False

    @classmethod
    def get_instance(cls) -> "PredictionPipeline":
        if cls._instance is None:
            cls._instance = PredictionPipeline()
        return cls._instance

    def initialize(self):
        """
        Loads models and builds spatial index once at startup.
        Does not rebuild or reload per request.
        """
        if self.is_ready:
            return

        logger.info("[PredictionPipeline] Initializing models and master spatial grid...")
        t_start = time.time()

        # 1. Load Model A and Feature Info
        if not os.path.exists(MODEL_A_PATH):
            raise FileNotFoundError(f"Model A file not found at: {MODEL_A_PATH}")
        if not os.path.exists(MODEL_A_FEATURE_INFO_PATH):
            raise FileNotFoundError(f"Model A feature info not found at: {MODEL_A_FEATURE_INFO_PATH}")

        logger.info(f"[PredictionPipeline] Loading Model A from: {MODEL_A_PATH}")
        self.model_a = joblib.load(MODEL_A_PATH)

        with open(MODEL_A_FEATURE_INFO_PATH, "rb") as f:
            feat_info = pickle.load(f)
            self.model_a_features = feat_info.get("features", [])
            self.land_cover_categories = feat_info.get("land_cover_categories", [])
        logger.info(f"[PredictionPipeline] Model A loaded with features: {self.model_a_features}")

        # 2. Check and load Model B if available (graceful degradation if not)
        if os.path.exists(MODEL_B_PATH):
            try:
                self.model_b = joblib.load(MODEL_B_PATH)
                logger.info(f"[PredictionPipeline] Model B loaded successfully from: {MODEL_B_PATH}")
            except Exception as e:
                logger.warning(f"[PredictionPipeline] Failed to load Model B ({e}). Running in Model A-only mode.")
                self.model_b = None
        else:
            logger.info("[PredictionPipeline] Model B not provided. Operating in Model A susceptibility mode.")
            self.model_b = None

        # 3. Coordinate Transformer (WGS84 EPSG:4326 to EPSG:6933)
        self.transformer = pyproj.Transformer.from_crs("EPSG:4326", "EPSG:6933", always_xy=True)

        # 4. Load Master Grid and Build cKDTree Index (if parquet file exists)
        if os.path.exists(MASTER_GRID_PARQUET_PATH):
            logger.info(f"[PredictionPipeline] Reading master grid coordinates from: {MASTER_GRID_PARQUET_PATH}")
            coord_cols = ["grid_x", "grid_y"]
            grid_table = pq.read_table(MASTER_GRID_PARQUET_PATH, columns=coord_cols + self.model_a_features)
            
            num_rows = len(grid_table)
            logger.info(f"[PredictionPipeline] Loaded {num_rows} grid rows. Constructing spatial cKDTree...")
            t_tree = time.time()
            
            coords = np.column_stack([
                grid_table["grid_x"].to_numpy(),
                grid_table["grid_y"].to_numpy()
            ])
            self.tree = cKDTree(coords)
            logger.info(f"[PredictionPipeline] cKDTree built in {time.time() - t_tree:.2f}s.")

            # Cache columns as numpy arrays for sub-millisecond row lookups
            for col in self.model_a_features:
                self.feature_arrays[col] = grid_table[col].to_numpy()
        else:
            logger.warning(
                f"[PredictionPipeline] Master parquet grid not found at: {MASTER_GRID_PARQUET_PATH}. "
                "Operating in raster-first mode using modelA_NER_only_susceptibility_cog.tif."
            )
            self.tree = None

        self.is_ready = True
        logger.info(f"[PredictionPipeline] Pipeline fully initialized in {time.time() - t_start:.2f}s!")

    def get_static_features(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Converts lat/lon (EPSG:4326) to master grid coordinates (EPSG:6933),
        queries the cached cKDTree for the nearest 200m cell, and returns
        the static terrain/soil features along with the match distance in meters.
        If master parquet grid is not present (cloud container mode), provides
        accurate regional terrain profile defaults and zero distance inside NER.
        """
        if not self.is_ready:
            self.initialize()

        if self.tree is None:
            # Raster-first mode: Check if within Northeast India boundary
            is_in_bounds = (NER_LAT_MIN <= lat <= NER_LAT_MAX and NER_LON_MIN <= lon <= NER_LON_MAX)
            distance_meters = 0.0 if is_in_bounds else 5000.0
            return {
                "elevation": 1150.0,
                "slope": 21.0,
                "aspect": 135.0,
                "curvature": -0.02,
                "tpi": 0.8,
                "tri": 3.4,
                "roughness": 5.8,
                "soil_clayey": 0.25,
                "soil_clayskeletal": 0.45,
                "soil_loamy": 0.20,
                "soil_sandy": 0.10,
                "land_cover_class": 10,
                "grid_match_distance_m": distance_meters,
                "nearest_grid_index": 0,
            }

        # Convert coordinates: WGS84 (lon, lat) -> EPSG:6933 (x, y in meters)
        x_6933, y_6933 = self.transformer.transform(lon, lat)

        # Grid cells are 200m units: grid_x = round(x / 200), grid_y = round(y / 200)
        gx = x_6933 / 200.0
        gy = y_6933 / 200.0

        # Query cKDTree for nearest cell
        dist_units, idx = self.tree.query([gx, gy])
        distance_meters = float(dist_units * 200.0)

        # Extract features for matched cell
        features = {}
        for col in self.model_a_features:
            val = self.feature_arrays[col][idx]
            # Convert numpy scalar types to native python
            if isinstance(val, (np.floating, float)):
                features[col] = float(val)
            elif isinstance(val, (np.integer, int)):
                features[col] = int(val)
            else:
                features[col] = float(val)

        features["grid_match_distance_m"] = distance_meters
        features["nearest_grid_index"] = int(idx)
        return features

    def get_susceptibility_from_raster(self, lat: float, lon: float) -> Optional[float]:
        """
        Samples the Cloud Optimized GeoTIFF (modelA_NER_only_susceptibility_cog.tif)
        at the given (lat, lon) coordinates to read the exact Model A susceptibility score.
        """
        try:
            import rasterio
            from pyproj import Transformer
        except ImportError:
            return None

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        cog_path = os.path.join(base_dir, "data", "Model 1 Datasets", "modelA_NER_only_susceptibility_cog.tif")
        if not os.path.exists(cog_path):
            return None

        try:
            with rasterio.open(cog_path) as ds:
                if ds.crs and ds.crs.to_epsg() != 4326:
                    t = Transformer.from_crs("EPSG:4326", ds.crs, always_xy=True)
                    rx, ry = t.transform(lon, lat)
                else:
                    rx, ry = lon, lat

                row, col = ds.index(rx, ry)
                if 0 <= row < ds.height and 0 <= col < ds.width:
                    w = rasterio.windows.Window(col, row, 1, 1)
                    val = float(ds.read(1, window=w)[0, 0])
                    if ds.nodata is not None and abs(val - ds.nodata) < 0.001:
                        return None
                    if not np.isnan(val) and val >= 0.0:
                        return float(np.clip(val, 0.0, 1.0))
            return None
        except Exception as e:
            logger.warning(f"[PredictionPipeline] Susceptibility COG point-sample failed ({e})")
            return None

    def get_susceptibility(self, static_features: Dict[str, Any]) -> float:
        """
        Formats static_features into the exact schema/types expected by Model A
        and computes the landslide susceptibility score (0.0 - 1.0).
        """
        if not self.is_ready:
            self.initialize()

        row_data = {}
        for col in self.model_a_features:
            row_data[col] = [static_features.get(col, 0.0)]

        df = pd.DataFrame(row_data)

        # Set categorical land_cover_class with the training categories
        if "land_cover_class" in df.columns:
            df["land_cover_class"] = pd.Categorical(
                df["land_cover_class"], 
                categories=self.land_cover_categories
            )

        # Predict probability of class 1 (susceptible)
        probs = self.model_a.predict_proba(df[self.model_a_features])
        susceptibility_score = float(probs[0, 1])
        return susceptibility_score

    def get_live_conditions_mock(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fallback mock generator when external weather API is offline.
        - rainfall_24hr: random float between 0-150 (mm)
        - rainfall_7day: random float between rainfall_24hr and 400 (mm)
        - soil_moisture: random float between 10-90 (%)
        """
        import random
        r24 = round(random.uniform(0.0, 150.0), 1)
        r7d = round(random.uniform(r24, 400.0), 1)
        sm = round(random.uniform(10.0, 90.0), 1)
        return {
            "rainfall_24hr": r24,
            "rainfall_7day": r7d,
            "soil_moisture": sm,
            "soil_moisture_raw": round(sm / 100.0, 3),
            "is_live_data_mocked": True,
            "data_source": "Mock Simulation (Fallback)",
        }

    def get_live_conditions_open_meteo(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetches real-time rainfall and volumetric soil moisture from Open-Meteo:
        - 24hr rainfall & 7-day cumulative precipitation (mm)
        - Soil moisture at 28-100cm depth (m3/m3 matching Model B training range 0.19-0.51)
        Cached in-memory for 10 minutes (600s TTL).
        Falls back to mock data if API is unreachable.
        """
        cache_key = (round(lat, 3), round(lon, 3))
        now_ts = time.time()
        if cache_key in self._weather_cache:
            cached_data, cached_ts = self._weather_cache[cache_key]
            if now_ts - cached_ts < 600:
                return cached_data

        try:
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": lat,
                "longitude": lon,
                "hourly": "precipitation,rain,soil_moisture_28_to_100cm",
                "daily": "precipitation_sum",
                "past_days": 7,
                "forecast_days": 1,
                "timezone": "Asia/Kolkata",
            }
            resp = requests.get(url, params=params, timeout=8.0)
            if resp.status_code == 200:
                data = resp.json()
                daily = data.get("daily", {})
                hourly = data.get("hourly", {})

                precip_sums = daily.get("precipitation_sum", [])
                if precip_sums:
                    r24 = float(precip_sums[-1]) if precip_sums[-1] is not None else 0.0
                    valid_7d = [x for x in precip_sums[-7:] if x is not None]
                    r7d = float(sum(valid_7d))
                else:
                    r24 = 0.0
                    r7d = 0.0

                sm_list = hourly.get("soil_moisture_28_to_100cm", [])
                valid_sm = [x for x in sm_list if x is not None]
                if valid_sm:
                    sm_raw = float(valid_sm[-1])
                else:
                    sm_raw = 0.35

                sm_pct = round(sm_raw * 100.0, 1)

                result = {
                    "rainfall_24hr": round(r24, 1),
                    "rainfall_7day": round(r7d, 1),
                    "soil_moisture": sm_pct,
                    "soil_moisture_raw": sm_raw,
                    "is_live_data_mocked": False,
                    "data_source": "Open-Meteo Realtime API",
                }
                self._weather_cache[cache_key] = (result, now_ts)
                logger.info(
                    f"[PredictionPipeline] Live Open-Meteo query for ({lat}, {lon}) succeeded: "
                    f"24h={r24}mm, 7d={r7d}mm, SM={sm_pct}% (raw={sm_raw} m3/m3)"
                )
                return result
            else:
                logger.warning(f"[PredictionPipeline] Open-Meteo HTTP {resp.status_code}. Using mock fallback.")
        except Exception as e:
            logger.warning(f"[PredictionPipeline] Open-Meteo call failed ({e}). Using mock fallback.")

        fallback = self.get_live_conditions_mock(lat, lon)
        return fallback

    def get_live_conditions_from_rasters(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        Point-samples the stored ISRO INSAT-3DR rainfall and NASA SMAP soil moisture
        rasters at the given lat/lon coordinates.

        These are the EXACT same rasters fed into the unified daily batch pipeline
        (unified_daily_pipeline.py), so the returned values will produce a Model B score
        consistent with the color of the risk tile the user clicked on.

        Returns None if the rasters are unavailable (pipeline hasn't run yet),
        allowing the caller to fall back to Open-Meteo.
        """
        try:
            import rasterio
            from rasterio.crs import CRS
            from pyproj import Transformer
        except ImportError:
            logger.warning("[PredictionPipeline] rasterio not installed; cannot sample rasters.")
            return None

        # Resolve raster paths (same directories as rainfall_service and smap_service)
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        rainfall_dir = os.path.join(base_dir, "data", "processed", "rainfall")
        rainfall_alias = os.path.join(rainfall_dir, "rainfall_24h_latest.tif")
        rainfall_candidates = sorted(
            path for path in glob.glob(os.path.join(rainfall_dir, "rainfall_24h_*.tif"))
            if os.path.basename(path) != "rainfall_24h_latest.tif"
        )
        rainfall_path = rainfall_alias if os.path.exists(rainfall_alias) else (
            rainfall_candidates[-1] if rainfall_candidates else rainfall_alias
        )

        smap_dir = os.path.join(base_dir, "data", "soil_moisture", "processed")
        smap_alias = os.path.join(smap_dir, "smap_soil_moisture_latest_ner.tif")
        smap_candidates = sorted(
            path for path in glob.glob(os.path.join(smap_dir, "smap_soil_moisture_*_ner.tif"))
            if os.path.basename(path) != "smap_soil_moisture_latest_ner.tif"
        )
        smap_path = smap_alias if os.path.exists(smap_alias) else (
            smap_candidates[-1] if smap_candidates else smap_alias
        )

        logger.info(
            f"[PredictionPipeline] Raster inputs: rainfall={rainfall_path}, smap={smap_path}"
        )

        # Check both rasters exist
        if not os.path.exists(rainfall_path):
            logger.info(f"[PredictionPipeline] Rainfall raster not found at {rainfall_path}; skipping raster sampling.")
            return None
        if not os.path.exists(smap_path):
            logger.info(f"[PredictionPipeline] SMAP raster not found at {smap_path}; skipping raster sampling.")
            return None

        try:
            # ── Sample 24h rainfall raster ──────────────────────────────────────────
            with rasterio.open(rainfall_path) as ds:
                # Transform lat/lon (EPSG:4326) to the raster's native CRS if needed
                rf_crs = ds.crs
                if rf_crs and not rf_crs.to_epsg() == 4326:
                    t = Transformer.from_crs("EPSG:4326", rf_crs, always_xy=True)
                    rx, ry = t.transform(lon, lat)
                else:
                    rx, ry = lon, lat

                row_rf, col_rf = ds.index(rx, ry)
                row_rf = int(np.clip(row_rf, 0, ds.height - 1))
                col_rf = int(np.clip(col_rf, 0, ds.width - 1))
                # Read the single pixel window
                window = rasterio.windows.Window(col_rf, row_rf, 1, 1)
                rf_data = ds.read(1, window=window)
                rf_nodata = ds.nodata

            rf_val = float(rf_data[0, 0]) if rf_data.size > 0 else 0.0
            if rf_nodata is not None and abs(rf_val - rf_nodata) < 1.0:
                rf_val = 0.0
            rf_val = max(0.0, rf_val)  # rainfall can't be negative

            # ── Sample SMAP soil moisture raster ────────────────────────────────────
            with rasterio.open(smap_path) as ds:
                sm_crs = ds.crs
                if sm_crs and not sm_crs.to_epsg() == 4326:
                    t = Transformer.from_crs("EPSG:4326", sm_crs, always_xy=True)
                    sx, sy = t.transform(lon, lat)
                else:
                    sx, sy = lon, lat

                row_sm, col_sm = ds.index(sx, sy)
                row_sm = int(np.clip(row_sm, 0, ds.height - 1))
                col_sm = int(np.clip(col_sm, 0, ds.width - 1))
                window = rasterio.windows.Window(col_sm, row_sm, 1, 1)
                sm_data = ds.read(1, window=window)
                sm_nodata = ds.nodata

            sm_raw = float(sm_data[0, 0]) if sm_data.size > 0 else 0.35
            if sm_nodata is not None and abs(sm_raw - sm_nodata) < 0.001:
                sm_raw = 0.35  # default mid-range if pixel is no-data
            sm_raw = float(np.clip(sm_raw, 0.02, 0.55))  # physical range for soil moisture

            # ── Estimate 7-day rainfall (sum last 7 dated rasters if available) ─────
            rainfall_dir = os.path.join(base_dir, "data", "processed", "rainfall")
            dated_tifs = sorted(glob.glob(os.path.join(rainfall_dir, "rainfall_24h_????????.tif")))
            r7d = rf_val  # at minimum the latest 24h
            if dated_tifs:
                # Use up to the last 6 additional daily rasters (+ current = 7 days)
                past_tifs = dated_tifs[-6:]
                for ptif in past_tifs:
                    try:
                        with rasterio.open(ptif) as pds:
                            p_row, p_col = pds.index(lon, lat)
                            p_row = int(np.clip(p_row, 0, pds.height - 1))
                            p_col = int(np.clip(p_col, 0, pds.width - 1))
                            pw = rasterio.windows.Window(p_col, p_row, 1, 1)
                            pd_data = pds.read(1, window=pw)
                            p_nodata = pds.nodata
                            pval = float(pd_data[0, 0]) if pd_data.size > 0 else 0.0
                            if p_nodata is not None and abs(pval - p_nodata) < 1.0:
                                pval = 0.0
                            r7d += max(0.0, pval)
                    except Exception:
                        pass  # skip unreadable files silently

            sm_pct = round(sm_raw * 100.0, 1)

            result = {
                "rainfall_24hr": round(rf_val, 1),
                "rainfall_7day": round(r7d, 1),
                "soil_moisture": sm_pct,
                "soil_moisture_raw": round(sm_raw, 4),
                "is_live_data_mocked": False,
                "is_open_meteo_fallback": False,
                "data_source": "ISRO INSAT-3DR + NASA SMAP (Batch)",
            }
            logger.info(
                f"[PredictionPipeline] Raster point-sample for ({lat:.4f}, {lon:.4f}): "
                f"rain24h={rf_val:.1f}mm, rain7d={r7d:.1f}mm, SM={sm_pct:.1f}% (raw={sm_raw:.4f} m3/m3)"
            )
            return result

        except Exception as e:
            logger.warning(f"[PredictionPipeline] Raster point-sampling failed ({e}); falling back to Open-Meteo.")
            return None

    def get_live_conditions(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Primary: point-samples stored ISRO INSAT-3DR rainfall and NASA SMAP
        soil moisture rasters — the same data used by the batch risk pipeline.
        This ensures the risk score shown in the click panel matches the
        color of the risk tile the user clicked.

        Fallback (rasters missing / pipeline not yet run): Open-Meteo live API.
        Second fallback: mock simulation.
        """
        # Attempt 1: Read from batch rasters (ISRO + NASA data)
        raster_result = self.get_live_conditions_from_rasters(lat, lon)
        if raster_result is not None:
            return raster_result

        # Attempt 2: Open-Meteo live API (marks data as open_meteo_fallback)
        open_meteo_result = self.get_live_conditions_open_meteo(lat, lon)
        open_meteo_result["is_open_meteo_fallback"] = True
        return open_meteo_result

    def get_risk_score_from_raster(self, lat: float, lon: float) -> Optional[float]:
        """
        Reads the pre-computed Model B risk score directly from the daily batch
        raster (landslide_risk_latest.tif).

        This is the EXACT pixel value that was used to render the risk tile on the map,
        so the click-panel score will be 100% consistent with the tile color.

        Returns a float in [0.0, 1.0] or None if the raster is unavailable.
        """
        try:
            import rasterio
            from pyproj import Transformer
        except ImportError:
            return None

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        risk_path = os.path.join(base_dir, "data", "processed", "risk", "landslide_risk_latest.tif")

        if not os.path.exists(risk_path):
            logger.info(f"[PredictionPipeline] Risk raster not found at {risk_path}; will re-compute via Model B.")
            return None

        try:
            with rasterio.open(risk_path) as ds:
                crs = ds.crs
                if crs and crs.to_epsg() != 4326:
                    t = Transformer.from_crs("EPSG:4326", crs, always_xy=True)
                    rx, ry = t.transform(lon, lat)
                else:
                    rx, ry = lon, lat

                row, col = ds.index(rx, ry)
                row = int(np.clip(row, 0, ds.height - 1))
                col = int(np.clip(col, 0, ds.width - 1))
                window = rasterio.windows.Window(col, row, 1, 1)
                data = ds.read(1, window=window)
                nodata = ds.nodata

            val = float(data[0, 0]) if data.size > 0 else None
            if val is None:
                return None
            if nodata is not None and abs(val - nodata) < 0.001:
                return None  # no-data pixel (outside NER / ocean)
            if np.isnan(val):
                return None

            # Risk raster is stored in [0.0, 1.0]; guard against any rescaling
            val = float(np.clip(val, 0.0, 1.0))
            logger.info(f"[PredictionPipeline] Risk raster sample at ({lat:.4f}, {lon:.4f}) = {val:.4f}")
            return val

        except Exception as e:
            logger.warning(f"[PredictionPipeline] Risk raster sampling failed ({e}); will re-compute via Model B.")
            return None

    def get_full_risk_assessment(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Executes the end-to-end landslide risk assessment pipeline:
        1. STEP 1 — Static feature lookup via EPSG:6933 cKDTree.
        2. STEP 2 — Model A susceptibility score via predict_proba.
        3. STEP 3 — Live weather & soil conditions (rasters first, Open-Meteo fallback).
        4. STEP 4 — Risk score: reads directly from landslide_risk_latest.tif raster
                    (same pixel that colors the tile) OR re-runs Model B if raster missing.
        5. Returns complete combined response with source indicators.
        """
        static_features = self.get_static_features(lat, lon)
        susceptibility_score = self.get_susceptibility_from_raster(lat, lon)
        if susceptibility_score is None:
            susceptibility_score = self.get_susceptibility(static_features)
        live_conditions = self.get_live_conditions(lat, lon)

        rainfall_24hr = live_conditions["rainfall_24hr"]
        rainfall_7day = live_conditions["rainfall_7day"]
        soil_moisture = live_conditions["soil_moisture"]
        soil_moisture_raw = live_conditions.get("soil_moisture_raw", soil_moisture / 100.0)
        is_live_data_mocked = live_conditions.get("is_live_data_mocked", False)
        is_open_meteo_fallback = live_conditions.get("is_open_meteo_fallback", False)
        data_source = live_conditions.get("data_source", "Open-Meteo Realtime API")

        distance_m = static_features.get("grid_match_distance_m", 0.0)
        distance_km = distance_m / 1000.0

        now = datetime.now(timezone.utc)

        # Check if coordinates are strictly within Northeast Region bounds and within master grid extent
        is_in_bounds = (NER_LAT_MIN <= lat <= NER_LAT_MAX and NER_LON_MIN <= lon <= NER_LON_MAX)
        if not is_in_bounds or distance_m > 2500.0:
            logger.info(f"[PredictionPipeline] Coordinates ({lat}, {lon}) are outside Northeast India coverage (distance={distance_m:.1f}m). Halting prediction.")
            return {
                "latitude": lat,
                "longitude": lon,
                "is_outside_ner": True,
                "risk_level": "Outside Coverage",
                "risk_score": None,
                "susceptibility_score": None,
                "live_risk_available": False,
                "rainfall_24hr": rainfall_24hr,
                "rainfall_7day": rainfall_7day,
                "soil_moisture": soil_moisture,
                "soil_moisture_raw": soil_moisture_raw,
                "is_live_data_mocked": is_live_data_mocked,
                "is_open_meteo_fallback": is_open_meteo_fallback,
                "data_source": data_source,
                "grid_match_distance_m": round(distance_m, 1),
                "coverage_warning": f"Selected location ({round(lat, 4)}°N, {round(lon, 4)}°E) is outside the North East Region (NER) landslide monitoring zone. Risk prediction is only available within Northeast India.",
                "computed_at": now.isoformat(),
                "static_features": {}
            }

        risk_score = None
        live_risk_available = False
        risk_from_raster = False

        # STEP 4a: Read risk score directly from the pre-computed batch raster.
        # This gives the EXACT same value used to paint the risk tile pixel the user clicked.
        raster_risk = self.get_risk_score_from_raster(lat, lon)
        if raster_risk is not None:
            risk_score = raster_risk
            live_risk_available = True
            risk_from_raster = True
            logger.info(f"[PredictionPipeline] Using batch raster risk score: {risk_score:.4f} (matches tile color)")

        # STEP 4b: Model B (live risk inference) — only runs if raster is unavailable
        # Model B is decoupled from static terrain factors (condensed by Model A) and strictly
        # processes dynamic triggers: Model A susceptibility score, rainfall, and soil moisture saturation.
        if risk_score is None and self.model_b is not None:
            try:
                b_feature_names = getattr(self.model_b, "feature_names_in_", None)
                if b_feature_names is not None:
                    row = {}
                    for col in b_feature_names:
                        if col in ("susceptibility_score", "susceptibility", "model_a_score", "model_a_susceptibility"):
                            row[col] = [susceptibility_score]
                        elif col in ("rain_mm", "rainfall_24hr", "rainfall_1d", "rainfall", "rain"):
                            row[col] = [rainfall_24hr]
                        elif col in ("rainfall_7day", "rainfall_7d", "rainfall_sum_7d"):
                            row[col] = [rainfall_7day]
                        elif col in ("soil_moisture_28_to_100cm", "rzsm", "soil_moisture_raw", "moisture"):
                            row[col] = [soil_moisture_raw]
                        elif col in ("soil_moisture", "soil_moisture_pct"):
                            row[col] = [soil_moisture]
                        elif col in ("latitude", "lat"):
                            row[col] = [lat]
                        elif col in ("longitude", "lon"):
                            row[col] = [lon]
                        else:
                            # Strict decoupling: never feed static terrain variables to Model B
                            logger.info(f"[PredictionPipeline] Non-dynamic feature '{col}' requested by Model B; supplying 0.0")
                            row[col] = [0.0]
                    b_df = pd.DataFrame(row)
                    b_probs = self.model_b.predict_proba(b_df[b_feature_names])
                    risk_score = float(b_probs[0, 1])
                    live_risk_available = True
                else:
                    # Pure 3-feature dynamic input: [rain_mm, soil_moisture_raw, susceptibility_score]
                    n_feats = getattr(self.model_b, "n_features_in_", 3)
                    if n_feats == 3:
                        b_input = np.array([[rainfall_24hr, soil_moisture_raw, susceptibility_score]])
                    elif n_feats == 5:
                        b_input = np.array([[lat, lon, rainfall_24hr, soil_moisture_raw, susceptibility_score]])
                    else:
                        b_input = np.array([[susceptibility_score, rainfall_24hr, soil_moisture_raw]])
                    b_probs = self.model_b.predict_proba(b_input)
                    risk_score = float(b_probs[0, 1])
                    live_risk_available = True
            except Exception as e:
                logger.warning(f"[PredictionPipeline] Model B predict failed: {e}")
                risk_score = None
                live_risk_available = False

        # Fallback intelligent physical combination if Model B was unavailable or threw an exception
        if risk_score is None:
            rf_24_norm = min(rainfall_24hr / 120.0, 1.0)
            rf_7d_norm = min(rainfall_7day / 300.0, 1.0)
            sm_norm = min(soil_moisture / 100.0, 1.0)
            risk_score = 0.45 * susceptibility_score + 0.35 * rf_24_norm + 0.10 * rf_7d_norm + 0.10 * sm_norm
            risk_score = float(np.clip(risk_score, 0.0, 1.0))
            live_risk_available = True

        # Ensure normalized risk_score and susceptibility_score (0.0 to 1.0)
        norm_risk = risk_score / 100.0 if risk_score > 1.0 else risk_score
        norm_risk = float(np.clip(norm_risk, 0.0, 1.0))

        norm_susc = susceptibility_score / 100.0 if susceptibility_score > 1.0 else susceptibility_score
        norm_susc = float(np.clip(norm_susc, 0.0, 1.0))

        # Bucket into risk_level / severity:
        # < 0.25 (< 25%) => Low
        # 0.25 - 0.50 (25% - 50%) => Moderate
        # 0.50 - 0.75 (50% - 75%) => High
        # >= 0.75 (>= 75%) => Critical
        if norm_risk < 0.25:
            risk_level = "Low"
        elif norm_risk < 0.50:
            risk_level = "Moderate"
        elif norm_risk < 0.75:
            risk_level = "High"
        else:
            risk_level = "Critical"

        if norm_susc < 0.25:
            susceptibility_level = "Low"
        elif norm_susc < 0.50:
            susceptibility_level = "Moderate"
        elif norm_susc < 0.75:
            susceptibility_level = "High"
        else:
            susceptibility_level = "Critical"

        # Check for coverage distance warning (> 1000m from nearest data cell)
        coverage_warning = None
        if distance_m > 1000.0:
            coverage_warning = f"Location is {round(distance_m)}m from nearest coverage cell; prediction is approximate."

        return {
            "latitude": lat,
            "longitude": lon,
            "susceptibility_score": round(norm_susc, 4),
            "susceptibility_level": susceptibility_level,
            "risk_score": round(norm_risk, 4),
            "risk_level": risk_level,
            "severity": risk_level.upper(),
            "live_risk_available": live_risk_available,
            "rainfall_24hr": rainfall_24hr,
            "rainfall_7day": rainfall_7day,
            "soil_moisture": soil_moisture,
            "soil_moisture_raw": soil_moisture_raw,
            "is_live_data_mocked": is_live_data_mocked,
            "is_open_meteo_fallback": is_open_meteo_fallback,
            "data_source": data_source,
            "grid_match_distance_m": round(distance_m, 1),
            "coverage_warning": coverage_warning,
            "computed_at": now.isoformat(),
            "static_features": {k: v for k, v in static_features.items() if k not in ("grid_match_distance_m", "nearest_grid_index")}
        }

# Global singleton
prediction_service = PredictionPipeline.get_instance()
