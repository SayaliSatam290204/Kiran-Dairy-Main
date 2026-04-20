import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { authApi } from "../../api/authApi.js";

export const SetupRedirect = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // ✅ Wait for AuthContext to finish initialization

    const run = async () => {
      try {
        // ✅ AuthContext has finished loading - check if we have a user
        if (user && user.id && user.role) {
          // Valid user exists in context - route based on role
          if (user.role === 'admin') {
            navigate("/admin/dashboard", { replace: true });
          } else if (user.role === 'shop') {
            navigate("/shop/dashboard", { replace: true });
          } else {
            // Unknown role
            navigate("/login", { replace: true });
          }
          return;
        }

        // ✅ No user in context - send to login
        navigate("/login", { replace: true });
      } catch (err) {
        // fallback - go to login
        navigate("/login", { replace: true });
      }
    };

    run();
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white border rounded-xl p-8 text-center max-w-md w-full">
        <h2 className="text-lg font-bold mb-2">Loading...</h2>
        <p className="text-gray-600">Checking setup status</p>
      </div>
    </div>
  );
};