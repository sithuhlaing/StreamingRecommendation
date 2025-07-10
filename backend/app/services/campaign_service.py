# app/services/campaign_service.py - Business logic service
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from ..models.campaign import Campaign, Ad
from ..models.ad_metrics import AdMetrics
from ..utils.math_utils import calculate_roi, calculate_projected_performance

class CampaignService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_campaign(self, campaign_data) -> Campaign:
        """Create a new campaign with business validation."""
        # Business logic: Set daily budget if not provided
        if not campaign_data.daily_budget:
            days_in_campaign = (campaign_data.end_date - campaign_data.start_date).days
            campaign_data.daily_budget = campaign_data.budget / max(days_in_campaign, 1)
        
        db_campaign = Campaign(**campaign_data.dict())
        self.db.add(db_campaign)
        self.db.commit()
        self.db.refresh(db_campaign)
        
        return db_campaign
    
    def get_campaigns(
        self, 
        skip: int = 0, 
        limit: int = 100, 
        status: Optional[str] = None,
        advertiser_id: Optional[str] = None
    ) -> List[Campaign]:
        """Get campaigns with filtering."""
        query = self.db.query(Campaign)
        
        if status:
            query = query.filter(Campaign.status == status)
        if advertiser_id:
            query = query.filter(Campaign.advertiser_id == advertiser_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_campaign(self, campaign_id: str) -> Optional[Campaign]:
        """Get a specific campaign."""
        return self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
    
    def update_campaign_status(self, campaign_id: str, status: str) -> Campaign:
        """Update campaign status with business logic."""
        campaign = self.get_campaign(campaign_id)
        if not campaign:
            raise ValueError("Campaign not found")
        
        # Business logic for status transitions
        if status == "active" and campaign.status == "draft":
            # Validate campaign is ready to go live
            if not campaign.ads:
                raise ValueError("Cannot activate campaign without ads")
        
        campaign.status = status
        campaign.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(campaign)
        
        return campaign
    
    def get_campaign_performance(
        self, 
        campaign_id: str, 
        start_date: Optional[date] = None, 
        end_date: Optional[date] = None
    ) -> dict:
        """Get detailed performance metrics."""
        campaign = self.get_campaign(campaign_id)
        if not campaign:
            raise ValueError("Campaign not found")
        
        # Query metrics with date filtering
        metrics_query = self.db.query(AdMetrics).filter(
            AdMetrics.campaign_id == campaign_id
        )
        
        if start_date:
            metrics_query = metrics_query.filter(AdMetrics.date >= start_date)
        if end_date:
            metrics_query = metrics_query.filter(AdMetrics.date <= end_date)
        
        metrics = metrics_query.all()
        
        # Aggregate metrics
        total_impressions = sum(m.impressions for m in metrics)
        total_clicks = sum(m.clicks for m in metrics)
        total_conversions = sum(m.conversions for m in metrics)
        total_spend = sum(m.spend for m in metrics)
        total_revenue = sum(m.revenue for m in metrics)
        
        return {
            "campaign_id": campaign_id,
            "campaign_name": campaign.name,
            "total_impressions": total_impressions,
            "total_clicks": total_clicks,
            "total_conversions": total_conversions,
            "total_spend": total_spend,
            "total_revenue": total_revenue,
            "daily_metrics": [
                {
                    "date": m.date.isoformat(),
                    "impressions": m.impressions,
                    "clicks": m.clicks,
                    "conversions": m.conversions,
                    "spend": m.spend,
                    "revenue": m.revenue
                }
                for m in metrics
            ]
        }

