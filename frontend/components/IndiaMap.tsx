import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { District, RiskLevel } from '../types';

interface IndiaMapProps {
  districts: District[];
  onSelectDistrict: (district: District) => void;
  selectedDistrictId?: string;
}

const INDIA_GEOJSON_URL = 'https://raw.githubusercontent.com/geohacker/india/master/district/india_district.geojson';

const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case RiskLevel.LOW: return '#22c55e'; // green-500
    case RiskLevel.MODERATE: return '#eab308'; // yellow-500
    case RiskLevel.HIGH: return '#f97316'; // orange-500
    case RiskLevel.EXTREME: return '#ef4444'; // red-500
    default: return '#94a3b8';
  }
};

export const IndiaMap: React.FC<IndiaMapProps> = ({ districts, onSelectDistrict, selectedDistrictId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch India GeoJSON
    fetch(INDIA_GEOJSON_URL)
      .then(response => response.json())
      .then(data => {
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load map data", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 700;

    // Clear previous render
    svg.selectAll("*").remove();

    // Define projection
    // Center on India (approx 82, 23)
    const projection = d3.geoMercator()
      .center([82, 23])
      .scale(1000)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Draw Map (Districts)
    svg.append("g")
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", pathGenerator as any)
      .attr("fill", "#f8fafc") // slate-50
      .attr("stroke", "#cbd5e1") // slate-300
      .attr("stroke-width", 0.5)
      .on("mouseover", function() {
        d3.select(this).attr("fill", "#e2e8f0");
      })
      .on("mouseout", function() {
        d3.select(this).attr("fill", "#f8fafc");
      });

    // Draw Monitored Locations (Points)
    const pointsGroup = svg.append("g");

    // Add circles
    pointsGroup.selectAll("circle")
      .data(districts)
      .enter()
      .append("circle")
      .attr("cx", d => projection([d.coordinates[1], d.coordinates[0]])?.[0] || 0)
      .attr("cy", d => projection([d.coordinates[1], d.coordinates[0]])?.[1] || 0)
      .attr("r", d => d.id === selectedDistrictId ? 8 : 5)
      .attr("fill", d => getRiskColor(d.riskLevel))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .style("filter", d => d.id === selectedDistrictId ? "drop-shadow(0px 0px 4px rgba(0,0,0,0.5))" : "none")
      .on("click", (event, d) => {
        onSelectDistrict(d);
      })
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 8);

        // Format forecast for tooltip
        let forecastHtml = '';
        if (d.forecast && d.forecast.length > 0) {
          forecastHtml = '<div style="margin-top:8px; border-top:1px solid #eee; padding-top:4px;"><strong>5-Day Forecast:</strong><div style="display:flex; gap:8px; margin-top:4px;">';
          d.forecast.forEach((day: any) => {
             forecastHtml += `
               <div style="text-align:center; font-size:10px;">
                 <div style="color:#64748b;">${day.day}</div>
                 <div style="font-weight:bold; color:#334155;">${day.temp}°</div>
               </div>
             `;
          });
          forecastHtml += '</div></div>';
        }

        // Show tooltip
        tooltip
          .style("opacity", 1)
          .html(`
            <div style="min-width: 200px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="font-size:14px;">${d.name}</strong>
                <span style="font-size:10px; padding:2px 6px; border-radius:99px; background:${getRiskColor(d.riskLevel)}20; color:${getRiskColor(d.riskLevel)}; font-weight:bold;">
                  ${d.riskLevel}
                </span>
              </div>
              <div style="margin-top:4px; color:#475569;">
                Current: <strong>${d.currentTemp}°C</strong>
              </div>
              ${forecastHtml}
            </div>
          `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this).attr("r", d.id === selectedDistrictId ? 8 : 5);
        tooltip.style("opacity", 0);
      });

    // Tooltip div (appended to body if not exists, but here we can append to parent container)
    // For simplicity in React, we might want to use a React state for tooltip, but D3 manipulation is direct.
    // Let's create a tooltip div inside the component container if possible, or use a portal.
    // Standard D3 way:
    const tooltip = d3.select("body").selectAll(".d3-tooltip").data([0]).join("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("font-size", "12px")
      .style("z-index", "1000");

  }, [geoData, districts, selectedDistrictId]);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[500px]">
      <h3 className="text-lg font-bold text-slate-800 mb-2 w-full text-left">India Heat Risk Map</h3>
      {loading ? (
        <div className="animate-pulse text-slate-400">Loading Map Data...</div>
      ) : (
        <div className="relative w-full h-full flex justify-center overflow-hidden">
           <svg ref={svgRef} width="800" height="700" viewBox="0 0 800 700" className="max-w-full h-auto" />
        </div>
      )}
      <div className="text-xs text-slate-400 mt-2 w-full text-center">
        Map shows state boundaries. Circles represent monitored districts.
      </div>
    </div>
  );
};
