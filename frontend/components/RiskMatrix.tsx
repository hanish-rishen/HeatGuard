import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { District, RiskLevel } from '../types';

interface RiskMatrixProps {
  data: District[];
  onSelectDistrict: (d: District) => void;
  isDarkMode?: boolean;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ data, onSelectDistrict, isDarkMode = false }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current?.parentElement) {
        setDimensions({
          width: svgRef.current.parentElement.clientWidth,
          height: svgRef.current.parentElement.clientHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const x = d3.scaleLinear()
      .domain([20, 100]) // Humidity
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, 10]) // HRI
      .range([height - margin.bottom, margin.top]);

    // Background Grid
    // We will use distinct colors for quadrants instead of a gradient for clearer "Black/Red/Yellow" feel
    const defs = svg.append("defs");

    // Axis colors based on theme
    const axisColor = isDarkMode ? "#52525b" : "#e4e4e7"; // Zinc 600 / Zinc 200
    const textColor = isDarkMode ? "#a1a1aa" : "#71717a";

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(-height + margin.top + margin.bottom).ticks(5))
      .attr("color", axisColor)
      .call(g => {
         g.select(".domain").remove();
         g.selectAll(".tick line").attr("stroke-opacity", 0.5);
         g.selectAll("text").attr("fill", textColor).attr("font-size", "10px");
      });

    // Label X
    svg.append("text")
        .attr("x", width - margin.right)
        .attr("y", height - 5)
        .attr("fill", textColor)
        .attr("text-anchor", "end")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text("Humidity (%)");

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSize(-width + margin.left + margin.right).ticks(5))
      .attr("color", axisColor)
      .call(g => {
         g.select(".domain").remove();
         g.selectAll(".tick line").attr("stroke-opacity", 0.5);
         g.selectAll("text").attr("fill", textColor).attr("font-size", "10px");
      });

    // Label Y
    svg.append("text")
        .attr("x", margin.left)
        .attr("y", 12)
        .attr("fill", textColor)
        .attr("text-anchor", "start")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .text("HRI");

    // Plot Districts
    const circles = svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.currentHumidity))
      .attr("cy", d => y(d.currentHri))
      .attr("r", 6)
      .attr("fill", d => {
        if (d.riskLevel === RiskLevel.EXTREME) return "#ef4444"; // Red 500
        if (d.riskLevel === RiskLevel.HIGH) return "#f97316"; // Orange 500
        if (d.riskLevel === RiskLevel.MODERATE) return "#eab308"; // Yellow 500
        return isDarkMode ? "#3f3f46" : "#e4e4e7"; // Zinc 700 / Zinc 200
      })
      .attr("stroke", isDarkMode ? "#000" : "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease");

    // Interaction
    circles
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", 10)
          .attr("stroke", isDarkMode ? "#fff" : "#000");

        // Tooltip label
        svg.append("text")
           .attr("id", "tooltip-text")
           .attr("x", x(d.currentHumidity))
           .attr("y", y(d.currentHri) - 15)
           .attr("text-anchor", "middle")
           .attr("font-size", "12px")
           .attr("font-weight", "bold")
           .attr("fill", isDarkMode ? "#fff" : "#09090b")
           .style("pointer-events", "none") // Prevent tooltip from capturing mouse events
           .text(d.name);
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 6)
          .attr("stroke", isDarkMode ? "#000" : "#fff");
        svg.select("#tooltip-text").remove();
      })
      .on("click", (event, d) => onSelectDistrict(d));

  }, [data, onSelectDistrict, isDarkMode, dimensions]);

  return (
    <div className="w-full h-full min-h-[200px]">
       <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
