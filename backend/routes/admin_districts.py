import re
import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from database import get_db
from models.user import User
from models.district import District
from models.report import CitizenReport
from routes.auth import get_current_user
from utils.validation import validate_indian_phone_number
from services.auth_service import get_password_hash

router = APIRouter(prefix="/admin", tags=["admin-districts"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency ensuring only top-level 'admin' role can access these routes."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Super Administrator credentials required."
        )
    return current_user


class CreateDistrictAdminRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone_number: str
    password: str = Field(..., min_length=8)
    state_name: str
    district_name: str


class DistrictAdminResponse(BaseModel):
    id: str
    name: str
    phone_number: str
    role: str
    state_name: str
    district_name: str
    district_id: str
    is_verified: bool
    created_at: Optional[str] = None


@router.post("/district-admins", status_code=status.HTTP_201_CREATED)
async def create_district_admin(
    payload: CreateDistrictAdminRequest,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Creates a new District Administrator account directly assigned to a specific district.
    Available only to top-level Super Administrators (role='admin').
    """
    # 1. Validate phone number
    try:
        phone = validate_indian_phone_number(payload.phone_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Validate password strength (min 8 chars, letter + number)
    pwd = payload.password
    if len(pwd) < 8 or not re.search(r'[A-Za-z]', pwd) or not re.search(r'[0-9]', pwd):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long and contain both letters and numbers."
        )

    # 3. Look up district by state_name and district_name
    dist_stmt = select(District).where(
        District.state_name == payload.state_name.strip(),
        District.district_name == payload.district_name.strip()
    )
    dist_res = await db.execute(dist_stmt)
    district = dist_res.scalars().first()
    if not district:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid state/district combination: '{payload.district_name}' not found in state '{payload.state_name}'."
        )

    # 4. Check if phone_number is already registered
    existing_stmt = select(User).where(User.phone_number == phone)
    existing_res = await db.execute(existing_stmt)
    if existing_res.scalars().first():
        raise HTTPException(
            status_code=400,
            detail=f"Phone number {phone} is already registered to an existing account."
        )

    # 5. Hash password
    pwd_hash = get_password_hash(pwd)

    # 6. Create verified district_admin user
    target_state_name = district.state_name
    target_district_name = district.district_name
    target_district_id = district.id

    new_admin = User(
        name=payload.name.strip(),
        phone_number=phone,
        password_hash=pwd_hash,
        role="district_admin",
        is_verified=True,
        district_id=target_district_id,
    )
    db.add(new_admin)
    await db.commit()
    await db.refresh(new_admin)

    return {
        "message": "District Administrator created successfully",
        "user": {
            "id": str(new_admin.id),
            "name": new_admin.name,
            "phone_number": new_admin.phone_number,
            "role": new_admin.role,
            "state_name": target_state_name,
            "district_name": target_district_name,
            "district_id": str(target_district_id),
            "is_verified": new_admin.is_verified,
            "created_at": new_admin.created_at.isoformat() if new_admin.created_at else None
        }
    }


@router.get("/district-admins")
async def list_district_admins(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Returns the complete roster of District Administrators with their assigned jurisdictions.
    """
    stmt = (
        select(User, District)
        .outerjoin(District, User.district_id == District.id)
        .where(User.role == "district_admin")
        .order_by(User.created_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    admins_list = []
    for user_obj, district_obj in rows:
        admins_list.append({
            "id": str(user_obj.id),
            "name": user_obj.name,
            "phone_number": user_obj.phone_number,
            "role": user_obj.role,
            "state_name": district_obj.state_name if district_obj else "Unassigned",
            "district_name": district_obj.district_name if district_obj else "Unassigned",
            "district_id": str(district_obj.id) if district_obj else None,
            "is_verified": user_obj.is_verified,
            "created_at": user_obj.created_at.isoformat() if user_obj.created_at else None
        })
    return admins_list


@router.delete("/district-admins/{admin_id}")
async def delete_district_admin(
    admin_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Removes / deactivates a District Administrator account.
    """
    try:
        user_uuid = uuid.UUID(admin_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    stmt = select(User).where(User.id == user_uuid, User.role == "district_admin")
    result = await db.execute(stmt)
    target_user = result.scalars().first()

    if not target_user:
        raise HTTPException(status_code=404, detail="District Administrator not found.")

    await db.delete(target_user)
    await db.commit()

    return {
        "success": True,
        "message": f"District Administrator account for {target_user.name} ({target_user.phone_number}) successfully removed."
    }


@router.get("/reports")
async def get_all_admin_reports(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Returns all citizen hazard reports across all districts for regional SDMA command.
    """
    stmt = (
        select(CitizenReport, District, User)
        .outerjoin(District, CitizenReport.district_id == District.id)
        .outerjoin(User, CitizenReport.user_id == User.id)
        .order_by(CitizenReport.submitted_at.desc())
    )
    result = await db.execute(stmt)
    rows = result.all()

    report_list = []
    for report_obj, district_obj, user_obj in rows:
        report_list.append({
            "id": str(report_obj.id),
            "user_id": str(report_obj.user_id),
            "citizen_name": user_obj.name if user_obj else "Citizen",
            "citizen_phone": user_obj.phone_number if user_obj else None,
            "district_id": str(report_obj.district_id),
            "district_name": district_obj.district_name if district_obj else "Unknown",
            "state_name": district_obj.state_name if district_obj else "Unknown",
            "latitude": report_obj.latitude,
            "longitude": report_obj.longitude,
            "hazard_type": report_obj.hazard_type,
            "description": report_obj.description,
            "photo_path": report_obj.photo_path,
            "status": report_obj.status,
            "submitted_at": report_obj.submitted_at.isoformat() if report_obj.submitted_at else None,
            "reviewed_at": report_obj.reviewed_at.isoformat() if report_obj.reviewed_at else None,
        })
    return report_list


@router.patch("/reports/{report_id}")
async def update_admin_report_status(
    report_id: str,
    payload: Dict[str, Any],
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Allow super-admin to review (verify / dismiss / reset) any citizen hazard report.
    """
    new_status = payload.get("status", "").lower().strip()
    valid_statuses = {"pending", "verified", "dismissed"}
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    try:
        report_uuid = uuid.UUID(report_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid report UUID format")

    stmt = select(CitizenReport).where(CitizenReport.id == report_uuid)
    result = await db.execute(stmt)
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hazard report not found")

    from datetime import datetime
    report.status = new_status
    report.reviewed_at = datetime.utcnow()
    report.reviewed_by = admin_user.id

    await db.commit()
    await db.refresh(report)

    return {
        "success": True,
        "message": f"Report marked as {new_status}",
        "status": report.status,
        "report_id": str(report.id)
    }



