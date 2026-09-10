import uuid
from sqlalchemy import Column, String, Boolean, Float, DateTime, func, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid())
    phone_number = Column(String(13), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    role = Column(String, default='citizen')
    preferred_language = Column(String, default='en')
    is_verified = Column(Boolean, default=False)
    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)
    address_label = Column(String, nullable=True)
    location_updated_at = Column(DateTime(timezone=True), nullable=True)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class OtpVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone_number = Column(String(13), nullable=False)
    otp_code = Column(String(6), nullable=False)
    purpose = Column(String, default='signup')
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Index for fast lookup during OTP verification
Index('ix_otp_phone_purpose_used', OtpVerification.phone_number, OtpVerification.purpose, OtpVerification.is_used)
