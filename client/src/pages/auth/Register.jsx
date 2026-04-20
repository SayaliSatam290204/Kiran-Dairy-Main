import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../../api/authApi.js";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";

export const Register = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "", // used by admin if desired, but shops will use name as username
    password: "",
    // shop-specific fields
    location: "",
    ownerName: "",
    contactNo: "",
    address: "",
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      location: "",
      ownerName: "",
      contactNo: "",
      address: "",
      isActive: true
    });
  };

  const handleBackToRoleSelect = () => {
    setSelectedRole(null);
    setError("");
    setLoading(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      location: "",
      ownerName: "",
      contactNo: "",
      address: "",
      isActive: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      // prepare payload
      const payload = {
        role: selectedRole,
        name: formData.name || (selectedRole === "shop" ? formData.ownerName : ""),
        email: formData.email || undefined,
        phone: selectedRole === "admin" ? formData.phone : undefined,
        password: formData.password
      };

      if (selectedRole === "shop") {
        // include shop-specific fields for backend to create Shop doc
        payload.location = formData.location;
        payload.ownerName = formData.ownerName;
        payload.contactNo = formData.contactNo;
        payload.address = formData.address;
        payload.isActive = formData.isActive;
        // use shop name as phone/username for user creation
        payload.phone = formData.name; // shop name
      }

      await authApi.register(payload);
      toast.success("Registration successful, please login");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Role selection view
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Create Account
          </h1>
          <p className="text-center text-gray-600 mb-8">Choose your role</p>

          <div className="space-y-3">
            <button
              onClick={() => handleRoleSelect("admin")}
              className="w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <span className="block">Register as Admin</span>
            </button>

            <button
              onClick={() => handleRoleSelect("shop")}
              className="w-full text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              <span className="block">Register as Shop</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm text-gray-600 hover:underline"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Registration form view
  const textColor = selectedRole === "admin" ? "blue" : "green";
  const bgColor = selectedRole === "admin" ? "bg-blue-50" : "bg-green-50";
  const buttonColor =
    selectedRole === "admin"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-green-600 hover:bg-green-700";

  return (
    <div className={`flex items-center justify-center min-h-screen ${bgColor}`}>
      <Card
        className="w-96"
        title={`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Registration`}
      >
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedRole === "admin" ? (
            <>
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </>
          ) : (
            <>
              <Input
                label="Shop Name (Username)"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                label="Owner Name"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                label="Contact Number"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={loading}
                />
                <label className="text-sm text-gray-700">Shop is Active</label>
              </div>
            </>
          )}

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <Button type="submit" disabled={loading} className={`w-full ${buttonColor}`}>
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-300 space-y-3">
          <button
            type="button"
            onClick={handleBackToRoleSelect}
            className="w-full text-center py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
            disabled={loading}
          >
            ← Back to role selection
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-center py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
            disabled={loading}
          >
            ← Back to login
          </button>
        </div>
      </Card>
    </div>
  );
};
