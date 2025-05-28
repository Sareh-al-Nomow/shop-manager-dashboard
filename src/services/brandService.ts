import api from './api';

export interface Brand {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandUpdateData {
  name?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  slug?: string;

}

export interface BrandParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean | 'all';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Brand service for handling brand-related API calls
 */
const brandService = {
  /**
   * Get all brands with optional filtering
   * @param params Optional parameters for filtering brands
   * @returns Promise with brands data
   */
  getBrands: async (params?: BrandParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.search !== undefined) queryParams.append('search', params.search);
      if (params.isActive !== undefined && params.isActive !== 'all') queryParams.append('isActive', params.isActive.toString());
      if (params.sortBy !== undefined) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder !== undefined) queryParams.append('sortOrder', params.sortOrder);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/brands?${queryString}` : '/brands';

    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Get a brand by ID
   * @param id Brand ID to retrieve
   * @returns Promise with brand data
   */
  getBrandById: async (id: number) => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },

  /**
   * Create a new brand
   * @param brandData Brand data to create
   * @returns Promise with created brand data
   */
  createBrand: async (brandData: BrandUpdateData) => {
    const response = await api.post('/brands', brandData);
    return response.data;
  },

  /**
   * Update an existing brand
   * @param id Brand ID to update
   * @param brandData Brand data to update
   * @returns Promise with updated brand data
   */
  updateBrand: async (id: number, brandData: BrandUpdateData) => {
    const response = await api.put(`/brands/${id}`, brandData);
    return response.data;
  },

  /**
   * Delete a brand by ID
   * @param id Brand ID to delete
   * @returns Promise with deletion result
   */
  deleteBrand: async (id: number) => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  },
};

export default brandService;
