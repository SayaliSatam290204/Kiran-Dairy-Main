import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { adminApi } from "../../api/adminApi.js";
import { formatDate } from "../../utils/formatDate.js";

export const DispatchAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await adminApi.getDispatchAnalytics(params);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error(
        error.response?.data?.message || "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilter = () => {
    fetchAnalytics();
  };

  const handleResetFilter = () => {
    setDateRange({ startDate: "", endDate: "" });
    setAnalytics(null);
    fetchAnalytics();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dispatch Analytics</h1>
      </div>

      {/* Date Filter */}
      <Card className="bg-white">
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Apply Filter
          </button>
          <button
            onClick={handleResetFilter}
            className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : !analytics || (analytics.frequencyByShop && analytics.frequencyByShop.length === 0) ? (
        <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-2">No Dispatch Data Found</p>
          <p className="text-gray-600 mb-4">
            {dateRange.startDate || dateRange.endDate
              ? "No dispatches were found in the selected date range."
              : "Create a dispatch from the Dispatch page to see analytics here."}
          </p>
          <a
            href="/admin/dispatch"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Go to Dispatch
          </a>
        </Card>
      ) : analytics ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Total Dispatches
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics.frequencyByShop?.length === 0
                    ? 0
                    : analytics.frequencyByShop?.reduce(
                        (sum, shop) => sum + shop.dispatchCount,
                        0
                      ) || 0}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Avg Delivery Time
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {analytics.deliveryTimeStats?.avgDeliveryTime
                    ? Math.round(analytics.deliveryTimeStats.avgDeliveryTime)
                    : 0}
                  <span className="text-sm"> hrs</span>
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Received Count
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {analytics.statusSummary?.find((s) => s._id === "received")
                    ?.count || 0}
                </p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Active Shops
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {analytics.frequencyByShop?.length || 0}
                </p>
              </div>
            </Card>
          </div>

          {/* Status Summary */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Dispatch Status Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.statusSummary && analytics.statusSummary.length > 0 ? (
                analytics.statusSummary.map((status) => (
                  <div
                    key={status._id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <p className="text-sm text-gray-600 mb-1 capitalize">
                      {status._id}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {status.count}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {status.totalItems} items
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No data available</p>
              )}
            </div>
          </Card>

          {/* Top Dispatching Shops */}
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Top Dispatching Shops
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Shop
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Dispatches
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Received
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Pending
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Success Rate
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">
                      Avg Del. Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.frequencyByShop && analytics.frequencyByShop.length > 0 ? (
                    analytics.frequencyByShop.map((shop) => (
                      <tr key={shop.shopId} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {shop.shopName || "Unknown"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {shop.dispatchCount}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {shop.totalItems}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="green">{shop.receivedCount}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="yellow">{shop.pendingCount}</Badge>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {shop.successRate}%
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {shop.avgDeliveryTime ? `${shop.avgDeliveryTime} hrs` : "N/A"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-4 py-3 text-center text-gray-500">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Batch Dispatch Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Dispatch Type Breakdown
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">
                    Single Shop Dispatches
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {analytics.batchStats?.singleDispatch?.count || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">
                    Batch Dispatches
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    {analytics.batchStats?.batchDispatch?.count || 0}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Delivery Time Range
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Minimum</span>
                  <span className="text-2xl font-bold text-green-600">
                    {analytics.deliveryTimeStats?.minDeliveryTime
                      ? Math.round(
                          analytics.deliveryTimeStats.minDeliveryTime
                        )
                      : 0}
                    <span className="text-sm"> hrs</span>
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Maximum</span>
                  <span className="text-2xl font-bold text-red-600">
                    {analytics.deliveryTimeStats?.maxDeliveryTime
                      ? Math.round(
                          analytics.deliveryTimeStats.maxDeliveryTime
                        )
                      : 0}
                    <span className="text-sm"> hrs</span>
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-gray-700">
              No data to display
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Apply filters or create dispatches to see analytics.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
