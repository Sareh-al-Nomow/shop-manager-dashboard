import api from './api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  brand_id?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductParams {
  categoryId?: number;
  brandId?: number;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Product service for handling product-related API calls
 */
const productService = {
  /**
   * Get products with optional filtering and pagination
   * @param params Optional parameters for filtering products
   * @returns Promise with products data
   */
  getProducts: async (params?: ProductParams) => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.categoryId) queryParams.append('categoryId', params.categoryId.toString());
      if (params.brandId) queryParams.append('brandId', params.brandId.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    const response = await api.get(endpoint);
    return response.data;
  },
  
  /**
   * Get a single product by ID
   * @param id Product ID
   * @returns Promise with product data
   */
  getProductById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  
  /**
   * Create a new product
   * @param productData Product data to create
   * @returns Promise with created product data
   */
  createProduct: async (productData: FormData) => {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  // Add other product-related API methods as needed
  // For example: updateProduct, deleteProduct, etc.
};

export default productService;