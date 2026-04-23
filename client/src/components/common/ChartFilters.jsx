import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Button } from "../ui/Button.jsx";
import { Select, DatePicker, Space, Row, Col } from "antd";

const { RangePicker } = DatePicker;
const { Option } = Select;

export const ChartFilters = ({
  dashboardData,
  onFiltersChange,
  filters = {},
}) => {
  // ✅ Default date range (last 30 days)
  const defaultDateRange = [
    dayjs().subtract(30, "day"),
    dayjs(),
  ];

  const [localFilters, setLocalFilters] = useState({
    dateRange: Array.isArray(filters.dateRange)
      ? filters.dateRange
      : defaultDateRange,
    selectedBranches: filters.selectedBranches || [],
    viewType: filters.viewType || "all",
  });

  // ✅ Sync with parent filters
  useEffect(() => {
    setLocalFilters({
      dateRange: Array.isArray(filters.dateRange)
        ? filters.dateRange
        : defaultDateRange,
      selectedBranches: filters.selectedBranches || [],
      viewType: filters.viewType || "all",
    });
  }, [filters]);

  // ✅ FIXED: Use branchAnalytics instead of shops
  const allBranches = dashboardData?.branchAnalytics || [];

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: defaultDateRange,
      selectedBranches: [],
      viewType: "all",
    };

    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
      <Row gutter={[16, 16]} align="middle">

        {/* ✅ Date Range */}
        <Col xs={24} sm={12} lg={6}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date Range
          </label>

          <RangePicker
            value={
              Array.isArray(localFilters.dateRange)
                ? localFilters.dateRange
                : null
            }
            onChange={(dates) =>
              setLocalFilters((prev) => ({
                ...prev,
                dateRange: dates || defaultDateRange,
              }))
            }
            className="w-full"
            placeholder={["Start Date", "End Date"]}
          />
        </Col>

        {/* ✅ Branch Select */}
        <Col xs={24} sm={12} lg={6}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Branches
          </label>

          <Select
            mode="multiple"
            value={localFilters.selectedBranches}
            onChange={(values) =>
              setLocalFilters((prev) => ({
                ...prev,
                selectedBranches: values,
              }))
            }
            placeholder="Select branches (optional)"
            className="w-full"
            maxTagCount={2}
            allowClear
          >
            {allBranches.map((shop) => (
              <Option key={shop.shopId} value={shop.shopId}>
                {shop.shopName} ({shop.location})
              </Option>
            ))}
          </Select>
        </Col>

        {/* ✅ View Type */}
        <Col xs={24} sm={12} lg={6}>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            View
          </label>

          <Select
            value={localFilters.viewType}
            onChange={(value) =>
              setLocalFilters((prev) => ({
                ...prev,
                viewType: value,
              }))
            }
            className="w-full"
          >
            <Option value="all">All Branches</Option>
            <Option value="top5">Top 5</Option>
            <Option value="underperforming">
              Underperforming
            </Option>
          </Select>
        </Col>

        {/* ✅ Buttons */}
        <Col xs={24} lg={6} className="flex justify-end">
          <Space>
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-slate-300"
            >
              Reset
            </Button>

            <Button
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply
            </Button>
          </Space>
        </Col>

      </Row>
    </div>
  );
};