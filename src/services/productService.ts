import api from './api';

export interface ProductAttribute {
  product_attribute_value_index_id: number;
  product_id: number;
  attribute_id: number;
  option_id: number;
  option_text: string;
  created_at: string;
  updated_at: string;
  attribute: {
    attribute_id: number;
    uuid: string;
    attribute_code: string;
    attribute_name: string;
    type: string;
    is_required: boolean;
    display_on_frontend: boolean;
    sort_order: number;
    is_filterable: boolean;
    created_at: string;
    updated_at: string;
  };
  option: {
    attribute_option_id: number;
    uuid: string;
    attribute_id: number;
    attribute_code: string;
    option_text: string;
    created_at: string;
    updated_at: string;
  };
}

export interface ProductReview {
  rating: number;
}

export interface Product {
  product_id: number;
  uuid: string;
  type: string;
  variant_group_id: number;
  visibility: boolean;
  group_id: number;
  sku: string;
  price: number;
  old_price: number | null;
  weight: number;
  tax_class: number;
  status: boolean;
  is_digital?: boolean;
  created_at: string;
  updated_at: string;
  category_id: number;
  brand_id: number;
  description: {
    product_description_id: number;
    product_description_product_id: number;
    name: string;
    description: string;
    short_description: string;
    url_key: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    created_at: string;
    updated_at: string;
  };
  images: {
    product_image_id: number;
    product_image_product_id: number;
    origin_image: string;
    thumb_image: string;
    listing_image: string;
    single_image: string;
    is_main: boolean;
    created_at: string;
    updated_at: string;
  }[];
  inventory: {
    product_inventory_id: number;
    product_inventory_product_id: number;
    qty: number;
    manage_stock: boolean;
    stock_availability: boolean;
    created_at: string;
    updated_at: string;
  };
  category: {
    id: number;
    uuid: string;
    status: boolean;
    parent_id: number;
    include_in_nav: boolean;
    position: number;
    show_products: boolean;
    created_at: string;
    updated_at: string;
    description: {
      category_description_id: number;
      category_description_category_id: number;
      name: string;
      short_description: string;
      description: string;
      image: string;
      meta_title: string;
      meta_keywords: string;
      meta_description: string;
      url_key: string;
      created_at: string;
      updated_at: string;
    };
  };
  brand: {
    id: number;
    name: string;
    slug: string;
    image: string;
    description: string;
    isActive: boolean;
    created_at: string;
    updated_at: string;
  };
  attributes: ProductAttribute[];
  reviews: ProductReview[];
  meanRating: number;
}

export interface ProductParams {
  categoryId?: number;
  brandId?: number;
  page?: number;
  limit?: number;
  name?: string;
  sku?: string;
  visibility?: boolean;
  status?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductCreateData {
  type?: string;
  variant_group_id?: number;
  visibility?: boolean;
  group_id?: number;
  sku?: string;
  price?: number;
  old_price?: number;
  weight?: number;
  tax_class?: number;
  status?: boolean;
  is_digital?: boolean;
  category_id?: number;
  brand_id?: number;
  description?: {
    name?: string;
    description?: string;
    short_description?: string;
    url_key?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  };
  inventory?: {
    qty?: number;
    manage_stock?: boolean;
    stock_availability?: boolean;
  };
}

export interface ProductImageData {
  product_image_product_id: number;
  images: {
    origin_image: string;
    thumb_image?: string;
    listing_image?: string;
    single_image?: string;
    is_main?: boolean;
  }[];
}

export interface ProductAttributeData {
  product_id: number;
  attribute_id: number;
  option_id?: number;
  option_text?: string;
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
      if (params.name) queryParams.append('name', params.name);
      if (params.sku) queryParams.append('sku', params.sku);
      if (params.visibility !== undefined) queryParams.append('visibility', params.visibility.toString());
      if (params.status !== undefined) queryParams.append('status', params.status.toString());
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
    // The API now returns { data: [product], total, page, limit, totalPages }
    // We extract the first product from the data array
    return response.data.data && response.data.data.length > 0 
      ? response.data.data[0] 
      : null;
  },

  /**
   * Create a new product
   * @param productData Product data to create
   * @returns Promise with created product data
   */
  createProduct: async (productData: ProductCreateData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  /**
   * Save product images
   * @param imageData Product image data
   * @returns Promise with saved image data
   */
  saveProductImages: async (imageData: ProductImageData) => {
    const formData = new FormData();

    // Add product ID
    formData.append('product_image_product_id', imageData.product_image_product_id.toString());

    // Add images
    imageData.images.forEach((image) => {
      // Convert base64 to blob
      const base64Response = image.origin_image.split(',')[1];
      const byteCharacters = atob(base64Response);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Append to form data - use 'images' as the key for all images
      formData.append('images', blob);
    });

    const response = await api.post('/product-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Save product attribute
   * @param attributeData Product attribute data
   * @returns Promise with saved attribute data
   */
  saveProductAttribute: async (attributeData: ProductAttributeData) => {
    const response = await api.post('/product-attributes', attributeData);
    return response.data;
  },

  /**
   * Save multiple product attributes
   * @param attributesData Array of product attribute data
   * @returns Promise with array of responses
   */
  saveProductAttributes: async (attributesData: ProductAttributeData[]) => {
    const promises = attributesData.map(data => 
      api.post('/product-attributes', data)
    );
    return Promise.all(promises);
  },

  // Add other product-related API methods as needed
  // For example: updateProduct, deleteProduct, etc.

  /**
   * Update an existing product
   * @param id Product ID to update
   * @param productData Product data to update
   * @returns Promise with updated product data
   */
  updateProduct: async (id: number, productData: ProductCreateData) => {
    const response = await api.put(`/products/${id}`, { ...productData });
    return response.data;
  },
};

export default productService;
