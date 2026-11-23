"""
Service: unified_daily_pipeline.py
Purpose: Single daily batch execution of Model B dynamic landslide risk across Northeast India.
Inputs:
  1. INSAT-3DR 24h accumulated rainfall (rainfall_service.py) -> (3921, 4904) EPSG:4326
  2. NASA SMAP SPL3SMP_E soil moisture (smap_service.py) -> (3921, 4904) EPSG:4326
  3. Static Landslide Susceptibility COG (Model A) -> (3921, 4904) EPSG:4326
Outputs:
  1. Regional 200m Landslide Risk GeoTIFF (landslide_risk_YYYYMMDD.tif and landslide_risk_latest.tif)
  2. Daily High/Critical Risk Alerts (risk_alerts_today.json) aggregated by district
  3. Unified Quality Control (QC) Report (risk_latest_qc.json)

Execution Principle:
  Runs ONCE per daily cycle across the full regional master grid (~200m).
  Never executed per-citizen or per-GPS coordinate.
"""

import os
import re
import json
import glob
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple

import joblib
import numpy as np
import rasterio
from rasterio.transform import Affine
from scipy.spatial import cKDTree

from config import MODEL_B_PATH, BASE_DIR
from services.rainfall_service import (
    run_regional_rainfall_pipeline as run_rainfall_pipeline,
    PROCESSED_DIR as RAINFALL_DIR,
    MODEL_A_COG_PATH,
    NER_GEOJSON_PATH,
)
from services.smap_service import (
    run_smap_daily_pipeline as run_smap_pipeline,
    PROCESSED_DIR as SMAP_DIR,
)
try:
    from data.mdapi import download_rainfall_data
except Exception:
    try:
        from mdapi import download_rainfall_data
    except Exception:
        def download_rainfall_data(*args, **kwargs):
            return {"status": "FAILED", "message": "mdapi not available"}

logger = logging.getLogger("unified_daily_pipeline")

log_dir = os.path.join(BASE_DIR, "logs")
os.makedirs(log_dir, exist_ok=True)
log_file = os.path.join(log_dir, "pipeline.log")

# Create a file handler for the pipeline log
file_handler = logging.FileHandler(log_file, mode='a', encoding='utf-8')
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

# Attach it to the root logger so we capture logs from all imported modules (smap_service, mdapi, etc)
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)

# Only add the handler if it's not already there to prevent duplicate logs on reload
if not any(isinstance(h, logging.FileHandler) and h.baseFilename == os.path.abspath(log_file) for h in root_logger.handlers):
    root_logger.addHandler(file_handler)

RISK_PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed", "risk")
DISTRICTS_GEOJSON = os.path.join(BASE_DIR, "data", "states_districts_detailed.json")
os.makedirs(RISK_PROCESSED_DIR, exist_ok=True)

# Risk classification thresholds
# Low: < 0.25 | Moderate: 0.25 - 0.50 | High: 0.50 - 0.75 | Critical: >= 0.75
THRESHOLD_MODERATE = 0.25
THRESHOLD_HIGH = 0.50
THRESHOLD_CRITICAL = 0.75


def load_district_index() -> Tuple[cKDTree, List[Dict[str, Any]]]:
    """
    Loads district centroids from states_districts_detailed.json
    and builds a spatial cKDTree for nearest-district mapping of risk cells.
    """
    district_records = []
    coords = []

    if os.path.exists(DISTRICTS_GEOJSON):
        try:
            with open(DISTRICTS_GEOJSON, "r", encoding="utf-8") as f:
                data = json.load(f)
            for state_name, dist_list in data.items():
                for d in dist_list:
                    d_name = d.get("district", "Unknown")
                    lat = float(d.get("lat", 0.0))
                    lon = float(d.get("lon", 0.0))
                    district_records.append({
                        "state": state_name,
                        "district": d_name,
                        "lat": lat,
                        "lon": lon,
                    })
                    coords.append([lon, lat])
        except Exception as e:
            logger.warning(f"[UNIFIED] Could not build district index from JSON: {e}")

    if not coords:
        # Fallback dummy record
        district_records = [{"state": "Northeast Region", "district": "Regional Center", "lat": 26.0, "lon": 92.5}]
        coords = [[92.5, 26.0]]

    tree = cKDTree(np.array(coords))
    return tree, district_records


