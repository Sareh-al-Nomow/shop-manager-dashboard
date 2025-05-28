import api from './api';

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

  // Add other auth-related API methods here as needed
  // For example: register, forgotPassword, resetPassword, etc.
};

export default authService;