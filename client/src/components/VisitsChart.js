import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const VisitsChart = ({ visitsAndVisitorsByDay }) => {
  if (!visitsAndVisitorsByDay || Object.keys(visitsAndVisitorsByDay).length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 bg-gray-900 rounded-lg border border-dashed border-gray-700">
        <p>No data available for chart</p>
      </div>
    );
  }

  // Transform data for Recharts
  const data = Object.keys(visitsAndVisitorsByDay)
    .sort((a, b) => new Date(a) - new Date(b))
    .slice(-30) // Last 30 days
    .map(day => ({
      date: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: day,
      visits: visitsAndVisitorsByDay[day].visits,
      visitors: visitsAndVisitorsByDay[day].visitors,
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 p-4 border border-gray-700 shadow-lg rounded-lg">
          <p className="text-sm font-semibold text-gray-100 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Visits: <span className="font-bold ml-1">{payload[0].value}</span>
            </p>
            <p className="text-sm text-emerald-600 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Visitors: <span className="font-bold ml-1">{payload[1].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-sm font-medium text-gray-300 ml-1">{value}</span>}
          />
          <Area
            type="monotone"
            dataKey="visits"
            name="Visits"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVisits)"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            name="Visitors"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVisitors)"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VisitsChart;
