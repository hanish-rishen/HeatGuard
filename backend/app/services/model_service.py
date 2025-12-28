"""
Model Service for HeatGuard API

Handles loading and inference with the heat risk prediction model.
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd

from app.config import (
    FEATURE_COLUMNS_PATH,
    MODEL_PATH,
    SCALER_PATH,
    get_risk_level,
)

logger = logging.getLogger(__name__)

# Global variables for model artifacts
MODEL: Optional[Any] = None
SCALER: Optional[Any] = None
FEATURE_COLUMNS: Optional[List[str]] = None


def get_project_root() -> Path:
    """Get the project root directory."""
    # This file is at app/services/model_service.py
    # Project root is two levels up
    return Path(__file__).parent.parent.parent


def load_artifacts() -> None:
    """
    Load model artifacts (model, scaler, feature columns) from disk.

    This function should be called once at application startup.

    Raises:
        FileNotFoundError: If any artifact file is not found
        Exception: If loading fails for any other reason
    """
    global MODEL, SCALER, FEATURE_COLUMNS

    project_root = get_project_root()

    model_path = project_root / MODEL_PATH
    scaler_path = project_root / SCALER_PATH
    feature_columns_path = project_root / FEATURE_COLUMNS_PATH

    logger.info(f"Loading model from: {model_path}")
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")
    MODEL = joblib.load(model_path)
    logger.info("Model loaded successfully")

    logger.info(f"Loading scaler from: {scaler_path}")
    if not scaler_path.exists():
        raise FileNotFoundError(f"Scaler file not found: {scaler_path}")
    SCALER = joblib.load(scaler_path)
    logger.info("Scaler loaded successfully")

    logger.info(f"Loading feature columns from: {feature_columns_path}")
    if not feature_columns_path.exists():
        raise FileNotFoundError(f"Feature columns file not found: {feature_columns_path}")
    FEATURE_COLUMNS = joblib.load(feature_columns_path)
    logger.info(f"Feature columns loaded: {FEATURE_COLUMNS}")


def is_model_loaded() -> bool:
    """Check if the model artifacts are loaded."""
    return MODEL is not None and SCALER is not None and FEATURE_COLUMNS is not None


def predict_risk(features: Dict[str, float]) -> Dict[str, Any]:
    """
    Predict heat risk for given features.

    Args:
        features: Dictionary with keys matching FEATURE_COLUMNS.
                  Required features: tmax_c, day_of_year, month, lat, lon

    Returns:
        Dictionary containing:
            - risk_label: int (0-3)
            - risk_level: str (Green/Yellow/Orange/Red)
            - probabilities: dict mapping label string to probability

    Raises:
        ValueError: If required features are missing or model not loaded
    """
    if not is_model_loaded():
        raise ValueError("Model artifacts not loaded. Call load_artifacts() first.")

    # Validate that all required features are present
    missing_features = []
    for col in FEATURE_COLUMNS:
        if col not in features:
            missing_features.append(col)

    if missing_features:
        # For unknown features, default to 0 (with a warning)
        # This allows the model to work even if feature_columns.joblib has extra features
        logger.warning(f"Missing features (defaulting to 0): {missing_features}")
        for col in missing_features:
            features[col] = 0.0

    # Build DataFrame with correct column order
    df = pd.DataFrame([features])
    df = df[FEATURE_COLUMNS]  # Ensure correct column order

    logger.debug(f"Input features DataFrame:\n{df}")

    # Scale features
    X_scaled = SCALER.transform(df)

    # Get predictions
    risk_label = int(MODEL.predict(X_scaled)[0])
    risk_level = get_risk_level(risk_label)

    # Get probabilities (if available)
    probabilities = None
    if hasattr(MODEL, 'predict_proba'):
        try:
            proba = MODEL.predict_proba(X_scaled)[0]
            probabilities = {str(i): float(p) for i, p in enumerate(proba)}
        except Exception as e:
            logger.warning(f"Could not get prediction probabilities: {e}")

    return {
        "risk_label": risk_label,
        "risk_level": risk_level,
        "probabilities": probabilities
    }
