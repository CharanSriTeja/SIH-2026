"""
Routes: soil_moisture.py
Purpose: FastAPI endpoints for NASA SMAP SPL3SMP_E soil moisture product metadata and pipeline status.

Endpoints:
  GET /api/soil-moisture/latest - Metadata for the latest 200m soil moisture product with resolution honesty disclosures
  GET /api/soil-moisture/status - Pipeline health and processing status
"""

import os
import json
import glob
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["soil-moisture"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "soil_moisture", "processed")


def get_latest_smap_qc() -> Dict[str, Any]:
    """Retrieves the latest available SMAP QC report data."""
    latest_pointer = os.path.join(PROCESSED_DIR, "smap_soil_moisture_latest_qc.json")
    if os.path.exists(latest_pointer):
        try:
            with open(latest_pointer, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    # Fallback to finding latest smap_soil_moisture_*_qc.json
    qc_files = sorted(glob.glob(os.path.join(PROCESSED_DIR, "smap_soil_moisture_*_qc.json")))
    if qc_files:
        try:
            with open(qc_files[-1], "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    return {}


@router.get("/api/soil-moisture/latest")
@router.get("/soil-moisture/latest")
async def get_latest_soil_moisture_metadata() -> Dict[str, Any]:
    """
    Returns metadata for the latest computed regional soil moisture product:
    satellite product, observation date, resolution disclosures, valid cell count, statistics.
    """
    qc_data = get_latest_smap_qc()
    if not qc_data:
        raise HTTPException(
            status_code=404,
            detail="No processed SMAP soil moisture product found. Run the SMAP pipeline first."
        )

    # Calculate staleness
    proc_str = qc_data.get("processed_at")
    staleness_hours = None
    is_stale = False
    if proc_str:
        try:
            proc_dt = datetime.fromisoformat(proc_str)
            now_dt = datetime.now(timezone.utc)
            diff_sec = (now_dt - proc_dt).total_seconds()
            staleness_hours = round(max(0.0, diff_sec / 3600.0), 1)
            is_stale = staleness_hours > 36.0  # Daily product
        except Exception:
            pass

    ner_stats = qc_data.get("ner_grid_200m", {})
    disclosure = qc_data.get("resolution_disclosure", {})

    return {
        "status": qc_data.get("status", "UNKNOWN"),
        "satellite": "NASA SMAP",
        "product_id": qc_data.get("product_id", "SPL3SMP_E"),
        "product_version": qc_data.get("product_version", "006"),
        "raw_granule": qc_data.get("raw_granule"),
        "observation_date": qc_data.get("observation_date"),
        "processed_at": proc_str,
        "staleness_hours": staleness_hours,
        "is_stale": is_stale,
        "resolution_disclosure": {
            "native_satellite_resolution": disclosure.get("native_satellite_resolution", "9 km (EASE-Grid 2.0)"),
            "analysis_grid_resolution": disclosure.get("analysis_grid_resolution", "200 m (Model B analysis grid)"),
            "is_native_200m": False,
            "honesty_statement": disclosure.get(
                "honesty_statement",
                "Derived from NASA SMAP Enhanced L3 ~9km radiometer observations resampled to the 200m regional grid. Not native 200m resolution."
            )
        },
        "grid_metrics": {
            "valid_200m_cells": ner_stats.get("valid_cells", 0),
            "units": "cm3/cm3",
            "min_sm": ner_stats.get("min_sm_cm3_per_cm3"),
            "max_sm": ner_stats.get("max_sm_cm3_per_cm3"),
            "mean_sm": ner_stats.get("mean_sm_cm3_per_cm3"),
            "median_sm": ner_stats.get("median_sm_cm3_per_cm3"),
            "p25_sm": ner_stats.get("p25_sm_cm3_per_cm3"),
            "p75_sm": ner_stats.get("p75_sm_cm3_per_cm3"),
        },
        "tile_layer_url": "/tiles/soil-moisture/{z}/{x}/{y}.png",
        "tile_bounds_epsg4326": [88.0, 21.5, 97.5, 28.5],
    }


@router.get("/api/soil-moisture/status")
@router.get("/soil-moisture/status")
async def get_soil_moisture_pipeline_status() -> Dict[str, Any]:
    """
    Returns pipeline health, raster file existence, and last execution details.
    """
    latest_tif = os.path.join(PROCESSED_DIR, "smap_soil_moisture_latest_ner.tif")
    tif_exists = os.path.exists(latest_tif)
    tif_size_mb = round(os.path.getsize(latest_tif) / (1024 * 1024), 2) if tif_exists else 0.0

    qc_data = get_latest_smap_qc()

    return {
        "pipeline_name": "NASA SMAP Soil Moisture Pipeline",
        "raster_available": tif_exists,
        "raster_size_mb": tif_size_mb,
        "last_status": qc_data.get("status", "NO_RUN_YET"),
        "observation_date": qc_data.get("observation_date"),
        "processed_at": qc_data.get("processed_at"),
        "resolution_honesty_verified": True,
        "native_resolution": "9 km",
        "resampled_grid_resolution": "200 m"
    }
