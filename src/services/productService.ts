import api, { 
  PRODUCTS_ENDPOINT, 
  PRODUCT_BY_ID_ENDPOINT, 
  PRODUCT_IMAGES_ENDPOINT, 
  PRODUCT_IMAGE_BY_ID_ENDPOINT, 
  PRODUCT_ATTRIBUTES_ENDPOINT, 
  PRODUCT_ATTRIBUTE_BY_ID_ENDPOINT, 
  PRODUCT_UPLOAD_IMAGES_ENDPOINT,
  VARIANT_GROUPS_ENDPOINT,
  VARIANT_GROUP_BY_ID_ENDPOINT,
  VARIANT_GROUP_VARIANTS_ENDPOINT
} from './api';

export interface ProductAttribute {
  product_attribute_value_index_id: number;
  product_id: number;
  attribute_id: number;
  option_id: number;
  option_text: string;
  attribute_text: string;
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
  attribute_text?: string;
}


export interface VariantGroupCreateData {
  attribute_group_id: number;
  attribute_one?: number;
  attribute_two?: number;
  attribute_three?: number;
  attribute_four?: number;
  attribute_five?: number;
  visibility?: boolean;
  product_ids?: number[];
}

export interface VariantGroup {
  variant_group_id: number;
  uuid: string;
  attribute_group_id: number;
  attribute_one: number | null;
  attribute_two: number | null;
  attribute_three: number | null;
  attribute_four: number | null;
  attribute_five: number | null;
  visibility: boolean;
  created_at: string;
  updated_at: string;
  attribute_group: {
    attribute_group_id: number;
    uuid: string;
    group_name: string;
    created_at: string;
    updated_at: string;
  };
  products: Product[];
}

export interface VariantData {
  product_id: number;
  sku: string;
  qty: number;
  status: boolean;
  visibility: boolean;
  images: {
    origin_image: string;
    thumb_image?: string | null;
    listing_image?: string | null;
    single_image?: string | null;
    is_main: boolean;
  }[];
  attributeValues: {
    attribute_id: number;
    option_id: number;
  }[];
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
    const endpoint = queryString ? `${PRODUCTS_ENDPOINT}?${queryString}` : PRODUCTS_ENDPOINT;

    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Get a single product by ID
   * @param id Product ID
   * @returns Promise with product data
   */
  getProductById: async (id: number) => {
    const response = await api.get(PRODUCT_BY_ID_ENDPOINT(id));
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
    const response = await api.post(PRODUCTS_ENDPOINT, productData);
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
      try {
        // Check if the image is a data URL
        if (!image.origin_image || !image.origin_image.includes(',')) {
          console.error('Invalid image format: Not a data URL');
          return; // Skip this image
        }

        // Convert base64 to blob
        const base64Response = image.origin_image.split(',')[1];

        // Clean the base64 string to remove any invalid characters
        // Replace any characters that are not valid in a base64 string
        const cleanedBase64 = base64Response.replace(/[^A-Za-z0-9+/=]/g, '');

        // Decode the cleaned base64 string
        const byteCharacters = atob(cleanedBase64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });

        // Append to form data - use 'images' as the key for all images
        formData.append('images', blob);
      } catch (error) {
        console.error('Error processing image:', error);
        // Continue with other images even if one fails
      }
    });

    const response = await api.post(PRODUCT_IMAGES_ENDPOINT, formData, {
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
    const response = await api.post(PRODUCT_ATTRIBUTES_ENDPOINT, attributeData);
    return response.data;
  },

  /**
   * Save multiple product attributes
   * @param attributesData Array of product attribute data
   * @returns Promise with array of responses
   */
  saveProductAttributes: async (attributesData: ProductAttributeData[]) => {
    const promises = attributesData.map(data => 
      api.post(PRODUCT_ATTRIBUTES_ENDPOINT, data)
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
    const response = await api.put(PRODUCT_BY_ID_ENDPOINT(id), productData);
    // The API returns { data: [product], total, page, limit, totalPages }
    // We extract the first product from the data array
    return response.data.data && response.data.data.length > 0 
      ? response.data.data[0] 
      : null;
  },

  /**
   * Create a variant group for a product
   * @param variantGroupData Data for creating a variant group
   * @returns Promise with created variant group data
   */
  createVariantGroup: async (variantGroupData: VariantGroupCreateData) => {
    const response = await api.post(VARIANT_GROUPS_ENDPOINT, variantGroupData);
    return response.data;
  },

  /**
   * Add a variant to a variant group
   * @param variantGroupId Variant group ID
   * @param variantData Data for creating a variant
   * @returns Promise with created variant data
   */
  createVariant: async (variantGroupId: number, variantData: VariantData) => {
    const response = await api.post(VARIANT_GROUP_VARIANTS_ENDPOINT(variantGroupId), variantData);
    return response.data;
  },

  /**
   * Get a variant group by ID
   * @param id Variant group ID
   * @returns Promise with variant group data
   */
  getVariantGroupById: async (id: number): Promise<VariantGroup | null> => {
    try {
      const response = await api.get(VARIANT_GROUP_BY_ID_ENDPOINT(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching variant group:', error);
      return null;
    }
  },

  /**
   * Upload product images to Hetzner Object Storage
   * @param productId Product ID
   * @param images Array of image files
   * @returns Promise with uploaded image data
   */
  uploadProductImages: async (productId: number, images: File[]) => {
    const formData = new FormData();
    formData.append('product_image_product_id', productId.toString());

    // Add images to form data
    images.forEach(image => {
      formData.append('images', image);
    });

    const response = await api.post(PRODUCT_UPLOAD_IMAGES_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Delete a product image by ID
   * @param id Product image ID
   * @returns Promise with success message
   */
  deleteProductImage: async (id: number) => {
    const response = await api.delete(PRODUCT_IMAGE_BY_ID_ENDPOINT(id));
    return response.data;
  },

  /**
   * Update a product attribute
   * @param id Product attribute ID
   * @param attributeData Product attribute data to update
   * @returns Promise with updated attribute data
   */
  updateProductAttribute: async (id: number, attributeData: Partial<ProductAttributeData>) => {
    const response = await api.put(PRODUCT_ATTRIBUTE_BY_ID_ENDPOINT(id), attributeData);
    return response.data;
  },
};

export default productService;
