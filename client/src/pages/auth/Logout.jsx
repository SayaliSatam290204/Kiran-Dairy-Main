import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

export const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Perform logout
    logout();
    
    // Redirect to landing page
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 500);

    return () => clearTimeout(timer);
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white border rounded-xl p-8 text-center max-w-md w-full">
        <h2 className="text-lg font-bold mb-2">Logging out...</h2>
        <p className="text-gray-600">Redirecting to landing page</p>
      </div>
    </div>
  );
};
