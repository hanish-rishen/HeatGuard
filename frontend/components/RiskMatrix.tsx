import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { District, RiskLevel } from '../types';

interface RiskMatrixProps {
  data: District[];
  onSelectDistrict: (d: District) => void;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ data, onSelectDistrict }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const x = d3.scaleLinear()
      .domain([20, 100]) // Humidity
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([20, 50]) // Temperature
      .range([height - margin.bottom, margin.top]);

    // Draw Risk Zones (Simplified Heat Index approximation background)
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "heat-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#dcfce7"); // Green
    gradient.append("stop").attr("offset", "40%").attr("stop-color", "#fef9c3"); // Yellow
    gradient.append("stop").attr("offset", "70%").attr("stop-color", "#ffedd5"); // Orange
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#fee2e2"); // Red

    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .style("fill", "url(#heat-gradient)")
      .style("opacity", 0.3);

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .call(g => g.append("text")
        .attr("x", width - margin.right)
        .attr("y", 35)
        .attr("fill", "currentColor")
        .attr("text-anchor", "end")
        .text("Humidity (%)"));

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .text("Temperature (°C)"));

    // Plot Districts
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.currentHumidity))
      .attr("cy", d => y(d.currentTemp))
      .attr("r", 8)
      .attr("fill", d => {
        if (d.riskLevel === RiskLevel.EXTREME) return "#dc2626";
        if (d.riskLevel === RiskLevel.HIGH) return "#ea580c";
        if (d.riskLevel === RiskLevel.MODERATE) return "#ca8a04";
        return "#16a34a";
      })
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 12).attr("stroke", "#333");
        // Simple tooltip via title for mobile compatibility
        svg.append("text")
           .attr("id", "tooltip")
           .attr("x", x(d.currentHumidity))
           .attr("y", y(d.currentTemp) - 15)
           .attr("text-anchor", "middle")
           .attr("font-size", "12px")
           .attr("font-weight", "bold")
           .attr("fill", "#1e293b")
           .text(d.name);
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 8).attr("stroke", "white");
        svg.select("#tooltip").remove();
      })
      .on("click", (event, d) => onSelectDistrict(d));

  }, [data, onSelectDistrict]);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">Risk Distribution Matrix</h3>
      <p className="text-sm text-slate-500 mb-4">Visualizing relationship between temperature, humidity, and risk.</p>
      <div className="w-full overflow-hidden">
        <svg ref={svgRef} className="w-full h-[400px]" />
      </div>
    </div>
  );
};