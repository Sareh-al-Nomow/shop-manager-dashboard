import api from './api';

export interface CollectionTranslation {
  description: string;
  name: string;
  lang_code: string;
}

export interface ProductImage {
  origin_image: string;
}

export interface ProductDescription {
  name: string;
  description: string;
  short_description: string;
}

export interface Product {
  price: number;
  old_price: number | null;
  sku: string;
  category_id: number;
  brand_id: number;
  description: ProductDescription;
  images: ProductImage[];
  translations: any[];
}

export interface ProductCollection {
  product_collection_id: number;
  collection_id: number;
  product_id: number;
  product: Product;
}

export interface Collection {
  collection_id: number;
  uuid: string;
  name: string;
  description: string;
  image: string;
  code: string;
  type?: "section" | "banner";
  created_at: string;
  updated_at: string;
  translations: CollectionTranslation[];
  products: ProductCollection[];
}

export interface CreateCollectionData {
  name: string;
  description?: string | null;
  image?: string | null;
  code: string;
  type?: "section" | "banner";
  translations?: CollectionTranslation[];
}

export interface CollectionTranslationData {
  lang_code: string;
  name: string;
  description?: string | null;
}

export interface CollectionParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Collection service for handling collection-related API calls
 */
const collectionService = {
  /**
   * Get all collections with optional filtering
   * @param params Optional parameters for filtering collections
   * @returns Promise with collections data
   */
  getCollections: async (params?: CollectionParams) => {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.search !== undefined) queryParams.append('search', params.search);
      if (params.sortBy !== undefined) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder !== undefined) queryParams.append('sortOrder', params.sortOrder);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/collections?${queryString}` : '/collections';

    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Get a collection by ID
   * @param id Collection ID to retrieve
   * @returns Promise with collection data
   */
  getCollectionById: async (id: number) => {
    const response = await api.get(`/collections/${id}`);
    return response.data;
  },

  /**
   * Create a new collection
   * @param collectionData Collection data to create
   * @returns Promise with created collection data
   */
  createCollection: async (collectionData: CreateCollectionData) => {
    const response = await api.post('/collections', collectionData);
    return response.data;
  },

  /**
   * Upload an image for a collection
   * @param imageFile Image file to upload
   * @returns Promise with uploaded image data
   */
  uploadCollectionImage: async (imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post('/collections/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Add a translation to a collection
   * @param collectionId Collection ID to add translation to
   * @param translationData Translation data to add
   * @returns Promise with added translation data
   */
  addCollectionTranslation: async (collectionId: number, translationData: CollectionTranslationData) => {
    const response = await api.post(`/collections/${collectionId}/translations`, translationData);
    return response.data;
  },

  /**
   * Update an existing collection
   * @param id Collection ID to update
   * @param collectionData Collection data to update
   * @returns Promise with updated collection data
   */
  updateCollection: async (id: number, collectionData: {
    name?: string;
    description?: string | null;
    image?: string | null;
    code?: string;
    type?: "section" | "banner";
  }) => {
    const response = await api.put(`/collections/${id}`, collectionData);
    return response.data;
  },

  /**
   * Update a collection translation
   * @param id Collection ID to update translation for
   * @param translationData Translation data to update
   * @returns Promise with updated translation data
   */
  updateCollectionTranslation: async (id: number, translationData: {
    name: string;
    description?: string | null;
    lang_code: string;
  }) => {
    const response = await api.put(`/collections/translations/${id}`, translationData);
    return response.data;
  },

  /**
   * Delete a collection by ID
   * @param id Collection ID to delete
   * @returns Promise with deletion result
   */
  deleteCollection: async (id: number) => {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
  },

  /**
   * Add products to a collection
   * @param collectionId Collection ID to add products to
   * @param productIds Array of product IDs to add
   * @returns Promise with the result
   */
  addProductsToCollection: async (collectionId: number, productIds: number[]) => {
    const response = await api.post(`/collections/${collectionId}/products/batch`, {
      product_ids: productIds
    });
    return response.data;
  },

  /**
   * Remove products from a collection
   * @param collectionId Collection ID to remove products from
   * @param productIds Array of product IDs to remove
   * @returns Promise with the result
   */
  removeProductsFromCollection: async (collectionId: number, productIds: number[]) => {
    const response = await api.delete(`/collections/${collectionId}/products/batch`, {
      data: {
        product_ids: productIds
      }
    });
    return response.data;
  },

  /**
   * Get collections that include a specific product
   * @param productId Product ID to find collections for
   * @returns Promise with collections data
   */
  getCollectionsByProductId: async (productId: number) => {
    const response = await api.get(`/collections/product/${productId}`);
    return response.data;
  },
};

export default collectionService;
