# app/models/campaign.py - Campaign data model
from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid
from ..database import Base

class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    advertiser_id = Column(UUID(as_uuid=True), ForeignKey("advertisers.id"))
    
    # Campaign details
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    budget = Column(Float, nullable=False)
    daily_budget = Column(Float)
    
    # Targeting criteria
    target_demographics = Column(JSONB)
    target_content_types = Column(JSONB)  # Movies, TV shows, etc.
    geographic_targeting = Column(JSONB)
    
    # Performance tracking
    impressions_served = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    spend = Column(Float, default=0.0)
    
    # Campaign status
    status = Column(String(50), default="draft")  # draft, active, paused, completed
    is_active = Column(Boolean, default=True)
    
    # Audit fields
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(100))
    
    # Relationships
    advertiser = relationship("Advertiser", back_populates="campaigns")
    ads = relationship("Ad", back_populates="campaign")
    metrics = relationship("AdMetrics", back_populates="campaign")


class Ad(Base):
    __tablename__ = "ads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"))
    
    # Ad content
    title = Column(String(100), nullable=False)
    description = Column(Text)
    creative_url = Column(String(500))
    click_through_url = Column(String(500))
    
    # Ad specifications
    format = Column(String(50))  # banner, video, interactive
    duration = Column(Integer)  # for video ads
    file_size = Column(Integer)
    
    # Quality control
    quality_score = Column(Float)
    approval_status = Column(String(50), default="pending")
    
    # Relationships
    campaign = relationship("Campaign", back_populates="ads")
