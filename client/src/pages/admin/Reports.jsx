import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { adminApi } from "../../api/adminApi.js";
import { formatDate } from "../../utils/formatDate.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

export const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [allSales, setAllSales] = useState([]);
  const [shopPerformance, setShopPerformance] = useState([]);
  const [selectedShop, setSelectedShop] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [salesRes] = await Promise.all([
        adminApi.getAllSales(),
      ]);

      const sales = Array.isArray(salesRes.data.data) ? salesRes.data.data : (Array.isArray(salesRes.data) ? salesRes.data : []);
      setAllSales(sales);

      // Calculate shop performance
      const performance = {};
      sales.forEach((sale) => {
        const shopId = sale.shopId?._id || sale.shopId;
        const shopName = sale.shopId?.name || "Unknown Shop";
        
        if (!performance[shopId]) {
          performance[shopId] = {
            shopId,
            shopName,
            totalSales: 0,
            totalAmount: 0,
            billCount: 0,
            avgAmount: 0
          };
        }
        performance[shopId].totalSales += 1;
        performance[shopId].totalAmount += sale.totalAmount || 0;
        performance[shopId].billCount += 1;
      });

      // Calculate averages
      Object.keys(performance).forEach((key) => {
        performance[key].avgAmount = performance[key].totalAmount / performance[key].billCount;
      });

      setShopPerformance(Object.values(performance));
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error(
        error.response?.data?.message || "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSales = () => {
    let filtered = allSales;

    if (selectedShop !== "all") {
      filtered = filtered.filter(
        (sale) => (sale.shopId?._id || sale.shopId) === selectedShop
      );
    }

    if (dateRange.startDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.createdAt) >= new Date(dateRange.startDate)
      );
    }

    if (dateRange.endDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.createdAt) <= new Date(dateRange.endDate)
      );
    }

    return filtered;
  };

  const filteredSales = getFilteredSales();
  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const avgSaleAmount = filteredSales.length > 0 ? totalSalesAmount / filteredSales.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Reports</h1>
        <p className="text-gray-600">View detailed sales and inventory analytics</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{allSales.length}</p>
                <p className="text-xs text-gray-600 mt-1">Total bills</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(allSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0))}</p>
                <p className="text-xs text-gray-600 mt-1">All time</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Sale Value</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(allSales.length > 0 ? allSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0) / allSales.length : 0)}</p>
                <p className="text-xs text-gray-600 mt-1">Per bill</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Shops</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{shopPerformance.length}</p>
                <p className="text-xs text-gray-600 mt-1">With sales</p>
              </div>
            </Card>
          </div>

          {/* Sales Report */}
          <Card className="bg-white">
            <h2 className="text-xl font-bold mb-4">Sales Report</h2>
            
            {allSales.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No sales reported yet. Sales will appear once transactions are processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Shop</label>
                    <select
                      value={selectedShop}
                      onChange={(e) => setSelectedShop(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Shops</option>
                      {shopPerformance.map((shop) => (
                        <option key={shop.shopId} value={shop.shopId}>
                          {shop.shopName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Bills</p>
                    <p className="text-2xl font-bold text-blue-600">{filteredSales.length}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSalesAmount)}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Avg Bill</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgSaleAmount)}</p>
                  </div>
                </div>

                {/* Recent Sales Table */}
                {filteredSales.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Recent Sales</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Bill No</th>
                            <th className="px-4 py-2 text-left">Shop</th>
                            <th className="px-4 py-2 text-left">Items</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Payment</th>
                            <th className="px-4 py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredSales.slice(0, 10).map((sale) => (
                            <tr key={sale._id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium">{sale.billNo}</td>
                              <td className="px-4 py-2">{sale.shopId?.name || "---"}</td>
                              <td className="px-4 py-2">{sale.items?.length || 0}</td>
                              <td className="px-4 py-2 font-semibold">{formatCurrency(sale.totalAmount)}</td>
                              <td className="px-4 py-2">
                                <Badge variant="primary">{sale.paymentMethod || "Cash"}</Badge>
                              </td>
                              <td className="px-4 py-2 text-gray-600">{formatDate(sale.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Shop Performance */}
          {shopPerformance.length > 0 && (
            <Card className="bg-white">
              <h2 className="text-xl font-bold mb-4">Shop Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left">Shop Name</th>
                      <th className="px-4 py-2 text-left">Total Bills</th>
                      <th className="px-4 py-2 text-left">Total Revenue</th>
                      <th className="px-4 py-2 text-left">Avg Bill Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {shopPerformance.sort((a, b) => b.totalAmount - a.totalAmount).map((shop) => (
                      <tr key={shop.shopId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{shop.shopName}</td>
                        <td className="px-4 py-2">{shop.billCount}</td>
                        <td className="px-4 py-2 font-semibold text-green-600">{formatCurrency(shop.totalAmount)}</td>
                        <td className="px-4 py-2">{formatCurrency(shop.avgAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};