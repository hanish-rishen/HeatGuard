"""
Prediction Router for HeatGuard API

Provides endpoints for heat risk predictions.
"""

import logging
from datetime import date as date_type

from fastapi import APIRouter, HTTPException

from app.schemas import (
    BulkPredictRequest,
    BulkPredictResponse,
    PredictRequest,
    PredictResponse,
)
from app.services.date_utils import compute_day_of_year, compute_month
from app.services.model_service import is_model_loaded, predict_risk

logger = logging.getLogger(__name__)

router = APIRouter()


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
    if not is_model_loaded():
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
        prediction = predict_risk(features)

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


@router.post("/predict/bulk", response_model=BulkPredictResponse)
async def predict_bulk(req: BulkPredictRequest) -> BulkPredictResponse:
    """
    Predict heat risk for multiple locations.

    Accepts a list of prediction requests and returns a list of results.
    Useful for batch processing or grid-based predictions.
    """
    if not is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please try again later."
        )

    results = []

    for idx, point in enumerate(req.points):
        try:
            # Use provided date or default to today
            used_date = point.date if point.date is not None else date_type.today()

            # Build features exactly as specified
            features = {
                "tmax_c": point.tmax_c,
                "day_of_year": compute_day_of_year(used_date),
                "month": compute_month(used_date),
                "lat": point.lat,
                "lon": point.lon,
            }

            # Get prediction
            prediction = predict_risk(features)

            # Create response
            result = PredictResponse(
                lat=point.lat,
                lon=point.lon,
                date=used_date,
                tmax_c=point.tmax_c,
                risk_label=prediction["risk_label"],
                risk_level=prediction["risk_level"],
                probabilities=prediction["probabilities"]
            )
            results.append(result)

        except ValueError as e:
            logger.error(f"Prediction error for point {idx}: {e}")
            raise HTTPException(
                status_code=422,
                detail=f"Error processing point {idx}: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Unexpected error for point {idx}: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error processing point {idx}"
            )

    return BulkPredictResponse(results=results)
