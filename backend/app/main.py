"""
HeatGuard API Main Application

FastAPI application entry point for the heat risk prediction service.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import API_DESCRIPTION, API_TITLE, API_VERSION
from app.routers import health, predict, forecast, districts
from app.services.model_service import load_artifacts
from app.utils.logging_utils import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.

    Loads model artifacts on startup.
    """
    # Startup
    logger.info("Starting HeatGuard API...")
    try:
        load_artifacts()
        logger.info("Model artifacts loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model artifacts: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down HeatGuard API...")


# Create FastAPI application
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="", tags=["Health"])
app.include_router(predict.router, prefix="", tags=["Predictions"])
app.include_router(forecast.router, prefix="", tags=["Forecast"])
app.include_router(districts.router, prefix="", tags=["Districts"])


@app.get(
    "/",
    summary="Root Endpoint",
    description="Welcome endpoint with API information."
)
async def root():
    """
    Root endpoint returning API information.

    Provides a welcome message and basic API metadata.
    """
    return {
        "message": "Welcome to HeatGuard API",
        "description": "Heat Risk Prediction Service based on IMD 1x1 grid data",
        "version": API_VERSION,
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "single_prediction": "POST /predict/single",
            "bulk_prediction": "POST /predict/bulk"
        },
        "risk_levels": {
            "0": "Green - Comfortable/warm",
            "1": "Yellow - Hot",
            "2": "Orange - Very hot / potential heat stress",
            "3": "Red - Extreme heat / dangerous"
        }
    }


# For backwards compatibility with older FastAPI versions
# The lifespan approach above is preferred for FastAPI 0.95+
@app.on_event("startup")
async def startup_event():
    """
    Startup event handler (legacy approach).

    Note: This is kept for compatibility but the lifespan
    context manager above handles startup in newer FastAPI versions.
    """
    pass  # Handled by lifespan context manager


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
