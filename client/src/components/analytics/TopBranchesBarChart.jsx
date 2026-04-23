import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const TopBranchesBarChart = ({ data = [] }) => {
  const chartData = data.slice(0, 5).map(branch => ({
    name: branch.shopName,
    revenue: branch.actualRevenue || 0,
    expected: branch.expectedRevenue || 0,
  }));

  return (
    <BarChart
      data={chartData}
      margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
    >
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      
      <XAxis
        dataKey="name"
        angle={-30}
        textAnchor="end"
        height={60}
        tick={{ fill: '#64748b', fontSize: 12 }}
      />

      <YAxis
        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
        tick={{ fill: '#64748b' }}
      />

      <Tooltip
        formatter={(value) => `₹${value.toLocaleString()}`}
      />

      <Legend />

      <Bar
        dataKey="revenue"
        fill="#10b981"
        name="Actual Revenue"
        radius={[6, 6, 0, 0]}
      />

      <Bar
        dataKey="expected"
        fill="#3b82f6"
        name="Expected Revenue"
        radius={[6, 6, 0, 0]}
      />
    </BarChart>
  );
};

export default TopBranchesBarChart;