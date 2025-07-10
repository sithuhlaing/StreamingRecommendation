# app/services/quality_control_service.py
from sqlalchemy.orm import Session
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from ..models.campaign import Campaign, Ad
from ..models.ad_metrics import AdMetrics
from ..utils.validators import validate_ad_content, validate_brand_safety
from ..config import settings
import logging

logger = logging.getLogger(__name__)

class QualityControlService:
    """
    Quality Control Service for Disney Streaming Ad Campaign Management.
    Handles automated quality checks, brand safety, and performance monitoring.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def review_ad_content(self, ad_id: str) -> Dict:
        """
        Comprehensive ad content review process.
        Checks brand safety, content guidelines, and technical specifications.
        """
        ad = self.db.query(Ad).filter(Ad.id == ad_id).first()
        if not ad:
            return {"status": "error", "message": "Ad not found"}
        
        review_results = {
            "ad_id": ad_id,
            "review_timestamp": datetime.utcnow().isoformat(),
            "checks": [],
            "overall_score": 0,
            "approval_status": "pending",
            "issues": []
        }
        
        # 1. Technical Specifications Check
        tech_check = self._check_technical_specs(ad)
        review_results["checks"].append(tech_check)
        
        # 2. Brand Safety Check
        brand_check = self._check_brand_safety(ad)
        review_results["checks"].append(brand_check)
        
        # 3. Content Guidelines Check
        content_check = self._check_content_guidelines(ad)
        review_results["checks"].append(content_check)
        
        # 4. Disney Content Standards Check
        disney_check = self._check_disney_standards(ad)
        review_results["checks"].append(disney_check)
        
        # Calculate overall score
        total_score = sum(check["score"] for check in review_results["checks"])
        review_results["overall_score"] = total_score / len(review_results["checks"])
        
        # Determine approval status
        if review_results["overall_score"] >= settings.QUALITY_SCORE_THRESHOLD:
            review_results["approval_status"] = "approved"
            ad.approval_status = "approved"
        elif review_results["overall_score"] >= 2.0:
            review_results["approval_status"] = "needs_review"
            ad.approval_status = "needs_review"
        else:
            review_results["approval_status"] = "rejected"
            ad.approval_status = "rejected"
        
        # Update ad quality score
        ad.quality_score = review_results["overall_score"]
        self.db.commit()
        
        return review_results
    
    def _check_technical_specs(self, ad: Ad) -> Dict:
        """Check technical specifications of ad content."""
        check_result = {
            "check_type": "technical_specs",
            "score": 5.0,
            "issues": []
        }
        
        # File size check
        if ad.file_size and ad.file_size > settings.MAX_FILE_SIZE:
            check_result["score"] -= 2.0
            check_result["issues"].append(f"File size {ad.file_size} exceeds limit")
        
        # Duration check for video ads
        if ad.format == "video":
            if not ad.duration:
                check_result["score"] -= 1.0
                check_result["issues"].append("Video duration not specified")
            elif ad.duration > 30:  # 30 second limit
                check_result["score"] -= 1.5
                check_result["issues"].append("Video duration exceeds 30 seconds")
        
        # URL validation
        if ad.creative_url and not self._validate_url(ad.creative_url):
            check_result["score"] -= 1.0
            check_result["issues"].append("Invalid creative URL")
        
        if ad.click_through_url and not self._validate_url(ad.click_through_url):
            check_result["score"] -= 1.0
            check_result["issues"].append("Invalid click-through URL")
        
        return check_result
    
    def _check_brand_safety(self, ad: Ad) -> Dict:
        """Check brand safety compliance."""
        check_result = {
            "check_type": "brand_safety",
            "score": 5.0,
            "issues": []
        }
        
        # Content validation using external service
        if not validate_brand_safety(ad.title, ad.description):
            check_result["score"] -= 3.0
            check_result["issues"].append("Brand safety concerns detected")
        
        # Disney-specific brand safety checks
        unsafe_keywords = ["gambling", "alcohol", "violence", "inappropriate"]
        content_text = f"{ad.title} {ad.description}".lower()
        
        for keyword in unsafe_keywords:
            if keyword in content_text:
                check_result["score"] -= 1.0
                check_result["issues"].append(f"Unsafe keyword detected: {keyword}")
        
        return check_result
    
    def _check_content_guidelines(self, ad: Ad) -> Dict:
        """Check content guidelines compliance."""
        check_result = {
            "check_type": "content_guidelines",
            "score": 5.0,
            "issues": []
        }
        
        # Title length check
        if len(ad.title) > 100:
            check_result["score"] -= 0.5
            check_result["issues"].append("Title exceeds 100 characters")
        
        # Description length check
        if ad.description and len(ad.description) > 500:
            check_result["score"] -= 0.5
            check_result["issues"].append("Description exceeds 500 characters")
        
        # Content validation
        if not validate_ad_content(ad.title, ad.description):
            check_result["score"] -= 2.0
            check_result["issues"].append("Content guideline violations detected")
        
        return check_result
    
    def _check_disney_standards(self, ad: Ad) -> Dict:
        """Check Disney-specific content standards."""
        check_result = {
            "check_type": "disney_standards",
            "score": 5.0,
            "issues": []
        }
        
        # Family-friendly content check
        family_unfriendly = ["mature", "adult", "violent", "explicit"]
        content_text = f"{ad.title} {ad.description}".lower()
        
        for term in family_unfriendly:
            if term in content_text:
                check_result["score"] -= 2.0
                check_result["issues"].append(f"Non-family-friendly content: {term}")
        
        # Positive messaging check
        positive_indicators = ["family", "fun", "magical", "adventure", "wholesome"]
        if not any(indicator in content_text for indicator in positive_indicators):
            check_result["score"] -= 0.5
            check_result["issues"].append("Consider adding more positive family messaging")
        
        return check_result
    
    def _validate_url(self, url: str) -> bool:
        """Validate URL format and accessibility."""
        import re
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        return url_pattern.match(url) is not None
    
    def monitor_campaign_performance(self, campaign_id: str) -> Dict:
        """
        Monitor campaign performance and trigger alerts for quality issues.
        """
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return {"status": "error", "message": "Campaign not found"}
        
        # Get recent performance metrics
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        metrics = self.db.query(AdMetrics).filter(
            AdMetrics.campaign_id == campaign_id,
            AdMetrics.date >= start_date,
            AdMetrics.date <= end_date
        ).all()
        
        if not metrics:
            return {"status": "no_data", "message": "No recent performance data"}
        
        # Calculate performance indicators
        total_impressions = sum(m.impressions for m in metrics)
        total_clicks = sum(m.clicks for m in metrics)
        total_spend = sum(m.spend for m in metrics)
        
        ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        avg_cpc = (total_spend / total_clicks) if total_clicks > 0 else 0
        
        alerts = []
        
        # Performance threshold checks
        if ctr < settings.MIN_CTR_THRESHOLD:
            alerts.append({
                "type": "low_ctr",
                "severity": "high",
                "message": f"CTR {ctr:.2f}% below threshold {settings.MIN_CTR_THRESHOLD}%",
                "recommendation": "Review ad creative and targeting"
            })
        
        if avg_cpc > campaign.budget * 0.1:  # CPC > 10% of total budget
            alerts.append({
                "type": "high_cpc",
                "severity": "medium",
                "message": f"High CPC ${avg_cpc:.2f} detected",
                "recommendation": "Optimize targeting and bidding strategy"
            })
        
        # Budget pacing check
        days_elapsed = (datetime.utcnow() - campaign.start_date).days + 1
        expected_spend = (campaign.budget / 
                         ((campaign.end_date - campaign.start_date).days + 1)) * days_elapsed
        
        if total_spend > expected_spend * 1.2:  # 20% over expected
            alerts.append({
                "type": "budget_overspend",
                "severity": "critical",
                "message": f"Spending ${total_spend:.2f} vs expected ${expected_spend:.2f}",
                "recommendation": "Reduce daily budget or pause campaign"
            })
        
        # Auto-pause if critical issues
        if any(alert["severity"] == "critical" for alert in alerts):
            if settings.AUTO_PAUSE_LOW_PERFORMANCE:
                campaign.status = "paused"
                self.db.commit()
                alerts.append({
                    "type": "auto_pause",
                    "severity": "critical",
                    "message": "Campaign automatically paused due to critical issues",
                    "recommendation": "Review and resolve issues before reactivating"
                })
        
        return {
            "campaign_id": campaign_id,
            "performance_summary": {
                "ctr": ctr,
                "avg_cpc": avg_cpc,
                "total_spend": total_spend,
                "budget_utilization": (total_spend / campaign.budget * 100)
            },
            "alerts": alerts,
            "status": "paused" if campaign.status == "paused" else "active"
        }
    
    def get_quality_report(self, start_date: datetime, end_date: datetime) -> Dict:
        """Generate comprehensive quality control report."""
        # Get all ads reviewed in the period
        ads = self.db.query(Ad).filter(
            Ad.created_at >= start_date,
            Ad.created_at <= end_date
        ).all()
        
        total_ads = len(ads)
        if total_ads == 0:
            return {"message": "No ads found in the specified period"}
        
        approved = sum(1 for ad in ads if ad.approval_status == "approved")
        rejected = sum(1 for ad in ads if ad.approval_status == "rejected")
        pending = sum(1 for ad in ads if ad.approval_status == "pending")
        needs_review = sum(1 for ad in ads if ad.approval_status == "needs_review")
        
        avg_quality_score = sum(ad.quality_score or 0 for ad in ads) / total_ads
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "summary": {
                "total_ads_reviewed": total_ads,
                "approved": approved,
                "rejected": rejected,
                "pending": pending,
                "needs_review": needs_review,
                "approval_rate": (approved / total_ads * 100) if total_ads > 0 else 0,
                "average_quality_score": avg_quality_score
            },
            "quality_distribution": {
                "excellent": sum(1 for ad in ads if (ad.quality_score or 0) >= 4.5),
                "good": sum(1 for ad in ads if 3.5 <= (ad.quality_score or 0) < 4.5),
                "fair": sum(1 for ad in ads if 2.5 <= (ad.quality_score or 0) < 3.5),
                "poor": sum(1 for ad in ads if (ad.quality_score or 0) < 2.5)
            }
        }