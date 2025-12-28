"""
Forecast Router for HeatGuard API

Provides endpoints for weather forecast-based heat risk predictions.
"""

import logging
from typing import List

from fastapi import APIRouter, HTTPException, Query

from app.schemas import Forecast5DaysResponse, ForecastDay
from app.services.weather_service import fetch_openweather_forecast, extract_daily_max_temps
from app.services.date_utils import compute_day_of_year, compute_month
from app.services.model_service import is_model_loaded, predict_risk

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/forecast/5days", response_model=Forecast5DaysResponse)
async def forecast_5days(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude of the location"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude of the location"),
) -> Forecast5DaysResponse:
    """
    Fetch 5-day weather forecast from OpenWeather and compute heat risk for each day.

    This endpoint:
    1. Fetches the 5-day/3-hour forecast from OpenWeather API
    2. Aggregates to daily maximum temperatures
    3. Runs the HeatGuard risk model for each day
    4. Returns risk predictions for up to 5 days

    **Requirements:**
    - OPENWEATHER_API_KEY must be set in environment variables

    **Parameters:**
    - **lat**: Latitude of the location (-90 to 90)
    - **lon**: Longitude of the location (-180 to 180)

    **Returns:**
    - Location coordinates
    - List of daily forecasts with risk predictions
    """
    # Check if model is loaded
    if not is_model_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please try again later."
        )

    try:
        # Fetch forecast from OpenWeather
        logger.info(f"Fetching 5-day forecast for lat={lat}, lon={lon}")
        openweather_json = await fetch_openweather_forecast(lat, lon)

        # Extract daily max temperatures
        daily_temps = extract_daily_max_temps(openweather_json)

        if not daily_temps:
            raise HTTPException(
                status_code=502,
                detail="No forecast data available from OpenWeather"
            )

        # Run risk prediction for each day
        days_list: List[ForecastDay] = []

        for day_data in daily_temps:
            forecast_date = day_data["date"]
            tmax_c = day_data["tmax_c"]
            humidity = day_data.get("humidity", 0)

            # Build features for the model
            features = {
                "tmax_c": tmax_c,
                "day_of_year": compute_day_of_year(forecast_date),
                "month": compute_month(forecast_date),
                "lat": lat,
                "lon": lon,
            }

            # Get risk prediction
            result = predict_risk(features)

            # Create ForecastDay object
            forecast_day = ForecastDay(
                date=forecast_date,
                tmax_c=tmax_c,
                humidity=humidity,
                risk_label=result["risk_label"],
                risk_level=result["risk_level"],
                probabilities=result.get("probabilities")
            )
            days_list.append(forecast_day)

        logger.info(f"Successfully generated {len(days_list)} day forecast for lat={lat}, lon={lon}")

        return Forecast5DaysResponse(
            lat=lat,
            lon=lon,
            days=days_list
        )

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Error generating forecast: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while generating forecast"
        )
