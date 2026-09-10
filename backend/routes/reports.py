import os
import math
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from database import get_db
from models.user import User
from models.district import District
from models.report import CitizenReport
from routes.auth import get_current_user
from config import BASE_DIR

router = APIRouter(tags=["reports"])

# Root uploads directory for citizen hazard photos
UPLOADS_BASE_DIR = Path(BASE_DIR) / "uploads" / "citizen_reports"


def find_nearest_district(lat: float, lon: float, districts: List[District]) -> District:
    """
    Finds the nearest district by calculating spherical distance from (lat, lon)
    to each district's centroid.
    """
    if not districts:
        raise ValueError("No districts available in database.")

    best_district = None
    min_dist_sq = float("inf")

    for d in districts:
        if d.centroid_lat is not None and d.centroid_lon is not None:
            # Equirectangular approximation for fast distance comparison
            d_lat = (d.centroid_lat - lat) * 111.0
            d_lon = (d.centroid_lon - lon) * 111.0 * math.cos(math.radians(lat))
            dist_sq = d_lat * d_lat + d_lon * d_lon
            if dist_sq < min_dist_sq:
                min_dist_sq = dist_sq
                best_district = d

    return best_district or districts[0]


def validate_image_bytes(content: bytes, filename: str) -> str:
    """
    Validates file extension and magic bytes to guarantee it is a valid image.
    Accepts JPG, JPEG, and PNG. Returns canonical extension.
    """
    allowed_extensions = {".jpg", ".jpeg", ".png"}
    ext = Path(filename).suffix.lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file extension. Only JPG, JPEG, and PNG images are accepted."
        )

    # Magic byte verification
    # JPEG: starts with FF D8 FF
    # PNG: starts with 89 50 4E 47 0D 0A 1A 0A
    is_jpeg = len(content) >= 3 and content[:3] == b"\xff\xd8\xff"
    is_png = len(content) >= 8 and content[:8] == b"\x89PNG\r\n\x1a\n"

    if not (is_jpeg or is_png):
        raise HTTPException(
            status_code=400,
            detail="Invalid image content. File signature does not match a valid JPG or PNG image."
        )

    return ".jpg" if is_jpeg else ".png"


# --- Schemas ---

class ReviewReportRequest(BaseModel):
    status: str = Field(..., pattern="^(verified|dismissed)$")


# =========================================================================
# 1. CITIZEN HAZARD REPORTING (POST /reports & GET /reports/mine)
# =========================================================================

