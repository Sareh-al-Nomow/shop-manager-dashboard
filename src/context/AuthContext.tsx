
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services";

interface User {
  id: number;
  email: string;
  name: string;
  roles: string[];
  role_id: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; errorType?: string }>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    // Authentication check is complete
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; errorType?: string }> => {
    try {
      const data = await authService.login({ email, password });
      const userData = data.user;

      // Block users with role_id = 4 from logging in
      if (userData.role_id === 4) {
        console.error("Login blocked: User account is disabled");
        return { success: false, errorType: "account_blocked" };
      }

      // Save token and user data
      const authToken = data.token;

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      // Error is handled by the API interceptor for common cases
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const hasRole = (role: string): boolean => {
    if (!user) {
      return false;
    }

    // Role ID based permissions
    // role_id = 1: Admin - access to all pages
    // role_id = 2: Manager - access to half of the pages
    // role_id = 3: Show dashboard screen only
    // role_id = 4: Block login

    if (user.role_id === 1) {
      // Admin has access to everything
      return true;
    } else if (user.role_id === 2) {
      // Manager has access to half of the pages
      const managerRoles = ["product_manager", "order_manager", "customer_manager", "marketing_manager"];
      return managerRoles.includes(role);
    } else if (user.role_id === 3) {
      // Only has access to dashboard
      return role === "dashboard_access";
    } else {
      // role_id = 4 or any other value has no access
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, hasRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
