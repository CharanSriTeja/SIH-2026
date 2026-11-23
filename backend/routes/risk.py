import asyncio
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends
from utils.location_dependency import require_location, UserLocation
from services.prediction_service import prediction_service

router = APIRouter(prefix="/risk", tags=["risk"])

@router.get("/my-location")
async def get_risk_for_my_location(
    loc: UserLocation = Depends(require_location)
) -> Dict[str, Any]:
    """
    Returns the comprehensive landslide risk assessment for the authenticated user's location.
    Requires a valid location (either freshly provided via ?lat=&lon= or falls back to
    the user's saved location within the freshness window).
    Returns HTTP 428 Precondition Required if no location is available.
    """
    assessment = await asyncio.to_thread(
        prediction_service.get_full_risk_assessment,
        loc.latitude,
        loc.longitude
    )
    assessment["is_fresh_override"] = loc.is_fresh_override
    return assessment


@router.get("/alerts-today")
async def get_risk_alerts_today() -> Dict[str, Any]:
    """
    Returns today's high and critical landslide risk alerts aggregated by district.
    Derived from the daily regional Model B batch run across Northeast India.
    Cells with risk score >= 0.50 (High & Critical) are aggregated.
    """
    import os
    import json
    from config import BASE_DIR

    alerts_path = os.path.join(BASE_DIR, "data", "processed", "risk", "risk_alerts_today.json")
    if os.path.exists(alerts_path):
        try:
            with open(alerts_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            pass

    return {
        "status": "NO_ALERTS_YET",
        "date": None,
        "total_alert_cells": 0,
        "critical_cell_count": 0,
        "high_cell_count": 0,
        "districts_at_risk_count": 0,
        "districts": [],
        "hotspots": [],
    }


@router.get("/latest")
async def get_latest_risk_product() -> Dict[str, Any]:
    """
    Returns metadata and QC statistics for the latest 200m regional landslide risk raster.
    Includes honest resolution disclosure (resampled 9km SMAP observations).
    """
    import os
    import json
    from config import BASE_DIR

    qc_path = os.path.join(BASE_DIR, "data", "processed", "risk", "risk_latest_qc.json")
    if os.path.exists(qc_path):
        try:
            with open(qc_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            pass

    return {
        "status": "NOT_GENERATED",
        "message": "Unified daily pipeline has not run yet."
    }
