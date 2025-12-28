"""
Health Check Router for HeatGuard API

Provides health check endpoints for monitoring and deployment platforms.
"""

from fastapi import APIRouter

from app.schemas import HealthResponse
from app.services.model_service import is_model_loaded

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Check the health status of the API and model loading status."
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.

    Returns the API status and whether the ML model is loaded.
    Useful for container orchestration and load balancer health checks.
    """
    return HealthResponse(
        status="ok",
        model_loaded=is_model_loaded()
    )
