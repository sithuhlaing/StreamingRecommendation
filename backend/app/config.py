# app/config.py - Configuration management
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://user:password@localhost/disney_ads"
    redis_url: str = "redis://localhost:6379"
    
    # Security
    secret_key: str = "your-secret-key-here"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # External Services
    disney_streaming_api_url: str = "https://api.disneystreaming.com"
    ad_serving_api_url: str = "https://ads.disneystreaming.com"
    
    # Business Logic
    max_ads_per_campaign: int = 10000
    daily_impression_limit: int = 1000000000  # 1 billion as mentioned in job description
    
    class Config:
        env_file = ".env"

settings = Settings()