import { District, RiskLevel } from './types';

export const DISTRICTS_DATA: District[] = [
  {
    id: 'd1',
    name: 'Chennai',
    currentTemp: 38.5,
    currentHumidity: 75,
    currentHri: 8.5,
    riskLevel: RiskLevel.EXTREME,
    vulnerability: { elderlyPopulation: 12, outdoorWorkers: 25, slumPopulation: 28 },
    coordinates: [13.0827, 80.2707],
    forecast: [
      { day: 'Mon', temp: 39, humidity: 70, heatIndex: 48, hri: 8.5, risk_label: 3, risk_level: 'Red' },
      { day: 'Tue', temp: 40, humidity: 68, heatIndex: 50, hri: 9.2, risk_label: 3, risk_level: 'Red' },
      { day: 'Wed', temp: 38, humidity: 72, heatIndex: 47, hri: 8.0, risk_label: 2, risk_level: 'Orange' },
      { day: 'Thu', temp: 37, humidity: 75, heatIndex: 46, hri: 7.8, risk_label: 2, risk_level: 'Orange' },
      { day: 'Fri', temp: 36, humidity: 78, heatIndex: 45, hri: 7.5, risk_label: 2, risk_level: 'Orange' },
    ]
  },
  {
    id: 'd2',
    name: 'Madurai',
    currentTemp: 40.2,
    currentHumidity: 45,
    currentHri: 7.2,
    riskLevel: RiskLevel.HIGH,
    vulnerability: { elderlyPopulation: 10, outdoorWorkers: 40, slumPopulation: 15 },
    coordinates: [9.9252, 78.1198],
    forecast: [
      { day: 'Mon', temp: 41, humidity: 40, heatIndex: 44, hri: 7.2, risk_label: 2, risk_level: 'Orange' },
      { day: 'Tue', temp: 42, humidity: 38, heatIndex: 46, hri: 7.8, risk_label: 2, risk_level: 'Orange' },
      { day: 'Wed', temp: 41, humidity: 40, heatIndex: 45, hri: 7.5, risk_label: 2, risk_level: 'Orange' },
      { day: 'Thu', temp: 40, humidity: 42, heatIndex: 43, hri: 7.0, risk_label: 2, risk_level: 'Orange' },
      { day: 'Fri', temp: 39, humidity: 45, heatIndex: 42, hri: 6.8, risk_label: 1, risk_level: 'Yellow' },
    ]
  },
  {
    id: 'd3',
    name: 'Coimbatore',
    currentTemp: 34.0,
    currentHumidity: 55,
    currentHri: 4.5,
    riskLevel: RiskLevel.MODERATE,
    vulnerability: { elderlyPopulation: 14, outdoorWorkers: 20, slumPopulation: 10 },
    coordinates: [11.0168, 76.9558],
    forecast: [
      { day: 'Mon', temp: 35, humidity: 52, heatIndex: 38, hri: 4.5, risk_label: 1, risk_level: 'Yellow' },
      { day: 'Tue', temp: 36, humidity: 50, heatIndex: 39, hri: 4.8, risk_label: 1, risk_level: 'Yellow' },
      { day: 'Wed', temp: 35, humidity: 53, heatIndex: 38, hri: 4.6, risk_label: 1, risk_level: 'Yellow' },
      { day: 'Thu', temp: 34, humidity: 55, heatIndex: 37, hri: 4.2, risk_label: 1, risk_level: 'Yellow' },
      { day: 'Fri', temp: 33, humidity: 58, heatIndex: 36, hri: 4.0, risk_label: 0, risk_level: 'Green' },
    ]
  },
  {
    id: 'd4',
    name: 'Vellore',
    currentTemp: 41.5,
    currentHumidity: 40,
    currentHri: 8.8,
    riskLevel: RiskLevel.EXTREME,
    vulnerability: { elderlyPopulation: 9, outdoorWorkers: 35, slumPopulation: 12 },
    coordinates: [12.9165, 79.1325],
    forecast: [
      { day: 'Mon', temp: 42, humidity: 38, heatIndex: 47, hri: 8.8, risk_label: 3, risk_level: 'Red' },
      { day: 'Tue', temp: 43, humidity: 35, heatIndex: 48, hri: 9.0, risk_label: 3, risk_level: 'Red' },
      { day: 'Wed', temp: 42, humidity: 37, heatIndex: 46, hri: 8.5, risk_label: 3, risk_level: 'Red' },
      { day: 'Thu', temp: 41, humidity: 40, heatIndex: 45, hri: 8.2, risk_label: 3, risk_level: 'Red' },
      { day: 'Fri', temp: 40, humidity: 42, heatIndex: 44, hri: 7.9, risk_label: 2, risk_level: 'Orange' },
    ]
  },
  {
    id: 'd5',
    name: 'Nilgiris',
    currentTemp: 22.0,
    currentHumidity: 80,
    currentHri: 1.2,
    riskLevel: RiskLevel.LOW,
    vulnerability: { elderlyPopulation: 15, outdoorWorkers: 10, slumPopulation: 5 },
    coordinates: [11.4102, 76.6950],
    forecast: [
      { day: 'Mon', temp: 23, humidity: 78, heatIndex: 24, hri: 1.2, risk_label: 0, risk_level: 'Green' },
      { day: 'Tue', temp: 24, humidity: 75, heatIndex: 25, hri: 1.5, risk_label: 0, risk_level: 'Green' },
      { day: 'Wed', temp: 23, humidity: 77, heatIndex: 24, hri: 1.3, risk_label: 0, risk_level: 'Green' },
      { day: 'Thu', temp: 22, humidity: 80, heatIndex: 23, hri: 1.1, risk_label: 0, risk_level: 'Green' },
      { day: 'Fri', temp: 21, humidity: 82, heatIndex: 22, hri: 1.0, risk_label: 0, risk_level: 'Green' },
    ]
  },
   {
    id: 'd6',
    name: 'Tiruchirappalli',
    currentTemp: 39.0,
    currentHumidity: 50,
    currentHri: 6.5,
    riskLevel: RiskLevel.HIGH,
    vulnerability: { elderlyPopulation: 11, outdoorWorkers: 30, slumPopulation: 18 },
    coordinates: [10.7905, 78.7047],
    forecast: [
      { day: 'Mon', temp: 40, humidity: 48, heatIndex: 43, hri: 6.5, risk_label: 2, risk_level: 'Orange' },
      { day: 'Tue', temp: 40, humidity: 47, heatIndex: 43, hri: 6.6, risk_label: 2, risk_level: 'Orange' },
      { day: 'Wed', temp: 39, humidity: 50, heatIndex: 42, hri: 6.2, risk_label: 2, risk_level: 'Orange' },
      { day: 'Thu', temp: 38, humidity: 52, heatIndex: 41, hri: 6.0, risk_label: 1, risk_level: 'Yellow' },
      { day: 'Fri', temp: 38, humidity: 53, heatIndex: 41, hri: 5.8, risk_label: 1, risk_level: 'Yellow' },
    ]
  }
];

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
