# Streaming Ad Campaign Management System

A full-stack application for managing Streaming's ad campaigns, built with Python/FastAPI backend and React/TypeScript frontend.

## 🚀 Features

### Backend (Python/FastAPI)
- **RESTful API** with FastAPI and SQLAlchemy
- **PostgreSQL** database with comprehensive data models
- **Advanced Analytics** with mathematical calculations for audit stakeholders
- **Campaign Management** with workflow automation
- **Performance Tracking** with real-time metrics
- **Quality Control** pipeline for ad approval
- **Scalable Architecture** supporting billions of impressions

### Frontend (React/TypeScript)
- **Modern React** with TypeScript and Material-UI
- **Real-time Dashboard** with performance metrics
- **Campaign Management** interface with intuitive forms
- **Data Visualization** with charts and graphs
- **Responsive Design** for desktop and mobile
- **Advanced Filtering** and search capabilities

### Key Business Features
- **Campaign Workflow Management** - From creation to completion
- **Targeting System** - Demographics, content types, and geographic targeting
- **Budget Control** - Daily and total budget management with alerts
- **Performance Analytics** - CTR, CVR, ROAS, and advanced metrics
- **Quality Assurance** - Multi-stage approval process
- **Audit Trail** - Complete tracking for compliance
- **Risk Assessment** - Mathematical models for campaign risk scoring

## 🛠️ Technical Stack

### Backend
- **Python 3.11+** with FastAPI
- **SQLAlchemy** ORM with PostgreSQL
- **Redis** for caching and session management
- **Celery** for background task processing
- **JWT Authentication** for secure API access
- **Comprehensive Testing** with pytest

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for component library
- **React Query** for data fetching and caching
- **React Router** for navigation
- **Formik + Yup** for form validation
- **Recharts** for data visualization
- **Axios** for HTTP client

### Database
- **PostgreSQL 15** for relational data
- **Redis** for caching and real-time features
- **Database Migrations** with Alembic

## 📁 Project Structure

```
disney-ad-campaign-system/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── config.py          # Configuration management
│   │   ├── database.py        # Database connection setup
│   │   ├── models/            # SQLAlchemy data models
│   │   │   ├── campaign.py    # Campaign and Ad models
│   │   │   ├── advertiser.py  # Advertiser model
│   │   │   └── ad_metrics.py  # Analytics and metrics
│   │   ├── api/               # API route handlers
│   │   │   ├── campaigns.py   # Campaign endpoints
│   │   │   ├── advertisers.py # Advertiser endpoints
│   │   │   └── analytics.py   # Analytics endpoints
│   │   ├── services/          # Business logic layer
│   │   │   ├── campaign_service.py
│   │   │   ├── targeting_service.py
│   │   │   └── quality_control_service.py
│   │   └── utils/             # Utility functions
│   │       ├── math_utils.py  # Mathematical calculations
│   │       └── validators.py  # Data validation
│   ├── tests/                 # Test suite
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile            # Backend containerization
├── frontend/                  # React TypeScript frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard/    # Dashboard components
│   │   │   ├── CampaignManager/ # Campaign management
│   │   │   ├── Analytics/    # Analytics components
│   │   │   └── Common/       # Shared components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript interfaces
│   ├── package.json         # Node.js dependencies
│   └── Dockerfile          # Frontend containerization
├── docker-compose.yml       # Multi-service orchestration
├── README.md               # This file
└── .env.example           # Environment variables template