import re
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_
from sqlalchemy.orm import aliased
import glob
import shutil
import os

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
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Returns all citizen hazard reports across all districts for SDMA top-level command oversight.
    Supports filtering by state, district, review status, and date range.
    """
    submitter_alias = aliased(User)
    reviewer_alias = aliased(User)

    query_conditions = []
    if state and state.strip() and state.strip().lower() != 'all':
        query_conditions.append(District.state_name.ilike(f"%{state.strip()}%"))
    if district and district.strip() and district.strip().lower() != 'all':
        query_conditions.append(District.district_name.ilike(f"%{district.strip()}%"))
    if status and status.strip() and status.strip().lower() != 'all':
        query_conditions.append(CitizenReport.status == status.strip().lower())
    if date_from and date_from.strip():
        try:
            df = datetime.fromisoformat(date_from.replace("Z", "+00:00"))
            query_conditions.append(CitizenReport.submitted_at >= df)
        except Exception:
            pass
    if date_to and date_to.strip():
        try:
            dt = datetime.fromisoformat(date_to.replace("Z", "+00:00"))
            query_conditions.append(CitizenReport.submitted_at <= dt)
        except Exception:
            pass

    stmt = (
        select(CitizenReport, District, submitter_alias, reviewer_alias)
        .outerjoin(District, CitizenReport.district_id == District.id)
        .outerjoin(submitter_alias, CitizenReport.user_id == submitter_alias.id)
        .outerjoin(reviewer_alias, CitizenReport.reviewed_by == reviewer_alias.id)
    )
    if query_conditions:
        stmt = stmt.where(and_(*query_conditions))
    stmt = stmt.order_by(CitizenReport.submitted_at.desc())

    result = await db.execute(stmt)
    rows = result.all()

    report_list = []
    for report_obj, district_obj, submitter, reviewer in rows:
        photo_filename = Path(report_obj.photo_path).name if report_obj.photo_path else ""
        photo_url = f"/uploads/citizen_reports/{report_obj.district_id}/{photo_filename}" if report_obj.photo_path else None

        report_list.append({
            "id": str(report_obj.id),
            "user_id": str(report_obj.user_id) if report_obj.user_id else None,
            "citizen_name": submitter.name if submitter else "Citizen",
            "citizen_phone": submitter.phone_number if submitter else None,
            "district_id": str(report_obj.district_id),
            "district_name": district_obj.district_name if district_obj else "Unknown",
            "state_name": district_obj.state_name if district_obj else "Unknown",
            "latitude": report_obj.latitude,
            "longitude": report_obj.longitude,
            "hazard_type": report_obj.hazard_type,
            "description": report_obj.description,
            "photo_path": report_obj.photo_path,
            "photo_url": photo_url,
            "status": report_obj.status,
            "submitted_at": report_obj.submitted_at.isoformat() if report_obj.submitted_at else None,
            "reviewed_at": report_obj.reviewed_at.isoformat() if report_obj.reviewed_at else None,
            "reviewed_by": str(report_obj.reviewed_by) if report_obj.reviewed_by else None,
            "reviewed_by_name": reviewer.name if reviewer else None,
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

from fastapi import BackgroundTasks
from services.unified_daily_pipeline import run_unified_daily_pipeline

@router.post("/run-pipeline")
async def trigger_pipeline(
    background_tasks: BackgroundTasks,
    admin_user: User = Depends(require_admin)
) -> Dict[str, Any]:
    """
    Manually trigger the MOSDAC and NASA data fetching and processing pipeline.
    Runs in the background.
    """
    # Using background task so we don't block the request for a long time
    background_tasks.add_task(run_unified_daily_pipeline, force=True)
    return {
        "success": True,
        "message": "Data fetching pipeline triggered in the background. Check backend logs for progress."
    }

@router.get("/data-dates")
async def get_available_data_dates(admin_user: User = Depends(require_admin)) -> List[str]:
    """
    Scans the processed risk directory to find available historical data dates.
    """
    from config import BASE_DIR
    risk_dir = os.path.join(BASE_DIR, "data", "processed", "risk")
    if not os.path.exists(risk_dir):
        return []
    
    files = glob.glob(os.path.join(risk_dir, "landslide_risk_*.tif"))
    dates = []
    for fp in files:
        name = os.path.basename(fp)
        match = re.search(r'landslide_risk_(\d{8})\.tif', name)
        if match:
            # Format to YYYY-MM-DD
            d = match.group(1)
            dates.append(f"{d[:4]}-{d[4:6]}-{d[6:]}")
    
    return sorted(list(set(dates)), reverse=True)

@router.delete("/data-dates/{date_str}")
async def delete_historical_data(date_str: str, admin_user: User = Depends(require_admin)) -> Dict[str, Any]:
    """
    Deletes raw and processed files for a specific date (YYYY-MM-DD) to free up space.
    """
    from config import BASE_DIR
    compact_date = date_str.replace("-", "")
    
    if not re.match(r'^\d{8}$', compact_date):
        raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD.")

    deleted_files = []
    
    # 1. Risk files
    risk_dir = os.path.join(BASE_DIR, "data", "processed", "risk")
    for ext in ['.tif', '_qc.json']:
        fp = os.path.join(risk_dir, f"landslide_risk_{compact_date}{ext}")
        if os.path.exists(fp):
            os.remove(fp)
            deleted_files.append(fp)
            
    # 2. Rainfall processed
    rain_dir = os.path.join(BASE_DIR, "data", "processed", "rainfall")
    for ext in ['.tif', '_qc.json']:
        fp = os.path.join(rain_dir, f"rainfall_24h_{compact_date}{ext}")
        if os.path.exists(fp):
            os.remove(fp)
            deleted_files.append(fp)
            
    # 3. SMAP processed
    smap_dir = os.path.join(BASE_DIR, "data", "soil_moisture", "processed")
    fp = os.path.join(smap_dir, f"smap_soil_moisture_{compact_date}_ner.tif")
    if os.path.exists(fp):
        os.remove(fp)
        deleted_files.append(fp)
        
    # 4. SMAP Raw
    smap_raw_dir = os.path.join(BASE_DIR, "data", "soil_moisture", "raw")
    smap_raw_files = glob.glob(os.path.join(smap_raw_dir, f"SMAP_L3_SM_P_E_{compact_date}_*.h5"))
    for fp in smap_raw_files:
        os.remove(fp)
        deleted_files.append(fp)
        
    # 5. MOSDAC INSAT-3DR Raw (Entire daily folder)
    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        day = dt.strftime("%d")
        month = dt.strftime("%b").upper()
        year = dt.strftime("%Y")
        mosdac_folder = os.path.join(BASE_DIR, "data", "INSAT3DR_IMR", "3RIMG_L2G_IMR", year, f"{day}{month}")
        if os.path.exists(mosdac_folder):
            shutil.rmtree(mosdac_folder)
            deleted_files.append(mosdac_folder)
    except Exception as e:
        pass
        
    return {
        "success": True,
        "message": f"Deleted {len(deleted_files)} files/folders for {date_str}.",
        "deleted_count": len(deleted_files)
    }

@router.get("/pipeline-logs")
async def get_pipeline_logs(admin_user: User = Depends(require_admin)) -> Dict[str, Any]:
    """
    Returns the last 200 lines of the pipeline log file for the admin terminal.
    """
    from config import BASE_DIR
    log_file = os.path.join(BASE_DIR, "logs", "pipeline.log")
    
    if not os.path.exists(log_file):
        return {"logs": "Pipeline has not run yet or log file is missing."}
        
    try:
        with open(log_file, "r", encoding="utf-8") as f:
            lines = f.readlines()
            tail = lines[-200:]
            return {"logs": "".join(tail)}
    except Exception as e:
        return {"logs": f"Error reading logs: {str(e)}"}