@router.post("/reports", status_code=status.HTTP_201_CREATED)
async def submit_citizen_report(
    latitude: float = Form(...),
    longitude: float = Form(...),
    hazard_type: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Accepts a citizen hazard observation with mandatory geo-tagged photo.
    Automatically assigns the report to the nearest district jurisdiction.
    """
    # 1. Find nearest district
    dist_stmt = select(District)
    dist_res = await db.execute(dist_stmt)
    all_districts = dist_res.scalars().all()
    if not all_districts:
        raise HTTPException(status_code=500, detail="District reference dataset not initialized.")

    nearest_dist = find_nearest_district(latitude, longitude, all_districts)

    # 2. Read and validate photo bytes
    photo_bytes = await photo.read()
    if len(photo_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty photo file uploaded.")
    if len(photo_bytes) > 15 * 1024 * 1024:  # 15MB max
        raise HTTPException(status_code=400, detail="Photo size exceeds maximum allowed limit of 15MB.")

    valid_ext = validate_image_bytes(photo_bytes, photo.filename or "upload.jpg")

    # 3. Save file locally (with clear production cloud storage boundary)
    # -------------------------------------------------------------------------
    # PRODUCTION NOTE: In production cloud deployment, this local disk storage
    # would be replaced by an asynchronous upload to an object storage bucket
    # (e.g. AWS S3 or Google Cloud Storage) and `photo_path` would store the
    # storage key or CDN URL.
    # -------------------------------------------------------------------------
    district_dir = UPLOADS_BASE_DIR / str(nearest_dist.id)
    district_dir.mkdir(parents=True, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex}_{Path(photo.filename or 'image').stem[:24]}{valid_ext}"
    target_filepath = district_dir / unique_filename

    with open(target_filepath, "wb") as f:
        f.write(photo_bytes)

    relative_photo_path = f"uploads/citizen_reports/{nearest_dist.id}/{unique_filename}"

    # 4. Insert report record
    target_dist_id = nearest_dist.id
    target_state_name = nearest_dist.state_name
    target_district_name = nearest_dist.district_name

    new_report = CitizenReport(
        user_id=current_user.id,
        district_id=target_dist_id,
        latitude=latitude,
        longitude=longitude,
        hazard_type=hazard_type,
        description=description,
        photo_path=relative_photo_path,
        status="pending"
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)

    return {
        "success": True,
        "message": "Hazard report submitted successfully and forwarded to District Administration.",
        "report_id": str(new_report.id),
        "district": {
            "id": str(target_dist_id),
            "state_name": target_state_name,
            "district_name": target_district_name
        },
        "submitted_at": new_report.submitted_at.isoformat() if new_report.submitted_at else None
    }


@router.get("/reports/mine")
async def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Returns all reports submitted by the authenticated citizen / officer.
    """
    stmt = (
        select(CitizenReport, District)
        .join(District, CitizenReport.district_id == District.id)
        .where(CitizenReport.user_id == current_user.id)
        .order_by(CitizenReport.submitted_at.desc())
    )
    res = await db.execute(stmt)
    reports = []
    for rep, dist in res.all():
        photo_filename = Path(rep.photo_path).name
        reports.append({
            "id": str(rep.id),
            "latitude": rep.latitude,
            "longitude": rep.longitude,
            "hazard_type": rep.hazard_type,
            "description": rep.description,
            "status": rep.status,
            "state_name": dist.state_name,
            "district_name": dist.district_name,
            "photo_url": f"/uploads/citizen_reports/{dist.id}/{photo_filename}",
            "submitted_at": rep.submitted_at.isoformat() if rep.submitted_at else None,
            "reviewed_at": rep.reviewed_at.isoformat() if rep.reviewed_at else None
        })
    return reports


# =========================================================================
# 2. DISTRICT ADMINISTRATOR SCOPED REPORT VISIBILITY & MANAGEMENT
# =========================================================================

def require_district_admin(current_user: User = Depends(get_current_user)) -> User:
    """Enforces that the user is a district administrator with an assigned district."""
    if current_user.role != "district_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: District Administrator credentials required."
        )
    if not current_user.district_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="District Administrator is not assigned to any district."
        )
    return current_user


