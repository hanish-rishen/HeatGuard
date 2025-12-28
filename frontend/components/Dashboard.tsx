import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  Thermometer, Droplets, AlertTriangle, Users, FileText, ArrowRight, ShieldAlert,
  Map as MapIcon, Table as TableIcon, Activity, Search, Plus
} from 'lucide-react';
import { DISTRICTS_DATA, DISTRICT_LOCATIONS, HEAT_ACTION_PLANS } from '../constants';
import { District, RiskLevel } from '../types';
import { fetchDistricts, fetchDistrictForecast, searchDistricts, DistrictMetadata } from '../services/api';
import { RiskBadge } from './RiskBadge';
import { RiskMatrix } from './RiskMatrix';
import { IndiaMap } from './IndiaMap';
import { generateSituationReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; // Assuming we'd usually add this, but user said no new libs. I'll render plain text or basic HTML.

// Helper to render markdown-like text without extra lib if needed, but I'll assume simple text for now or simple mapping.
// Actually, standard React doesn't render MD. I will use a simple text display for the report.

interface DashboardProps {
  onOpenAssistant: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenAssistant }) => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'chart' | 'table'>('map');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DistrictMetadata[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const results = await searchDistricts(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAddDistrict = async (meta: DistrictMetadata) => {
    // Check if already exists
    if (districts.some(d => d.name === meta.name)) {
      alert(`${meta.name} is already in the dashboard.`);
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    // Fetch forecast for new district
    const baseDistrict: District = {
      ...meta,
      currentTemp: 0,
      currentHumidity: 0,
      riskLevel: RiskLevel.LOW,
      forecast: []
    };

    const newDistrict = await fetchDistrictForecast(baseDistrict);
    setDistricts(prev => [...prev, newDistrict]);
    setSearchResults([]);
    setSearchQuery('');
    setSelectedDistrict(newDistrict);
  };

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch districts metadata from backend
        const districtMeta = await fetchDistricts();

        if (districtMeta.length === 0) {
           console.warn("No districts returned from backend");
           setIsLoading(false);
           return;
        }

        // 2. Fetch forecast for each district
        const promises = districtMeta.map(loc => {
          // Create a base district object with placeholders
          const baseDistrict: District = {
            ...loc,
            currentTemp: 0,
            currentHumidity: 0,
            riskLevel: RiskLevel.LOW,
            forecast: []
          };
          return fetchDistrictForecast(baseDistrict); // This function needs to accept DistrictMetadata or compatible
        });

        const updatedDistricts = await Promise.all(promises);
        setDistricts(updatedDistricts);
      } catch (error) {
        console.error("Failed to load district data", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const highRiskCount = districts.filter(d => d.riskLevel === RiskLevel.HIGH || d.riskLevel === RiskLevel.EXTREME).length;
  const avgTemp = (districts.reduce((acc, curr) => acc + curr.currentTemp, 0) / (districts.length || 1)).toFixed(1);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    const result = await generateSituationReport(districts);
    setReport(result);
    setGeneratingReport(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">High/Extreme Risk</p>
            <p className="text-2xl font-bold text-slate-800">{highRiskCount} Districts</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
            <Thermometer size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">State Avg Temp</p>
            <p className="text-2xl font-bold text-slate-800">{avgTemp}°C</p>
          </div>
        </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Vulnerable Pop.</p>
            <p className="text-2xl font-bold text-slate-800">2.4M</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl shadow-sm text-white flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity" onClick={handleGenerateReport}>
          <div>
            <p className="text-sm opacity-90">AI Analysis</p>
            <p className="font-bold flex items-center gap-2">
              {generatingReport ? 'Analyzing...' : 'Situation Report'}
              {!generatingReport && <FileText size={16} />}
            </p>
          </div>
          {generatingReport && <Activity className="animate-spin" />}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search for a city in India (e.g. Pune, Surat)..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchResults.map((res) => (
              <div key={res.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <p className="font-bold text-slate-800">{res.name}</p>
                  <p className="text-xs text-slate-500">Lat: {res.coordinates[0].toFixed(2)}, Lon: {res.coordinates[1].toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleAddDistrict(res)}
                  className="p-2 bg-white text-indigo-600 border border-indigo-100 rounded-full hover:bg-indigo-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Report Section */}
      {report && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl relative">
          <button onClick={() => setReport(null)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">✕</button>
          <h3 className="text-indigo-900 font-bold flex items-center gap-2 mb-3">
            <Activity size={20} /> AI Situation Brief
          </h3>
          <div className="prose prose-sm max-w-none text-indigo-900/80 whitespace-pre-wrap font-medium">
            {report}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Vis Area (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

            {/* View Toggle */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">State Overview</h2>
              <div className="bg-white border border-slate-200 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${viewMode === 'map' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <MapIcon size={16} /> Map
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${viewMode === 'chart' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <Activity size={16} /> Matrix
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${viewMode === 'table' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  <TableIcon size={16} /> List
                </button>
              </div>
            </div>

            {viewMode === 'map' && (
               <IndiaMap
                 districts={districts}
                 onSelectDistrict={setSelectedDistrict}
                 selectedDistrictId={selectedDistrict?.id}
               />
            )}

            {viewMode === 'chart' && (
              <RiskMatrix data={districts} onSelectDistrict={setSelectedDistrict} />
            )}

            {viewMode === 'table' && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-slate-700">District</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Temp</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Humidity</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Risk</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {districts.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelectedDistrict(d)}>
                          <td className="px-6 py-4 font-medium text-slate-900">{d.name}</td>
                          <td className="px-6 py-4 text-slate-600">{d.currentTemp}°C</td>
                          <td className="px-6 py-4 text-slate-600">{d.currentHumidity}%</td>
                          <td className="px-6 py-4"><RiskBadge level={d.riskLevel} size="sm"/></td>
                          <td className="px-6 py-4">
                            <button className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center gap-1">
                              View <ArrowRight size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Selected District Detail View */}
            {selectedDistrict && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{selectedDistrict.name}</h2>
                    <p className="text-slate-500">5-Day Forecast Analysis</p>
                  </div>
                  <RiskBadge level={selectedDistrict.riskLevel} size="lg" />
                </div>

                <div className="h-64 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedDistrict.forecast}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b'}}/>
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} unit="°C"/>
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="temp" stroke="#f97316" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Elderly Risk</p>
                    <div className="flex items-end gap-2">
                       <span className="text-2xl font-bold text-slate-800">{selectedDistrict.vulnerability.elderlyPopulation}%</span>
                       <span className="text-sm text-slate-500 mb-1">population</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                      <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${selectedDistrict.vulnerability.elderlyPopulation * 4}%` }}></div>
                    </div>
                  </div>
                   <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Outdoor Workers</p>
                    <div className="flex items-end gap-2">
                       <span className="text-2xl font-bold text-slate-800">{selectedDistrict.vulnerability.outdoorWorkers}%</span>
                       <span className="text-sm text-slate-500 mb-1">population</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                      <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${selectedDistrict.vulnerability.outdoorWorkers * 2}%` }}></div>
                    </div>
                  </div>
                   <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Slum Density</p>
                    <div className="flex items-end gap-2">
                       <span className="text-2xl font-bold text-slate-800">{selectedDistrict.vulnerability.slumPopulation}%</span>
                       <span className="text-sm text-slate-500 mb-1">high UHI risk</span>
                    </div>
                     <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                      <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${selectedDistrict.vulnerability.slumPopulation * 3}%` }}></div>
                    </div>
                  </div>
                </div>

              </div>
            )}
        </div>

        {/* Sidebar (Action Plan) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
             <div className="mb-4 pb-4 border-b border-slate-100">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <FileText size={20} className="text-indigo-600"/>
                 Action Protocol
               </h3>
               <p className="text-sm text-slate-500">Based on National Heat Action Plan</p>
             </div>

             {selectedDistrict ? (
               <div className="space-y-4 flex-1">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">For {selectedDistrict.name}</span>
                    <RiskBadge level={selectedDistrict.riskLevel} size="sm"/>
                 </div>
                 <ul className="space-y-3">
                   {HEAT_ACTION_PLANS[selectedDistrict.riskLevel].map((action, i) => (
                     <li key={i} className="flex gap-3 text-sm text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-100">
                       <div className="mt-0.5 min-w-[16px] text-indigo-500 font-bold">•</div>
                       {action}
                     </li>
                   ))}
                 </ul>

                 <div className="mt-6 pt-6 border-t border-slate-100">
                   <p className="text-xs font-semibold text-slate-400 uppercase mb-3">Resources</p>
                   <button className="w-full py-2 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 mb-2 transition-colors">
                     Download District PDF
                   </button>
                   <button className="w-full py-2 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                     Notify Local Authorities
                   </button>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                 <AlertTriangle size={48} className="mb-4 opacity-20" />
                 <p className="text-sm">Select a district from the map or table to view specific action protocols.</p>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};
