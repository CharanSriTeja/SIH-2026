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
