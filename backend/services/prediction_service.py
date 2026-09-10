import os
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

        # 4. Load Master Grid and Build cKDTree Index
        if not os.path.exists(MASTER_GRID_PARQUET_PATH):
            raise FileNotFoundError(f"Master 200m parquet grid not found at: {MASTER_GRID_PARQUET_PATH}")

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

        self.is_ready = True
        logger.info(f"[PredictionPipeline] Pipeline fully initialized in {time.time() - t_start:.2f}s!")

    def get_static_features(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Converts lat/lon (EPSG:4326) to master grid coordinates (EPSG:6933),
        queries the cached cKDTree for the nearest 200m cell, and returns
        the static terrain/soil features along with the match distance in meters.
        """
        if not self.is_ready:
            self.initialize()

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

    def get_live_conditions(self, lat: float, lon: float) -> Dict[str, Any]:
        """Routes to live Open-Meteo API query with automatic caching and fallback."""
        return self.get_live_conditions_open_meteo(lat, lon)

    def get_full_risk_assessment(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Executes the end-to-end landslide risk assessment pipeline:
        1. STEP 1 — Static feature lookup via EPSG:6933 cKDTree.
        2. STEP 2 — Model A susceptibility score via predict_proba.
        3. STEP 3 — Live weather & soil saturation via Open-Meteo API.
        4. STEP 4 — Model B live risk fusion (susceptibility + weather + saturation).
        5. Returns complete combined response with is_live_data_mocked indicator.
        """
        static_features = self.get_static_features(lat, lon)
        susceptibility_score = self.get_susceptibility(static_features)
        live_conditions = self.get_live_conditions(lat, lon)

        rainfall_24hr = live_conditions["rainfall_24hr"]
        rainfall_7day = live_conditions["rainfall_7day"]
        soil_moisture = live_conditions["soil_moisture"]
        soil_moisture_raw = live_conditions.get("soil_moisture_raw", soil_moisture / 100.0)
        is_live_data_mocked = live_conditions.get("is_live_data_mocked", False)
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
                "data_source": data_source,
                "grid_match_distance_m": round(distance_m, 1),
                "coverage_warning": f"Selected location ({round(lat, 4)}°N, {round(lon, 4)}°E) is outside the North East Region (NER) landslide monitoring zone. Risk prediction is only available within Northeast India.",
                "computed_at": now.isoformat(),
                "static_features": {}
            }

        risk_score = None
        live_risk_available = False

        # STEP 4: Model B (live risk inference)
        # Model B is decoupled from static terrain factors (condensed by Model A) and strictly
        # processes dynamic triggers: Model A susceptibility score, rainfall, and soil moisture saturation.
        if self.model_b is not None:
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
            "data_source": data_source,
            "grid_match_distance_m": round(distance_m, 1),
            "coverage_warning": coverage_warning,
            "computed_at": now.isoformat(),
            "static_features": {k: v for k, v in static_features.items() if k not in ("grid_match_distance_m", "nearest_grid_index")}
        }

# Global singleton
prediction_service = PredictionPipeline.get_instance()
