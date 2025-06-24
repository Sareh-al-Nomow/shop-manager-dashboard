import React from "react";
import { useAuth } from "@/context/AuthContext";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: string;
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on whether the user has the required permission.
 * If the user doesn't have the required permission, it renders the fallback component (if provided) or nothing.
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requiredPermission, 
  fallback = null 
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;