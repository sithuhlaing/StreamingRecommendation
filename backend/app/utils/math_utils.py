# app/utils/math_utils.py - Mathematical utilities for audit background
import math
from typing import Dict, List, Optional
from statistics import mean, median, stdev
from datetime import datetime, timedelta

def calculate_campaign_performance(performance_data: Dict) -> Dict:
    """
    Advanced mathematical calculations for campaign performance.
    Designed for stakeholders with audit background.
    """
    impressions = performance_data.get("total_impressions", 0)
    clicks = performance_data.get("total_clicks", 0)
    conversions = performance_data.get("total_conversions", 0)
    spend = performance_data.get("total_spend", 0)
    revenue = performance_data.get("total_revenue", 0)
    
    # Basic rates
    ctr = (clicks / impressions * 100) if impressions > 0 else 0
    cvr = (conversions / clicks * 100) if clicks > 0 else 0
    cpc = (spend / clicks) if clicks > 0 else 0
    cpm = (spend / impressions * 1000) if impressions > 0 else 0
    roas = (revenue / spend) if spend > 0 else 0
    
    # Advanced metrics
    cost_per_acquisition = (spend / conversions) if conversions > 0 else 0
    profit = revenue - spend
    profit_margin = (profit / revenue * 100) if revenue > 0 else 0
    
    # Statistical analysis
    daily_metrics = performance_data.get("daily_metrics", [])
    if daily_metrics:
        daily_impressions = [d["impressions"] for d in daily_metrics]
        daily_spend = [d["spend"] for d in daily_metrics]
        
        # Variability analysis
        impression_variance = calculate_variance(daily_impressions)
        spend_variance = calculate_variance(daily_spend)
        
        # Trend analysis
        impression_trend = calculate_trend(daily_impressions)
        spend_trend = calculate_trend(daily_spend)
    else:
        impression_variance = spend_variance = 0
        impression_trend = spend_trend = 0
    
    # Risk assessment
    risk_score = calculate_risk_score(ctr, cvr, roas, impression_variance)
    
    # Projected performance
    projected_monthly_revenue = project_monthly_performance(revenue, len(daily_metrics))
    
    performance_data.update({
        "calculated_metrics": {
            "ctr_percent": round(ctr, 2),
            "cvr_percent": round(cvr, 2),
            "cpc": round(cpc, 2),
            "cpm": round(cpm, 2),
            "roas": round(roas, 2),
            "cost_per_acquisition": round(cost_per_acquisition, 2),
            "profit": round(profit, 2),
            "profit_margin_percent": round(profit_margin, 2),
            "impression_variance": round(impression_variance, 2),
            "spend_variance": round(spend_variance, 2),
            "impression_trend": round(impression_trend, 4),
            "spend_trend": round(spend_trend, 4),
            "risk_score": round(risk_score, 2),
            "projected_monthly_revenue": round(projected_monthly_revenue, 2)
        }
    })
    
    return performance_data

def calculate_variance(data: List[float]) -> float:
    """Calculate variance for performance stability analysis."""
    if len(data) < 2:
        return 0
    
    mean_val = mean(data)
    variance = sum((x - mean_val) ** 2 for x in data) / (len(data) - 1)
    return variance

def calculate_trend(data: List[float]) -> float:
    """Calculate linear trend slope for performance trajectory."""
    if len(data) < 2:
        return 0
    
    n = len(data)
    x = list(range(n))
    
    # Linear regression slope calculation
    x_mean = mean(x)
    y_mean = mean(data)
    
    numerator = sum((x[i] - x_mean) * (data[i] - y_mean) for i in range(n))
    denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
    
    return numerator / denominator if denominator != 0 else 0

def calculate_risk_score(ctr: float, cvr: float, roas: float, variance: float) -> float:
    """
    Calculate risk score based on performance metrics.
    Higher score indicates higher risk.
    """
    # Normalize metrics to 0-1 scale
    ctr_risk = max(0, 1 - (ctr / 5))  # Assume 5% is excellent CTR
    cvr_risk = max(0, 1 - (cvr / 10))  # Assume 10% is excellent CVR
    roas_risk = max(0, 1 - (roas / 5))  # Assume 5x ROAS is excellent
    variance_risk = min(1, variance / 1000000)  # Normalize variance
    
    # Weighted risk score
    risk_score = (ctr_risk * 0.3 + cvr_risk * 0.3 + roas_risk * 0.3 + variance_risk * 0.1) * 100
    
    return risk_score

def project_monthly_performance(current_revenue: float, days_elapsed: int) -> float:
    """Project monthly performance based on current trajectory."""
    if days_elapsed == 0:
        return 0
    
    daily_average = current_revenue / days_elapsed
    return daily_average * 30

def calculate_statistical_significance(control_group: List[float], test_group: List[float]) -> Dict:
    """
    Calculate statistical significance for A/B testing.
    Returns p-value and confidence interval.
    """
    if len(control_group) < 2 or len(test_group) < 2:
        return {"p_value": 1.0, "significant": False, "confidence_interval": [0, 0]}
    
    # Simple t-test approximation
    mean_control = mean(control_group)
    mean_test = mean(test_group)
    
    std_control = stdev(control_group) if len(control_group) > 1 else 0
    std_test = stdev(test_group) if len(test_group) > 1 else 0
    
    # Standard error calculation
    se = math.sqrt((std_control**2 / len(control_group)) + (std_test**2 / len(test_group)))
    
    if se == 0:
        return {"p_value": 1.0, "significant": False, "confidence_interval": [0, 0]}
    
    # T-statistic
    t_stat = (mean_test - mean_control) / se
    
    # Simplified p-value calculation (approximate)
    p_value = 2 * (1 - abs(t_stat) / (abs(t_stat) + math.sqrt(len(control_group) + len(test_group) - 2)))
    
    significant = p_value < 0.05
    
    # 95% confidence interval
    margin_of_error = 1.96 * se
    ci_lower = (mean_test - mean_control) - margin_of_error
    ci_upper = (mean_test - mean_control) + margin_of_error
    
    return {
        "p_value": p_value,
        "significant": significant,
        "confidence_interval": [ci_lower, ci_upper],
        "effect_size": mean_test - mean_control
    }

def calculate_roi(revenue: float, cost: float) -> float:
    """Calculate Return on Investment."""
    if cost == 0:
        return float('inf') if revenue > 0 else 0
    return ((revenue - cost) / cost) * 100

def calculate_projected_performance(
    historical_data: List[Dict], 
    projection_days: int
) -> Dict:
    """
    Project future performance based on historical trends.
    Uses linear regression for trend analysis.
    """
    if not historical_data:
        return {"projected_revenue": 0, "projected_spend": 0, "confidence": 0}
    
    revenues = [d.get("revenue", 0) for d in historical_data]
    spends = [d.get("spend", 0) for d in historical_data]
    
    # Calculate trends
    revenue_trend = calculate_trend(revenues)
    spend_trend = calculate_trend(spends)
    
    # Project forward
    current_revenue = revenues[-1] if revenues else 0
    current_spend = spends[-1] if spends else 0
    
    projected_revenue = current_revenue + (revenue_trend * projection_days)
    projected_spend = current_spend + (spend_trend * projection_days)
    
    # Calculate confidence based on data consistency
    revenue_variance = calculate_variance(revenues)
    confidence = max(0, 100 - (revenue_variance / max(mean(revenues), 1) * 100))
    
    return {
        "projected_revenue": max(0, projected_revenue),
        "projected_spend": max(0, projected_spend),
        "confidence_percent": min(100, confidence),
        "revenue_trend": revenue_trend,
        "spend_trend": spend_trend
    }
