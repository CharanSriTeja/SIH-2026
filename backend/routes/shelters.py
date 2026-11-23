import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.user import User
from models.shelter import Shelter
from routes.auth import get_current_user

router = APIRouter(prefix="/district-admin/shelters", tags=["shelters"])

def require_district_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency ensuring only district admins can access these routes."""
    if current_user.role != "district_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: District Administrator credentials required."
        )
    return current_user

class ShelterCreate(BaseModel):
    name: str
    address: str | None = None
    latitude: float
    longitude: float
    capacity: int | None = None
    contact_phone: str | None = None

class ShelterUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    capacity: int | None = None
    contact_phone: str | None = None
    is_active: bool | None = None

class ShelterResponse(BaseModel):
    id: str
    district_id: str
    name: str
    address: str | None
    latitude: float
    longitude: float
    capacity: int | None
    contact_phone: str | None
    is_active: bool

@router.post("", response_model=ShelterResponse, status_code=status.HTTP_201_CREATED)
async def create_shelter(
    payload: ShelterCreate,
    admin_user: User = Depends(require_district_admin),
    db: AsyncSession = Depends(get_db)
):
    if not admin_user.district_id:
        raise HTTPException(status_code=400, detail="District Admin is not assigned to a district.")

    new_shelter = Shelter(
        district_id=admin_user.district_id,
        name=payload.name.strip(),
        address=payload.address.strip() if payload.address else None,
        latitude=payload.latitude,
        longitude=payload.longitude,
        capacity=payload.capacity,
        contact_phone=payload.contact_phone.strip() if payload.contact_phone else None,
        created_by=admin_user.id
    )
    
    db.add(new_shelter)
    await db.commit()
    await db.refresh(new_shelter)
    
    return {
        "id": str(new_shelter.id),
        "district_id": str(new_shelter.district_id),
        "name": new_shelter.name,
        "address": new_shelter.address,
        "latitude": new_shelter.latitude,
        "longitude": new_shelter.longitude,
        "capacity": new_shelter.capacity,
        "contact_phone": new_shelter.contact_phone,
        "is_active": new_shelter.is_active
    }

@router.get("", response_model=List[ShelterResponse])
async def list_shelters(
    admin_user: User = Depends(require_district_admin),
    db: AsyncSession = Depends(get_db)
):
    if not admin_user.district_id:
        return []
        
    stmt = select(Shelter).where(Shelter.district_id == admin_user.district_id).order_by(Shelter.created_at.desc())
    result = await db.execute(stmt)
    shelters = result.scalars().all()
    
    return [
        {
            "id": str(s.id),
            "district_id": str(s.district_id),
            "name": s.name,
            "address": s.address,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "capacity": s.capacity,
            "contact_phone": s.contact_phone,
            "is_active": s.is_active
        } for s in shelters
    ]

@router.patch("/{shelter_id}", response_model=ShelterResponse)
async def update_shelter(
    shelter_id: str,
    payload: ShelterUpdate,
    admin_user: User = Depends(require_district_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        suuid = uuid.UUID(shelter_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid shelter ID")
        
    stmt = select(Shelter).where(Shelter.id == suuid, Shelter.district_id == admin_user.district_id)
    result = await db.execute(stmt)
    shelter = result.scalars().first()
    
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found or unauthorized")
        
    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(shelter, key, value)
        
    await db.commit()
    await db.refresh(shelter)
    
    return {
        "id": str(shelter.id),
        "district_id": str(shelter.district_id),
        "name": shelter.name,
        "address": shelter.address,
        "latitude": shelter.latitude,
        "longitude": shelter.longitude,
        "capacity": shelter.capacity,
        "contact_phone": shelter.contact_phone,
        "is_active": shelter.is_active
    }

@router.delete("/{shelter_id}")
async def delete_shelter(
    shelter_id: str,
    admin_user: User = Depends(require_district_admin),
    db: AsyncSession = Depends(get_db)
):
    try:
        suuid = uuid.UUID(shelter_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid shelter ID")
        
    stmt = select(Shelter).where(Shelter.id == suuid, Shelter.district_id == admin_user.district_id)
    result = await db.execute(stmt)
    shelter = result.scalars().first()
    
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found or unauthorized")
        
    # Soft delete
    shelter.is_active = False
    await db.commit()
    
    return {"success": True, "message": "Shelter deactivated successfully"}

# Public endpoint for citizen app
@router.get("/public/nearby")
async def get_nearby_shelters(
    lat: float,
    lon: float,
    limit: int = 5,
    db: AsyncSession = Depends(get_db)
):
    # This just returns all active shelters. The actual nearest routing logic
    # is handled in the /citizen/nearest-facilities endpoint.
    # We can use a bounding box or simple distance here if needed, but for now we just return active shelters.
    stmt = select(Shelter).where(Shelter.is_active == True)
    result = await db.execute(stmt)
    shelters = result.scalars().all()
    
    from services.routing_service import get_road_route
    # Simple straight line distance to filter top 5
    from math import radians, cos, sin, asin, sqrt
    def haversine(lon1, lat1, lon2, lat2):
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a)) 
        r = 6371 # Radius of earth in kilometers
        return c * r
        
    for s in shelters:
        s.dist = haversine(lon, lat, s.longitude, s.latitude)
        
    shelters.sort(key=lambda s: s.dist)
    top_shelters = shelters[:limit]
    
    return [
        {
            "id": str(s.id),
            "district_id": str(s.district_id),
            "name": s.name,
            "address": s.address,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "capacity": s.capacity,
            "contact_phone": s.contact_phone,
            "distance_km": round(s.dist, 2)
        } for s in top_shelters
    ]
