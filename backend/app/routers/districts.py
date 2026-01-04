"""
Districts Router for HeatGuard API

Provides endpoints for district metadata and configuration.
"""

import json
import hashlib
import uuid
from pathlib import Path
from typing import List, Dict, Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

from app.services.weather_service import search_location_by_name

router = APIRouter()


class VulnerabilityMetrics(BaseModel):
    elderlyPopulation: float
    outdoorWorkers: float
    slumPopulation: float


class DistrictMetadata(BaseModel):
    id: str
    name: str
    state: str
    coordinates: List[float]  # [lat, lon]
    population: int | None = None
    area: int | None = None
    density: int | None = None
    vulnerability: VulnerabilityMetrics


# Locate the backend project root and load the two JSON files
# backend/app/routers/districts.py -> parents[0]=routers, [1]=app, [2]=backend
BASE_DIR = Path(__file__).resolve().parents[2]
DISTRICTS_PATH = BASE_DIR / "data" / "districts.json"
GEO_PATH = BASE_DIR / "data" / "District-Geocodes.json"

ALL_DISTRICTS: List[DistrictMetadata] = []


def norm(s: str) -> str:
    return s.strip().lower() if s else ""


def generate_vulnerability(state: str, district: str) -> VulnerabilityMetrics:
    """Deterministic vulnerability generator so values are stable."""
    key = f"{state}-{district}".encode("utf-8")
    h = int(hashlib.sha256(key).hexdigest(), 16)
    elderly = 8 + (h % 9)              # 8–16%
    outdoor = 20 + ((h // 10) % 21)    # 20–40%
    slum = 10 + ((h // 100) % 21)      # 10–30%
    return VulnerabilityMetrics(
        elderlyPopulation=float(elderly),
        outdoorWorkers=float(outdoor),
        slumPopulation=float(slum),
    )


def load_district_data():
    """Load district data from JSON files."""
    global ALL_DISTRICTS

    if not DISTRICTS_PATH.exists() or not GEO_PATH.exists():
        # Fallback or warning if files are missing
        print(f"WARNING: District data files not found at {DISTRICTS_PATH} or {GEO_PATH}")
        return

    try:
        with DISTRICTS_PATH.open("r", encoding="utf-8") as f:
            data = json.load(f)
            # Handle structure: {"districts": [...]}
            if isinstance(data, dict) and "districts" in data:
                districts_raw = data["districts"]
            else:
                districts_raw = data

        with GEO_PATH.open("r", encoding="utf-8") as f:
            geo_raw = json.load(f)

        # Build a lookup for geocodes keyed by a normalised district name
        geo_index: Dict[str, Dict] = {}
        for row in geo_raw:
            # Inspect keys in District-Geocodes.json and adapt:
            name = norm(row.get("district") or row.get("District") or row.get("name") or row.get("District_Name", ""))
            if not name:
                continue
            geo_index[name] = row

        # Build ALL_DISTRICTS by merging districts.json with geocodes
        districts: List[DistrictMetadata] = []
        for row in districts_raw:
            state = row.get("state", "Unknown")
            district_name = row.get("district", "Unknown")
            pop = row.get("population")
            area = row.get("area")
            density = row.get("density")

            geo_row = geo_index.get(norm(district_name))
            if geo_row:
                try:
                    lat = float(geo_row.get("lat") or geo_row.get("latitude") or geo_row.get("Latitude") or 0)
                    lon = float(geo_row.get("lon") or geo_row.get("longitude") or geo_row.get("Longitude") or 0)
                except (ValueError, TypeError):
                    lat, lon = 0.0, 0.0
            else:
                lat, lon = 0.0, 0.0  # fallback if no geocode found

            vuln = generate_vulnerability(state, district_name)

            # Generate ID
            state_code = row.get('stateCode') or state[:2]
            dist_code = row.get('districtCode') or district_name[:4]
            dist_id = f"{state_code.lower()}_{dist_code.lower()}"

            districts.append(DistrictMetadata(
                id=dist_id,
                name=district_name,
                state=state,
                coordinates=[lat, lon],
                population=pop,
                area=area,
                density=density,
                vulnerability=vuln,
            ))

        ALL_DISTRICTS = districts
        print(f"Loaded {len(ALL_DISTRICTS)} districts.")

    except Exception as e:
        print(f"Error loading district data: {e}")


# Load data on module import
load_district_data()


@router.get("/districts", response_model=List[DistrictMetadata])
async def get_districts():
    return ALL_DISTRICTS


@router.get("/districts/by-state", response_model=List[DistrictMetadata])
async def get_districts_by_state(state: str = Query(..., min_length=2)):
    s = state.lower()
    return [d for d in ALL_DISTRICTS if d.state.lower() == s]


@router.get("/districts/states", response_model=List[str])
async def get_states():
    """Return a list of all available states."""
    return sorted(list(set(d.state for d in ALL_DISTRICTS)))


@router.get("/districts/search", response_model=List[DistrictMetadata])
async def search_districts(q: str = Query(..., min_length=2)):
    results = await search_location_by_name(q)
    districts: List[DistrictMetadata] = []
    seen_district_ids = set()

    for res in results:
        if res.get("country") != "IN":
            continue
        name = res.get("name")
        state_name = res.get("state") or res.get("admin_name") or "Unknown"
        coords = [res.get("lat"), res.get("lon")]

        # Attempt to find existing district data to populate stats
        match = next((d for d in ALL_DISTRICTS
                      if norm(d.name) == norm(name) and norm(d.state) == norm(state_name)), None)

        if match:
            # Deduplicate: if we already have this district in the results, skip
            if match.id in seen_district_ids:
                continue
            seen_district_ids.add(match.id)

            pop = match.population
            area = match.area
            density = match.density

            vuln = generate_vulnerability(state_name, name)
            dist_id = f"search_{uuid.uuid4().hex[:8]}"
            districts.append(DistrictMetadata(
                id=dist_id,
                name=match.name,
                state=match.state,
                coordinates=coords,
                population=pop,
                area=area,
                density=density,
                vulnerability=vuln,
            ))
        # Else: Skip results that don't match any known district in our database
        # This filters out "hallucinated" or irrelevant locations from the geocoder (e.g. Karur, Maharashtra)

    return districts
