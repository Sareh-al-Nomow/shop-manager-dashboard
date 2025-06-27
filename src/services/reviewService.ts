import api, { 
  REVIEWS_ALL_ENDPOINT, 
  REVIEW_SINGLE_ENDPOINT, 
  REVIEW_STATUS_ENDPOINT, 
  REVIEW_RESPONSE_ENDPOINT, 
  REVIEW_DELETE_ENDPOINT 
} from './api';

export interface Review {
  review_id: number;
  uuid: string;
  product_id: number;
  customer_id: number;
  rating: number;
  title: string | null;
  review_text: string;
  status: string;
  is_verified_purchase: boolean;
  helpful_votes: number;
  not_helpful_votes: number;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  product: {
    description: {
      name: string;
    };
    product_id: number;
  };
  customer: {
    full_name: string;
    id: number;
    avatar: string | null;
  };
}

export interface ReviewParams {
  page?: number;
  limit?: number;
  status?: string;
  product_id?: number;
  customer_id?: number;
  rating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Review service for handling review-related API calls
 */
const reviewService = {
  /**
   * Get all reviews with optional filtering and pagination
   * @param params Optional parameters for filtering reviews
   * @returns Promise with reviews data
   */
  getAllReviews: async (params?: ReviewParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.product_id) queryParams.append('product_id', params.product_id.toString());
      if (params.customer_id) queryParams.append('customer_id', params.customer_id.toString());
      if (params.rating) queryParams.append('rating', params.rating.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${REVIEWS_ALL_ENDPOINT}?${queryString}` : REVIEWS_ALL_ENDPOINT;

    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Get a single review by ID
   * @param id Review ID
   * @returns Promise with review data
   */
  getReviewById: async (id: number) => {
    const response = await api.get(REVIEW_SINGLE_ENDPOINT(id));
    return response.data;
  },

  /**
   * Update review status
   * @param id Review ID
   * @param status New status value
   * @returns Promise with updated review data
   */
  updateReviewStatus: async (id: number, status: string) => {
    const response = await api.patch(REVIEW_STATUS_ENDPOINT(id), { status });
    return response.data;
  },

  /**
   * Add admin response to a review
   * @param id Review ID
   * @param responseText Admin response text
   * @returns Promise with updated review data
   */
  addAdminResponse: async (id: number, responseText: string) => {
    const response = await api.put(REVIEW_RESPONSE_ENDPOINT(id), { admin_response: responseText });
    return response.data;
  },

  /**
   * Delete a review
   * @param id Review ID
   * @returns Promise with deletion confirmation
   */
  deleteReview: async (id: number) => {
    const response = await api.delete(REVIEW_DELETE_ENDPOINT(id));
    return response.data;
  },
};

export default reviewService;