def locate_latest_rainfall_raster() -> str:
    """Finds latest processed 24h rainfall GeoTIFF."""
    candidates = sorted(glob.glob(os.path.join(RAINFALL_DIR, "rainfall_24h_*.tif")))
    latest_alias = os.path.join(RAINFALL_DIR, "rainfall_24h_latest.tif")
    if os.path.exists(latest_alias):
        return latest_alias
    if candidates:
        return candidates[-1]
    raise FileNotFoundError("No processed 24h rainfall raster found in data/processed/rainfall/")


def locate_latest_smap_raster() -> str:
    """Finds latest processed SMAP soil moisture GeoTIFF."""
    latest_alias = os.path.join(SMAP_DIR, "smap_soil_moisture_latest_ner.tif")
    if os.path.exists(latest_alias):
        return latest_alias
    candidates = sorted(glob.glob(os.path.join(SMAP_DIR, "smap_soil_moisture_*_ner.tif")))
    if candidates:
        return candidates[-1]
    raise FileNotFoundError("No processed SMAP soil moisture raster found in data/soil_moisture/processed/")


def execute_model_b_batch(
    rain_2d: np.ndarray,
    sm_2d: np.ndarray,
    susc_2d: np.ndarray,
    chunk_size: int = 500_000
) -> np.ndarray:
    """
    Executes Model B inference in memory-safe chunks across active NER cells:
    Feature schema: ['rain_mm', 'soil_moisture_28_to_100cm', 'susceptibility_score']
    """
    height, width = susc_2d.shape
    risk_grid = np.full((height, width), np.nan, dtype=np.float32)

    # Active analysis cells: susceptibility is finite and > 0 (inside NER)
    active_mask = np.isfinite(susc_2d) & (susc_2d > 0.0)
    num_active = int(np.sum(active_mask))
    logger.info(f"[MODEL B] Total active analysis cells inside NER: {num_active:,}")

    if num_active == 0:
        return risk_grid

    # Extract features for active cells
    rain_vals = np.nan_to_num(rain_2d[active_mask], nan=0.0).astype(np.float32)
    # Clip soil moisture to Model B training bounds (0.02 - 0.50 cm3/cm3)
    sm_vals = np.clip(np.nan_to_num(sm_2d[active_mask], nan=0.35), 0.02, 0.50).astype(np.float32)
    susc_vals = np.clip(susc_2d[active_mask], 0.0, 1.0).astype(np.float32)

    logger.info(
        f"[MODEL B] Feature Summary across {num_active:,} cells:\n"
        f"  rain_mm: min={rain_vals.min():.1f}, max={rain_vals.max():.1f}, mean={rain_vals.mean():.1f}\n"
        f"  soil_moisture: min={sm_vals.min():.3f}, max={sm_vals.max():.3f}, mean={sm_vals.mean():.3f}\n"
        f"  susceptibility: min={susc_vals.min():.3f}, max={susc_vals.max():.3f}, mean={susc_vals.mean():.3f}"
    )

    # Check for trained Model B Random Forest
    model_b = None
    if os.path.exists(MODEL_B_PATH):
        try:
            model_b = joblib.load(MODEL_B_PATH)
            logger.info(f"[MODEL B] Successfully loaded trained Model B from: {MODEL_B_PATH}")
        except Exception as e:
            logger.warning(f"[MODEL B] Could not load Model B ({e}). Using calibrated physical fusion.")
    else:
        logger.warning(f"[MODEL B] Model B not found at {MODEL_B_PATH}. Using calibrated physical fusion.")

    # Feature matrix X
    X = np.column_stack([rain_vals, sm_vals, susc_vals])
    risk_predictions = np.zeros(num_active, dtype=np.float32)

    t_inf = time.time()
    if model_b is not None:
        try:
            # Process in memory-safe chunks
            num_chunks = (num_active + chunk_size - 1) // chunk_size
            for i in range(num_chunks):
                start = i * chunk_size
                end = min(start + chunk_size, num_active)
                chunk_x = X[start:end]
                # predict_proba returns [P(class 0), P(class 1)]
                probs = model_b.predict_proba(chunk_x)
                risk_predictions[start:end] = probs[:, 1].astype(np.float32)
            logger.info(f"[MODEL B] Inferred {num_active:,} cells via Random Forest in {time.time() - t_inf:.2f}s")
        except Exception as e:
            logger.warning(f"[MODEL B] Batch predict_proba failed ({e}). Falling back to calibrated physical fusion.")
            model_b = None

    if model_b is None:
        # Calibrated physical fusion formula matching prediction_service fallback:
        # rf_norm (0-120mm) * 0.35 + sm_norm (0-0.50) * 0.20 + susc (0-1.0) * 0.45
        rf_norm = np.clip(rain_vals / 120.0, 0.0, 1.0)
        sm_norm = np.clip(sm_vals / 0.50, 0.0, 1.0)
        risk_predictions = 0.45 * susc_vals + 0.35 * rf_norm + 0.20 * sm_norm
        risk_predictions = np.clip(risk_predictions, 0.0, 1.0).astype(np.float32)
        logger.info(f"[MODEL B] Inferred {num_active:,} cells via calibrated physical fusion in {time.time() - t_inf:.2f}s")

    # Reconstruct 2D risk grid
    risk_grid[active_mask] = risk_predictions
    return risk_grid


