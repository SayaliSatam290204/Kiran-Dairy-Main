import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { staffPaymentApi } from "../../api/staffPaymentApi.js";
import { staffApi } from "../../api/staffApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Card } from "../../components/ui/Card.jsx";

export const StaffPayment = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    month: "",
    status: "",
    staffId: ""
  });
  const [formData, setFormData] = useState({
    staffId: "",
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "cash",
    month: "",
    notes: ""
  });

  // Fetch payments and staff on mount
  useEffect(() => {
    fetchPayments();
    fetchStaff();
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

  const fetchStaff = async () => {
    try {
      const response = await staffApi.getAllStaff();
      setStaff(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch staff");
    }
  };

  const handleOpenModal = (payment = null) => {
    if (payment) {
      setEditingId(payment._id);
      setFormData({
        staffId: payment.staffId._id,
        amount: payment.amount,
        paymentDate: payment.paymentDate.split('T')[0],
        paymentMethod: payment.paymentMethod,
        month: payment.month,
        notes: payment.notes
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      staffId: "",
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: "cash",
      month: "",
      notes: ""
    });
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeFilter = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchPayments();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staffId || !formData.amount || !formData.month) {
      return toast.error("Please fill all required fields");
    }

    try {
      const payload = {
        ...formData,
        paymentPeriod: {
          startDate: new Date(formData.month + '-01'),
          endDate: new Date(formData.month + '-28')
        }
      };

      if (editingId) {
        await staffPaymentApi.updatePayment(editingId, payload);
        toast.success("Payment updated successfully");
      } else {
        await staffPaymentApi.createPayment(payload);
        toast.success("Payment created successfully");
      }
      handleCloseModal();
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      await staffPaymentApi.deletePayment(id);
      toast.success("Payment deleted successfully");
      fetchPayments();
    } catch (error) {
      toast.error("Failed to delete payment");
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await staffPaymentApi.updatePayment(id, { status: 'completed' });
      toast.success("Payment marked as completed");
      fetchPayments();
    } catch (error) {
      toast.error("Failed to update payment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Staff Payments</h1>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          + Add Payment
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-800">Staff</label>
            <select
              name="staffId"
              value={filters.staffId}
              onChange={handleChangeFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Staff</option>
              {staff.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Month"
            name="month"
            type="month"
            value={filters.month}
            onChange={handleChangeFilter}
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-800">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChangeFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleApplyFilters}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No payments found. Add one to get started.</p>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Staff Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Method</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment Date</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map(payment => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.staffId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">₹{payment.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.month}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{payment.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    {payment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleMarkPaid(payment._id)}
                          className="text-green-600 hover:text-green-700 font-semibold"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => handleOpenModal(payment)}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(payment._id)}
                          className="text-red-600 hover:text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {payment.status !== 'pending' && (
                      <button
                        onClick={() => handleOpenModal(payment)}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? "Edit Payment" : "Create Payment"}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-800">Staff *</label>
              <select
                name="staffId"
                value={formData.staffId}
                onChange={handleChangeForm}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Staff</option>
                {staff.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Amount *"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChangeForm}
              required
            />

            <Input
              label="Payment Month *"
              name="month"
              type="month"
              value={formData.month}
              onChange={handleChangeForm}
              required
            />

            <Input
              label="Payment Date"
              name="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={handleChangeForm}
            />

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-800">Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChangeForm}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online</option>
              </select>
            </div>

            <Input
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChangeForm}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {editingId ? "Update Payment" : "Create Payment"}
              </Button>
              <Button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
