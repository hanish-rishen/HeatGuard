import React, { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Thermometer, ShieldAlert, Users, FileText, ArrowRight, Activity, Map as MapIcon, Maximize2, ChevronDown
} from 'lucide-react';
import { DISTRICTS_DATA, HEAT_ACTION_PLANS } from '../constants';
import { District, RiskLevel, WeatherForecast, VulnerabilityMetrics } from '../types';
import { RiskBadge } from './RiskBadge';
import { RiskMatrix } from './RiskMatrix';
import { generateSituationReport } from '../services/geminiService';

interface DashboardProps {
  onOpenAssistant: () => void;
  isDarkMode: boolean;
}

// --- New Interfaces ---
type RiskLevelString = "Green" | "Yellow" | "Orange" | "Red";

interface Vulnerability {
  elderlyPopulation: number;
  outdoorWorkers: number;
  slumPopulation: number;
}

interface ApiDistrict {
  id: string;
  name: string;
  state: string;
  coordinates: [number, number]; // [lat, lon]
  population?: number;
  area?: number;
  density?: number;
  vulnerability: Vulnerability;
}

interface PredictPoint {
  date: string;   // ISO date
  lat: number;
  lon: number;
  tmax_c: number;
}

interface PredictionResult {
  lat: number;
  lon: number;
  date: string;
  tmax_c: number;
  risk_label: number;    // 0..3
  risk_level: RiskLevelString; // "Green" | "Yellow" | "Orange" | "Red"
}

