import api from './api';
import permissionService, { Permission, RolePermission } from './permissionService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    roles: string[];
    role_id: number;
  };
}

/**
 * Authentication service for handling login and other auth-related API calls
 */
const authService = {
  /**
   * Login user with email and password
   * @param credentials User credentials (email and password)
   * @returns Promise with login response data
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get permissions for a user based on their role_id
   * @param roleId The role ID of the user
   * @returns Promise with user permissions data
   */
  getUserPermissions: async (roleId: number): Promise<RolePermission[]> => {
    return permissionService.getRolePermissions(roleId);
  },

  // Add other auth-related API methods here as needed
  // For example: register, forgotPassword, resetPassword, etc.
};

export default authService;
