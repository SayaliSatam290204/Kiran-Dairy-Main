import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { staffApi } from "../../api/staffApi.js";
import { shopApi } from "../../api/shopApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { StaffPerformanceModal } from "../../components/StaffPerformanceModal.jsx";

export const ShopStaff = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);

  // Fetch staff on mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getStaffByShop(user.shopId);
      setStaff(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPerformance = async (staffMember) => {
    setSelectedStaff(staffMember);
    setShowPerformanceModal(true);
    setPerformanceLoading(true);
    
    try {
      const response = await shopApi.getStaffDetailedPerformance(staffMember._id);
      setPerformanceData(response.data.data);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Directory</h1>
        <p className="text-sm text-gray-600 mt-1">View your branch staff members and their performance. To add or manage staff, contact your administrator.</p>
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
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Shifts</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Monthly Salary</th>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