def generate_risk_alerts(
    risk_grid_2d: np.ndarray,
    rain_2d: np.ndarray,
    sm_2d: np.ndarray,
    transform: Affine,
    obs_date: str
) -> Dict[str, Any]:
    """
    Filters cells where risk_score >= 0.50 (High and Critical),
    associates nearest district/state, and aggregates alert metrics.
    """
    logger.info("[RISK ALERTS] Aggregating High and Critical risk cells (score >= 0.50)...")
    tree, district_records = load_district_index()

    # Find cells with risk_score >= THRESHOLD_HIGH
    alert_mask = np.isfinite(risk_grid_2d) & (risk_grid_2d >= THRESHOLD_HIGH)
    alert_rows, alert_cols = np.where(alert_mask)
    num_alerts = len(alert_rows)

    logger.info(f"[RISK ALERTS] Found {num_alerts:,} cells meeting alert threshold (>= {THRESHOLD_HIGH})")

    if num_alerts == 0:
        return {
            "date": obs_date,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "total_alert_cells": 0,
            "critical_cell_count": 0,
            "high_cell_count": 0,
            "districts_at_risk_count": 0,
            "districts": [],
            "hotspots": [],
        }

    # Convert pixel coords (col, row) to geographic (lon, lat)
    # x = c + col * a + row * b
    # y = f + col * d + row * e
    lons = transform.c + alert_cols * transform.a + alert_rows * transform.b
    lats = transform.f + alert_cols * transform.d + alert_rows * transform.e
    scores = risk_grid_2d[alert_rows, alert_cols]
    rains = np.nan_to_num(rain_2d[alert_rows, alert_cols], nan=0.0)
    sms = np.nan_to_num(sm_2d[alert_rows, alert_cols], nan=0.35)

    # Nearest district lookup in batch
    coords = np.column_stack([lons, lats])
    _, dist_indices = tree.query(coords)

    # Group by district
    dist_groups: Dict[Tuple[str, str], List[Dict[str, Any]]] = {}
    for i in range(num_alerts):
        rec = district_records[dist_indices[i]]
        key = (rec["state"], rec["district"])
        if key not in dist_groups:
            dist_groups[key] = []
        dist_groups[key].append({
            "score": float(scores[i]),
            "rain": float(rains[i]),
            "sm": float(sms[i]),
            "lat": float(lats[i]),
            "lon": float(lons[i]),
        })

    district_summaries = []
    critical_total = 0
    high_total = 0

    for (state, district), cells in dist_groups.items():
        cell_scores = [c["score"] for c in cells]
        crit_count = sum(1 for s in cell_scores if s >= THRESHOLD_CRITICAL)
        high_count = len(cell_scores) - crit_count
        critical_total += crit_count
        high_total += high_count

        max_score = max(cell_scores)
        avg_score = sum(cell_scores) / len(cell_scores)
        avg_rain = sum(c["rain"] for c in cells) / len(cells)
        avg_sm = sum(c["sm"] for c in cells) / len(cells)

        # Centroid of alert cells in district
        c_lat = sum(c["lat"] for c in cells) / len(cells)
        c_lon = sum(c["lon"] for c in cells) / len(cells)

        district_summaries.append({
            "state": state,
            "district": district,
            "severity": "Critical" if max_score >= THRESHOLD_CRITICAL else "High",
            "max_risk_score": round(max_score, 4),
            "avg_risk_score": round(avg_score, 4),
            "alert_cell_count": len(cells),
            "critical_cell_count": crit_count,
            "high_cell_count": high_count,
            "avg_rainfall_24h_mm": round(avg_rain, 1),
            "avg_soil_moisture_cm3_per_cm3": round(avg_sm, 4),
            "approx_centroid": {"lat": round(c_lat, 4), "lon": round(c_lon, 4)},
        })

    # Sort districts by severity and cell count
    district_summaries.sort(key=lambda d: (-d["max_risk_score"], -d["alert_cell_count"]))

    # Select top 50 hotspot representative points for map markers
    hotspot_indices = np.argsort(-scores)[:50]
    hotspots = [
        {
            "latitude": round(float(lats[idx]), 4),
            "longitude": round(float(lons[idx]), 4),
            "risk_score": round(float(scores[idx]), 4),
            "risk_level": "Critical" if scores[idx] >= THRESHOLD_CRITICAL else "High",
            "rainfall_24h_mm": round(float(rains[idx]), 1),
            "soil_moisture": round(float(sms[idx]), 4),
            "nearest_district": district_records[dist_indices[idx]]["district"],
            "state": district_records[dist_indices[idx]]["state"],
        }
        for idx in hotspot_indices
    ]

    report = {
        "date": obs_date,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_alert_cells": num_alerts,
        "critical_cell_count": critical_total,
        "high_cell_count": high_total,
        "districts_at_risk_count": len(district_summaries),
        "districts": district_summaries,
        "hotspots": hotspots,
    }

    alerts_path = os.path.join(RISK_PROCESSED_DIR, "risk_alerts_today.json")
    with open(alerts_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    logger.info(f"[RISK ALERTS] Saved alerts summary to: {alerts_path}")

    return report


def run_unified_daily_pipeline(force: bool = False, target_date: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Orchestrates the entire daily cycle:
    1. Rainfall Pipeline (MOSDAC INSAT-3DR)
    2. Soil Moisture Pipeline (NASA SMAP SPL3SMP_E)
    3. Model A alignment check
    4. Model B regional batch inference
    5. Landslide Risk GeoTIFF output
    6. Daily Alerts derivation
    """
    logger.info("=" * 80)
    logger.info("STARTING UNIFIED DAILY LANDSLIDE RISK PIPELINE (NER REGIONAL BATCH)")
    logger.info("=" * 80)
    t_start = time.time()

    # STEP 1: Rainfall Pipeline
    logger.info("\n[PIPELINE 1/4] Running 24h Rainfall Pipeline...")
    
    # If force=True, download MOSDAC data for target_date (or yesterday)
    if force:
        logger.info("[PIPELINE 1/4] Force download enabled. Fetching latest from MOSDAC...")
        try:
            if target_date:
                start_date = target_date.strftime("%Y-%m-%d")
                end_date = (target_date + timedelta(days=1)).strftime("%Y-%m-%d")
            else:
                # Default to exactly yesterday
                yesterday = datetime.now(timezone.utc) - timedelta(days=1)
                start_date = yesterday.strftime("%Y-%m-%d")
                end_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                target_date = yesterday # Explicitly set target date to yesterday so processing targets it
            
            raw_dir = os.path.join(BASE_DIR, "data", "INSAT3DR_IMR", "3RIMG_L2G_IMR")
            download_rainfall_data(start_date=start_date, end_date=end_date, target_dir=raw_dir)
        except Exception as e:
            logger.error(f"[PIPELINE 1/4] Failed to download MOSDAC data: {e}")

    try:
        t_date_str = target_date.strftime("%Y-%m-%d") if target_date else None
        rain_qc = run_rainfall_pipeline(target_date=t_date_str)
    except Exception as e:
        logger.warning(f"[PIPELINE 1/4] Rainfall pipeline run warning: {e}. Checking existing files.")
    rain_tif = locate_latest_rainfall_raster()
    logger.info(f"[PIPELINE 1/4] Using rainfall raster: {rain_tif}")

    # STEP 2: SMAP Soil Moisture Pipeline
    logger.info("\n[PIPELINE 2/4] Running NASA SMAP Soil Moisture Pipeline...")
    try:
        smap_qc = run_smap_pipeline(force_download=force, target_date=target_date)
    except Exception as e:
        logger.warning(f"[PIPELINE 2/4] SMAP pipeline run warning: {e}. Checking existing files.")
    smap_tif = locate_latest_smap_raster()
    logger.info(f"[PIPELINE 2/4] Using soil moisture raster: {smap_tif}")

    # STEP 3: Load Model A and align all rasters
    logger.info("\n[PIPELINE 3/4] Aligning Rasters and Assembling Master Analysis Grid...")
    if not os.path.exists(MODEL_A_COG_PATH):
        raise FileNotFoundError(f"Model A COG not found at: {MODEL_A_COG_PATH}")

    with rasterio.open(MODEL_A_COG_PATH) as ds_susc:
        susc_2d = ds_susc.read(1)
        target_profile = ds_susc.profile.copy()
        target_transform = ds_susc.transform
        target_crs = ds_susc.crs

    with rasterio.open(rain_tif) as ds_rain:
        rain_2d = ds_rain.read(1)

    with rasterio.open(smap_tif) as ds_sm:
        sm_2d = ds_sm.read(1)

    assert susc_2d.shape == rain_2d.shape == sm_2d.shape, (
        f"Raster dimension mismatch: Susc={susc_2d.shape}, Rain={rain_2d.shape}, SM={sm_2d.shape}"
    )
    logger.info(f"[PIPELINE 3/4] All 3 rasters perfectly aligned: {susc_2d.shape}, CRS={target_crs}")

    # STEP 4: Execute Model B in one single batch across entire NER
    logger.info("\n[PIPELINE 4/4] Executing Model B Batch Inference...")
    risk_2d = execute_model_b_batch(rain_2d, sm_2d, susc_2d)

    # Parse date from rainfall or use today
    match = re.search(r"rainfall_24h_(\d{8})", os.path.basename(rain_tif))
    obs_date = match.group(1) if match else datetime.now(timezone.utc).strftime("%Y%m%d")

    # STEP 5: Save GeoTIFF
    dated_tif = os.path.join(RISK_PROCESSED_DIR, f"landslide_risk_{obs_date}.tif")
    latest_tif = os.path.join(RISK_PROCESSED_DIR, "landslide_risk_latest.tif")

    out_profile = target_profile.copy()
    out_profile.update({
        "driver": "GTiff",
        "dtype": "float32",
        "nodata": np.nan,
        "count": 1,
        "compress": "lzw",
    })

    tags = {
        "pipeline": "Unified Landslide Risk Pipeline",
        "model": "Model B Dynamic Random Forest",
        "observation_date": obs_date,
        "rainfall_source": "MOSDAC INSAT-3DR (3RIMG_L2G_IMR)",
        "soil_moisture_source": "NASA SMAP Enhanced L3 (SPL3SMP_E v006)",
        "susceptibility_source": "Model A COG (200m)",
        "native_soil_moisture_resolution": "9 km",
        "analysis_grid_resolution": "200 m",
        "computed_at": datetime.now(timezone.utc).isoformat(),
    }

    for path in [dated_tif, latest_tif]:
        with rasterio.open(path, "w", **out_profile) as dst:
            dst.write(risk_2d, 1)
            dst.update_tags(**tags)
        logger.info(f"[RISK SAVE] Saved GeoTIFF: {path}")

    # STEP 6: Generate Alerts
    alerts_report = generate_risk_alerts(risk_2d, rain_2d, sm_2d, target_transform, obs_date)

    # Class distribution
    valid_risk = risk_2d[np.isfinite(risk_2d)]
    total_valid = len(valid_risk)
    low_count = int(np.sum(valid_risk < THRESHOLD_MODERATE))
    mod_count = int(np.sum((valid_risk >= THRESHOLD_MODERATE) & (valid_risk < THRESHOLD_HIGH)))
    high_count = int(np.sum((valid_risk >= THRESHOLD_HIGH) & (valid_risk < THRESHOLD_CRITICAL)))
    crit_count = int(np.sum(valid_risk >= THRESHOLD_CRITICAL))

    total_time = round(time.time() - t_start, 2)
    logger.info("=" * 80)
    logger.info(
        f"UNIFIED DAILY PIPELINE COMPLETED IN {total_time}s\n"
        f"  Total Valid Cells: {total_valid:,}\n"
        f"  Low (< 0.25): {low_count:,} ({low_count/max(1,total_valid)*100:.1f}%)\n"
        f"  Moderate (0.25-0.50): {mod_count:,} ({mod_count/max(1,total_valid)*100:.1f}%)\n"
        f"  High (0.50-0.75): {high_count:,} ({high_count/max(1,total_valid)*100:.1f}%)\n"
        f"  Critical (>= 0.75): {crit_count:,} ({crit_count/max(1,total_valid)*100:.1f}%)\n"
        f"  Districts at Risk: {alerts_report['districts_at_risk_count']}"
    )
    logger.info("=" * 80)

    # STEP 7: Save Unified QC
    qc = {
        "status": "COMPLETE",
        "date": obs_date,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "runtime_seconds": total_time,
        "input_products": {
            "rainfall": os.path.basename(rain_tif),
            "soil_moisture": os.path.basename(smap_tif),
            "susceptibility": os.path.basename(MODEL_A_COG_PATH),
        },
        "resolution_disclosure": {
            "satellite_soil_moisture_native": "9 km",
            "analysis_grid": "200 m",
            "honesty_note": (
                "Dynamic risk is computed on a 200m grid using NASA SMAP ~9km soil moisture "
                "resampled via bilinear interpolation. Native 200m satellite observation is not claimed."
            ),
        },
        "risk_distribution": {
            "total_cells": total_valid,
            "low_cells": low_count,
            "moderate_cells": mod_count,
            "high_cells": high_count,
            "critical_cells": crit_count,
            "min_score": round(float(np.min(valid_risk)), 4) if total_valid > 0 else 0.0,
            "max_score": round(float(np.max(valid_risk)), 4) if total_valid > 0 else 0.0,
            "mean_score": round(float(np.mean(valid_risk)), 4) if total_valid > 0 else 0.0,
        },
        "alerts_today": {
            "total_alert_cells": alerts_report["total_alert_cells"],
            "districts_at_risk_count": alerts_report["districts_at_risk_count"],
        },
        "artifacts": {
            "latest_risk_tif": latest_tif,
            "dated_risk_tif": dated_tif,
            "alerts_json": os.path.join(RISK_PROCESSED_DIR, "risk_alerts_today.json"),
        }
    }

    qc_path = os.path.join(RISK_PROCESSED_DIR, "risk_latest_qc.json")
    with open(qc_path, "w", encoding="utf-8") as f:
        json.dump(qc, f, indent=2)

    return qc


if __name__ == "__main__":
    run_unified_daily_pipeline()