@router.get("/district-admin/reports")
async def get_district_admin_reports(
    status_filter: Optional[str] = Query(None, alias="status"),
    admin_user: User = Depends(require_district_admin),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Strictly scoped report retrieval: District Admins can ONLY see reports
    from their assigned district_id.
    """
    # 1. Fetch admin's district info
    dist_stmt = select(District).where(District.id == admin_user.district_id)
    dist_res = await db.execute(dist_stmt)
    assigned_district = dist_res.scalars().first()
    if not assigned_district:
        raise HTTPException(status_code=404, detail="Assigned district not found.")

    # 2. Query citizen_reports strictly by district_id
    query_conditions = [CitizenReport.district_id == admin_user.district_id]
    if status_filter:
        query_conditions.append(CitizenReport.status == status_filter.lower())

    stmt = (
        select(CitizenReport, User)
        .outerjoin(User, CitizenReport.user_id == User.id)
        .where(and_(*query_conditions))
        .order_by(CitizenReport.submitted_at.desc())
    )
    result = await db.execute(stmt)
    records = result.all()

    report_list = []
    for rep, submitter in records:
        photo_filename = Path(rep.photo_path).name if rep.photo_path else ""
        photo_url = f"/uploads/citizen_reports/{rep.district_id}/{photo_filename}" if rep.photo_path else None
        report_list.append({
            "id": str(rep.id),
            "submitter_name": submitter.name if submitter else "Anonymous Citizen",
            "submitter_phone": submitter.phone_number if submitter else "N/A",
            "citizen_name": submitter.name if submitter else "Anonymous Citizen",
            "citizen_phone": submitter.phone_number if submitter else "N/A",
            "latitude": rep.latitude,
            "longitude": rep.longitude,
            "hazard_type": rep.hazard_type,
            "description": rep.description,
            "photo_path": rep.photo_path,
            "photo_url": photo_url,
            "status": rep.status,
            "submitted_at": rep.submitted_at.isoformat() if rep.submitted_at else None,
            "reviewed_at": rep.reviewed_at.isoformat() if rep.reviewed_at else None,
        })

    return {
        "district": {
            "id": str(assigned_district.id),
            "state_name": assigned_district.state_name,
            "district_name": assigned_district.district_name
        },
        "total_reports": len(report_list),
        "reports": report_list
    }


@router.patch("/district-admin/reports/{report_id}")
async def review_district_report(
    report_id: str,
    payload: ReviewReportRequest,
    admin_user: User = Depends(require_district_admin),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Updates status (verified | dismissed). Strictly verifies that the report's
    district_id matches the requesting admin's district_id.
    """
    try:
        rep_uuid = uuid.UUID(report_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid report ID format.")

    stmt = select(CitizenReport).where(CitizenReport.id == rep_uuid)
    result = await db.execute(stmt)
    report = result.scalars().first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    # Strict ownership check
    if report.district_id != admin_user.district_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only review reports in your designated district."
        )

    now = datetime.now(timezone.utc)
    report.status = payload.status
    report.reviewed_at = now
    report.reviewed_by = admin_user.id
    await db.commit()

    return {
        "success": True,
        "message": f"Report marked as {payload.status}.",
        "report_id": str(report.id),
        "status": report.status,
        "reviewed_at": report.reviewed_at.isoformat()
    }


# =========================================================================
# 3. ACCESS-CONTROLLED IMAGE SERVING
# =========================================================================

@router.get("/uploads/citizen_reports/{district_id}/{filename}")
async def serve_citizen_report_photo(
    district_id: str,
    filename: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Access-controlled image serving.
    Permitted callers:
    - Super-Admin (role='admin')
    - The District Administrator assigned to this district_id
    - The citizen who submitted the report
    - Field officers
    """
    # 1. Look up report corresponding to this file path
    rel_path = f"uploads/citizen_reports/{district_id}/{filename}"
    stmt = select(CitizenReport).where(CitizenReport.photo_path == rel_path)
    res = await db.execute(stmt)
    report = res.scalars().first()

    # If not found by exact path, try matching by filename
    if not report:
        fallback_stmt = select(CitizenReport).where(CitizenReport.photo_path.like(f"%{filename}"))
        fallback_res = await db.execute(fallback_stmt)
        report = fallback_res.scalars().first()

    # 2. Access control check
    is_super_admin = current_user.role == "admin"
    is_district_admin = current_user.role == "district_admin"
    is_submitter = report and report.user_id == current_user.id
    is_field_officer = current_user.role in ("field_officer", "officer")

    if not (is_super_admin or is_district_admin or is_submitter or is_field_officer):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to view this report photo."
        )

    # 3. Serve file: check primary directory and report record path fallback
    file_path = UPLOADS_BASE_DIR / district_id / filename
    if not file_path.exists() and report and report.photo_path:
        candidate = Path(BASE_DIR) / report.photo_path
        if candidate.exists():
            file_path = candidate

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Photo file not found on disk.")

    media_type = "image/png" if file_path.suffix.lower() == ".png" else "image/jpeg"
    return FileResponse(file_path, media_type=media_type)
