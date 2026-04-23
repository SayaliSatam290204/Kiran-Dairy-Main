import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const BranchPerformanceChart = ({ data = [], selectedBranches = [] }) => {
  // ✅ Safe filtering
  const filteredData =
    selectedBranches.length > 0
      ? data.filter((branch) =>
          selectedBranches.includes(branch.shopId)
        )
      : data;

  // ✅ Safe mapping
  const chartData = filteredData.map((branch) => ({
    name: branch.shopName || "N/A",
    actual: branch.actualRevenue || 0,
    expected: branch.expectedRevenue || 0,
    gap: Math.max(
      0,
      (branch.expectedRevenue || 0) - (branch.actualRevenue || 0)
    ),
  }));

  return (
    <BarChart
      data={chartData}
      margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
    >
      {/* Grid */}
      <CartesianGrid
        strokeDasharray="3 3"
        vertical={false}
        stroke="#f1f5f9"
      />

      {/* X Axis */}
      <XAxis
        dataKey="name"
        angle={-40}
        textAnchor="end"
        interval={0}
        height={70}
        tick={{ fill: "#64748b", fontSize: 11 }}
      />

      {/* Y Axis */}
      <YAxis
        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
        tick={{ fill: "#64748b", fontSize: 11 }}
      />

      {/* Tooltip */}
      <Tooltip
        formatter={(value, name) => [
          `₹${value.toLocaleString()}`,
          name === "actual"
            ? "Actual Revenue"
            : name === "expected"
            ? "Expected Revenue"
            : "Performance Gap",
        ]}
        labelStyle={{ fontWeight: 600 }}
      />

      {/* Legend */}
      <Legend />

      {/* Bars */}
      <Bar
        dataKey="actual"
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

export default BranchPerformanceChart;