import api from './api';

export interface Coupon {
    coupon_id: number;
    uuid: string;
    status: boolean;
    description: string;
    discount_amount: number;
    free_shipping: boolean;
    discount_type: string;
    coupon: string;
    used_time: number;
    target_products: any;
    condition: any;
    user_condition: any;
    buyx_gety: any;
    max_uses_time_per_coupon: number;
    max_uses_time_per_customer: number;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

export interface CouponParams {
    page?: number;
    limit?: number;
    coupon?: string;
    status?: string;
}

export interface CouponResponse {
    data: Coupon[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Coupon service for handling coupon-related API calls
 */
const couponService = {
    /**
     * Get all coupons with optional filtering and pagination
     * @param params Optional parameters for filtering coupons
     * @returns Promise with coupons data
     */
    getAll: async (params?: CouponParams): Promise<CouponResponse> => {
        const queryParams = new URLSearchParams();

        if (params) {
            if (params.page !== undefined) queryParams.append('page', params.page.toString());
            if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
            if (params.coupon !== undefined) queryParams.append('coupon', params.coupon);
            if (params.status !== undefined) queryParams.append('status', params.status);
        }

        const queryString = queryParams.toString();
        const endpoint = queryString ? `/coupons?${queryString}` : '/coupons';

        const response = await api.get(endpoint);
        return response.data;
    },

    /**
     * Get coupon by ID
     * @param id Coupon ID
     * @returns Promise with coupon data
     */
    getById: async (id: number) => {
        const response = await api.get(`/coupons/${id}`);
        return response.data;
    },

    /**
     * Create a new coupon
     * @param couponData Coupon data
     * @returns Promise with created coupon data
     */
    create: async (couponData: Omit<Coupon, 'coupon_id' | 'uuid' | 'used_time' | 'created_at' | 'updated_at'>) => {
        const response = await api.post('/coupons', couponData);
        return response.data;
    },

    /**
     * Update an existing coupon
     * @param id Coupon ID
     * @param couponData Updated coupon data
     * @returns Promise with updated coupon data
     */
    update: async (id: number, couponData: Partial<Omit<Coupon, 'coupon_id' | 'uuid' | 'created_at' | 'updated_at'>>) => {
        const response = await api.put(`/coupons/${id}`, couponData);
        return response.data;
    },

    /**
     * Delete a coupon
     * @param id Coupon ID
     * @returns Promise with success status
     */
    delete: async (id: number) => {
        await api.delete(`/coupons/${id}`);
    }
};

export default couponService;
