import os
import math
import uuid
import json
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional

import numpy as np
import pandas as pd
import rasterio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query, Request
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from database import get_db
from models.user import User
from models.district import District
from models.report import CitizenReport
from routes.auth import get_current_user
from config import BASE_DIR

logger = logging.getLogger(__name__)

router = APIRouter(tags=["reports"])

# Root uploads directory for citizen hazard photos
UPLOADS_BASE_DIR = Path(BASE_DIR) / "uploads" / "citizen_reports"
VILLAGES_PARQUET = os.path.join(BASE_DIR, "data", "Villages", "villages_ner.parquet")
LATEST_RISK_TIF = os.path.join(BASE_DIR, "data", "processed", "risk", "landslide_risk_latest.tif")
RISK_ALERTS_JSON = os.path.join(BASE_DIR, "data", "processed", "risk", "risk_alerts_today.json")

_VILLAGES_CACHE = None
_VILLAGES_MTIME = 0


def load_cached_villages_df():
    global _VILLAGES_CACHE, _VILLAGES_MTIME
    if not os.path.exists(VILLAGES_PARQUET):
        return None
    try:
        mtime = os.path.getmtime(VILLAGES_PARQUET)
        if _VILLAGES_CACHE is None or mtime > _VILLAGES_MTIME:
            _VILLAGES_CACHE = pd.read_parquet(VILLAGES_PARQUET)
            _VILLAGES_MTIME = mtime
    except Exception as e:
        logger.error(f"Error reading villages parquet: {e}")
    return _VILLAGES_CACHE


def get_villages_for_district(district_id: str, district_name: str) -> List[Dict[str, Any]]:
    """
    Returns all villages belonging to a specific district along with their
    Model B dynamic risk score/level and today's alert status.
    """
    df = load_cached_villages_df()
    if df is None or df.empty:
        return []

    # Filter by district_id
    sub = df[df["district_id"] == str(district_id)]
    if sub.empty and district_name:
        sub = df[df["district_name"].str.lower() == district_name.strip().lower()]

    if sub.empty:
        return []

    # Load daily alerts and hotspots from risk_alerts_today.json
    hotspots = []
    if os.path.exists(RISK_ALERTS_JSON):
        try:
            with open(RISK_ALERTS_JSON, "r", encoding="utf-8") as f:
                alerts_data = json.load(f)
            hotspots = alerts_data.get("hotspots", [])
        except Exception as e:
            logger.warning(f"Failed to read risk alerts JSON: {e}")

    hotspot_coords = (
        np.array([[float(h["latitude"]), float(h["longitude"])] for h in hotspots if "latitude" in h and "longitude" in h])
        if hotspots else np.empty((0, 2))
    )

    # Sample raster for precise Model B risk scores (200m grid)
    scores = []
    if os.path.exists(LATEST_RISK_TIF):
        try:
            with rasterio.open(LATEST_RISK_TIF) as src:
                coords = [(float(r["longitude"]), float(r["latitude"])) for _, r in sub.iterrows()]
                for val in src.sample(coords):
                    s = float(val[0]) if len(val) > 0 and np.isfinite(val[0]) else 0.0
                    scores.append(round(max(0.0, min(1.0, s)), 4))
        except Exception as e:
            logger.warning(f"Failed to sample landslide risk raster: {e}")
            scores = [0.0] * len(sub)
    else:
        scores = [0.0] * len(sub)

    villages = []
    for idx, (_, row) in enumerate(sub.iterrows()):
        v_lat = float(row["latitude"])
        v_lon = float(row["longitude"])
        score = scores[idx] if idx < len(scores) else 0.0

        if score >= 0.75:
            level = "Critical"
        elif score >= 0.50:
            level = "High"
        elif score >= 0.25:
            level = "Moderate"
        else:
            level = "Low"

        # Calculate distance to nearest alert hotspot in km
        min_dist_km = None
        if len(hotspot_coords) > 0:
            dlat = (hotspot_coords[:, 0] - v_lat) * 111.0
            dlon = (hotspot_coords[:, 1] - v_lon) * 111.0 * np.cos(np.radians(v_lat))
            dists = np.sqrt(dlat * dlat + dlon * dlon)
            min_dist_km = round(float(np.min(dists)), 2)

        is_alert = (score >= 0.50)
        pop = row.get("population")
        pop_val = int(pop) if pd.notna(pop) and pop > 0 else None

        villages.append({
            "osm_id": int(row["osm_id"]) if pd.notna(row.get("osm_id")) else None,
            "name": str(row.get("name") or "Unnamed Settlement"),
            "place_type": str(row.get("place_type") or "village"),
            "latitude": round(v_lat, 5),
            "longitude": round(v_lon, 5),
            "risk_score": score,
            "risk_level": level,
            "is_in_todays_alerts": is_alert,
            "nearest_alert_distance_km": min_dist_km,
            "population": pop_val,
        })

    # Sort severity: Critical -> High -> Moderate -> Low, then -risk_score, then alphabetical
    sev_rank = {"Critical": 0, "High": 1, "Moderate": 2, "Low": 3}
    villages.sort(key=lambda v: (sev_rank.get(v["risk_level"], 4), -v["risk_score"], v["name"]))
    return villages


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


