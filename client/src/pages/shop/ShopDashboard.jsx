import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaShoppingCart,
  FaRupeeSign,
  FaUndoAlt,
  FaTruck,
  FaUsers,
  FaClipboard,
  FaChartBar,
} from "react-icons/fa";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { shopApi } from "../../api/shopApi.js";
import { salesApi } from "../../api/salesApi.js";
import { adminApi } from "../../api/adminApi.js";
import { staffPaymentApi } from "../../api/staffPaymentApi.js";
import { staffApi } from "../../api/staffApi.js";
import { formatDate } from "../../utils/formatDate.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { useAuth } from "../../hooks/useAuth.js";

export const ShopDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalInventory: 0,
    totalSales: 0,
    totalReturns: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalStaff: 0,
    activeStaff: 0,
    totalReceivedDispatches: 0
  });
  const [receivedDispatches, setReceivedDispatches] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        
        // Fetch shop dashboard stats
        const dashboardResponse = await shopApi.getDashboard();
        const dashboardData = dashboardResponse.data.data;

        // Fetch pending payments
        const paymentsResponse = await staffPaymentApi.getPendingPayments();
        const pendingCount = paymentsResponse.data.data.length;
        const pendingAmount = paymentsResponse.data.data.reduce((sum, p) => sum + p.amount, 0);

        // Fetch staff info
        const staffResponse = await staffApi.getAllStaff();
        const allStaff = staffResponse.data.data.filter(s => s.shopId._id === user.shopId);
        const activeCount = allStaff.filter(s => s.status === 'active').length;

        // Fetch received dispatches for "Received Stock Summary"
        const dispatchesResponse = await shopApi.getReceivedDispatches();
        setReceivedDispatches(dispatchesResponse.data.data || []);

        // Fetch sales history
        try {
          const salesResponse = await salesApi.getHistory();
          setSalesHistory(salesResponse.data.data || []);
        } catch (error) {
          console.error("Failed to fetch sales history:", error);
          setSalesHistory([]);
        }

        // Fetch staff performance by shift (monthly)
        try {
          const year = new Date().getFullYear();
          const month = new Date().getMonth() + 1;
          const perfResponse = await shopApi.getStaffPerformance('monthly', year, month);
          setStaffPerformance(perfResponse.data.data || null);
        } catch (error) {
          console.error("Failed to fetch staff performance:", error);
          setStaffPerformance(null);
        }

        setStats({
          ...dashboardData,
          pendingPayments: pendingAmount,
          totalStaff: allStaff.length,
          activeStaff: activeCount
        });
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        toast.error(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user.shopId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shop Dashboard</h1>
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
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Inventory</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalInventory}</p>
                  <p className="text-xs text-gray-500 mt-1">Units in stock</p>
                </div>
                <FaBox className="text-4xl text-green-400 opacity-30" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Daily Sales</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalSales}</p>
                  <p className="text-xs text-gray-500 mt-1">Transactions today</p>
                </div>
                <FaShoppingCart className="text-4xl text-blue-400 opacity-30" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-600">₹{stats.totalRevenue}</p>
                  <p className="text-xs text-gray-500 mt-1">Today's earnings</p>
                </div>
                <FaRupeeSign className="text-4xl text-purple-400 opacity-30" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Returns</p>
                  <p className="text-3xl font-bold text-red-600">{stats.totalReturns}</p>
                  <p className="text-xs text-gray-500 mt-1">Return requests</p>
                </div>
                <FaUndoAlt className="text-4xl text-red-400 opacity-30" />
              </div>
            </Card>
          </div>

          {/* Staff & Billing Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Staff Management Card */}
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Staff Management</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.activeStaff}/{stats.totalStaff}</p>
                  <p className="text-xs text-gray-500 mt-1">Active / Total staff</p>
                </div>
                <FaUsers className="text-4xl text-indigo-400 opacity-30" />
              </div>
              <Button
                onClick={() => navigate('/shop/staff')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
              >
                Manage Staff
              </Button>
            </Card>

            {/* Staff Payments Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Pending Payments</p>
                  <p className="text-3xl font-bold text-orange-600">₹{stats.pendingPayments}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
                </div>
                <FaClipboard className="text-4xl text-orange-400 opacity-30" />
              </div>
              <Button
                onClick={() => navigate('/shop/payment')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm"
              >
                Manage Payments
              </Button>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card title="Quick Actions" className="bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                onClick={() => navigate('/shop/pos')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Sale
              </Button>
              <Button
                onClick={() => navigate('/shop/inventory')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                View Inventory
              </Button>
              <Button
                onClick={() => navigate('/shop/dispatch')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                ▢ Confirm Dispatch
              </Button>
              <Button
                onClick={() => navigate('/shop/returns')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Manage Returns
              </Button>
            </div>
          </Card>

          {/* Received Stock Summary */}
          {receivedDispatches.length > 0 && (
            <Card title="Recently Received Stock" className="border-green-200">
              <div className="space-y-4">
                {receivedDispatches.slice(0, 5).map((dispatch) => (
                  <div key={dispatch._id} className="border border-green-100 rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Dispatch: {dispatch.dispatchNo}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Received: {formatDate(dispatch.receivedDate)}
                        </p>
                        {dispatch.confirmedBy && (
                          <p className="text-xs text-gray-600">
                            Confirmed by: {dispatch.confirmedBy.name}
                          </p>
                        )}
                      </div>
                      <Badge variant="green">Received</Badge>
                    </div>

                    {/* Products in this dispatch */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {dispatch.items.map((item, idx) => (
                        <div key={idx} className="bg-white rounded p-2 text-sm">
                          <p className="font-medium text-gray-900">
                            {item.productId?.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: <span className="font-semibold">{item.quantity}</span>
                          </p>
                          <p className="text-xs text-green-600">
                            {formatCurrency(item.productId?.price || 0)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {dispatch.receivedNotes && (
                      <div className="mt-2 pt-2 border-t border-green-100">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">Notes:</span> {dispatch.receivedNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sales History */}
          {salesHistory.length > 0 && (
            <Card title="Recent Sales" className="border-blue-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Bill No</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
                      <th className="text-right px-4 py-2 font-semibold text-gray-700">Items</th>
                      <th className="text-right px-4 py-2 font-semibold text-gray-700">Amount</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {salesHistory.slice(0, 10).map((sale) => (
                      <tr key={sale._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{sale.billNo}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(sale.saleDate)}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{sale.items.length}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          {formatCurrency(sale.totalAmount)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={sale.paymentMethod === 'cash' ? 'green' : 'blue'}>
                            {sale.paymentMethod.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Staff Performance by Shift */}
          {staffPerformance?.byShift && staffPerformance.byShift.length > 0 && (
            <Card title="Staff Performance (Monthly by Shift)" className="border-purple-200">
              <div className="space-y-6">
                {staffPerformance.byShift.map((shift) => (
                  <div key={shift._id} className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 capitalize">
                        {shift.shift} Shift
                      </h3>
                      <Badge variant={shift.shift === 'morning' ? 'blue' : 'orange'}>
                        {shift.staffWorking} staff working
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Total Sales</p>
                        <p className="text-2xl font-bold text-blue-600">{shift.totalSales}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(shift.totalAmount)}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Items Sold</p>
                        <p className="text-2xl font-bold text-purple-600">{shift.itemsSold}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Avg per Sale</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatCurrency(shift.totalAmount / (shift.totalSales || 1))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {staffPerformance.monthlyTotal && (
                  <div className="border-t-2 border-gray-300 pt-4 mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Monthly Total</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-100 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Total Sales</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {staffPerformance.monthlyTotal.totalSales}
                        </p>
                      </div>
                      <div className="bg-green-100 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(staffPerformance.monthlyTotal.totalAmount)}
                        </p>
                      </div>
                      <div className="bg-purple-100 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Items Sold</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {staffPerformance.monthlyTotal.itemsSold}
                        </p>
                      </div>
                      <div className="bg-orange-100 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Avg per Sale</p>
                        <p className="text-2xl font-bold text-orange-700">
                          {formatCurrency(
                            staffPerformance.monthlyTotal.totalAmount /
                              (staffPerformance.monthlyTotal.totalSales || 1)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};