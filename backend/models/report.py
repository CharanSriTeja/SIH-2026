import uuid
from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=func.gen_random_uuid())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    district_id = Column(UUID(as_uuid=True), ForeignKey("districts.id", ondelete="CASCADE"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    hazard_type = Column(String, nullable=True)  # e.g. "crack", "slope_movement", "blocked_road"
    description = Column(Text, nullable=True)
    photo_path = Column(String, nullable=False)
    status = Column(String, default="pending", nullable=False)  # pending | verified | dismissed
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        Index('ix_citizen_reports_district_status', 'district_id', 'status'),
        Index('ix_citizen_reports_user', 'user_id'),
    )
