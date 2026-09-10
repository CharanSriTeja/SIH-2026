import uuid
from sqlalchemy import Column, String, Float, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class District(Base):
    __tablename__ = "districts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    state_name = Column(String, nullable=False)
    district_name = Column(String, nullable=False)
    centroid_lat = Column(Float, nullable=True)
    centroid_lon = Column(Float, nullable=True)

    __table_args__ = (
        UniqueConstraint('state_name', 'district_name', name='uq_state_district'),
        Index('ix_districts_state', 'state_name'),
    )
