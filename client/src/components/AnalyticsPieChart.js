import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
  '#e11d48', // Rose
  '#0ea5e9', // Sky
  '#22c55e', // Green
  '#eab308', // Yellow
  '#64748b', // Slate
  '#a855f7', // Purple
  '#f43f5e', // Rose Red
  '#0f766e', // Dark Teal
];

const AnalyticsPieChart = ({ data, title }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800 h-full flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">{title}</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Transform object data to array if needed, or use as is if already array
  const chartData = Array.isArray(data) 
    ? data 
    : Object.entries(data).map(([name, value]) => ({ name, value }));

  // Sort by value descending
  chartData.sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-3 border border-gray-700 shadow-lg rounded-lg">
          <p className="text-sm font-medium text-gray-100">
            {payload[0].name}: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-800 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-100 mb-6">{title}</h3>
      <div className="flex-grow min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value) => <span className="text-sm text-gray-400 ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPieChart;
