import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { District, RiskLevel } from '../types';

interface DistrictMapProps {
  districts: District[];
  onSelectDistrict: (district: District) => void;
  selectedDistrictId?: string;
}

const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case RiskLevel.LOW: return '#22c55e'; // green-500
    case RiskLevel.MODERATE: return '#eab308'; // yellow-500
    case RiskLevel.HIGH: return '#f97316'; // orange-500
    case RiskLevel.EXTREME: return '#ef4444'; // red-500
    default: return '#94a3b8';
  }
};

export const DistrictMap: React.FC<DistrictMapProps> = ({ districts, onSelectDistrict, selectedDistrictId }) => {
  // Prepare data for scatter plot
  // We use longitude as X and latitude as Y
  const data = districts.map(d => ({
    x: d.coordinates[1], // lon
    y: d.coordinates[0], // lat
    z: 1, // size
    ...d
  }));

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-96 flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 mb-2">Geospatial Risk View</h3>
      <div className="flex-1 relative">
        {/* Background "Map" placeholder - just a subtle grid or shape could go here */}
        <div className="absolute inset-0 bg-slate-50 rounded-lg border border-slate-100" />

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis type="number" dataKey="x" name="Longitude" domain={['auto', 'auto']} hide />
            <YAxis type="number" dataKey="y" name="Latitude" domain={['auto', 'auto']} hide />
            <ZAxis type="number" dataKey="z" range={[100, 400]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
                      <p className="font-bold text-slate-800">{data.name}</p>
                      <p className="text-sm text-slate-600">Temp: {data.currentTemp}°C</p>
                      <p className="text-sm font-medium" style={{ color: getRiskColor(data.riskLevel) }}>
                        {data.riskLevel} Risk
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Districts" data={data} onClick={(e) => onSelectDistrict(e.payload)}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getRiskColor(entry.riskLevel)}
                  stroke={selectedDistrictId === entry.id ? '#000' : 'none'}
                  strokeWidth={2}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        <div className="absolute bottom-2 right-2 bg-white/90 p-2 rounded text-xs text-slate-500 pointer-events-none">
          Tamil Nadu Region
        </div>
      </div>
    </div>
  );
};
