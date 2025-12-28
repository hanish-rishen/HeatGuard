import { District, RiskLevel } from './types';

// Mock data removed. Data is now fetched from backend.
export const DISTRICT_LOCATIONS: any[] = [];
export const DISTRICTS_DATA: any[] = [];

export const HEAT_ACTION_PLANS = {
  [RiskLevel.LOW]: [
    "Monitor weather forecasts daily.",
    "Ensure hydration.",
    "No specific medical advisory needed."
  ],
  [RiskLevel.MODERATE]: [
    "Issue Yellow Alert.",
    "Advise outdoor workers to take breaks between 12 PM - 3 PM.",
    "Keep ORS packets ready in PHCs."
  ],
  [RiskLevel.HIGH]: [
    "Issue Orange Alert.",
    "Open cooling centers in high vulnerability wards.",
    "Suspend outdoor labor during peak heat hours.",
    "Hospitals to activate heat-stroke wards."
  ],
  [RiskLevel.EXTREME]: [
    "Issue Red Alert.",
    "Close schools and non-essential outdoor activities.",
    "Deploy mobile water tankers to slums.",
    "Emergency medical teams on standby.",
    "Mass media warnings every hour."
  ]
};
