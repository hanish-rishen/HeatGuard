"""
Weather Service for HeatGuard API

Handles fetching weather forecasts from OpenWeather API.
"""

import logging
from datetime import datetime, date
from typing import Dict, List, Any
from collections import defaultdict

import httpx
from fastapi import HTTPException

from app.config import OPENWEATHER_API_KEY, OPENWEATHER_BASE_URL

logger = logging.getLogger(__name__)


async def fetch_openweather_forecast(lat: float, lon: float) -> Dict[str, Any]:
    """
    Calls OpenWeather 5-day/3-hour forecast API and returns the raw JSON.

    Args:
        lat: Latitude of the location
        lon: Longitude of the location

    Returns:
        Raw JSON response from OpenWeather API

    Raises:
        HTTPException(500): If OpenWeather API key is not configured
        HTTPException(502): If OpenWeather API returns an error
    """
    if not OPENWEATHER_API_KEY:
        logger.error("OpenWeather API key not configured")
        raise HTTPException(
            status_code=500,
            detail="OpenWeather API key not configured. Set OPENWEATHER_API_KEY environment variable."
        )

    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        # Using default units (Kelvin) - we'll convert to Celsius
        # Alternatively, use "units": "metric" for Celsius directly
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(OPENWEATHER_BASE_URL, params=params)

            if response.status_code != 200:
                logger.error(f"OpenWeather API error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=502,
                    detail=f"Failed to fetch forecast from OpenWeather: {response.status_code}"
                )

            return response.json()

    except httpx.RequestError as e:
        logger.error(f"Request error when calling OpenWeather: {e}")
        raise HTTPException(
            status_code=502,
            detail="Failed to connect to OpenWeather API"
        )


def extract_daily_max_temps(openweather_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract daily maximum temperatures from OpenWeather 5-day/3-hour forecast.

    Args:
        openweather_json: Raw JSON response from OpenWeather API

    Returns:
        List of dicts with 'date' and 'tmax_c' for each day (up to 5 days)

    Notes:
        - OpenWeather returns 'list' of 3-hour steps
        - Each item has 'dt_txt' (timestamp) and 'main.temp_max' (in Kelvin)
        - We group by calendar day and take the max temp_max per day
        - Kelvin to Celsius: t_c = t_k - 273.15
    """
    forecast_list = openweather_json.get("list", [])

    if not forecast_list:
        logger.warning("No forecast data in OpenWeather response")
        return []

    # Group temperatures by date
    daily_data: Dict[date, Dict[str, List[float]]] = defaultdict(lambda: defaultdict(list))

    for item in forecast_list:
        try:
            # Parse the datetime
            dt_txt = item.get("dt_txt", "")
            if not dt_txt:
                continue

            forecast_date = datetime.strptime(dt_txt, "%Y-%m-%d %H:%M:%S").date()

            # Get temp_max in Kelvin and convert to Celsius
            temp_max_k = item.get("main", {}).get("temp_max", 0)
            temp_max_c = temp_max_k - 273.15

            # Get humidity
            humidity = item.get("main", {}).get("humidity", 0)

            daily_data[forecast_date]["temps"].append(temp_max_c)
            daily_data[forecast_date]["humidities"].append(humidity)

        except (ValueError, KeyError) as e:
            logger.warning(f"Error parsing forecast item: {e}")
            continue

    # Get today's date to filter future days only
    today = date.today()

    # Calculate daily max and sort by date
    result = []
    for forecast_date in sorted(daily_data.keys()):
        # Only include today and future dates
        if forecast_date >= today:
            temps = daily_data[forecast_date]["temps"]
            humidities = daily_data[forecast_date]["humidities"]

            max_temp = max(temps) if temps else 0
            avg_humidity = sum(humidities) / len(humidities) if humidities else 0

            result.append({
                "date": forecast_date,
                "tmax_c": round(max_temp, 1),  # Round to 1 decimal place
                "humidity": round(avg_humidity, 1)
            })

    # Return at most 5 days
    return result[:5]


async def search_location_by_name(query: str) -> List[Dict[str, Any]]:
    """
    Search for a location by name using OpenWeather Geocoding API.

    Args:
        query: City name to search for (e.g., "Mumbai", "Delhi,IN")

    Returns:
        List of matching locations with lat, lon, name, state, country
    """
    if not OPENWEATHER_API_KEY:
        logger.error("OpenWeather API key not configured")
        raise HTTPException(
            status_code=500,
            detail="OpenWeather API key not configured"
        )

    # OpenWeather Geocoding API endpoint
    url = "http://api.openweathermap.org/geo/1.0/direct"
    params = {
        "q": query,
        "limit": 5,
        "appid": OPENWEATHER_API_KEY
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)

            if response.status_code != 200:
                logger.error(f"OpenWeather Geocoding API error: {response.status_code}")
                return []

            return response.json()

    except httpx.RequestError as e:
        logger.error(f"Request error when calling OpenWeather Geocoding: {e}")
        return []
