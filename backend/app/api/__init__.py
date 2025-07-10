# app/api/__init__.py
"""
API module for Disney Streaming Ad Campaign Management.
Contains all REST API endpoints and route handlers.
"""

from .campaigns import router as campaigns_router
from .advertisers import router as advertisers_router
from .analytics import router as analytics_router

__all__ = ["campaigns_router", "advertisers_router", "analytics_router"]