"""
HeatGuard API Pydantic Schemas

Defines request and response models for the API endpoints.
"""

import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel


class PredictRequest(BaseModel):
    """Request model for single heat risk prediction."""
    lat: float
    lon: float
    tmax_c: float
    date: Optional[datetime.date] = None


class PredictResponse(BaseModel):
    """Response model for heat risk prediction."""
    lat: float
    lon: float
    date: datetime.date
    tmax_c: float
    risk_label: int
    risk_level: str
    probabilities: Optional[Dict[str, float]] = None


class BulkPredictRequest(BaseModel):
    """Request model for bulk heat risk predictions."""
    points: List[PredictRequest]


class BulkPredictResponse(BaseModel):
    """Response model for bulk heat risk predictions."""
    results: List[PredictResponse]


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str
    model_loaded: Optional[bool] = None


# =============================================================================
# Forecast Endpoint Schemas
# =============================================================================

class ForecastLocation(BaseModel):
    """Location details for the forecast."""
    lat: float
    lon: float
    name: Optional[str] = None


class ForecastDay(BaseModel):
    """Single day forecast with risk prediction."""
    date: datetime.date
    tmax_c: float
    risk_label: int
    risk_level: str
    humidity: Optional[float] = None
    probabilities: Optional[Dict[str, float]] = None


class Forecast5DaysResponse(BaseModel):
    """Response model for 5-day forecast with risk predictions."""
    location: ForecastLocation
    forecast: List[ForecastDay]

