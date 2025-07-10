# app/utils/validators.py
import re
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)

def validate_campaign_data(campaign_data: Dict) -> Tuple[bool, List[str]]:
    """
    Comprehensive campaign data validation.
    Returns (is_valid, list_of_errors)
    """
    errors = []
    
    # Required fields validation
    required_fields = ["name", "advertiser_id", "start_date", "end_date", "budget"]
    for field in required_fields:
        if field not in campaign_data or not campaign_data[field]:
            errors.append(f"Missing required field: {field}")
    
    # Campaign name validation
    if "name" in campaign_data:
        name = campaign_data["name"]
        if len(name) < 3:
            errors.append("Campaign name must be at least 3 characters")
        if len(name) > 255:
            errors.append("Campaign name cannot exceed 255 characters")
        if not re.match(r"^[a-zA-Z0-9\s\-_\.]+$", name):
            errors.append("Campaign name contains invalid characters")
    
    # Date validation
    if "start_date" in campaign_data and "end_date" in campaign_data:
        try:
            start_date = campaign_data["start_date"]
            end_date = campaign_data["end_date"]
            
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            if start_date >= end_date:
                errors.append("End date must be after start date")
            
            if start_date < datetime.now():
                errors.append("Start date cannot be in the past")
            
            campaign_duration = (end_date - start_date).days
            if campaign_duration > 365:
                errors.append("Campaign duration cannot exceed 365 days")
            
        except (ValueError, TypeError) as e:
            errors.append(f"Invalid date format: {str(e)}")
    
    # Budget validation
    if "budget" in campaign_data:
        try:
            budget = float(campaign_data["budget"])
            if budget <= 0:
                errors.append("Budget must be greater than 0")
            if budget < 100:
                errors.append("Minimum budget is $100")
            if budget > 10000000:
                errors.append("Maximum budget is $10,000,000")
        except (ValueError, TypeError):
            errors.append("Budget must be a valid number")
    
    # Daily budget validation
    if "daily_budget" in campaign_data and campaign_data["daily_budget"]:
        try:
            daily_budget = float(campaign_data["daily_budget"])
            total_budget = float(campaign_data.get("budget", 0))
            
            if daily_budget <= 0:
                errors.append("Daily budget must be greater than 0")
            
            if "start_date" in campaign_data and "end_date" in campaign_data:
                try:
                    start_date = campaign_data["start_date"]
                    end_date = campaign_data["end_date"]
                    
                    if isinstance(start_date, str):
                        start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                    if isinstance(end_date, str):
                        end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                    
                    campaign_days = (end_date - start_date).days + 1
                    if daily_budget * campaign_days > total_budget:
                        errors.append("Daily budget exceeds total campaign budget")
                        
                except (ValueError, TypeError):
                    pass  # Date validation already handled above
                    
        except (ValueError, TypeError):
            errors.append("Daily budget must be a valid number")
    
    # Targeting validation
    if "target_demographics" in campaign_data:
        demo_errors = validate_demographic_targeting(campaign_data["target_demographics"])
        errors.extend(demo_errors)
    
    if "geographic_targeting" in campaign_data:
        geo_errors = validate_geographic_targeting(campaign_data["geographic_targeting"])
        errors.extend(geo_errors)
    
    return len(errors) == 0, errors

def validate_ad_content(title: str, description: Optional[str] = None) -> bool:
    """
    Validate ad content for compliance with guidelines.
    """
    if not title or len(title.strip()) == 0:
        return False
    
    # Title length check
    if len(title) > 100:
        return False
    
    # Description length check
    if description and len(description) > 500:
        return False
    
    # Prohibited content check
    prohibited_words = [
        "explicit", "adult", "gambling", "illegal", "violence",
        "hate", "discrimination", "inappropriate", "offensive"
    ]
    
    content_text = f"{title} {description or ''}".lower()
    
    for word in prohibited_words:
        if word in content_text:
            logger.warning(f"Prohibited word detected in ad content: {word}")
            return False
    
    # Required Disney-friendly content
    positive_indicators = [
        "family", "fun", "magical", "adventure", "wholesome",
        "entertainment", "joy", "wonder", "imagination", "dreams"
    ]
    
    # At least one positive indicator should be present for Disney content
    if not any(indicator in content_text for indicator in positive_indicators):
        logger.info("Consider adding more family-friendly messaging")
    
    return True

