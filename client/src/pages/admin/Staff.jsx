import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { staffApi } from "../../api/staffApi.js";
import { adminApi } from "../../api/adminApi.js";
import { staffPerformanceApi } from "../../api/staffPerformanceApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { StaffPerformanceModal } from "../../components/StaffPerformanceModal.jsx";

export const Staff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shopId: "",
    shifts: ["morning"],
    baseSalary: "",
    joinDate: "",
    notes: ""
  });

  // Fetch staff and shops on mount
  useEffect(() => {
    fetchStaff();
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setShopsLoading(true);
      const response = await adminApi.getShops();
      setShops(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch shops");
    } finally {
      setShopsLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getAllStaff();
      setStaff(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (staffMember = null) => {
    if (staffMember) {
      setEditingId(staffMember._id);
      setFormData({
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        shopId: staffMember.shopId._id || staffMember.shopId,
        shifts: staffMember.shifts,
        baseSalary: staffMember.baseSalary,
        joinDate: staffMember.joinDate.split('T')[0],
        notes: staffMember.notes
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      shopId: "",
      shifts: ["morning"],
      baseSalary: "",
      joinDate: "",
      notes: ""
    });
  };

  const handleChangeForm = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "shifts") {
        const newShifts = checked
          ? [...formData.shifts, value]
          : formData.shifts.filter(s => s !== value);
        setFormData(prev => ({ ...prev, shifts: newShifts }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.baseSalary || !formData.joinDate || !formData.shopId) {
      return toast.error("Please fill all required fields");
    }

    try {
      if (editingId) {
        await staffApi.updateStaff(editingId, formData);
        toast.success("Staff updated successfully");
      } else {
        await staffApi.createStaff(formData);
        toast.success("Staff created successfully");
      }
      handleCloseModal();
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await staffApi.deleteStaff(id);
      toast.success("Staff deleted successfully");
      fetchStaff();
    } catch (error) {
      toast.error("Failed to delete staff");
    }
  };

  const handleViewPerformance = async (staffMember) => {
    setSelectedStaff(staffMember);
    setShowPerformanceModal(true);
    setPerformanceLoading(true);
    
    try {
      const response = await staffPerformanceApi.getAllStaffPerformance();
      const staffPerf = response.data.data.find(s => s._id === staffMember._id);
      setPerformanceData(staffPerf);
    } catch (error) {
      toast.error("Failed to load performance data");
      console.error(error);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const handleClosePerformanceModal = () => {
    setShowPerformanceModal(false);
    setSelectedStaff(null);
    setPerformanceData(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Add Staff
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading staff...</p>
        </div>
      ) : staff.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No staff members found. Add one to get started.</p>
        </Card>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Shop</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Shifts</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Salary</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {staff.map(member => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.shopId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex gap-2">
                      {member.shifts?.map(shift => (
                        <span key={shift} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {shift}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">₹{member.baseSalary}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    <button
                      onClick={() => handleViewPerformance(member)}
                      className="text-green-600 hover:text-green-700 font-semibold"
                      title="View Performance"
                    >
                      ▨ Performance
                    </button>
                    <button
                      onClick={() => handleOpenModal(member)}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      className="text-red-600 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? "Edit Staff" : "Add Staff"}>
          <form onSubmit={handleSubmit} className="space-y-0">
            {/* Personal Information Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChangeForm}
                  required
                  className="mb-0"
                />
                <Input
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChangeForm}
                  required
                  className="mb-0"
                />
              </div>
              <Input
                label="Phone *"
                name="phone"
                value={formData.phone}
                onChange={handleChangeForm}
                required
              />
            </div>

            {/* Shop Selection Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Shop Assignment</h3>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Shop *
                </label>
                <select
                  name="shopId"
                  value={formData.shopId}
                  onChange={handleChangeForm}
                  required
                  disabled={shopsLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select a shop --</option>
                  {shops.map(shop => (
                    <option key={shop._id} value={shop._id}>
                      {shop.name} ({shop.location})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Employment Information Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Base Salary (Monthly) *"
                  name="baseSalary"
                  type="number"
                  value={formData.baseSalary}
                  onChange={handleChangeForm}
                  required
                  placeholder="e.g., 10000"
                  className="mb-0"
                />
                <Input
                  label="Join Date *"
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleChangeForm}
                  required
                  className="mb-0"
                />
              </div>
            </div>

            {/* Shifts Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Assigned Shifts</h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition">
                    <input
                      type="checkbox"
                      name="shifts"
                      value="morning"
                      checked={formData.shifts.includes("morning")}
                      onChange={handleChangeForm}
                      className="w-4 h-4 mr-3 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Morning Shift</span>
                  </label>
                  <label className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition">
                    <input
                      type="checkbox"
                      name="shifts"
                      value="evening"
                      checked={formData.shifts.includes("evening")}
                      onChange={handleChangeForm}
                      className="w-4 h-4 mr-3 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Evening Shift</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Additional Notes</h3>
              <Input
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChangeForm}
                placeholder="Add any additional notes about the staff member"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
              >
                {editingId ? "Update Staff" : "Create Staff"}
              </Button>
              <Button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 py-2 rounded-md font-semibold"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {showPerformanceModal && selectedStaff && performanceData && (
        <StaffPerformanceModal
          isOpen={showPerformanceModal}
          onClose={handleClosePerformanceModal}
          staff={selectedStaff}
          performance={performanceData}
        />
      )}
    </div>
  );
};
