from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, constr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import random
import re

from database import get_db
from models.user import User, OtpVerification
from services.auth_service import get_password_hash, verify_password, create_access_token, decode_access_token
from services.otp_service import send_otp_sms
from utils.validation import validate_indian_phone_number

router = APIRouter(prefix="/auth", tags=["auth"])

# --- Schemas ---

class SignupRequest(BaseModel):
    phone_number: str
    password: str
    name: str | None = None

class VerifyOtpRequest(BaseModel):
    phone_number: str
    otp_code: str
    purpose: str = "signup"

class ResendOtpRequest(BaseModel):
    phone_number: str
    purpose: str = "signup"

class LoginRequest(BaseModel):
    phone_number: str
    password: str

# --- Dependencies ---

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    elif "token" in request.query_params:
        token = request.query_params.get("token")
        
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
        
    user_id = payload.get("id")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    return user

# --- Routes ---

@router.post("/signup")
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    try:
        phone = validate_indian_phone_number(request.phone_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # Validate password strength (simple: min 8, at least 1 letter, 1 number)
    if len(request.password) < 8 or not re.search(r'[A-Za-z]', request.password) or not re.search(r'[0-9]', request.password):
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long and contain both letters and numbers")
        
    # Check if user already exists and is verified
    result = await db.execute(select(User).where(User.phone_number == phone))
    existing_user = result.scalars().first()
    
    if existing_user:
        if existing_user.is_verified:
            raise HTTPException(status_code=400, detail="Phone number already registered and verified")
        else:
            # Overwrite existing unverified user
            existing_user.password_hash = get_password_hash(request.password)
            existing_user.name = request.name
            user = existing_user
    else:
        user = User(
            phone_number=phone,
            password_hash=get_password_hash(request.password),
            name=request.name,
            is_verified=False
        )
        db.add(user)
        
    await db.flush() # flush to get user id if needed later
    
    # Invalidate previous unused OTPs for this phone + purpose
    await db.execute(
        select(OtpVerification).where(
            OtpVerification.phone_number == phone,
            OtpVerification.purpose == "signup",
            OtpVerification.is_used == False
        )
    ) # In reality, we could update them to is_used=True, but we'll just ignore them based on expires_at and order

    # Generate OTP
    otp_code = str(random.randint(100000, 999999))
    
    otp_record = OtpVerification(
        phone_number=phone,
        otp_code=otp_code,
        purpose="signup",
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        is_used=False
    )
    db.add(otp_record)
    await db.commit()
    
    # Send OTP via Brevo
    sms_res = send_otp_sms(phone, otp_code)
    if not sms_res.get("success"):
        raise HTTPException(status_code=400, detail=sms_res.get("message", "Failed to send verification code."))
        
    return {
        "message": sms_res.get("message", "OTP sent"),
        "phone_number": phone,
        "brevo_reference": sms_res.get("reference"),
        "dev_otp": sms_res.get("dev_otp")
    }


@router.post("/verify-otp")
async def verify_otp(request: VerifyOtpRequest, db: AsyncSession = Depends(get_db)):
    try:
        phone = validate_indian_phone_number(request.phone_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # Get most recent unused, non-expired OTP
    result = await db.execute(
        select(OtpVerification)
        .where(
            OtpVerification.phone_number == phone,
            OtpVerification.purpose == request.purpose,
            OtpVerification.is_used == False,
            OtpVerification.expires_at > datetime.utcnow()
        )
        .order_by(OtpVerification.created_at.desc())
    )
    otp_record = result.scalars().first()
    
    if not otp_record:
        raise HTTPException(status_code=400, detail="OTP expired, please request a new one")
        
    if otp_record.otp_code != request.otp_code:
        raise HTTPException(status_code=400, detail="Incorrect OTP")
        
    # Mark OTP as used
    otp_record.is_used = True
    
    # Update user to verified
    user_result = await db.execute(select(User).where(User.phone_number == phone))
    user = user_result.scalars().first()
    
    if user:
        user.is_verified = True
        await db.commit()
        await db.refresh(user)
    else:
        await db.commit()
        raise HTTPException(status_code=400, detail="User record not found")
        
    # Generate JWT
    token_data = {"id": str(user.id), "role": user.role, "phone_number": user.phone_number}
    access_token = create_access_token(token_data)
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/resend-otp")
async def resend_otp(request: ResendOtpRequest, request_info: Request, db: AsyncSession = Depends(get_db)):
    try:
        phone = validate_indian_phone_number(request.phone_number)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    # Rate limiting: Max 3 requests in the last 15 minutes
    fifteen_mins_ago = datetime.utcnow() - timedelta(minutes=15)
    result = await db.execute(
        select(OtpVerification)
        .where(
            OtpVerification.phone_number == phone,
            OtpVerification.purpose == request.purpose,
            OtpVerification.created_at > fifteen_mins_ago
        )
    )
    recent_otps = result.scalars().all()
    
    if len(recent_otps) >= 3:
        raise HTTPException(status_code=429, detail="Too many OTP requests. Please wait 15 minutes before trying again.")
        
    # Invalidate previous
    result = await db.execute(
        select(OtpVerification).where(
            OtpVerification.phone_number == phone,
            OtpVerification.purpose == request.purpose,
            OtpVerification.is_used == False
        )
    )
    for record in result.scalars().all():
        record.is_used = True
        
    otp_code = str(random.randint(100000, 999999))
    otp_record = OtpVerification(
        phone_number=phone,
        otp_code=otp_code,
        purpose=request.purpose,
        expires_at=datetime.utcnow() + timedelta(minutes=5),
        is_used=False
    )
    db.add(otp_record)
    await db.commit()
    
    # Send OTP via Brevo
    sms_res = send_otp_sms(phone, otp_code)
    if not sms_res.get("success"):
        raise HTTPException(status_code=400, detail=sms_res.get("message", "Failed to send verification code."))
        
    return {
        "message": sms_res.get("message", "OTP sent"),
        "phone_number": phone,
        "brevo_reference": sms_res.get("reference"),
        "dev_otp": sms_res.get("dev_otp")
    }


@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        phone = validate_indian_phone_number(request.phone_number)
    except ValueError:
        raise HTTPException(status_code=400, detail="Account not found or not verified") # Generic message
        
    result = await db.execute(select(User).where(User.phone_number == phone))
    user = result.scalars().first()
    
    if not user or not user.is_verified:
        raise HTTPException(status_code=400, detail="Account not found or not verified")
        
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid phone number or password")
        
    token_data = {
        "id": str(user.id),
        "role": user.role,
        "phone_number": user.phone_number,
        "district_id": str(user.district_id) if user.district_id else None
    }
    access_token = create_access_token(token_data)
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "phone_number": current_user.phone_number,
        "name": current_user.name,
        "role": current_user.role,
        "preferred_language": current_user.preferred_language,
        "district_id": str(current_user.district_id) if current_user.district_id else None,
        "is_verified": current_user.is_verified
    }
