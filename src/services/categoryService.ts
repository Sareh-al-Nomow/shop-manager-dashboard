import api, { 
  CATEGORIES_ENDPOINT, 
  CATEGORY_BY_ID_ENDPOINT, 
  CATEGORIES_SHORTS_ENDPOINT 
} from './api';

export interface Category {
  id: number;
  parent_id: number | null;
  image_url?: string;
  created_at: string;
  updated_at: string;
  status?: boolean;
  include_in_nav?: boolean;
  show_products?: boolean;
  position?: number;
  description?: {
    name?: string;
    short_description?: string;
    description?: string;
    meta_title?: string;
    image?:string;
    meta_keywords?: string;
    meta_description?: string;
    url_key?: string;
  };
}


export interface CategoryUpdateData {
  status?: boolean;
  include_in_nav?: boolean;
  show_products?: boolean;
  parent_id?: number | null | string;
  position?: number;
  description?: {
    name?: string;
    short_description?: string;
    description?: string;
    meta_title?: string;
    image?:string;
    meta_keywords?: string;
    meta_description?: string;
    url_key?: string;
  };
}

export interface CategoryParams {
  parentId?: number | null;
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Category service for handling category-related API calls
 */
const categoryService = {
  /**
   * Get all categories with optional filtering
   * @param params Optional parameters for filtering categories
   * @returns Promise with categories data
   */
  getCategories: async (params?: CategoryParams) => {
    const queryParams = new URLSearchParams();


    if (params) {
      if (params.parentId !== undefined) {
        if (params.parentId === null) {
           queryParams.append('parentId', 'null');
        } else {
          queryParams.append('parentId', params.parentId.toString());
        }
      }


      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.search !== undefined) queryParams.append('search', params.search);
      if (params.status !== undefined) queryParams.append('status', params.status.toString());
      if (params.sortBy !== undefined) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder !== undefined) queryParams.append('sortOrder', params.sortOrder);
    }

    const queryString = queryParams.toString()

    const endpoint = queryString ? `${CATEGORIES_ENDPOINT}?${queryString}` : CATEGORIES_ENDPOINT;

    const response = await api.get(endpoint);
    return response.data;
  },

  getCategoriesShorts: async () => {
    const response = await api.get(CATEGORIES_SHORTS_ENDPOINT);
    return response.data;
  },

  /**
   * Get root categories (parentId = null)
   * @returns Promise with root categories data
   */
  getRootCategories: async () => {
    const queryParams = new URLSearchParams();
    queryParams.append('parentId', 'null');
    queryParams.append('limit', '10');

    const response = await api.get(`${CATEGORIES_ENDPOINT}?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Create a new category
   * @param categoryData Category data to create
   * @returns Promise with created category data
   */
  createCategory: async (categoryData: CategoryUpdateData) => {
    const response = await api.post(CATEGORIES_ENDPOINT, categoryData);
    return response.data;
  },

  /**
   * Update an existing category
   * @param id Category ID to update
   * @param categoryData Category data to update
   * @returns Promise with updated category data
   */
  updateCategory: async (id: number, categoryData: CategoryUpdateData) => {
    const response = await api.put(CATEGORY_BY_ID_ENDPOINT(id), categoryData);
    return response.data;
  },

  /**
   * Get a category by ID
   * @param id Category ID to retrieve
   * @returns Promise with category data
   */
  getCategoryById: async (id: number) => {
    const response = await api.get(CATEGORY_BY_ID_ENDPOINT(id));
    console.log(response.data);
    return response.data;
  },

  /**
   * Delete a category by ID
   * @param id Category ID to delete
   * @returns Promise with deletion result
   */
  deleteCategory: async (id: number) => {
    const response = await api.delete(CATEGORY_BY_ID_ENDPOINT(id));
    return response.data;
  },

  // Add other category-related API methods as needed
};

export default categoryService;
