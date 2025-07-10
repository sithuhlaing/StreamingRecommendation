# app/models/ad_metrics.py - Analytics and metrics model
from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from ..database import Base

class AdMetrics(Base):
    __tablename__ = "ad_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"))
    
    # Time dimension
    date = Column(DateTime, nullable=False)
    hour = Column(Integer)  # 0-23 for hourly granularity
    
    # Core metrics
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    spend = Column(Float, default=0.0)
    revenue = Column(Float, default=0.0)
    
    # Calculated metrics (computed fields)
    ctr = Column(Float)  # Click-through rate
    cpc = Column(Float)  # Cost per click
    cpm = Column(Float)  # Cost per mille
    roas = Column(Float)  # Return on ad spend
    
    # Engagement metrics
    video_completion_rate = Column(Float)
    viewability_rate = Column(Float)
    engagement_rate = Column(Float)
    
    # Audience metrics
    unique_viewers = Column(Integer)
    frequency = Column(Float)
    
    # Relationships
    campaign = relationship("Campaign", back_populates="metrics")

