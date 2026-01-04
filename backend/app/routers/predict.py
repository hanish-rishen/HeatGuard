"""
Prediction Router for HeatGuard API

Provides endpoints for heat risk predictions.
"""

import logging
from datetime import date as date_type
from typing import List, Dict

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas import (
    PredictRequest,
    PredictResponse,
)
from app.services.date_utils import compute_day_of_year, compute_month
from app.services import model_service

logger = logging.getLogger(__name__)

router = APIRouter()

RISK_MAP = {0: "Green", 1: "Yellow", 2: "Orange", 3: "Red"}


class PredictPoint(BaseModel):
    date: date_type
    lat: float
    lon: float
    tmax_c: float


class PredictBulkRequest(BaseModel):
    points: List[PredictPoint]


class PredictionResult(BaseModel):
    lat: float
    lon: float
    date: date_type
    tmax_c: float
    risk_label: int
    risk_level: str
    probabilities: Dict[str, float]


class PredictBulkResponse(BaseModel):
    results: List[PredictionResult]


@router.post("/predict/single", response_model=PredictResponse)
async def predict_single(req: PredictRequest) -> PredictResponse:
    """
    Predict heat risk for a single location.

    Accepts latitude, longitude, maximum temperature, and optional date.
    Returns the predicted risk level with probabilities.

    - **lat**: Latitude of the location (-90 to 90)
    - **lon**: Longitude of the location (-180 to 180)
    - **tmax_c**: Maximum temperature in Celsius
    - **date**: Date for prediction (optional, defaults to today)
    """
    if not model_service.is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please try again later."
        )

    try:
        # Use provided date or default to today
        used_date = req.date if req.date is not None else date_type.today()

        # Build features exactly as specified
        features = {
            "tmax_c": req.tmax_c,
            "day_of_year": compute_day_of_year(used_date),
            "month": compute_month(used_date),
            "lat": req.lat,
            "lon": req.lon,
        }

        # Get prediction
        prediction = model_service.predict_risk(features)

        # Return response
        return PredictResponse(
            lat=req.lat,
            lon=req.lon,
            date=used_date,
            tmax_c=req.tmax_c,
            risk_label=prediction["risk_label"],
            risk_level=prediction["risk_level"],
            probabilities=prediction["probabilities"]
        )

    except ValueError as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during prediction: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/predict/bulk", response_model=PredictBulkResponse)
async def predict_bulk(req: PredictBulkRequest):
    """
    Predict heat risk for multiple locations in bulk.
    Uses vectorized operations for efficiency.
    """
    if not model_service.is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please try again later."
        )

    if not req.points:
        return PredictBulkResponse(results=[])

    # Access model artifacts directly for bulk processing
    scaler = model_service.SCALER
    model = model_service.MODEL
    feature_columns = model_service.FEATURE_COLUMNS

    if scaler is None or model is None or feature_columns is None:
         raise HTTPException(status_code=503, detail="Model artifacts not fully loaded.")

    try:
        # Build DataFrame of features
        rows = []
        for p in req.points:
            dayofyear = p.date.timetuple().tm_yday
            month = p.date.month
            rows.append({
                "tmax_c": p.tmax_c,
                "day_of_year": dayofyear,
                "month": month,
                "lat": p.lat,
                "lon": p.lon,
            })

        X = pd.DataFrame(rows)

        # Reorder columns to match feature_columns
        # This ensures the order is exactly what the model expects
        X = X[feature_columns]

        X_scaled = scaler.transform(X)

        preds = model.predict(X_scaled)
        proba = model.predict_proba(X_scaled)

        results: List[PredictionResult] = []
        for idx, p in enumerate(req.points):
            label_int = int(preds[idx])
            probs_row = proba[idx]
            probs_dict = {str(i): float(probs_row[i]) for i in range(len(probs_row))}
            results.append(PredictionResult(
                lat=p.lat,
                lon=p.lon,
                date=p.date,
                tmax_c=p.tmax_c,
                risk_label=label_int,
                risk_level=RISK_MAP.get(label_int, "Unknown"),
                probabilities=probs_dict,
            ))

        return PredictBulkResponse(results=results)

    except Exception as e:
        logger.error(f"Bulk prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Bulk prediction failed: {str(e)}")