def validate_brand_safety(title: str, description: Optional[str] = None) -> bool:
    """
    Advanced brand safety validation using content analysis.
    """
    content_text = f"{title} {description or ''}".lower()
    
    # Brand safety categories to avoid
    unsafe_categories = {
        "violence": ["violence", "violent", "fight", "attack", "war", "weapon"],
        "adult_content": ["adult", "mature", "explicit", "sexual", "intimate"],
        "substances": ["alcohol", "drinking", "drugs", "smoking", "tobacco"],
        "gambling": ["gambling", "casino", "betting", "lottery", "poker"],
        "negative_sentiment": ["hate", "angry", "disgusting", "terrible", "awful"]
    }
    
    violations = []
    
    for category, keywords in unsafe_categories.items():
        for keyword in keywords:
            if keyword in content_text:
                violations.append(f"{category}: {keyword}")
    
    if violations:
        logger.warning(f"Brand safety violations detected: {violations}")
        return False
    
    return True

def validate_demographic_targeting(demographics: Dict) -> List[str]:
    """Validate demographic targeting configuration."""
    errors = []
    
    if not isinstance(demographics, dict):
        errors.append("Demographics must be a dictionary")
        return errors
    
    # Age groups validation
    if "age_groups" in demographics:
        age_groups = demographics["age_groups"]
        valid_age_groups = ["18-24", "25-34", "35-44", "45-54", "55+"]
        
        if not isinstance(age_groups, list):
            errors.append("Age groups must be a list")
        else:
            for age_group in age_groups:
                if age_group not in valid_age_groups:
                    errors.append(f"Invalid age group: {age_group}")
    
    # Gender validation
    if "genders" in demographics:
        genders = demographics["genders"]
        valid_genders = ["male", "female", "non-binary", "all"]
        
        if not isinstance(genders, list):
            errors.append("Genders must be a list")
        else:
            for gender in genders:
                if gender not in valid_genders:
                    errors.append(f"Invalid gender: {gender}")
    
    # Income validation
    if "income_levels" in demographics:
        income_levels = demographics["income_levels"]
        valid_income_levels = ["low", "medium", "high", "premium"]
        
        if not isinstance(income_levels, list):
            errors.append("Income levels must be a list")
        else:
            for income in income_levels:
                if income not in valid_income_levels:
                    errors.append(f"Invalid income level: {income}")
    
    return errors

def validate_geographic_targeting(geographic: Dict) -> List[str]:
    """Validate geographic targeting configuration."""
    errors = []
    
    if not isinstance(geographic, dict):
        errors.append("Geographic targeting must be a dictionary")
        return errors
    
    # Countries validation
    if "countries" in geographic:
        countries = geographic["countries"]
        valid_countries = [
            "US", "CA", "UK", "AU", "DE", "FR", "ES", "IT", "NL", "SE",
            "NO", "DK", "FI", "BR", "MX", "AR", "CL", "CO", "PE"
        ]
        
        if not isinstance(countries, list):
            errors.append("Countries must be a list")
        else:
            for country in countries:
                if country not in valid_countries:
                    errors.append(f"Invalid or unsupported country: {country}")
    
    # States/Regions validation (for US)
    if "states" in geographic:
        states = geographic["states"]
        if not isinstance(states, list):
            errors.append("States must be a list")
        else:
            # Validate US state codes
            for state in states:
                if not re.match(r"^[A-Z]{2}$", state):
                    errors.append(f"Invalid state code format: {state}")
    
    # Cities validation
    if "cities" in geographic:
        cities = geographic["cities"]
        if not isinstance(cities, list):
            errors.append("Cities must be a list")
        else:
            for city in cities:
                if not isinstance(city, str) or len(city.strip()) == 0:
                    errors.append("City names must be non-empty strings")
    
    return errorss

# def validate_advertiser_data(advertiser_data: Dict) -> Tuple[bool, List[str]]:
#     """Validate advertiser data."""
#     errors = []
    
#     # Required fields
#     required_fields = ["name", "company_name", "contact_email"]
#     for field in required_fields:
#         if field not in advertiser_data or not advertiser_data[field]:
#             errors.append(f"Missing required field: {field}")
    
#     # Email validation
#     if "contact_email" in advertiser_data:
#         email = advertiser_data["contact_email"]
#         email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}#'