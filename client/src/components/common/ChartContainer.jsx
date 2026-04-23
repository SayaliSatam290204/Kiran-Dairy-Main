import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ---------------- COMMON WRAPPER ---------------- */
export const ChartContainer = ({ title, height = 300, children, gradient = false }) => {
  return (
    <div
      className={`rounded-3xl p-6 shadow-xl border transition-all duration-300 min-h-[400px] ${
        gradient ? "bg-gradient-to-br from-slate-50 to-white" : "bg-white"
      }`}
    >
      <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
      <div className="w-full min-h-[320px] h-[320px]">{children}</div>
    </div>
  );
};

/* ---------------- BRANCH REVENUE BAR CHART ---------------- */
export const BranchRevenueBarChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          interval={0}              // ✅ SHOW ALL LABELS
          angle={-35}              // ✅ ROTATE
          textAnchor="end"
          height={80}
          tick={false}
        />

        <YAxis />
        <Tooltip />

        <Bar dataKey="actualRevenue" fill="#10b981" name="Actual Revenue" />
        <Bar dataKey="expectedRevenue" fill="#3b82f6" name="Expected Revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ---------------- TOP BRANCHES BAR CHART ---------------- */
export const TopBranchesBarChart = ({ data = [] }) => {
  const formatted = data.map((item) => ({
    name: item.shopName,
    revenue: item.actualRevenue,
    transactions: item.totalTransactions,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={formatted} margin={{ bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          interval={0}              // ✅ SHOW ALL
          angle={-35}
          textAnchor="end"
          height={80}
          tick={false}
        />

        <YAxis />
        <Tooltip />

        <Bar dataKey="revenue" fill="#6366f1" name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ---------------- STAFF PERFORMANCE BAR ---------------- */
export const StaffPerformanceBar = ({ data = [] }) => {
  const formatted = data.map((item) => ({
    name: item.name,
    sales: item.monthly?.totalSales || 0,
    amount: item.monthly?.totalAmount || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={formatted} margin={{ bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          interval={0}              // ✅ SHOW ALL
          angle={-35}
          textAnchor="end"
          height={80}
          tick={false}
        />

        <YAxis />
        <Tooltip />

        <Bar dataKey="sales" fill="#f59e0b" name="Sales" />
        <Bar dataKey="amount" fill="#ef4444" name="Amount" />
      </BarChart>
    </ResponsiveContainer>
  );
};

/* ---------------- PRODUCT PIE CHART ---------------- */
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export const ProductRevenuePieChart = ({ data = [] }) => {
  const formatted = data.map((item) => ({
    name: item.productName,
    value: item.totalRevenue,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={formatted} dataKey="value" nameKey="name" outerRadius={100}>
          {formatted.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};