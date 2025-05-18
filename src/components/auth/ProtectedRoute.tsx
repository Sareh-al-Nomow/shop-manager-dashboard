
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state or nothing while checking authentication
  if (isLoading) {
    // You could return a loading spinner here if desired
    return null;
  }

  // Only redirect if not authenticated and loading is complete
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Prevent role_id = 4 users from accessing the dashboard
  if (user?.role_id === 4) {
    // You could redirect to a specific page for blocked users
    // or just back to login with a message
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
