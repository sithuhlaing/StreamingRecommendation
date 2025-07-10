# app/main.py - FastAPI main application
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn
from .database import get_db
from .models import campaign, advertiser, ad_metrics
from .api import campaigns, advertisers, analytics
from .config import settings

app = FastAPI(
    title="Disney Streaming Ad Campaign Management",
    description="Ad Experience (AX) team platform for campaign workflow management",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(campaigns.router, prefix="/api/v1/campaigns", tags=["campaigns"])
app.include_router(advertisers.router, prefix="/api/v1/advertisers", tags=["advertisers"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])

@app.get("/")
async def root():
    return {"message": "Disney Streaming Ad Campaign Management API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "disney-ad-campaign-api"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)