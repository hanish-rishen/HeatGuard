import { District, RiskLevel, WeatherForecast, VulnerabilityMetrics } from '../types';

const API_BASE_URL = 'http://localhost:8000';

interface BackendForecastDay {
  date: string;
  tmax_c: number;
  humidity: number;
  risk_label: number;
  risk_level: string;
  probabilities: Record<string, number>;
}

interface BackendForecastResponse {
  lat: number;
  lon: number;
  days: BackendForecastDay[];
}

// Helper to calculate Heat Index (simplified formula)
// HI = -42.379 + 2.04901523*T + 10.14333127*R - .22475541*T*R - .00683783*T*T - .05481717*R*R + .00122874*T*T*R + .00085282*T*R*R - .00000199*T*T*R*R
// T in Fahrenheit, R is humidity. We need to convert C to F first.
const calculateHeatIndex = (tempC: number, humidity: number): number => {
  const T = (tempC * 9/5) + 32;
  const R = humidity;

  let HI = 0.5 * (T + 61.0 + ((T-68.0)*1.2) + (R*0.094));

  if (HI > 80) {
    HI = -42.379 + 2.04901523*T + 10.14333127*R - .22475541*T*R - .00683783*T*T - .05481717*R*R + .00122874*T*T*R + .00085282*T*R*R - .00000199*T*T*R*R;

    if (R < 13 && T > 80 && T < 112) {
      const adj = ((13-R)/4)*Math.sqrt((17-Math.abs(T-95.))/17);
      HI -= adj;
    } else if (R > 85 && T > 80 && T < 87) {
      const adj = ((R-85)/10) * ((87-T)/5);
      HI += adj;
    }
  }

  // Convert back to Celsius if needed, but usually HI is shown in "feels like" C or just an index.
  // The frontend seems to display it as a number around 40-50, which looks like Celsius.
  // Let's convert back to Celsius.
  return Math.round((HI - 32) * 5/9);
};

const mapRiskLevel = (backendLevel: string): RiskLevel => {
  switch (backendLevel.toLowerCase()) {
    case 'low': return RiskLevel.LOW;
    case 'moderate': return RiskLevel.MODERATE;
    case 'high': return RiskLevel.HIGH;
    case 'extreme': return RiskLevel.EXTREME;
    default: return RiskLevel.LOW;
  }
};

const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

export interface DistrictMetadata {
  id: string;
  name: string;
  coordinates: [number, number];
  vulnerability: VulnerabilityMetrics;
}

export const fetchDistricts = async (): Promise<DistrictMetadata[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/districts`);
    if (!response.ok) {
      throw new Error('Failed to fetch districts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

export const fetchDistrictForecast = async (district: DistrictMetadata): Promise<District> => {
  // Default district object in case of error
  const defaultDistrict: District = {
    ...district,
    currentTemp: 0,
    currentHumidity: 0,
    riskLevel: RiskLevel.LOW,
    forecast: []
  };

  try {
    const response = await fetch(`${API_BASE_URL}/forecast/5days?lat=${district.coordinates[0]}&lon=${district.coordinates[1]}`);

    if (!response.ok) {
      console.error(`Failed to fetch forecast for ${district.name}`);
      return defaultDistrict;
    }

    const data: BackendForecastResponse = await response.json();

    if (!data.days || data.days.length === 0) return defaultDistrict;

    const forecast: WeatherForecast[] = data.days.map(day => ({
      day: getDayName(day.date),
      temp: day.tmax_c,
      humidity: day.humidity,
      heatIndex: calculateHeatIndex(day.tmax_c, day.humidity)
    }));

    const currentDay = data.days[0];

    return {
      ...district,
      currentTemp: currentDay.tmax_c,
      currentHumidity: currentDay.humidity,
      riskLevel: mapRiskLevel(currentDay.risk_level),
      forecast: forecast
    };

  } catch (error) {
    console.error(`Error fetching forecast for ${district.name}:`, error);
    return defaultDistrict;
  }
};

export const searchDistricts = async (query: string): Promise<DistrictMetadata[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/districts/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search districts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching districts:', error);
    return [];
  }
};
