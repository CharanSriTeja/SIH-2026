import requests
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Public OSRM API for driving routes
OSRM_BASE_URL = "http://router.project-osrm.org/route/v1/driving"

def get_road_route(origin_lat: float, origin_lon: float, dest_lat: float, dest_lon: float) -> Dict[str, Any]:
    """
    Calculates the road distance and duration between two points using OSRM.
    Falls back to straight-line distance (haversine) if OSRM fails.
    
    Returns:
        {
            "distance_km": float,
            "duration_minutes": float,
            "route_geometry": dict (GeoJSON LineString) or None,
            "routing_method": str ("osrm" or "straight_line_fallback")
        }
    """
    try:
        # OSRM expects coordinates in lon,lat order
        url = f"{OSRM_BASE_URL}/{origin_lon},{origin_lat};{dest_lon},{dest_lat}?overview=full&geometries=geojson"
        
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
            route = data["routes"][0]
            distance_meters = route.get("distance", 0)
            duration_seconds = route.get("duration", 0)
            geometry = route.get("geometry")
            
            return {
                "distance_km": round(distance_meters / 1000.0, 2),
                "duration_minutes": round(duration_seconds / 60.0, 2),
                "route_geometry": geometry,
                "routing_method": "osrm"
            }
            
    except Exception as e:
        logger.warning(f"OSRM routing failed, falling back to straight-line: {e}")
        
    # Fallback to straight-line distance
    from math import radians, cos, sin, asin, sqrt
    
    def haversine(lon1, lat1, lon2, lat2):
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a)) 
        r = 6371 # Radius of earth in kilometers
        return c * r
        
    distance_km = round(haversine(origin_lon, origin_lat, dest_lon, dest_lat), 2)
    # Estimate duration assuming 40 km/h average speed in rural/semi-urban India
    duration_minutes = round((distance_km / 40.0) * 60, 2)
    
    return {
        "distance_km": distance_km,
        "duration_minutes": duration_minutes,
        "route_geometry": None,
        "routing_method": "straight_line_fallback"
    }
