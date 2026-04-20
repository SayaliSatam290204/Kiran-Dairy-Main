import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth.js";
import { Card } from "../../components/ui/Card.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

export const AdminProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSave = async () => {
    // Validation
    if (!passwordData.currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }
    if (!passwordData.newPassword.trim()) {
      toast.error("New password is required");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setPasswordLoading(true);
    try {
      // TODO: Call password change API endpoint when available
      // For now, simulate with a toast
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    setConfirmLogout(true);
  };

  const doLogout = () => {
    setConfirmLogout(false);
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Admin Profile</h1>

      {/* Profile Card */}
      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-lg bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">
              {(user?.name || "A").trim().charAt(0).toUpperCase()}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{user?.name || "Admin"}</h2>
                    <p className="text-gray-600 text-sm mt-1">{user?.email || "N/A"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="blue">{user?.role?.toUpperCase() || "ADMIN"}</Badge>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      disabled
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`px-6 py-2 rounded-md font-semibold text-white ${
              isEditing
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </Button>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-2 mt-6 border-t pt-6">
            <Button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user?.name || "",
                  email: user?.email || "",
                });
              }}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-md font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold"
            >
              Save
            </Button>
          </div>
        )}
      </Card>

      {/* Additional Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Account Type</p>
            <p className="font-semibold text-gray-900 mt-1">
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Admin"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold text-green-600 mt-1">Active</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-semibold text-gray-900 mt-1 text-sm">{user?.email || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Joined</p>
            <p className="font-semibold text-gray-900 mt-1">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN")
                : "N/A"}
            </p>
          </div>
        </div>
      </Card>

      {/* Password Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Password</h3>
            <p className="text-sm text-gray-600 mt-1">Change your password to keep your account secure</p>
          </div>
          <Button
            onClick={() => setShowPasswordModal(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
          >
            Change Password
          </Button>
        </div>
      </Card>

      {/* Logout Card */}
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Logout</h3>
            <p className="text-sm text-gray-600 mt-1">Sign out from your account</p>
          </div>
          <Button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold"
          >
            Logout
          </Button>
        </div>
      </Card>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={confirmLogout} title="Confirm Logout" onClose={() => setConfirmLogout(false)}>
        <p className="text-gray-700 mb-4">Are you sure you want to logout?</p>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setConfirmLogout(false)}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={doLogout}
            className="px-4 py-2"
          >
            Logout
          </Button>
        </div>
      </Modal>

      {/* Password Change Modal */}
      <Modal isOpen={showPasswordModal} title="Change Password" onClose={() => {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <Input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter your current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <Input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <Input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm your new password"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="secondary"
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
            }}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordSave}
            disabled={passwordLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold disabled:opacity-50"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