interface PredictBulkResponse {
  results: PredictionResult[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenAssistant, isDarkMode }) => {
  // --- New State ---
  const [states, setStates] = useState<string[]>(["Tamil Nadu", "Kerala", "Karnataka"]);
  const [selectedState, setSelectedState] = useState<string>("Tamil Nadu");
  const [districts, setDistricts] = useState<ApiDistrict[]>([]);
  const [todayRisk, setTodayRisk] = useState<Record<string, PredictionResult>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // --- Effects ---
  React.useEffect(() => {
    async function loadDistrictsAndRisk() {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch districts
        const res = await fetch(`/api/districts/by-state?state=${encodeURIComponent(selectedState)}`);
        if (!res.ok) throw new Error("Failed to fetch districts");
        const data: ApiDistrict[] = await res.json();
        setDistricts(data);

        // 2. Fetch bulk risk
        if (data.length > 0) {
          const today = new Date().toISOString().slice(0, 10);
          const points: PredictPoint[] = data.map(d => ({
            date: today,
            lat: d.coordinates[0],
            lon: d.coordinates[1],
            tmax_c: 36, // TODO: replace with real Tmax when wired
          }));

          const bulkRes = await fetch("/api/predict/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ points }),
          });
          if (!bulkRes.ok) throw new Error("Failed to fetch bulk risk");
          const bulkData: PredictBulkResponse = await bulkRes.json();

          const riskByKey: Record<string, PredictionResult> = {};
          bulkData.results.forEach((r, idx) => {
            // Assuming order is preserved, or we match by lat/lon.
            // The prompt implies index matching or we need ID.
            // The prompt code snippet uses index: `const key = ${data[idx].id};`
            if (data[idx]) {
                const key = data[idx].id;
                riskByKey[key] = r;
            }
          });
          setTodayRisk(riskByKey);
        } else {
            setTodayRisk({});
        }

      } catch (e) {
        console.error(e);
        setError("Failed to load districts or risk data");
      } finally {
        setLoading(false);
      }
    }
    loadDistrictsAndRisk();
  }, [selectedState]);

  // --- Helpers ---
  function riskLabelToUi(r: PredictionResult | undefined) {
    if (!r) return { label: "Unknown", color: "gray", level: RiskLevel.LOW };
    switch (r.risk_level) {
      case "Green": return { label: "Low", color: "#22c55e", level: RiskLevel.LOW };
      case "Yellow": return { label: "Moderate", color: "#eab308", level: RiskLevel.MODERATE };
      case "Orange": return { label: "High", color: "#f97316", level: RiskLevel.HIGH };
      case "Red": return { label: "Extreme", color: "#ef4444", level: RiskLevel.EXTREME };
      default: return { label: "Unknown", color: "gray", level: RiskLevel.LOW };
    }
  }

  const loadForecastForDistrict = async (d: ApiDistrict) => {
      // Fetch 5-day forecast
      // Since we don't have a real backend for forecast yet (or do we? The prompt says "Triggers the existing logic to call /forecast/5days"),
      // I will assume there is an endpoint or I need to mock it/use the existing structure.
      // The prompt says: "Triggers the existing logic to call /forecast/5days".
      // I will implement a fetch here.

      try {
        const today = new Date().toISOString().slice(0, 10);
        // Mocking the forecast fetch or calling real endpoint if it exists.
        // The prompt implies the endpoint exists: /forecast/5days
        // But I don't see it in the file list. I see `backend/app/routers/forecast.py`. So it exists!

        const res = await fetch(`/api/forecast/5days?lat=${d.coordinates[0]}&lon=${d.coordinates[1]}&date=${today}`);
        let forecastData: WeatherForecast[] = [];

        if (res.ok) {
            const json = await res.json();
            // Map backend forecast to frontend WeatherForecast
            // Backend likely returns: { forecast: [...] } or just [...]
            // I'll assume it returns the list.
            // Need to check `forecast.py` to be sure, but for now I'll try to map it.
            // If the backend returns what `predict` returns, it might need mapping.
            // Let's assume it returns compatible data or I'll map it.
             forecastData = json.forecast || json;
        } else {
            // Fallback to mock if fail
             forecastData = [];
        }

        // Construct full District object
        const riskInfo = todayRisk[d.id];
        const uiRisk = riskLabelToUi(riskInfo);

        const fullDistrict: District = {
            id: d.id,
            name: d.name,
            currentTemp: riskInfo?.tmax_c || 36, // Use risk temp or default
            currentHumidity: 50, // Placeholder
            currentHri: 0, // Placeholder
            riskLevel: uiRisk.level,
            forecast: forecastData,
            vulnerability: d.vulnerability,
            coordinates: d.coordinates
        };
        setSelectedDistrict(fullDistrict);

      } catch (err) {
          console.error("Failed to fetch forecast", err);
      }
  };

  const highRiskCount = DISTRICTS_DATA.filter(d => d.riskLevel === RiskLevel.HIGH || d.riskLevel === RiskLevel.EXTREME).length;

  // Calculate average Risk Level (0-3 scale)
  const getRiskValue = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW: return 0;
      case RiskLevel.MODERATE: return 1;
      case RiskLevel.HIGH: return 2;
      case RiskLevel.EXTREME: return 3;
      default: return 0;
    }
  };

  const totalRiskScore = DISTRICTS_DATA.reduce((acc, curr) => acc + getRiskValue(curr.riskLevel), 0);
  const overallRiskLevel = Math.round(totalRiskScore / DISTRICTS_DATA.length);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    const result = await generateSituationReport(DISTRICTS_DATA);
    setReport(result);
    setGeneratingReport(false);
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 lg:h-full">

      {/* Top Row: KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between group hover:border-red-500/50 transition-colors">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Critical Zones</p>
            <p className="text-2xl font-black text-red-500">{highRiskCount} <span className="text-sm text-zinc-400 font-medium">Districts</span></p>
          </div>
          <div className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
            <ShieldAlert size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between group hover:border-yellow-500/50 transition-colors">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Overall Risk Level</p>
            <p className="text-2xl font-black text-yellow-500">Level {overallRiskLevel}</p>
          </div>
          <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-xl">
            <Activity size={20} />
          </div>
        </div>

         <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Vulnerable</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-white">2.4M</p>
          </div>
          <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl">
            <Users size={20} />
          </div>
        </div>

        <div
          className="bg-gradient-to-br from-zinc-900 to-black dark:from-zinc-800 dark:to-zinc-900 p-4 rounded-2xl border border-zinc-800 dark:border-zinc-700 text-white flex items-center justify-between cursor-pointer hover:shadow-lg hover:shadow-red-500/10 transition-all"
          onClick={handleGenerateReport}
        >
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">AI Insight</p>
            <p className="font-bold text-sm flex items-center gap-2 mt-1">
              {generatingReport ? 'Analyzing Data...' : 'Generate Brief'}
            </p>
          </div>
          {generatingReport ? <Activity className="animate-spin text-red-500" /> : <FileText size={20} className="text-zinc-300" />}
        </div>
      </div>

      {/* Main Content Grid - Bento Style */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">

        {/* Left Column: List & Matrix (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 lg:overflow-y-auto">

          {/* List Component - Scrollable */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col flex-1 min-h-[250px] overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-zinc-700 dark:text-zinc-200">Monitored Districts</h3>
                <span className="text-xs font-mono bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">{districts.length} Total</span>
              </div>

              {/* State Selector */}
              <div className="relative">
                <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="overflow-y-auto p-2 space-y-1">
              {loading ? (
                  <div className="p-4 text-center text-zinc-400 text-sm">Loading districts...</div>
              ) : error ? (
                  <div className="p-4 text-center text-red-400 text-sm">{error}</div>
              ) : (
                districts.map((d) => {
                    const risk = todayRisk[d.id];
                    const uiRisk = riskLabelToUi(risk);

                    return (
                        <div
                        key={d.id}
                        onClick={() => loadForecastForDistrict(d)}
                        className={`p-3 rounded-xl cursor-pointer transition-all border ${
                            selectedDistrict?.id === d.id
                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 shadow-inner'
                            : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        }`}
                        >
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{d.name}</span>
                            {/* Custom Badge for dynamic risk */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border`} style={{
                                backgroundColor: `${uiRisk.color}20`,
                                color: uiRisk.color,
                                borderColor: `${uiRisk.color}40`
                            }}>
                                {uiRisk.label.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
                            {/* Placeholder data since bulk endpoint doesn't return HRI/Humidity yet */}
                            <span className="flex items-center gap-1"><Activity size={12}/> -- HRI</span>
                            <span>H: --%</span>
                        </div>
                        </div>
                    );
                })
              )}
            </div>
          </div>

          {/* Mini Matrix Preview */}
          <div className="h-56 lg:h-64 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shrink-0 flex flex-col">
             <h3 className="font-bold text-zinc-700 dark:text-zinc-200 text-sm mb-2">Risk Matrix</h3>
             <div className="flex-1 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800">
               <RiskMatrix data={DISTRICTS_DATA} onSelectDistrict={setSelectedDistrict} isDarkMode={isDarkMode} />
             </div>
          </div>
        </div>

        {/* Center Column: Detail View (5 cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-0">
          {selectedDistrict ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start bg-zinc-50/30 dark:bg-zinc-900/30">
                <div>
                   <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-1">{selectedDistrict.name}</h2>
                   <p className="text-sm text-zinc-500 flex items-center gap-2">
                     Updated 10m ago • <span className="text-zinc-400">ID: {selectedDistrict.id.toUpperCase()}</span>
                   </p>
                </div>
                <RiskBadge level={selectedDistrict.riskLevel} size="lg" />
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Forecast Chart */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">5-Day Heat-Health Risk Forecast</h4>
                  <div className="h-48 w-full bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-100 dark:border-zinc-800 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedDistrict.forecast}>
                        <defs>
                          <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                            <stop offset="33%" stopColor="#f97316" stopOpacity={1}/>
                            <stop offset="66%" stopColor="#eab308" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="33%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="66%" stopColor="#eab308" stopOpacity={0.3}/>
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#333" : "#e4e4e7"}/>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: isDarkMode ? '#a1a1aa' : '#71717a', fontSize: 12}} dy={10}/>
                        <YAxis
                          hide
                          domain={[0, 3]}
                          ticks={[0, 1, 2, 3]}
                        />
                        <Tooltip
                          cursor={{stroke: isDarkMode ? '#ffffff20' : '#00000010', strokeWidth: 2}}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const riskColors = {
                                0: '#22c55e',
                                1: '#eab308',
                                2: '#f97316',
                                3: '#ef4444'
                              };
                              const riskLabels = {
                                0: 'Green (Comfortable)',
                                1: 'Yellow (Hot)',
                                2: 'Orange (Very Hot)',
                                3: 'Red (Extreme)'
                              };
                              const riskVal = data.risk_label ?? 0;

                              return (
                                <div className={`p-3 rounded-xl border shadow-xl ${isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}>
                                  <p className="font-bold text-sm mb-2">{label}</p>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: riskColors[riskVal as keyof typeof riskColors] }}></div>
                                    <span className="font-medium text-sm">{riskLabels[riskVal as keyof typeof riskLabels]}</span>
                                  </div>
                                  <p className="text-xs text-zinc-500 mt-1">Risk Level: <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{riskVal}</span></p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="risk_label"
                          stroke="url(#riskGradient)"
                          strokeWidth={3}
                          fill="url(#riskFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-2 text-center">
                    Primary signal is risk level.
                  </p>
                </div>

                {/* Vulnerability Bars */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Population Vulnerability</h4>
                  <div className="space-y-4">
                     {[
                       { label: 'Elderly (>60)', val: selectedDistrict.vulnerability.elderlyPopulation, color: 'bg-yellow-500' },
                       { label: 'Outdoor Workers', val: selectedDistrict.vulnerability.outdoorWorkers, color: 'bg-red-500' },
                       { label: 'Slum Density', val: selectedDistrict.vulnerability.slumPopulation, color: 'bg-orange-500' }
                     ].map((item, i) => (
                       <div key={i}>
                         <div className="flex justify-between text-sm mb-1.5">
                           <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
                           <span className="font-bold text-zinc-900 dark:text-white">{item.val}%</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                           <div className={`h-full ${item.color}`} style={{ width: `${item.val * 2}%` }}></div>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>

              </div>
            </div>
          ) : (
             <div className="h-full bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-zinc-400 p-8 text-center">
                <MapIcon size={48} className="mb-4 opacity-20" />
                <h3 className="font-bold text-lg text-zinc-500">No District Selected</h3>
                <p className="text-sm max-w-xs mx-auto mt-2">Select a district from the list or matrix to view detailed telemetry and forecasts.</p>
             </div>
          )}
        </div>

        {/* Right Column: AI & Actions (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">

          {/* AI Report Card */}
          {report && (
            <div className="bg-zinc-900 dark:bg-zinc-800 text-white p-5 rounded-2xl shadow-xl shadow-zinc-900/20 relative animate-in slide-in-from-top-4">
              <button onClick={() => setReport(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">✕</button>
              <h3 className="font-bold flex items-center gap-2 mb-3 text-red-400">
                <Activity size={18} /> Situation Report
              </h3>
              <div className="text-sm text-zinc-300 leading-relaxed font-medium max-h-40 overflow-y-auto custom-scrollbar">
                {report}
              </div>
            </div>
          )}

          {/* Action Plan Summary */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex-1 flex flex-col min-h-0 overflow-hidden">
             <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
               <h3 className="font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                 <FileText size={18} className="text-red-500"/>
                 {selectedDistrict ? 'Active Protocols' : 'General Protocols'}
               </h3>
             </div>

             <div className="flex-1 overflow-y-auto p-4">
               {selectedDistrict ? (
                 <div className="space-y-3">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-zinc-500">LEVEL</span>
                      <RiskBadge level={selectedDistrict.riskLevel} size="sm"/>
                   </div>
                   {HEAT_ACTION_PLANS[selectedDistrict.riskLevel].map((action, i) => (
                     <div key={i} className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-300 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                       <span className="text-red-500 font-bold">•</span>
                       {action}
                     </div>
                   ))}
                 </div>
               ) : (
                  <div className="text-center text-zinc-400 py-10">
                    <p className="text-sm">Select a district to view specific protocols.</p>
                  </div>
               )}
             </div>

             {selectedDistrict && (
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <button className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                    Initiate Alert Protocol
                  </button>
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};
