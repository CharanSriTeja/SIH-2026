from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from routes.auth import get_current_user
from config import NER_LAT_MIN, NER_LAT_MAX, NER_LON_MIN, NER_LON_MAX

router = APIRouter(prefix="/profile", tags=["profile"])

# --- Request & Response Schemas ---

class LocationUpdateRequest(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")

class LocationUpdateResponse(BaseModel):
    status: str
    latitude: float
    longitude: float
    location_updated_at: str
    outside_primary_coverage: bool
    warning: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    preferred_language: Optional[str] = None

class ProfileResponse(BaseModel):
    id: str
    phone_number: str
    name: Optional[str] = None
    role: str
    preferred_language: str
    last_latitude: Optional[float] = None
    last_longitude: Optional[float] = None
    address_label: Optional[str] = None
    district_id: Optional[str] = None
    location_updated_at: Optional[str] = None
    created_at: Optional[str] = None

# --- Routes ---

@router.post("/location", response_model=LocationUpdateResponse)
async def update_location(
    body: LocationUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates the authenticated user's persistent GPS location coordinates.
    Checks whether coordinates fall within the primary Northeast Region (NER) coverage extent.
    """
    is_outside = not (
        NER_LAT_MIN <= body.latitude <= NER_LAT_MAX and
        NER_LON_MIN <= body.longitude <= NER_LON_MAX
    )
    
    warning_msg = None
    if is_outside:
        warning_msg = (
            "Your location appears to be outside our primary Northeast Region coverage area (Lat 21-30°N, Lon 88-98°E). "
            "Model predictions may be less accurate."
        )

    now = datetime.now(timezone.utc)
    current_user.last_latitude = body.latitude
    current_user.last_longitude = body.longitude
    current_user.location_updated_at = now
    
    await db.commit()
    await db.refresh(current_user)

    return LocationUpdateResponse(
        status="success",
        latitude=current_user.last_latitude,
        longitude=current_user.last_longitude,
        location_updated_at=current_user.location_updated_at.isoformat(),
        outside_primary_coverage=is_outside,
        warning=warning_msg
    )


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieves the complete profile for the authenticated user,
    including persisted location coordinates. Password hash is never exposed.
    """
    return ProfileResponse(
        id=str(current_user.id),
        phone_number=current_user.phone_number,
        name=current_user.name,
        role=current_user.role or "citizen",
        preferred_language=current_user.preferred_language or "en",
        last_latitude=current_user.last_latitude,
        last_longitude=current_user.last_longitude,
        address_label=current_user.address_label,
        district_id=str(current_user.district_id) if current_user.district_id else None,
        location_updated_at=current_user.location_updated_at.isoformat() if current_user.location_updated_at else None,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None
    )


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    body: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates editable profile fields (name, preferred_language).
    Does NOT allow phone number updates through this endpoint.
    """
    if body.name is not None:
        current_user.name = body.name.strip()
    if body.preferred_language is not None:
        current_user.preferred_language = body.preferred_language.strip().lower()

    await db.commit()
    await db.refresh(current_user)

    return ProfileResponse(
        id=str(current_user.id),
        phone_number=current_user.phone_number,
        name=current_user.name,
        role=current_user.role or "citizen",
        preferred_language=current_user.preferred_language or "en",
        last_latitude=current_user.last_latitude,
        last_longitude=current_user.last_longitude,
        address_label=current_user.address_label,
        district_id=str(current_user.district_id) if current_user.district_id else None,
        location_updated_at=current_user.location_updated_at.isoformat() if current_user.location_updated_at else None,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None
    )
