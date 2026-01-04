export enum RiskLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  EXTREME = 'Extreme'
}

export type RiskLevelString = "Green" | "Yellow" | "Orange" | "Red";

export interface WeatherForecast {
  day: string;
  temp: number;
  humidity: number;
  heatIndex: number;
  hri: number; // Heat Risk Index
  risk_label?: number; // 0-3
  risk_level?: RiskLevelString;
}

export interface VulnerabilityMetrics {
  elderlyPopulation: number; // percentage
  outdoorWorkers: number; // percentage
  slumPopulation: number; // percentage
}

export interface District {
  id: string;
  name: string;
  currentTemp: number;
  currentHumidity: number;
  currentHri: number; // Added HRI
  riskLevel: RiskLevel;
  forecast: WeatherForecast[];
  vulnerability: VulnerabilityMetrics;
  coordinates: [number, number]; // Simplified lat/long for vis
}

export interface UserRole {
  id: string;
  label: string;
  accessLevel: 'admin' | 'health_official' | 'public';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
