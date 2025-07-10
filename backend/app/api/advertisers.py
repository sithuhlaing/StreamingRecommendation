# app/api/advertisers.py - Advertiser API endpoints
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.advertiser import Advertiser
from ..services.advertiser_service import AdvertiserService
from pydantic import BaseModel, Field, EmailStr

router = APIRouter()

class AdvertiserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    company_name: str = Field(..., min_length=1, max_length=255)
    industry: str = Field(..., max_length=100)
    contact_email: EmailStr
    contact_phone: Optional[str] = Field(None, max_length=50)
    monthly_ad_spend: Optional[float] = Field(None, gt=0)
    account_manager: Optional[str] = Field(None, max_length=100)
    tier: str = Field("standard", regex="^(premium|standard|basic)$")

class AdvertiserResponse(BaseModel):
    id: str
    name: str
    company_name: str
    industry: str
    contact_email: str
    contact_phone: Optional[str]
    monthly_ad_spend: Optional[float]
    account_manager: Optional[str]
    tier: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdvertiserUpdate(BaseModel):
    name: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    monthly_ad_spend: Optional[float] = None
    account_manager: Optional[str] = None
    tier: Optional[str] = None

@router.post("/", response_model=AdvertiserResponse)
async def create_advertiser(
    advertiser: AdvertiserCreate,
    db: Session = Depends(get_db)
):
    """Create a new advertiser."""
    advertiser_service = AdvertiserService(db)
    
    # Check if advertiser with same email already exists
    existing = advertiser_service.get_by_email(advertiser.contact_email)
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Advertiser with this email already exists"
        )
    
    return advertiser_service.create_advertiser(advertiser)

@router.get("/", response_model=List[AdvertiserResponse])
async def get_advertisers(
    skip: int = 0,
    limit: int = 100,
    tier: Optional[str] = None,
    industry: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get advertisers with filtering and pagination."""
    advertiser_service = AdvertiserService(db)
    return advertiser_service.get_advertisers(
        skip=skip, 
        limit=limit, 
        tier=tier, 
        industry=industry,
        is_active=is_active
    )

@router.get("/{advertiser_id}", response_model=AdvertiserResponse)
async def get_advertiser(advertiser_id: str, db: Session = Depends(get_db)):
    """Get a specific advertiser by ID."""
    advertiser_service = AdvertiserService(db)
    advertiser = advertiser_service.get_advertiser(advertiser_id)
    if not advertiser:
        raise HTTPException(status_code=404, detail="Advertiser not found")
    return advertiser

@router.put("/{advertiser_id}", response_model=AdvertiserResponse)
async def update_advertiser(
    advertiser_id: str,
    advertiser_update: AdvertiserUpdate,
    db: Session = Depends(get_db)
):
    """Update an advertiser."""
    advertiser_service = AdvertiserService(db)
    advertiser = advertiser_service.update_advertiser(advertiser_id, advertiser_update)
    if not advertiser:
        raise HTTPException(status_code=404, detail="Advertiser not found")
    return advertiser

@router.delete("/{advertiser_id}")
async def deactivate_advertiser(advertiser_id: str, db: Session = Depends(get_db)):
    """Deactivate an advertiser (soft delete)."""
    advertiser_service = AdvertiserService(db)
    success = advertiser_service.deactivate_advertiser(advertiser_id)
    if not success:
        raise HTTPException(status_code=404, detail="Advertiser not found")
    return {"message": "Advertiser deactivated successfully"}

@router.get("/{advertiser_id}/campaigns")
async def get_advertiser_campaigns(
    advertiser_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all campaigns for a specific advertiser."""
    advertiser_service = AdvertiserService(db)
    campaigns = advertiser_service.get_advertiser_campaigns(
        advertiser_id, skip, limit
    )
    if campaigns is None:
        raise HTTPException(status_code=404, detail="Advertiser not found")
    return campaigns

@router.get("/{advertiser_id}/performance")
async def get_advertiser_performance(
    advertiser_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get performance metrics for all advertiser campaigns."""
    advertiser_service = AdvertiserService(db)
    performance = advertiser_service.get_advertiser_performance(
        advertiser_id, start_date, end_date
    )
    if performance is None:
        raise HTTPException(status_code=404, detail="Advertiser not found")
    return performance