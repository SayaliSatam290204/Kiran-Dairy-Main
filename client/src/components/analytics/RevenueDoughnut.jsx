import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const RevenueDoughnut = ({ data }) => {
  const chartData =
    data && data.length > 0
      ? data
      : [
          { name: "Actual Revenue", value: 0 },
          { name: "Expected Revenue", value: 0 },
          { name: "Gap", value: 0 },
        ];

  return (
    <PieChart>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        innerRadius={70}
        outerRadius={100}
        dataKey="value"
        nameKey="name"
        cornerRadius={6}
      >
        {chartData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={entry.fill || COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip
        formatter={(value) => [`₹${value.toLocaleString()}`, ""]}
      />

      <Legend
        layout="vertical"
        align="right"
        verticalAlign="middle"
        iconType="circle"
      />
    </PieChart>
  );
};

export default RevenueDoughnut;