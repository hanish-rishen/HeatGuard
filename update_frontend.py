import os

file_path = r"r:\HeatGaurd\frontend\app\page.tsx"

new_content = """
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, MapPin, AlertTriangle, ThermometerSun, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { forecast5Days, predictSingle, type ForecastDay } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// India geographic bounds
const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 37.0,
  minLon: 68.0,
  maxLon: 98.0,
};

// Major Indian cities
const CITIES = [
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
];

interface HeatPoint {
  lat: number;
  lon: number;
  intensity: number;
}

interface ForecastData {
  lat: number;
  lon: number;
  cityName?: string;
  days: ForecastDay[];
}

// Risk to intensity mapping
const getRiskIntensity = (level: string) => {
  switch (level?.toLowerCase()) {
    case "green": return 0.3;
    case "yellow": return 0.6;
    case "orange": return 0.8;
    case "red": return 1.0;
    default: return 0.2;
  }
};

export default function Home() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const customMarkerRef = useRef<any>(null);
  const initializingRef = useRef(false);

  const [isMapReady, setIsMapReady] = useState(false);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatPoints, setHeatPoints] = useState<HeatPoint[]>([]);
  const { toast } = useToast();

  // Check if coordinates are within India
  const isWithinIndia = (lat: number, lon: number) => {
    return lat >= INDIA_BOUNDS.minLat && lat <= INDIA_BOUNDS.maxLat &&
           lon >= INDIA_BOUNDS.minLon && lon <= INDIA_BOUNDS.maxLon;
  };

  // Fetch forecast for a location
  const fetchForecast = useCallback(async (lat: number, lon: number, cityName?: string) => {
    if (!isWithinIndia(lat, lon)) {
      toast({
        title: "Location Outside India",
        description: "Please select a location within India.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await forecast5Days(lat, lon);
      setForecast({
        lat,
        lon,
        cityName,
        days: response.days,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch forecast. Make sure the backend is running on port 8000.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }, [toast]);

  // Generate heat points
  const generateHeatmap = useCallback(async () => {
    setHeatmapLoading(true);
    const gridSize = 15; // Higher density for smoother heatmap
    const latStep = (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat) / gridSize;
    const lonStep = (INDIA_BOUNDS.maxLon - INDIA_BOUNDS.minLon) / gridSize;

    const points: HeatPoint[] = [];
    const promises: Promise<void>[] = [];

    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const lat = INDIA_BOUNDS.minLat + (i * latStep);
        const lon = INDIA_BOUNDS.minLon + (j * lonStep);

        // Add some randomness to avoid grid-like look
        const jitterLat = lat + (Math.random() - 0.5) * latStep * 0.5;
        const jitterLon = lon + (Math.random() - 0.5) * lonStep * 0.5;

        promises.push(
          predictSingle({ lat: jitterLat, lon: jitterLon, tmax_c: 35 })
            .then((response) => {
              points.push({
                lat: jitterLat,
                lon: jitterLon,
                intensity: getRiskIntensity(response.risk_level),
              });
            })
            .catch(() => {
              // Silently handle errors
            })
        );
      }
    }

    await Promise.all(promises);
    setHeatPoints(points);
    setHeatmapLoading(false);
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    if (mapInstanceRef.current || initializingRef.current) return;

    initializingRef.current = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      // @ts-ignore
      window.L = L; // Required for leaflet.heat
      await import("leaflet.heat");

      // Clear any existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Create map centered on India
      const map = L.map(mapContainerRef.current!, {
        center: [22.5, 82],
        zoom: 5,
        minZoom: 5,
        maxZoom: 8,
        maxBounds: [
          [INDIA_BOUNDS.minLat - 2, INDIA_BOUNDS.minLon - 2],
          [INDIA_BOUNDS.maxLat + 2, INDIA_BOUNDS.maxLon + 2]
        ],
      });

      // Darker tile layer for better heatmap visibility
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Custom icon for cities
      const cityIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="
          width: 12px;
          height: 12px;
          background: #334155;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      // Add city markers
      CITIES.forEach((city) => {
        const marker = L.marker([city.lat, city.lon], { icon: cityIcon })
          .addTo(map)
          .bindTooltip(city.name, { permanent: false, direction: "top", className: "city-tooltip" });

        marker.on("click", () => {
          fetchForecast(city.lat, city.lon, city.name);
        });

        markersRef.current.push(marker);
      });

      // Handle map clicks for custom locations
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;

        if (!isWithinIndia(lat, lng)) {
          toast({
            title: "Outside India",
            description: "Please click within India's boundaries.",
            variant: "destructive",
          });
          return;
        }

        // Remove previous custom marker
        if (customMarkerRef.current) {
          map.removeLayer(customMarkerRef.current);
        }

        // Add new custom marker
        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 12px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        customMarkerRef.current = L.marker([lat, lng], { icon: customIcon })
          .addTo(map)
          .bindTooltip(`${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`, {
            permanent: true,
            direction: "top",
            className: "custom-tooltip"
          });

        fetchForecast(lat, lng);
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
      initializingRef.current = false;

      // Load heatmap
      generateHeatmap();
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [fetchForecast, generateHeatmap, toast]);

  // Update heat layer when points change
  useEffect(() => {
    if (!mapInstanceRef.current || heatPoints.length === 0) return;

    // @ts-ignore
    const L = window.L;
    const map = mapInstanceRef.current;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    const heatData = heatPoints.map(p => [p.lat, p.lon, p.intensity]);

    // @ts-ignore
    heatLayerRef.current = L.heatLayer(heatData, {
      radius: 40,
      blur: 25,
      maxZoom: 8,
      max: 1.0,
      gradient: {
        0.2: '#22c55e', // Green
        0.5: '#eab308', // Yellow
        0.8: '#f97316', // Orange
        1.0: '#ef4444'  // Red
      }
    }).addTo(map);

  }, [heatPoints]);

  // Check if there's a warning
  const hasWarning = forecast?.days.some(
    (d) => d.risk_level.toLowerCase() === "orange" || d.risk_level.toLowerCase() === "red"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <ThermometerSun className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">HeatGuard</h1>
                <p className="text-xs text-slate-500">India Heat Risk Monitor</p>
              </div>
            </div>
            <Button
              onClick={generateHeatmap}
              disabled={heatmapLoading}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              {heatmapLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Refresh Heatmap
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden border border-slate-200 shadow-md bg-white">
              <CardHeader className="py-3 bg-white border-b border-slate-100">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  Heat Risk Heatmap
                  {heatmapLoading && (
                    <span className="text-xs text-slate-500 ml-auto">Updating heatmap...</span>
                  )}
                </CardTitle>
              </CardHeader>
              <div className="relative">
                <div
                  ref={mapContainerRef}
                  className="w-full h-[500px] lg:h-[600px] bg-slate-100"
                  style={{ zIndex: 1 }}
                />
                {!isMapReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                )}
              </div>
            </Card>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 font-medium">Risk Intensity:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                <div className="flex justify-between w-24 text-xs text-slate-500">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Panel */}
          <div className="lg:col-span-1">
            <Card className="border border-slate-200 shadow-md sticky top-24 bg-white">
              <CardHeader className="py-3 bg-white border-b border-slate-100">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ThermometerSun className="w-5 h-5 text-orange-500" />
                    Forecast
                  </span>
                  {forecast && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setForecast(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                )}

                {/* Empty State */}
                {!loading && !forecast && (
                  <div className="text-center py-16 text-slate-400">
                    <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No location selected</p>
                    <p className="text-sm mt-1">
                      Click anywhere on the map to see forecast
                    </p>
                  </div>
                )}

                {/* Forecast Data */}
                <AnimatePresence mode="wait">
                  {!loading && forecast && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Location Header */}
                      <div className="text-center pb-4 border-b border-slate-100">
                        <h3 className="font-bold text-xl text-slate-800">
                          {forecast.cityName || "Selected Location"}
                        </h3>
                        <p className="text-sm text-slate-500 font-mono mt-1">
                          {forecast.lat.toFixed(3)}°N, {forecast.lon.toFixed(3)}°E
                        </p>
                      </div>

                      {/* Warning Banner */}
                      {hasWarning && (
                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3"
                        >
                          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-red-800">Heat Warning</h4>
                            <p className="text-xs text-red-700 mt-1">
                              Extreme temperatures predicted in the next 5 days. Stay hydrated and avoid direct sunlight.
                            </p>
                          </div>
                        </motion.div>
                      )}

                      {/* Area Chart */}
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={forecast.days}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                              dataKey="date"
                              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                              dy={10}
                            />
                            <YAxis
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                              unit="°C"
                            />
                            <Tooltip
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            />
                            <Area
                              type="monotone"
                              dataKey="tmax_c"
                              stroke="#f97316"
                              strokeWidth={3}
                              fillOpacity={1}
                              fill="url(#colorTemp)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="text-center text-xs text-slate-400">
                        5-Day Temperature Forecast
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
"""

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content.strip())

print("File updated successfully.")
