import os
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import pandas as pd

from database import get_db
from models.user import User
from models.shelter import Shelter
from routes.auth import get_current_user
from services.routing_service import get_road_route
from config import BASE_DIR

router = APIRouter(prefix="/citizen", tags=["citizen"])

def haversine(lon1: float, lat1: float, lon2: float, lat2: float) -> float:
    from math import radians, cos, sin, asin, sqrt
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 # Radius of earth in kilometers
    return c * r

@router.get("/nearest-facilities")
async def get_nearest_facilities(
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    
    origin_lat = lat if lat is not None else current_user.last_latitude
    origin_lon = lon if lon is not None else current_user.last_longitude
    
    if origin_lat is None or origin_lon is None:
        raise HTTPException(status_code=400, detail="Location not provided and no saved location found.")
        
    # 1. Fetch Shelters
    stmt = select(Shelter).where(Shelter.is_active == True)
    result = await db.execute(stmt)
    shelters = result.scalars().all()
    
    shelter_candidates = []
    for s in shelters:
        dist = haversine(origin_lon, origin_lat, s.longitude, s.latitude)
        shelter_candidates.append({
            "id": str(s.id),
            "name": s.name,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "straight_dist": dist,
            "type": "shelter"
        })
        
    shelter_candidates.sort(key=lambda x: x["straight_dist"])
    top_shelters = shelter_candidates[:3]
    
    # 2. Fetch Hospitals
    hospital_candidates = []
    hospitals_parquet = os.path.join(BASE_DIR, "data", "Hospitals", "hospitals_ner.parquet")
    if os.path.exists(hospitals_parquet):
        df = pd.read_parquet(hospitals_parquet)
        if "name" in df.columns and "latitude" in df.columns and "longitude" in df.columns:
            # We don't want to iterate over all rows inefficiently, but since it's just a few thousand we can vectorize haversine
            import numpy as np
            
            lon1, lat1, lon2, lat2 = map(np.radians, [origin_lon, origin_lat, df['longitude'], df['latitude']])
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
            c = 2 * np.arcsin(np.sqrt(a))
            km = 6371 * c
            
            df['straight_dist'] = km
            top_h_df = df.nsmallest(3, 'straight_dist')
            for _, row in top_h_df.iterrows():
                hospital_candidates.append({
                    "name": row.get("name", "Unknown Hospital"),
                    "latitude": float(row["latitude"]),
                    "longitude": float(row["longitude"]),
                    "straight_dist": float(row["straight_dist"]),
                    "type": "hospital"
                })
                
    # 3. Route to top candidates
    nearest_shelter = None
    nearest_hospital = None
    min_shelter_dist = float('inf')
    min_hospital_dist = float('inf')
    routing_method = "straight_line_fallback"
    
    for s in top_shelters:
        route = get_road_route(origin_lat, origin_lon, s["latitude"], s["longitude"])
        if route["routing_method"] == "osrm":
            routing_method = "osrm"
            
        if route["distance_km"] < min_shelter_dist:
            min_shelter_dist = route["distance_km"]
            nearest_shelter = {
                "name": s["name"],
                "latitude": s["latitude"],
                "longitude": s["longitude"],
                "distance_km": route["distance_km"],
                "duration_minutes": route["duration_minutes"],
                "route_geometry": route["route_geometry"]
            }
            
    nearest_hospital_list = []
    
    for h in hospital_candidates:
        route = get_road_route(origin_lat, origin_lon, h["latitude"], h["longitude"])
        if route["routing_method"] == "osrm":
            routing_method = "osrm"
            
        nearest_hospital_list.append({
            "name": h["name"],
            "latitude": h["latitude"],
            "longitude": h["longitude"],
            "distance_km": route["distance_km"],
            "duration_minutes": route["duration_minutes"],
            "route_geometry": route["route_geometry"]
        })
            
    # Sort hospitals by duration (or distance) to find the nearest
    nearest_hospital_list.sort(key=lambda x: x["distance_km"])
    top_3_hospitals = nearest_hospital_list[:3]

    return {
        "nearest_shelter": nearest_shelter,
        "nearest_hospitals": top_3_hospitals,
        "routing_method": routing_method
    }

