import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaCrown } from "react-icons/fa";
import { authApi } from "../../api/authApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import { Card } from "../../components/ui/Card.jsx";
import { Input } from "../../components/ui/Input.jsx";
import { Button } from "../../components/ui/Button.jsx";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isDev = import.meta?.env?.DEV;

  useEffect(() => {
    if (roleParam && !selectedRole) {
      handleRoleSelect(roleParam);
    }
  }, [roleParam, selectedRole]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);

    if (isDev) {
      if (role === "admin") {
        setEmail("admin@kiran-dairy.com");
        setPassword("admin123");
      } else if (role === "super-admin") {
        setEmail("swaroopjadhav6161@gmail.com");
        setPassword("Shree@45");
      } else {
        setPhone("Kiran-Dairy-Mumbai"); // Shop name as username
        setPassword("demo123");
      }
    }

    setError("");
  };

  const handleBackToRoleSelect = () => {
    setSelectedRole(null);
    setEmail("");
    setPhone("");
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({
        email: selectedRole === "admin" || selectedRole === "super-admin" ? email : undefined,
        phone: selectedRole === "shop" ? phone : undefined,
        password
      });

      const { token, user } = response.data.data;

      if (user.role !== selectedRole) {
        setError(
          `This account is not a ${selectedRole} account. Please use the correct credentials.`
        );
        toast.error(`Account role mismatch. Expected ${selectedRole}, got ${user.role}`);
        setLoading(false);
        return;
      }

      // Log the user data before storing (for debugging)
      console.log('Login successful. User data:', user);

      login(user, token);

      let dashboardRoute;
      if (selectedRole === "super-admin") {
        dashboardRoute = "/super-admin/dashboard";
      } else if (selectedRole === "admin") {
        dashboardRoute = "/admin/dashboard";
      } else {
        dashboardRoute = "/shop/dashboard";
      }

      toast.success(
        `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} login successful!`
      );
      navigate(dashboardRoute);
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Skip role selection if role from URL param
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Kiran Dairy
          </h1>
          <p className="text-center text-gray-600 mb-8">Choose your role to continue</p>

          <div className="space-y-3">
            <button
              onClick={() => handleRoleSelect("super-admin")}
              className="w-full text-center bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <FaCrown size={18} />
              <span>Login as Super Admin</span>
            </button>

            <button
              onClick={() => handleRoleSelect("admin")}
              className="w-full text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <span className="block">▲ Login as Admin</span>
            </button>

            <button
              onClick={() => handleRoleSelect("shop")}
              className="w-full text-center bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              <span className="block">Login as Shop</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/register")}
              className="text-sm text-gray-600 hover:underline"
            >
              Don't have an account? Create one
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Form View
  const getColorScheme = () => {
    if (selectedRole === "super-admin") return { text: "purple", bg: "bg-purple-50", button: "bg-purple-600 hover:bg-purple-700" };
    if (selectedRole === "admin") return { text: "blue", bg: "bg-blue-50", button: "bg-blue-600 hover:bg-blue-700" };
    return { text: "green", bg: "bg-green-50", button: "bg-green-600 hover:bg-green-700" };
  };

  const colors = getColorScheme();
  const textColor = colors.text;
  const bgColor = colors.bg;
  const buttonColor = colors.button;

  return (
    <div className={`flex items-center justify-center min-h-screen ${bgColor}`}>
      <Card
        className="w-96"
        title={`${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login`}
      >
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedRole === "admin" || selectedRole === "super-admin" ? (
            <Input
              label="Email"
              type="email"
              placeholder="your-email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          ) : (
            <Input
              label="Shop Name (Username)"
              type="text"
              placeholder="Enter shop name"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={loading}
            />
          )}

          <div className="space-y-2">
            <Input
              label="Password" 
              type={showPassword ? "text" : "password"}
              autoComplete={showPassword ? "off" : "current-password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={`text-xs text-${textColor}-600 hover:text-${textColor}-800 font-semibold`}
              disabled={loading}
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>

          <Button type="submit" disabled={loading} className={`w-full ${buttonColor}`}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>


        {roleParam && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full text-center py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
              disabled={loading}
            >
              ← Back to Landing
            </button>
          </div>
        )}
        {!roleParam && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full text-center py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
              disabled={loading}
            >
              ← Create new account
            </button>
          </div>
        )}
      </Card>
    </div>
  );
};