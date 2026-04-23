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

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

const ProductRevenueChart = ({ data = [] }) => {
  // ✅ Safe + Top 10 products
  const chartData = data
    .slice(0, 10)
    .map((product, idx) => ({
      name: product.productName || "N/A",
      revenue: product.totalRevenue || 0,
      quantity: product.totalQuantity || 0,
      fill: COLORS[idx % COLORS.length],
    }));

  return (
    <BarChart
      data={chartData}
      margin={{ top: 20, right: 30, left: 10, bottom: 70 }}
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
          name === "revenue"
            ? `₹${value.toLocaleString()}`
            : value,
          name === "revenue" ? "Revenue" : "Quantity",
        ]}
        labelStyle={{ fontWeight: 600 }}
      />

      {/* Legend */}
      <Legend />

      {/* Bars */}
      <Bar
        dataKey="revenue"
        fill="#10b981"
        name="Revenue"
        radius={[6, 6, 0, 0]}
      />

      <Bar
        dataKey="quantity"
        fill="#3b82f6"
        name="Quantity"
        radius={[6, 6, 0, 0]}
      />
    </BarChart>
  );
};

export default ProductRevenueChart;