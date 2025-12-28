"""
Districts Router for HeatGuard API

Provides endpoints for district metadata and configuration.
"""

from typing import List

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from app.services.weather_service import search_location_by_name
import uuid
import random

router = APIRouter()


class VulnerabilityMetrics(BaseModel):
    elderlyPopulation: float
    outdoorWorkers: float
    slumPopulation: float


class DistrictMetadata(BaseModel):
    id: str
    name: str
    coordinates: List[float]
    vulnerability: VulnerabilityMetrics


# Static district data (moved from frontend)
# Expanded to include major cities across India
DISTRICTS_DATA = [
    {
        "id": "d1",
        "name": "Chennai",
        "coordinates": [13.0827, 80.2707],
        "vulnerability": {"elderlyPopulation": 12, "outdoorWorkers": 25, "slumPopulation": 28}
    },
    {
        "id": "d2",
        "name": "Madurai",
        "coordinates": [9.9252, 78.1198],
        "vulnerability": {"elderlyPopulation": 10, "outdoorWorkers": 40, "slumPopulation": 15}
    },
    {
        "id": "d3",
        "name": "Coimbatore",
        "coordinates": [11.0168, 76.9558],
        "vulnerability": {"elderlyPopulation": 14, "outdoorWorkers": 20, "slumPopulation": 10}
    },
    {
        "id": "d4",
        "name": "New Delhi",
        "coordinates": [28.6139, 77.2090],
        "vulnerability": {"elderlyPopulation": 8, "outdoorWorkers": 30, "slumPopulation": 20}
    },
    {
        "id": "d5",
        "name": "Mumbai",
        "coordinates": [19.0760, 72.8777],
        "vulnerability": {"elderlyPopulation": 11, "outdoorWorkers": 22, "slumPopulation": 40}
    },
    {
        "id": "d6",
        "name": "Kolkata",
        "coordinates": [22.5726, 88.3639],
        "vulnerability": {"elderlyPopulation": 13, "outdoorWorkers": 28, "slumPopulation": 30}
    },
    {
        "id": "d7",
        "name": "Bengaluru",
        "coordinates": [12.9716, 77.5946],
        "vulnerability": {"elderlyPopulation": 9, "outdoorWorkers": 18, "slumPopulation": 15}
    },
    {
        "id": "d8",
        "name": "Hyderabad",
        "coordinates": [17.3850, 78.4867],
        "vulnerability": {"elderlyPopulation": 10, "outdoorWorkers": 25, "slumPopulation": 22}
    },
    {
        "id": "d9",
        "name": "Ahmedabad",
        "coordinates": [23.0225, 72.5714],
        "vulnerability": {"elderlyPopulation": 11, "outdoorWorkers": 35, "slumPopulation": 18}
    },
    {
        "id": "d10",
        "name": "Jaipur",
        "coordinates": [26.9124, 75.7873],
        "vulnerability": {"elderlyPopulation": 12, "outdoorWorkers": 32, "slumPopulation": 25}
    },
    {
        "id": "d11",
        "name": "Lucknow",
        "coordinates": [26.8467, 80.9462],
        "vulnerability": {"elderlyPopulation": 10, "outdoorWorkers": 38, "slumPopulation": 20}
    },
    {
        "id": "d12",
        "name": "Patna",
        "coordinates": [25.5941, 85.1376],
        "vulnerability": {"elderlyPopulation": 9, "outdoorWorkers": 45, "slumPopulation": 28}
    },
    {
        "id": "d13",
        "name": "Bhopal",
        "coordinates": [23.2599, 77.4126],
        "vulnerability": {"elderlyPopulation": 11, "outdoorWorkers": 30, "slumPopulation": 22}
    },
    {
        "id": "d14",
        "name": "Chandigarh",
        "coordinates": [30.7333, 76.7794],
        "vulnerability": {"elderlyPopulation": 14, "outdoorWorkers": 15, "slumPopulation": 10}
    },
    {
        "id": "d15",
        "name": "Srinagar",
        "coordinates": [34.0837, 74.7973],
        "vulnerability": {"elderlyPopulation": 12, "outdoorWorkers": 20, "slumPopulation": 5}
    },
    {
        "id": "d16",
        "name": "Thiruvananthapuram",
        "coordinates": [8.5241, 76.9366],
        "vulnerability": {"elderlyPopulation": 16, "outdoorWorkers": 25, "slumPopulation": 12}
    },
    {
        "id": "d17",
        "name": "Bhubaneswar",
        "coordinates": [20.2961, 85.8245],
        "vulnerability": {"elderlyPopulation": 11, "outdoorWorkers": 35, "slumPopulation": 25}
    },
    {
        "id": "d18",
        "name": "Guwahati",
        "coordinates": [26.1445, 91.7362],
        "vulnerability": {"elderlyPopulation": 10, "outdoorWorkers": 30, "slumPopulation": 15}
    },
    {
        "id": "d19",
        "name": "Nagpur",
        "coordinates": [21.1458, 79.0882],
        "vulnerability": {"elderlyPopulation": 12, "outdoorWorkers": 33, "slumPopulation": 20}
    },
    {
        "id": "d20",
        "name": "Visakhapatnam",
        "coordinates": [17.6868, 83.2185],
        "vulnerability": {"elderlyPopulation": 11, "outdoorWorkers": 28, "slumPopulation": 22}
    }
]


@router.get("/districts", response_model=List[DistrictMetadata])
async def get_districts():
    """
    Get list of supported districts with their metadata.
    """
    return DISTRICTS_DATA


@router.get("/districts/search", response_model=List[DistrictMetadata])
async def search_districts(q: str = Query(..., min_length=2)):
    """
    Search for districts/cities by name.
    Returns a list of potential matches formatted as DistrictMetadata.
    """
    results = await search_location_by_name(q)

    districts = []
    for res in results:
        # Filter for India if needed, but let's keep it open or prioritize IN
        if res.get("country") != "IN":
            continue

        # Generate estimated vulnerability data since we don't have it for new cities
        # In a real app, this would come from a database
        districts.append({
            "id": f"search_{uuid.uuid4().hex[:8]}",
            "name": res.get("name"),
            "coordinates": [res.get("lat"), res.get("lon")],
            "vulnerability": {
                "elderlyPopulation": round(random.uniform(8, 15), 1),
                "outdoorWorkers": round(random.uniform(20, 40), 1),
                "slumPopulation": round(random.uniform(10, 30), 1)
            }
        })

    return districts
