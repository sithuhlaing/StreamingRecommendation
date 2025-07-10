# app/api/analytics.py - Analytics API endpoints
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from ..database import get_db
from ..services.analytics_service import AnalyticsService
from ..utils.math_utils import calculate_statistical_significance
from pydantic import BaseModel, Field

router = APIRouter()

class DashboardMetrics(BaseModel):
    total_campaigns: int
    active_campaigns: int
    total_advertisers: int
    total_spend: float
    total_impressions: int
    total_clicks: int
    total_conversions: int
    average_ctr: float
    average_cpc: float
    average_roas: float

class PerformanceReport(BaseModel):
    date_range: Dict[str, str]
    summary: Dict[str, Any]
    daily_metrics: List[Dict[str, Any]]
    top_campaigns: List[Dict[str, Any]]
    performance_trends: Dict[str, Any]

@router.get("/dashboard", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    date_range: int = Query(7, description="Number of days to include"),
    db: Session = Depends(get_db)
):
    """Get high-level dashboard metrics."""
    analytics_service = AnalyticsService(db)
    
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=date_range)
    
    metrics = analytics_service.get_dashboard_metrics(start_date, end_date)
    return metrics

@router.get("/performance", response_model=PerformanceReport)
async def get_performance_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    campaign_ids: Optional[List[str]] = Query(None),
    advertiser_ids: Optional[List[str]] = Query(None),
    group_by: str = Query("day", regex="^(hour|day|week|month)$"),
    db: Session = Depends(get_db)
):
    """Generate comprehensive performance report."""
    analytics_service = AnalyticsService(db)
    
    # Default to last 30 days if no dates provided
    if not end_date:
        end_date = datetime.utcnow().date()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    report = analytics_service.generate_performance_report(
        start_date=start_date,
        end_date=end_date,
        campaign_ids=campaign_ids,
        advertiser_ids=advertiser_ids,
        group_by=group_by
    )
    
    return report

@router.get("/trends")
async def get_performance_trends(
    metric: str = Query("impressions", regex="^(impressions|clicks|conversions|spend|ctr|cpc|roas)$"),
    period: str = Query("daily", regex="^(hourly|daily|weekly|monthly)$"),
    days: int = Query(30, ge=1, le=365),
    campaign_ids: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)
):
    """Get performance trends for specific metrics."""
    analytics_service = AnalyticsService(db)
    
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days)
    
    trends = analytics_service.get_performance_trends(
        metric=metric,
        period=period,
        start_date=start_date,
        end_date=end_date,
        campaign_ids=campaign_ids
    )
    
    return trends

@router.get("/benchmarks")
async def get_industry_benchmarks(
    industry: Optional[str] = None,
    tier: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get industry performance benchmarks."""
    analytics_service = AnalyticsService(db)
    
    benchmarks = analytics_service.get_industry_benchmarks(
        industry=industry,
        tier=tier
    )
    
    return benchmarks

@router.post("/ab-test")
async def run_ab_test_analysis(
    control_campaign_id: str,
    test_campaign_id: str,
    metric: str = Query("ctr", regex="^(ctr|cvr|cpc|roas)$"),
    confidence_level: float = Query(0.95, ge=0.8, le=0.99),
    db: Session = Depends(get_db)
):
    """Run A/B test statistical analysis between two campaigns."""
    analytics_service = AnalyticsService(db)
    
    # Get performance data for both campaigns
    control_data = analytics_service.get_campaign_metric_data(control_campaign_id, metric)
    test_data = analytics_service.get_campaign_metric_data(test_campaign_id, metric)
    
    if not control_data or not test_data:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient data for A/B test analysis"
        )
    
    # Calculate statistical significance
    results = calculate_statistical_significance(control_data, test_data)
    
    return {
        "control_campaign_id": control_campaign_id,
        "test_campaign_id": test_campaign_id,
        "metric": metric,
        "confidence_level": confidence_level,
        "results": results,
        "recommendation": analytics_service.get_ab_test_recommendation(results)
    }

@router.get("/alerts")
async def get_performance_alerts(
    severity: Optional[str] = Query(None, regex="^(low|medium|high|critical)$"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Get performance alerts and anomalies."""
    analytics_service = AnalyticsService(db)
    
    alerts = analytics_service.get_performance_alerts(
        severity=severity,
        limit=limit
    )
    
    return alerts

@router.get("/forecast")
async def get_performance_forecast(
    campaign_id: str,
    days_ahead: int = Query(7, ge=1, le=90),
    metric: str = Query("impressions", regex="^(impressions|clicks|conversions|spend)$"),
    db: Session = Depends(get_db)
):
    """Generate performance forecast for a campaign."""
    analytics_service = AnalyticsService(db)
    
    forecast = analytics_service.generate_performance_forecast(
        campaign_id=campaign_id,
        days_ahead=days_ahead,
        metric=metric
    )
    
    if not forecast:
        raise HTTPException(
            status_code=404, 
            detail="Campaign not found or insufficient historical data"
        )
    
    return forecast

@router.get("/audience-insights")
async def get_audience_insights(
    campaign_ids: Optional[List[str]] = Query(None),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get audience demographic and behavioral insights."""
    analytics_service = AnalyticsService(db)
    
    insights = analytics_service.get_audience_insights(
        campaign_ids=campaign_ids,
        start_date=start_date,
        end_date=end_date
    )
    
    return insights