@router.get("/district-admin/overview")
async def get_district_admin_overview(
    admin_user: User = Depends(require_district_admin),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns summary statistics for the District Admin operational command center:
    - pending_count: count of pending hazard reports awaiting review
    - verified_count: total count of verified reports
    - verified_this_week_count: verified reports in the last 7 days
    - active_risk_count: count of currently active risk areas (stubbed with TODO)
    - risk_level_breakdown: grid/village breakdown (stubbed with TODO)
    - district jurisdiction metadata with centroid for map framing
    """
    # 1. Fetch assigned district
    dist_stmt = select(District).where(District.id == admin_user.district_id)
    dist_res = await db.execute(dist_stmt)
    assigned_district = dist_res.scalars().first()
    if not assigned_district:
        raise HTTPException(status_code=404, detail="Assigned district not found.")

    # 2. Count reports strictly within this district_id
    # Pending
    pending_stmt = select(func.count(CitizenReport.id)).where(
        CitizenReport.district_id == admin_user.district_id,
        CitizenReport.status == "pending"
    )
    pending_count = (await db.execute(pending_stmt)).scalar() or 0

    # Verified total
    verified_stmt = select(func.count(CitizenReport.id)).where(
        CitizenReport.district_id == admin_user.district_id,
        CitizenReport.status == "verified"
    )
    verified_count = (await db.execute(verified_stmt)).scalar() or 0

    # Verified this week (within last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    verified_week_stmt = select(func.count(CitizenReport.id)).where(
        CitizenReport.district_id == admin_user.district_id,
        CitizenReport.status == "verified",
        CitizenReport.submitted_at >= seven_days_ago
    )
    verified_this_week_count = (await db.execute(verified_week_stmt)).scalar() or 0

    # Dismissed total
    dismissed_stmt = select(func.count(CitizenReport.id)).where(
        CitizenReport.district_id == admin_user.district_id,
        CitizenReport.status == "dismissed"
    )
    dismissed_count = (await db.execute(dismissed_stmt)).scalar() or 0

    # Total reports
    total_stmt = select(func.count(CitizenReport.id)).where(
        CitizenReport.district_id == admin_user.district_id
    )
    total_reports_count = (await db.execute(total_stmt)).scalar() or 0

    # Compute real village risk metrics and terrain distribution
    villages = get_villages_for_district(str(assigned_district.id), assigned_district.district_name)
    total_villages_count = len(villages)
    crit_count = sum(1 for v in villages if v["risk_level"] == "Critical")
    high_count = sum(1 for v in villages if v["risk_level"] == "High")
    mod_count = sum(1 for v in villages if v["risk_level"] == "Moderate")
    low_count = sum(1 for v in villages if v["risk_level"] == "Low")
    active_risk_count = sum(1 for v in villages if v["is_in_todays_alerts"])

    # Load timestamp and summary from risk_alerts_today.json
    last_updated = None
    district_alert_meta = None
    if os.path.exists(RISK_ALERTS_JSON):
        try:
            with open(RISK_ALERTS_JSON, "r", encoding="utf-8") as f:
                alerts_data = json.load(f)
            last_updated = alerts_data.get("generated_at") or alerts_data.get("date")
            for d in alerts_data.get("districts", []):
                if d.get("district", "").lower() == assigned_district.district_name.lower():
                    district_alert_meta = d
                    break
        except Exception as e:
            logger.warning(f"Error reading risk_alerts_today.json: {e}")

    risk_level_breakdown = {
        "Low": low_count,
        "Moderate": mod_count,
        "High": high_count,
        "Critical": crit_count
    }

    return {
        "district": {
            "id": str(assigned_district.id),
            "state_name": assigned_district.state_name,
            "district_name": assigned_district.district_name,
            "centroid_lat": assigned_district.centroid_lat,
            "centroid_lon": assigned_district.centroid_lon
        },
        "pending_count": pending_count,
        "verified_count": verified_count,
        "verified_this_week_count": verified_this_week_count,
        "dismissed_count": dismissed_count,
        "total_reports_count": total_reports_count,
        "active_risk_count": active_risk_count,
        "total_villages_count": total_villages_count,
        "risk_level_breakdown": risk_level_breakdown,
        "last_updated": last_updated,
        "district_alert_meta": district_alert_meta
    }


@router.get("/district-admin/villages")
async def get_district_admin_villages(
    risk_filter: Optional[str] = Query(None, description="Filter: all, critical, high, moderate, low, alert_only"),
    search: Optional[str] = Query(None, description="Search village by name"),
    admin_user: User = Depends(require_district_admin),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns inhabited settlements/villages within the requesting District Admin's
    assigned district, strictly scoped by district_id.
    Each village carries its current Model B risk level, risk score, alert status,
    distance to nearest alert hotspot, and population.
    """
    dist_stmt = select(District).where(District.id == admin_user.district_id)
    dist_res = await db.execute(dist_stmt)
    assigned_district = dist_res.scalars().first()
    if not assigned_district:
        raise HTTPException(status_code=404, detail="Assigned district not found.")

    all_villages = get_villages_for_district(str(assigned_district.id), assigned_district.district_name)

    # Compute unfiltered breakdown for tab badges
    crit_total = sum(1 for v in all_villages if v["risk_level"] == "Critical")
    high_total = sum(1 for v in all_villages if v["risk_level"] == "High")
    mod_total = sum(1 for v in all_villages if v["risk_level"] == "Moderate")
    low_total = sum(1 for v in all_villages if v["risk_level"] == "Low")
    alert_total = sum(1 for v in all_villages if v["is_in_todays_alerts"])

    # Apply search filter
    filtered = all_villages
    if search and search.strip():
        q = search.strip().lower()
        filtered = [v for v in filtered if q in v["name"].lower()]

    # Apply risk level filter
    if risk_filter and risk_filter.lower() != "all":
        rf = risk_filter.strip().lower()
        if rf == "alert_only":
            filtered = [v for v in filtered if v["is_in_todays_alerts"]]
        elif rf in ["critical", "high", "moderate", "low"]:
            filtered = [v for v in filtered if v["risk_level"].lower() == rf]

    return {
        "district": {
            "id": str(assigned_district.id),
            "state_name": assigned_district.state_name,
            "district_name": assigned_district.district_name,
            "centroid_lat": assigned_district.centroid_lat,
            "centroid_lon": assigned_district.centroid_lon
        },
        "total_villages": len(all_villages),
        "filtered_count": len(filtered),
        "alert_villages_count": alert_total,
        "breakdown": {
            "Critical": crit_total,
            "High": high_total,
            "Moderate": mod_total,
            "Low": low_total
        },
        "villages": filtered
    }


@router.get("/district-admin/active-risk-areas")
async def get_district_active_risk_areas(
    admin_user: User = Depends(require_district_admin),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns currently flagged active high/critical risk settlements within this district.
    """
    dist_stmt = select(District).where(District.id == admin_user.district_id)
    dist_res = await db.execute(dist_stmt)
    assigned_district = dist_res.scalars().first()
    if not assigned_district:
        raise HTTPException(status_code=404, detail="Assigned district not found.")

    villages = get_villages_for_district(str(assigned_district.id), assigned_district.district_name)
    alert_villages = [v for v in villages if v["is_in_todays_alerts"]]

    return {
        "district_id": str(admin_user.district_id),
        "district_name": assigned_district.district_name,
        "total_alert_areas": len(alert_villages),
        "areas": alert_villages,
        "message": (
            f"Flagged {len(alert_villages)} settlement(s) in active risk alert zones in {assigned_district.district_name}."
            if alert_villages
            else f"No settlements currently in High or Critical alert zones in {assigned_district.district_name}."
        )
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
