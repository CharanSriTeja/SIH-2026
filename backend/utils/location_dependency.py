from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, Query, Request, status
from models.user import User
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from services.auth_service import decode_access_token
from config import LOCATION_FRESHNESS_HOURS

class UserLocation:
    def __init__(self, latitude: float, longitude: float, is_fresh_override: bool = False, user: Optional[User] = None):
        self.latitude = latitude
        self.longitude = longitude
        self.is_fresh_override = is_fresh_override
        self.user = user

async def require_location(
    request: Request,
    lat: Optional[float] = Query(None, description="Explicit latitude override in decimal degrees"),
    lon: Optional[float] = Query(None, description="Explicit longitude override in decimal degrees"),
    db: AsyncSession = Depends(get_db)
) -> UserLocation:
    """
    Ensures that a valid location is available for location-gated endpoints.
    1. Checks if fresh lat & lon are explicitly provided in request query parameters.
    2. Falls back to authenticated user's saved location within the freshness window.
    3. Raises HTTP 428 (Precondition Required) if no valid location exists.
    """
    # 1. Fresh override provided
    if lat is not None and lon is not None:
        if -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0:
            return UserLocation(latitude=lat, longitude=lon, is_fresh_override=True)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Provided latitude or longitude is out of valid geographic range."
            )

    # 2. Extract user if token present
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required when lat/lon coordinates are not provided."
        )

    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = payload.get("id")
    result = await db.execute(select(User).where(User.id == user_id))
    current_user = result.scalars().first()
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    # Check saved user location and freshness
    if current_user.last_latitude is not None and current_user.last_longitude is not None:
        if current_user.location_updated_at:
            updated_at = current_user.location_updated_at
            if updated_at.tzinfo is None:
                updated_at = updated_at.replace(tzinfo=timezone.utc)
            now_utc = datetime.now(timezone.utc)
            freshness_limit = timedelta(hours=LOCATION_FRESHNESS_HOURS)
            
            if now_utc - updated_at <= freshness_limit:
                return UserLocation(
                    latitude=current_user.last_latitude,
                    longitude=current_user.last_longitude,
                    is_fresh_override=False,
                    user=current_user
                )
        else:
            return UserLocation(
                latitude=current_user.last_latitude,
                longitude=current_user.last_longitude,
                is_fresh_override=False,
                user=current_user
            )

    # 3. No valid location found -> HTTP 428 Precondition Required
    raise HTTPException(
        status_code=status.HTTP_428_PRECONDITION_REQUIRED,
        detail="Location required. Please provide your current GPS coordinates to access this service."
    )
