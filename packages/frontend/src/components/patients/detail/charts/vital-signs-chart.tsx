"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VitalSign } from "@/types/patient";

interface VitalSignsChartProps {
  vitalSigns: VitalSign[];
  selectedVital: string;
  period: string;
}

export function VitalSignsChart({ vitalSigns, selectedVital, period }: VitalSignsChartProps) {
  // Filter data based on period
  const filterDataByPeriod = (data: VitalSign[]) => {
    const now = new Date();
    const periodInDays = {
      "1week": 7,
      "1month": 30,
      "3months": 90,
      "6months": 180,
      "1year": 365,
    }[period] || 90;

    const cutoffDate = new Date(now.getTime() - (periodInDays * 24 * 60 * 60 * 1000));
    return data.filter(vital => new Date(vital.date) >= cutoffDate);
  };

  const filteredData = filterDataByPeriod(vitalSigns);

  // Generate simple SVG chart
  const generateChart = () => {
    if (filteredData.length === 0) return null;

    const width = 600;
    const height = 200;
    const padding = 40;

    let dataPoints: number[] = [];
    let label = "";
    let unit = "";

    switch (selectedVital) {
      case "bloodPressure":
        dataPoints = filteredData.map(v => v.bloodPressureSystolic || 0).filter(v => v > 0);
        label = "Blood Pressure (Systolic)";
        unit = "mmHg";
        break;
      case "heartRate":
        dataPoints = filteredData.map(v => v.heartRate || 0).filter(v => v > 0);
        label = "Heart Rate";
        unit = "bpm";
        break;
      case "temperature":
        dataPoints = filteredData.map(v => v.temperature || 0).filter(v => v > 0);
        label = "Temperature";
        unit = "°F";
        break;
      case "weight":
        dataPoints = filteredData.map(v => v.weight || 0).filter(v => v > 0);
        label = "Weight";
        unit = "kg";
        break;
      case "oxygenSaturation":
        dataPoints = filteredData.map(v => v.oxygenSaturation || 0).filter(v => v > 0);
        label = "Oxygen Saturation";
        unit = "%";
        break;
    }

    if (dataPoints.length === 0) return null;

    const minValue = Math.min(...dataPoints);
    const maxValue = Math.max(...dataPoints);
    const range = maxValue - minValue || 1;

    const points = dataPoints.map((value, index) => {
      const x = padding + (index * (width - 2 * padding)) / (dataPoints.length - 1);
      const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="w-full overflow-x-auto">
        <svg width={width} height={height} className="border rounded-lg bg-white">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={points}
          />
          
          {/* Data points */}
          {dataPoints.map((value, index) => {
            const x = padding + (index * (width - 2 * padding)) / (dataPoints.length - 1);
            const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Y-axis labels */}
          <text x="10" y={padding} fontSize="12" fill="#6b7280" textAnchor="start">
            {maxValue.toFixed(1)} {unit}
          </text>
          <text x="10" y={height - padding + 5} fontSize="12" fill="#6b7280" textAnchor="start">
            {minValue.toFixed(1)} {unit}
          </text>
          
          {/* Chart title */}
          <text x={width / 2} y="20" fontSize="14" fill="#374151" textAnchor="middle" fontWeight="bold">
            {label} Trend
          </text>
        </svg>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>{label}</span>
          </div>
          <span>•</span>
          <span>{dataPoints.length} readings over {period}</span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vital Signs Trend</CardTitle>
        <CardDescription>
          {selectedVital} over the last {period}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredData.length > 0 ? (
          generateChart()
        ) : (
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground">No data available for the selected period</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try selecting a different time period or vital sign
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}