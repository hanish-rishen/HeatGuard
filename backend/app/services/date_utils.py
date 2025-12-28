"""
Date Utilities for HeatGuard API

Provides helper functions for date-related computations.
"""

from datetime import date, datetime
from typing import Optional


def compute_day_of_year(d: date) -> int:
    """
    Compute the day of year (1-366) for a given date.

    Args:
        d: A date object

    Returns:
        Day of year as an integer (1-366)
    """
    return d.timetuple().tm_yday


def compute_month(d: date) -> int:
    """
    Extract the month (1-12) from a date.

    Args:
        d: A date object

    Returns:
        Month as an integer (1-12)
    """
    return d.month


def get_date_or_today(d: Optional[date]) -> date:
    """
    Return the provided date or today's date if None.

    Args:
        d: Optional date object

    Returns:
        The provided date or today's date
    """
    if d is None:
        return date.today()
    return d


def get_date_features(d: Optional[date] = None) -> dict:
    """
    Get all date-related features for the model.

    Args:
        d: Optional date object (defaults to today)

    Returns:
        Dictionary with 'day_of_year' and 'month' keys
    """
    target_date = get_date_or_today(d)
    return {
        "day_of_year": compute_day_of_year(target_date),
        "month": compute_month(target_date)
    }
