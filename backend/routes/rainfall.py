"""
Routes: rainfall.py
Purpose: FastAPI endpoints for regional 24-hour rainfall product metadata and system health.

Endpoints:
  GET /api/rainfall/latest - Metadata for the latest 24h rainfall product
  GET /api/system/status   - Regional pipeline health and data completeness status
"""

import os
import json
import glob
from datetime import datetime, timezone
from typing import Dict, Any
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["rainfall", "system"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed", "rainfall")

def get_latest_qc_data() -> Dict[str, Any]:
    """Retrieves the latest available QC report data."""
    latest_pointer = os.path.join(PROCESSED_DIR, "latest_qc.json")
    if os.path.exists(latest_pointer):
        try:
            with open(latest_pointer, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    # Fallback to finding latest rainfall_24h_*_qc.json
    qc_files = sorted(glob.glob(os.path.join(PROCESSED_DIR, "rainfall_24h_*_qc.json")))
    if qc_files:
        try:
            with open(qc_files[-1], "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    return {}


@router.get("/api/rainfall/latest")
@router.get("/rainfall/latest")
async def get_latest_rainfall_metadata() -> Dict[str, Any]:
    """
    Returns metadata for the latest computed 24-hour rainfall product:
    timestamp, completeness %, status (COMPLETE/PARTIAL/FAILED), min/max/mean (mm).
    """
    qc_data = get_latest_qc_data()
    if not qc_data:
        raise HTTPException(
            status_code=404,
            detail="No processed 24-hour rainfall product found. Run the rainfall pipeline first."
        )

    # Calculate staleness
    gen_str = qc_data.get("generated_at")
    staleness_hours = None
    is_stale = False
    if gen_str:
        try:
            gen_dt = datetime.fromisoformat(gen_str)
            now_dt = datetime.now(timezone.utc)
            diff_sec = (now_dt - gen_dt).total_seconds()
            staleness_hours = round(max(0.0, diff_sec / 3600.0), 1)
            is_stale = staleness_hours > 30.0
        except Exception:
            pass

    geotiff_path = qc_data.get("geotiff_path", "")
    if not geotiff_path and qc_data.get("date"):
        date_compact = str(qc_data["date"]).replace("-", "")
        cand = os.path.join(PROCESSED_DIR, f"rainfall_24h_{date_compact}.tif")
        if os.path.exists(cand):
            geotiff_path = cand
    geotiff_exists = bool(geotiff_path and os.path.exists(geotiff_path))

    return {
        "date": qc_data.get("date"),
        "timestamp": qc_data.get("generated_at"),
        "status": qc_data.get("status", "UNKNOWN"),
        "completeness_pct": qc_data.get("completeness_pct", 0.0),
        "available_observations": qc_data.get("available_observations", 0),
        "expected_observations": qc_data.get("expected_observations", 48),
        "rainfall_min_mm": qc_data.get("rainfall_min_mm", 0.0),
        "rainfall_max_mm": qc_data.get("rainfall_max_mm", 0.0),
        "rainfall_mean_mm": qc_data.get("rainfall_mean_mm", 0.0),
        "nodata_pct": qc_data.get("nodata_pct", 0.0),
        "geotiff_path": geotiff_path,
        "geotiff_exists": geotiff_exists,
        "staleness_hours": staleness_hours,
        "is_stale": is_stale,
        "units": "mm"
    }


@router.get("/api/system/status")
@router.get("/system/status")
async def get_system_status() -> Dict[str, Any]:
    """
    Returns system status focused on the regional 24-hour rainfall pipeline:
    latest timestamp, file count, data completeness, and processing status.
    """
    qc_data = get_latest_qc_data()

    gen_str = qc_data.get("generated_at")
    staleness_hours = None
    is_stale = False
    if gen_str:
        try:
            gen_dt = datetime.fromisoformat(gen_str)
            now_dt = datetime.now(timezone.utc)
            diff_sec = (now_dt - gen_dt).total_seconds()
            staleness_hours = round(max(0.0, diff_sec / 3600.0), 1)
            is_stale = staleness_hours > 30.0
        except Exception:
            pass

    has_rainfall = bool(qc_data)
    pipeline_status = qc_data.get("status", "NO_DATA")

    return {
        "system_status": "ONLINE",
        "coverage_region": "Northeast India (NER)",
        "bounding_box": {
            "west": 88.0,
            "south": 21.5,
            "east": 97.5,
            "north": 28.5
        },
        "rainfall_pipeline": {
            "is_available": has_rainfall,
            "latest_date": qc_data.get("date"),
            "latest_timestamp": qc_data.get("generated_at"),
            "status": pipeline_status,
            "file_count": qc_data.get("available_observations", 0),
            "expected_files": qc_data.get("expected_observations", 48),
            "data_completeness_pct": qc_data.get("completeness_pct", 0.0),
            "staleness_hours": staleness_hours,
            "is_stale": is_stale,
            "source_product": "INSAT-3DR IMAGER (3RIMG_L2G_IMR)"
        },
        "soil_moisture_integration": {
            "status": "STUBBED_PENDING_PHASE",
            "message": "Soil moisture integration will follow as a separate step. Input is cleanly stubbed."
        },
        "model_b_dynamic_risk": {
            "status": "STUBBED_PENDING_SOIL_MOISTURE",
            "message": "Rainfall feature ready across 200m grid. Risk inference stubbed pending soil moisture."
        }
    }
