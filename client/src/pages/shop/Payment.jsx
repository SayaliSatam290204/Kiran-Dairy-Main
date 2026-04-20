import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { staffPaymentApi } from "../../api/staffPaymentApi.js";
import { staffApi } from "../../api/staffApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Card } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

export const ShopPayment = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: "",
    status: ""
  });

  // Fetch payments on mount
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await staffPaymentApi.getAllPayments(filters);
      setPayments(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchPayments();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Staff Payments</h1>
          <p className="text-gray-600 mt-2">
            📋 View Only - To process staff payments, please contact your administrator
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <input
                type="month"
                name="month"
                value={filters.month}
                onChange={handleChangeFilter}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChangeFilter}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </Card>

        {/* Payments Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No payments found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Staff Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Month</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Method</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {payment.staffId?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {payment.staffId?.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {payment.month}
                      </td>
                      <td className="px-4 py-3 capitalize">
                        <Badge variant={
                          payment.paymentMethod === 'cash' ? 'primary' :
                          payment.paymentMethod === 'bank_transfer' ? 'success' : 'secondary'
                        }>
                          {payment.paymentMethod}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          payment.status === 'completed' ? 'success' : 'warning'
                        }>
                          {payment.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
