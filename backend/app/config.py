"""
HeatGuard API Configuration

Contains constants and configuration values for the heat risk prediction API.
"""

import os
from pathlib import Path
from typing import Dict
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# =============================================================================
# OpenWeather API Configuration
# =============================================================================
# IMPORTANT: Set OPENWEATHER_API_KEY in your environment variables
# For local development, you can create a .env file or set it directly:
#   export OPENWEATHER_API_KEY="your_api_key_here"  (Linux/Mac)
#   $env:OPENWEATHER_API_KEY="your_api_key_here"   (PowerShell)
# For deployment (Render/Leapcell), set it in the platform's environment config.
# =============================================================================
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "").strip()
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"

# Risk level mapping: numeric label -> human-readable string
RISK_LABEL_TO_LEVEL: Dict[int, str] = {
    0: "Green",      # Comfortable/warm
    1: "Yellow",     # Hot
    2: "Orange",     # Very hot / potential heat stress
    3: "Red",        # Extreme heat / dangerous
}

# API metadata
API_TITLE = "HeatGuard API"
API_DESCRIPTION = """
HeatGuard Heat Risk Prediction API

This API provides heat risk predictions based on location, temperature, and date.
The model was trained on IMD 1x1 grid data (all-India).

## Risk Levels
- **Green (0)**: Comfortable/warm conditions
- **Yellow (1)**: Hot conditions
- **Orange (2)**: Very hot / potential heat stress
- **Red (3)**: Extreme heat / dangerous conditions
"""
API_VERSION = "1.0.0"

# Model paths (relative to project root)
MODEL_PATH = "models/heatguard_xgb_model.joblib"
SCALER_PATH = "models/heatguard_scaler.joblib"
FEATURE_COLUMNS_PATH = "models/feature_columns.joblib"


def get_risk_level(label: int) -> str:
    """
    Convert numeric risk label to human-readable risk level string.

    Args:
        label: Numeric risk label (0-3)

    Returns:
        Human-readable risk level string
    """
    return RISK_LABEL_TO_LEVEL.get(int(label), "Unknown")
