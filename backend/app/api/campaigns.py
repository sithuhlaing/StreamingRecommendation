# app/api/campaigns.py - Campaign API endpoints
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from ..database import get_db
from ..models.campaign import Campaign, Ad
from ..services.campaign_service import CampaignService
from ..utils.math_utils import calculate_campaign_performance
from pydantic import BaseModel, Field

router = APIRouter()

class CampaignCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    advertiser_id: str
    start_date: datetime
    end_date: datetime
    budget: float = Field(..., gt=0)
    daily_budget: Optional[float] = None
    target_demographics: Optional[dict] = None
    target_content_types: Optional[dict] = None
    geographic_targeting: Optional[dict] = None

class CampaignResponse(BaseModel):
    id: str
    name: str
    advertiser_id: str
    start_date: datetime
    end_date: datetime
    budget: float
    status: str
    impressions_served: int
    clicks: int
    conversions: int
    spend: float
    
    class Config:
        from_attributes = True

@router.post("/", response_model=CampaignResponse)
async def create_campaign(
    campaign: CampaignCreate,
    db: Session = Depends(get_db)
):
    """Create a new ad campaign with business logic validation."""
    campaign_service = CampaignService(db)
    
    # Business validation
    if campaign.end_date <= campaign.start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    if campaign.daily_budget and campaign.daily_budget * 30 > campaign.budget:
        raise HTTPException(status_code=400, detail="Daily budget exceeds monthly budget")
    
    return campaign_service.create_campaign(campaign)

@router.get("/", response_model=List[CampaignResponse])
async def get_campaigns(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    advertiser_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get campaigns with filtering and pagination."""
    campaign_service = CampaignService(db)
    return campaign_service.get_campaigns(
        skip=skip, 
        limit=limit, 
        status=status, 
        advertiser_id=advertiser_id
    )

@router.get("/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    """Get a specific campaign by ID."""
    campaign_service = CampaignService(db)
    campaign = campaign_service.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.put("/{campaign_id}/status")
async def update_campaign_status(
    campaign_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    """Update campaign status (draft, active, paused, completed)."""
    valid_statuses = ["draft", "active", "paused", "completed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    campaign_service = CampaignService(db)
    return campaign_service.update_campaign_status(campaign_id, status)

@router.get("/{campaign_id}/performance")
async def get_campaign_performance(
    campaign_id: str,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get detailed performance metrics for a campaign."""
    campaign_service = CampaignService(db)
    performance = campaign_service.get_campaign_performance(
        campaign_id, start_date, end_date
    )
    
    # Apply mathematical calculations for advanced metrics
    enhanced_performance = calculate_campaign_performance(performance)
    
    return enhanced_performance

