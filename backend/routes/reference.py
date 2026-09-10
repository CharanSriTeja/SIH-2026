from typing import Dict, List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from models.district import District

router = APIRouter(prefix="/reference", tags=["reference"])

@router.get("/states-districts")
async def get_states_districts(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    """
    Returns the comprehensive list of Northeast Region (NER) states and their districts.
    Public reference data used for frontend cascading dropdowns and spatial matching.
    """
    stmt = select(District).order_by(District.state_name, District.district_name)
    result = await db.execute(stmt)
    districts = result.scalars().all()

    # Formatted mapping { "Assam": ["Baksa", "Barpeta", ...], ... }
    states_dict: Dict[str, List[str]] = {}
    detailed_list: List[Dict[str, Any]] = []

    for d in districts:
        if d.state_name not in states_dict:
            states_dict[d.state_name] = []
        states_dict[d.state_name].append(d.district_name)
        detailed_list.append({
            "id": str(d.id),
            "state_name": d.state_name,
            "district_name": d.district_name,
            "centroid_lat": d.centroid_lat,
            "centroid_lon": d.centroid_lon
        })

    return {
        "states": list(states_dict.keys()),
        "districts_by_state": states_dict,
        "districts": detailed_list,
        "all_districts": detailed_list
    }
