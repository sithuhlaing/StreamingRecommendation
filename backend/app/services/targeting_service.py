# app/services/targeting_service.py
from sqlalchemy.orm import Session
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from ..models.campaign import Campaign
from ..models.ad_metrics import AdMetrics
from ..utils.math_utils import calculate_audience_overlap, calculate_targeting_efficiency
import logging

logger = logging.getLogger(__name__)

class TargetingService:
    """
    Advanced targeting service for Disney Streaming campaigns.
    Handles audience segmentation, demographic targeting, and optimization.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    def optimize_targeting(self, campaign_id: str) -> Dict:
        """
        Analyze campaign performance and suggest targeting optimizations.
        """
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return {"error": "Campaign not found"}
        
        # Get performance data
        metrics = self._get_campaign_metrics(campaign_id)
        if not metrics:
            return {"error": "Insufficient performance data"}
        
        # Analyze current targeting
        current_targeting = {
            "demographics": campaign.target_demographics or {},
            "content_types": campaign.target_content_types or {},
            "geographic": campaign.geographic_targeting or {}
        }
        
        # Generate optimization recommendations
        recommendations = []
        
        # Demographic optimization
        demo_rec = self._analyze_demographic_performance(campaign_id, metrics)
        if demo_rec:
            recommendations.extend(demo_rec)
        
        # Content type optimization
        content_rec = self._analyze_content_performance(campaign_id, metrics)
        if content_rec:
            recommendations.extend(content_rec)
        
        # Geographic optimization
        geo_rec = self._analyze_geographic_performance(campaign_id, metrics)
        if geo_rec:
            recommendations.extend(geo_rec)
        
        # Audience expansion opportunities
        expansion_rec = self._identify_expansion_opportunities(campaign_id)
        if expansion_rec:
            recommendations.extend(expansion_rec)
        
        return {
            "campaign_id": campaign_id,
            "current_targeting": current_targeting,
            "performance_summary": self._summarize_performance(metrics),
            "recommendations": recommendations,
            "optimization_score": self._calculate_optimization_score(recommendations)
        }
    
    def _get_campaign_metrics(self, campaign_id: str) -> List[AdMetrics]:
        """Get recent campaign metrics for analysis."""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        return self.db.query(AdMetrics).filter(
            AdMetrics.campaign_id == campaign_id,
            AdMetrics.date >= start_date,
            AdMetrics.date <= end_date
        ).all()
    
    def _analyze_demographic_performance(self, campaign_id: str, metrics: List[AdMetrics]) -> List[Dict]:
        """Analyze demographic targeting performance."""
        recommendations = []
        
        # Calculate performance by age group (simulated)
        age_performance = {
            "18-24": {"ctr": 2.1, "cvr": 1.8, "cpc": 0.45},
            "25-34": {"ctr": 3.2, "cvr": 2.4, "cpc": 0.38},
            "35-44": {"ctr": 2.8, "cvr": 3.1, "cpc": 0.42},
            "45-54": {"ctr": 1.9, "cvr": 2.2, "cpc": 0.51},
            "55+": {"ctr": 1.5, "cvr": 1.6, "cpc": 0.58}
        }
        
        # Find best performing demographics
        best_ctr = max(age_performance.values(), key=lambda x: x["ctr"])
        best_cvr = max(age_performance.values(), key=lambda x: x["cvr"])
        
        for age_group, perf in age_performance.items():
            if perf["ctr"] >= best_ctr["ctr"] * 0.9:  # Top 90% performers
                recommendations.append({
                    "type": "demographic_optimization",
                    "priority": "high",
                    "action": "expand",
                    "target": age_group,
                    "reason": f"High CTR: {perf['ctr']}%",
                    "expected_impact": "+15% impressions"
                })
            elif perf["ctr"] < 1.5:  # Poor performers
                recommendations.append({
                    "type": "demographic_optimization",
                    "priority": "medium",
                    "action": "reduce_or_exclude",
                    "target": age_group,
                    "reason": f"Low CTR: {perf['ctr']}%",
                    "expected_impact": "+8% efficiency"
                })
        
        return recommendations
    
    def _analyze_content_performance(self, campaign_id: str, metrics: List[AdMetrics]) -> List[Dict]:
        """Analyze content type targeting performance."""
        recommendations = []
        
        # Simulated content performance data
        content_performance = {
            "movies": {"engagement": 85, "completion": 78, "ctr": 3.1},
            "tv_shows": {"engagement": 92, "completion": 82, "ctr": 3.6},
            "documentaries": {"engagement": 76, "completion": 88, "ctr": 2.3},
            "sports": {"engagement": 94, "completion": 65, "ctr": 4.2},
            "news": {"engagement": 68, "completion": 72, "ctr": 1.8}
        }
        
        for content_type, perf in content_performance.items():
            if perf["ctr"] >= 3.5:
                recommendations.append({
                    "type": "content_optimization",
                    "priority": "high",
                    "action": "increase_budget_allocation",
                    "target": content_type,
                    "reason": f"Excellent CTR: {perf['ctr']}%",
                    "expected_impact": "+20% conversions"
                })
            elif perf["engagement"] >= 90:
                recommendations.append({
                    "type": "content_optimization",
                    "priority": "medium",
                    "action": "expand_targeting",
                    "target": content_type,
                    "reason": f"High engagement: {perf['engagement']}%",
                    "expected_impact": "+12% reach"
                })
        
        return recommendations
    
    def _analyze_geographic_performance(self, campaign_id: str, metrics: List[AdMetrics]) -> List[Dict]:
        """Analyze geographic targeting performance."""
        recommendations = []
        
        # Simulated geographic performance
        geo_performance = {
            "US-West": {"ctr": 3.2, "cpc": 0.42, "market_size": "large"},
            "US-East": {"ctr": 2.8, "cpc": 0.38, "market_size": "large"},
            "US-Central": {"ctr": 2.1, "cpc": 0.35, "market_size": "medium"},
            "Canada": {"ctr": 2.5, "cpc": 0.31, "market_size": "medium"},
            "UK": {"ctr": 2.9, "cpc": 0.45, "market_size": "medium"}
        }
        
        for region, perf in geo_performance.items():
            efficiency_score = perf["ctr"] / perf["cpc"]  # CTR per dollar
            
            if efficiency_score >= 7.0:
                recommendations.append({
                    "type": "geographic_optimization",
                    "priority": "high",
                    "action": "increase_budget",
                    "target": region,
                    "reason": f"High efficiency: {efficiency_score:.1f} CTR/$",
                    "expected_impact": "+18% ROI"
                })
            elif perf["market_size"] == "large" and perf["ctr"] < 2.5:
                recommendations.append({
                    "type": "geographic_optimization",
                    "priority": "medium",
                    "action": "optimize_creative",
                    "target": region,
                    "reason": f"Large market underperforming: {perf['ctr']}% CTR",
                    "expected_impact": "+10% performance"
                })
        
        return recommendations
    
    def _identify_expansion_opportunities(self, campaign_id: str) -> List[Dict]:
        """Identify audience expansion opportunities."""
        recommendations = []
        
        # Lookalike audience opportunities
        recommendations.append({
            "type": "audience_expansion",
            "priority": "high",
            "action": "create_lookalike",
            "target": "high_value_converters",
            "reason": "Based on top 10% of converters",
            "expected_impact": "+25% qualified reach"
        })
        
        # Similar content audiences
        recommendations.append({
            "type": "audience_expansion",
            "priority": "medium",
            "action": "add_similar_interests",
            "target": "disney_enthusiasts",
            "reason": "High affinity with Disney content",
            "expected_impact": "+15% engagement"
        })
        
        # Cross-platform opportunities
        recommendations.append({
            "type": "audience_expansion",
            "priority": "medium",
            "action": "expand_platforms",
            "target": "mobile_first_users",
            "reason": "Growing mobile viewership",
            "expected_impact": "+20% reach"
        })
        
        return recommendations
    
    def _summarize_performance(self, metrics: List[AdMetrics]) -> Dict:
        """Summarize campaign performance metrics."""
        if not metrics:
            return {}
        
        total_impressions = sum(m.impressions for m in metrics)
        total_clicks = sum(m.clicks for m in metrics)
        total_conversions = sum(m.conversions for m in metrics)
        total_spend = sum(m.spend for m in metrics)
        
        return {
            "total_impressions": total_impressions,
            "total_clicks": total_clicks,
            "total_conversions": total_conversions,
            "total_spend": total_spend,
            "ctr": (total_clicks / total_impressions * 100) if total_impressions > 0 else 0,
            "cvr": (total_conversions / total_clicks * 100) if total_clicks > 0 else 0,
            "cpc": (total_spend / total_clicks) if total_clicks > 0 else 0,
            "days_analyzed": len(set(m.date.date() for m in metrics))
        }
    
    def _calculate_optimization_score(self, recommendations: List[Dict]) -> float:
        """Calculate optimization potential score."""
        if not recommendations:
            return 100.0  # Already optimized
        
        priority_weights = {"high": 3, "medium": 2, "low": 1}
        total_weight = sum(priority_weights.get(r["priority"], 1) for r in recommendations)
        
        # Score decreases with more high-priority recommendations
        optimization_score = max(0, 100 - (total_weight * 5))
        
        return round(optimization_score, 1)
    
    def create_audience_segment(self, segment_data: Dict) -> Dict:
        """Create a new audience segment for targeting."""
        segment = {
            "id": f"segment_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "name": segment_data.get("name"),
            "description": segment_data.get("description"),
            "criteria": segment_data.get("criteria", {}),
            "estimated_size": self._estimate_audience_size(segment_data.get("criteria", {})),
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }
        
        return segment
    
    def _estimate_audience_size(self, criteria: Dict) -> int:
        """Estimate audience size based on targeting criteria."""
        base_size = 100000000  # Disney+ has ~100M subscribers
        
        # Apply demographic filters
        if "age_groups" in criteria:
            age_reduction = len(criteria["age_groups"]) / 5  # 5 total age groups
            base_size = int(base_size * age_reduction)
        
        # Apply geographic filters
        if "regions" in criteria:
            geo_reduction = len(criteria["regions"]) / 10  # Assume 10 major regions
            base_size = int(base_size * geo_reduction)
        
        # Apply content interest filters
        if "content_types" in criteria:
            content_reduction = len(criteria["content_types"]) / 5  # 5 content types
            base_size = int(base_size * content_reduction * 0.8)  # More specific
        
        return max(10000, base_size)  # Minimum viable audience
    
    def get_targeting_recommendations(self, advertiser_industry: str, campaign_objective: str) -> Dict:
        """Get targeting recommendations based on industry and objective."""
        recommendations = {
            "suggested_demographics": [],
            "suggested_content_types": [],
            "suggested_regions": [],
            "budget_allocation": {},
            "best_practices": []
        }
        
        # Industry-specific recommendations
        if advertiser_industry.lower() in ["entertainment", "media"]:
            recommendations["suggested_demographics"] = ["18-34", "25-44"]
            recommendations["suggested_content_types"] = ["movies", "tv_shows"]
            recommendations["best_practices"].append("Focus on premium content slots")
        
        elif advertiser_industry.lower() in ["technology", "gaming"]:
            recommendations["suggested_demographics"] = ["18-35", "25-40"]
            recommendations["suggested_content_types"] = ["documentaries", "sports"]
            recommendations["best_practices"].append("Target tech-savvy audiences")
        
        elif advertiser_industry.lower() in ["automotive", "travel"]:
            recommendations["suggested_demographics"] = ["25-54"]
            recommendations["suggested_content_types"] = ["documentaries", "sports", "news"]
            recommendations["best_practices"].append("Emphasize aspirational content")
        
        # Objective-specific recommendations
        if campaign_objective == "awareness":
            recommendations["budget_allocation"] = {
                "video_ads": 60,
                "display_ads": 30,
                "interactive_ads": 10
            }
            recommendations["best_practices"].append("Prioritize reach over frequency")
        
        elif campaign_objective == "conversion":
            recommendations["budget_allocation"] = {
                "video_ads": 40,
                "display_ads": 35,
                "interactive_ads": 25
            }
            recommendations["best_practices"].append("Focus on high-intent audiences")
        
        return recommendations