// src/components/common/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { Skeleton } from "../ui/Skeleton.jsx";

/**
 * ProtectedRoute Component
 * Handles role-based access control and authentication checks
 * - Redirects unauthorized users silently (no console logs)
 * - Shows loading skeleton while auth state loads
 * - Supports role-based rendering
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  // Double-check token exists in localStorage (catches interceptor edge cases)
  const token = localStorage.getItem('token');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // If no token, always redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If no user data, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Validate user has required fields
  if (!user.role) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization - silently redirect without logging
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};