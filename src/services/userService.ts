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
  full_name: string | "";
  address: string | null;
  isActive: boolean;
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
  Cart: {
    cart_id: number;
    uuid: string;
    sid: string | null;
    currency: string | null;
    customer_id: number;
    customer_group_id: number | null;
    customer_email: string;
    customer_full_name: string;
    user_ip: string | null;
    status: boolean;
    coupon: string | null;
    shipping_fee_excl_tax: number | null;
    shipping_fee_incl_tax: number | null;
    discount_amount: number | null;
    sub_total: number;
    sub_total_incl_tax: number;
    sub_total_with_discount: number;
    sub_total_with_discount_incl_tax: number;
    total_qty: number;
    total_weight: number | null;
    tax_amount: number;
    tax_amount_before_discount: number;
    shipping_tax_amount: number;
    grand_total: number;
    shipping_method: string | null;
    shipping_method_name: string | null;
    shipping_zone_id: number | null;
    shipping_address_id: number | null;
    payment_method: string | null;
    payment_method_name: string | null;
    billing_address_id: number | null;
    shipping_note: string | null;
    created_at: string;
    updated_at: string;
    total_tax_amount: number;
    user_id: number;
  }[];
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
  Order: {
    order_id: number;
    uuid: string;
    integration_order_id: string | null;
    sid: string | null;
    order_number: string;
    status: string;
    cart_id: number;
    currency: string;
    customer_id: number;
    customer_email: string;
    customer_full_name: string;
    user_ip: string | null;
    user_agent: string | null;
    coupon: string | null;
    shipping_fee_excl_tax: number;
    shipping_fee_incl_tax: number;
    discount_amount: number | null;
    sub_total: number;
    sub_total_incl_tax: number;
    sub_total_with_discount: number;
    sub_total_with_discount_incl_tax: number;
    total_qty: number;
    total_weight: number;
    tax_amount: number;
    tax_amount_before_discount: number;
    shipping_tax_amount: number;
    shipping_note: string | null;
    grand_total: number;
    shipping_method: string;
    shipping_method_name: string;
    shipping_address_id: number;
    payment_method: string;
    payment_method_name: string;
    billing_address_id: number;
    shipment_status: string | null;
    payment_status: string;
    created_at: string;
    updated_at: string;
    total_tax_amount: number;
  }[];
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
