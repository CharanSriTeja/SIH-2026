from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import logging
import asyncio

from utils.validation import validate_indian_phone_number
from services.alert_service import get_alert_service
from config import settings

logger = logging.getLogger("landslide_sms.routes")

router = APIRouter(prefix="/alerts", tags=["Emergency Alerts"])

# --- Request / Response Schemas ---

class SendAlertRequest(BaseModel):
    phone_number: str = Field(..., description="Indian phone number (e.g. 9876543210 or +919876543210)")
    risk_level: str = Field("HIGH", description="Risk level (e.g., MODERATE, HIGH, CRITICAL)")
    location_name: Optional[str] = Field(None, description="Affected locality, village, or district name")
    custom_message: Optional[str] = Field(None, description="Advisory or warning instructions")
    latitude: Optional[float] = Field(None, description="Latitude of threatened area")
    longitude: Optional[float] = Field(None, description="Longitude of threatened area")
    template_id: Optional[str] = Field(None, description="Optional MSG91 Flow template ID override")
    variables: Optional[Dict[str, Any]] = Field(None, description="Custom template variables map")
    bypass_cooldown: bool = Field(False, description="Whether to bypass deduplication/cooldown checks")

class HazardAlertRequest(BaseModel):
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    phone_number: str = Field(..., description="Recipient mobile number")
    location_name: Optional[str] = Field(None, description="Optional friendly location name")

# --- Routes ---

@router.get("/status")
def get_alerts_status():
    """
    Returns the operational status of the emergency SMS alerting system.
    """
    return {
        "provider": "msg91",
        "enabled": settings.MSG91_ENABLED,
        "cooldown_minutes": settings.ALERT_COOLDOWN_MINUTES,
        "sender_id": settings.MSG91_SENDER_ID,
        "is_configured": bool(settings.MSG91_AUTH_KEY and settings.MSG91_AUTH_KEY != "your_msg91_auth_key_here")
    }

@router.post("/sms")
def send_emergency_sms(request: SendAlertRequest):
    """
    Dispatches an emergency landslide SMS alert to a resident.
    Validates phone number, enforces cooldown window, and logs the transaction.
    """
    # Validate phone number
    try:
        canonical_phone = validate_indian_phone_number(request.phone_number)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

    alert_service = get_alert_service()
    result = alert_service.send_alert(
        phone_number=canonical_phone,
        risk_level=request.risk_level,
        location_name=request.location_name,
        custom_message=request.custom_message,
        latitude=request.latitude,
        longitude=request.longitude,
        template_id=request.template_id,
        variables=request.variables,
        bypass_cooldown=request.bypass_cooldown
    )

    if result.get("status") == "THROTTLED":
        # 429 Too Many Requests (standard for rate-limited/cooldown requests)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "message": result["message"],
                "cooldown_remaining_minutes": result.get("cooldown_remaining_minutes"),
                "masked_recipient": result.get("masked_recipient")
            }
        )

    return result

@router.post("/dispatch-hazard")
async def dispatch_hazard_assessment(request: HazardAlertRequest):
    """
    Performs live AI hazard evaluation (Model B) for coordinates,
    and automatically sends an alert if the assessed risk is High or Critical.
    """
    try:
        canonical_phone = validate_indian_phone_number(request.phone_number)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

    alert_service = get_alert_service()
    result = await asyncio.to_thread(
        alert_service.dispatch_hazard_assessment_alert,
        request.latitude,
        request.longitude,
        canonical_phone,
        request.location_name
    )

    return result

@router.get("/history")
def get_alerts_history(limit: int = Query(50, ge=1, le=200)):
    """
    Returns audit history of recent alerts with masked recipient phone numbers.
    """
    alert_service = get_alert_service()
    return alert_service.get_recent_alerts(limit=limit)
