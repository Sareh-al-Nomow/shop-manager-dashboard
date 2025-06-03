import api from './api';

export interface User {
  id: number;
  uuid: string;
  email: string;
  phone_number: string;
  password: string;
  googleId: string | null;
  facebookId: string | null;
  birthday: string | null;
  otp: string | null;
  provider: string;
  avatar: string | null;
  full_name: string;
  resetToken: string | null;
  resetTokenExpires: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_banned: boolean;
  is_terms_accepted: boolean;
  is_privacy_policy_accepted: boolean;
  is_newsletter_accepted: boolean;
  group_id: number;
  role_id: number;
  created_at: string;
  updated_at: string;
  Cart: any[];
  role: {
    id: number;
    uuid: string;
    role_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  group: {
    id: number;
    uuid: string;
    group_name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  Order: any[];
}

export interface UserParams {
  page?: number;
  limit?: number;
  email?: string;
  isActive?: boolean;
  role?: number;
}

/**
 * User service for handling user-related API calls
 */
const userService = {
  /**
   * Get users with optional filtering
   * @param params Optional parameters for filtering users
   * @returns Promise with users data
   */
  getUsers: async (params?: UserParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.email !== undefined) queryParams.append('email', params.email);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params.role !== undefined) queryParams.append('role', params.role.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/user?${queryString}` : '/user';

    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Get a user by ID
   * @param id User ID to retrieve
   * @returns Promise with user data
   */
  getUserById: async (id: number) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
  },

  // Add other user-related API methods as needed
};

export default userService;