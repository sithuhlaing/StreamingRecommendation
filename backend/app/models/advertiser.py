# app/models/advertiser.py - Advertiser model
from sqlalchemy import Column, String, DateTime, Float, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from ..database import Base

class Advertiser(Base):
    __tablename__ = "advertisers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    company_name = Column(String(255))
    industry = Column(String(100))
    
    # Contact information
    contact_email = Column(String(255))
    contact_phone = Column(String(50))
    
    # Business details
    monthly_ad_spend = Column(Float)
    account_manager = Column(String(100))
    tier = Column(String(50))  # premium, standard, basic
    
    # Account status
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    campaigns = relationship("Campaign", back_populates="advertiser")
