import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'https://api.sareh-nomow.xyz/api';

// API Endpoints
// Product endpoints
const PRODUCTS_ENDPOINT = '/products';
const PRODUCT_BY_ID_ENDPOINT = (id: number) => `/products/${id}`;
const PRODUCT_IMAGES_ENDPOINT = '/product-images';
const PRODUCT_IMAGE_BY_ID_ENDPOINT = (id: number) => `/product-images/${id}`;
const PRODUCT_ATTRIBUTES_ENDPOINT = '/product-attributes';
const PRODUCT_ATTRIBUTE_BY_ID_ENDPOINT = (id: number) => `/product-attributes/${id}`;
const PRODUCT_UPLOAD_IMAGES_ENDPOINT = '/products/product-images/';

// Variant endpoints
const VARIANT_GROUPS_ENDPOINT = '/variant-groups';
const VARIANT_GROUP_BY_ID_ENDPOINT = (id: number) => `/variant-groups/${id}`;
const VARIANT_GROUP_VARIANTS_ENDPOINT = (variantGroupId: number) => `/variant-groups/${variantGroupId}/variants`;

// Role endpoints
const ROLES_ENDPOINT = '/roles';
const ROLE_BY_ID_ENDPOINT = (id: number) => `/roles/${id}`;

// Permission endpoints
const PERMISSIONS_ENDPOINT = '/permissions';
const PERMISSIONS_BY_SERVICE_ENDPOINT = (service: string) => `/permissions/service/${service}`;
const ROLE_PERMISSIONS_ENDPOINT = (roleId: number) => `/role-permissions/role/${roleId}`;
const ROLE_PERMISSIONS_BATCH_ENDPOINT = (roleId: number) => `/role-permissions/role/${roleId}/batch`;
const ROLE_PERMISSION_BY_ID_ENDPOINT = (roleId: number, permissionId: number) => `/role-permissions/role/${roleId}/permission/${permissionId}`;

// Group endpoints
const GROUPS_ENDPOINT = '/groups';
const GROUP_BY_ID_ENDPOINT = (id: number) => `/groups/${id}`;

// Auth endpoints
const AUTH_LOGIN_ENDPOINT = '/auth/login';

// Brand endpoints
const BRANDS_ENDPOINT = '/brands';
const BRAND_BY_ID_ENDPOINT = (id: number) => `/brands/${id}`;
const BRANDS_SHORTS_ENDPOINT = '/brands/shorts';

// Attribute endpoints
const ATTRIBUTES_ENDPOINT = '/attributes';
const ATTRIBUTE_BY_ID_ENDPOINT = (id: number) => `/attributes/${id}`;
const ATTRIBUTE_GROUPS_ENDPOINT = '/attribute-groups';
const ATTRIBUTE_OPTIONS_ENDPOINT = '/attribute-options';
const ATTRIBUTE_GROUP_LINKS_ENDPOINT = '/attribute-group-links';

// Category endpoints
const CATEGORIES_ENDPOINT = '/categories';
const CATEGORY_BY_ID_ENDPOINT = (id: number) => `/categories/${id}`;
const CATEGORIES_SHORTS_ENDPOINT = '/categories/shorts';

// Category Translation endpoints
const CATEGORY_TRANSLATION_ENDPOINT = '/categoryTranslation';
const CATEGORY_TRANSLATION_BY_ID_ENDPOINT = (id: number) => `/categoryTranslation/${id}`;
const CATEGORY_TRANSLATION_BY_CATEGORY_ENDPOINT = (categoryId: number) => `/categoryTranslation/category/${categoryId}`;
const CATEGORY_TRANSLATION_BY_LANG_ENDPOINT = (categoryId: number, langCode: string) => `/categoryTranslation/category/${categoryId}/lang/${langCode}`;

// Collection endpoints
const COLLECTIONS_ENDPOINT = '/collections';
const COLLECTION_BY_ID_ENDPOINT = (id: number) => `/collections/${id}`;
const COLLECTION_UPLOAD_IMAGE_ENDPOINT = '/collections/upload-image';
const COLLECTION_TRANSLATIONS_ENDPOINT = (collectionId: number) => `/collections/${collectionId}/translations`;
const COLLECTION_TRANSLATION_BY_ID_ENDPOINT = (id: number) => `/collections/translations/${id}`;
const COLLECTION_PRODUCTS_BATCH_ENDPOINT = (collectionId: number) => `/collections/${collectionId}/products/batch`;
const COLLECTION_DELETE_PRODUCTS_BATCH_ENDPOINT = (collectionId: number) => `/collections/delete/${collectionId}/products/batch`;
const COLLECTIONS_BY_PRODUCT_ENDPOINT = (productId: number) => `/collections/product/${productId}`;

// Review endpoints
const REVIEWS_ALL_ENDPOINT = '/reviews/all';
const REVIEW_SINGLE_ENDPOINT = (id: number) => `/reviews/single/${id}`;
const REVIEW_STATUS_ENDPOINT = (id: number) => `/reviews/${id}/status`;
const REVIEW_RESPONSE_ENDPOINT = (id: number) => `/reviews/${id}/response`;
const REVIEW_DELETE_ENDPOINT = (id: number) => `/reviews/${id}`;

// Coupon endpoints
const COUPONS_ENDPOINT = '/coupons';
const COUPON_BY_ID_ENDPOINT = (id: number) => `/coupons/${id}`;

// Image upload endpoints
const CATEGORY_UPLOAD_IMAGE_ENDPOINT = '/categories/upload-image';
const BRAND_UPLOAD_IMAGE_ENDPOINT = '/brands/upload-image';

// Tax class endpoints
const TAX_CLASSES_ENDPOINT = '/tax-classes';
const TAX_CLASS_BY_ID_ENDPOINT = (id: number) => `/tax-classes/${id}`;

// Language endpoints
const LANGUAGES_ENDPOINT = '/languages';

// Location endpoints
const COUNTRIES_ENDPOINT = '/countries';
const COUNTRY_BY_ID_ENDPOINT = (id: number) => `/countries/${id}`;
const COUNTRY_CITIES_ENDPOINT = (countryId: number) => `/countries/${countryId}/cities`;

// Settings endpoints
const SETTINGS_ENDPOINT = '/settings';
const SETTINGS_STORE_ENDPOINT = '/settings/store';

// User endpoints
const USER_ENDPOINT = '/user';
const USER_BY_ID_ENDPOINT = (id: number) => `/user/${id}`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, etc.)
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Extract error message from response if available
    if (error.response && error.response.data) {
      // If the error response has a message property, use it
      if (error.response.data.message) {
        error.message = error.response.data.message;
      } 
      // If the error response has an error property, use it
      else if (error.response.data.error) {
        error.message = error.response.data.error;
      }
      // If the error response is a string, use it directly
      else if (typeof error.response.data === 'string') {
        error.message = error.response.data;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { 
  API_BASE_URL,
  // Product endpoints
  PRODUCTS_ENDPOINT,
  PRODUCT_BY_ID_ENDPOINT,
  PRODUCT_IMAGES_ENDPOINT,
  PRODUCT_IMAGE_BY_ID_ENDPOINT,
  PRODUCT_ATTRIBUTES_ENDPOINT,
  PRODUCT_ATTRIBUTE_BY_ID_ENDPOINT,
  PRODUCT_UPLOAD_IMAGES_ENDPOINT,
  // Variant endpoints
  VARIANT_GROUPS_ENDPOINT,
  VARIANT_GROUP_BY_ID_ENDPOINT,
  VARIANT_GROUP_VARIANTS_ENDPOINT,
  // Role endpoints
  ROLES_ENDPOINT,
  ROLE_BY_ID_ENDPOINT,
  // Permission endpoints
  PERMISSIONS_ENDPOINT,
  PERMISSIONS_BY_SERVICE_ENDPOINT,
  ROLE_PERMISSIONS_ENDPOINT,
  ROLE_PERMISSIONS_BATCH_ENDPOINT,
  ROLE_PERMISSION_BY_ID_ENDPOINT,
  // Group endpoints
  GROUPS_ENDPOINT,
  GROUP_BY_ID_ENDPOINT,
  // Auth endpoints
  AUTH_LOGIN_ENDPOINT,
  // Brand endpoints
  BRANDS_ENDPOINT,
  BRAND_BY_ID_ENDPOINT,
  BRANDS_SHORTS_ENDPOINT,
  // Attribute endpoints
  ATTRIBUTES_ENDPOINT,
  ATTRIBUTE_BY_ID_ENDPOINT,
  ATTRIBUTE_GROUPS_ENDPOINT,
  ATTRIBUTE_OPTIONS_ENDPOINT,
  ATTRIBUTE_GROUP_LINKS_ENDPOINT,
  // Category endpoints
  CATEGORIES_ENDPOINT,
  CATEGORY_BY_ID_ENDPOINT,
  CATEGORIES_SHORTS_ENDPOINT,
  // Category Translation endpoints
  CATEGORY_TRANSLATION_ENDPOINT,
  CATEGORY_TRANSLATION_BY_ID_ENDPOINT,
  CATEGORY_TRANSLATION_BY_CATEGORY_ENDPOINT,
  CATEGORY_TRANSLATION_BY_LANG_ENDPOINT,
  // Collection endpoints
  COLLECTIONS_ENDPOINT,
  COLLECTION_BY_ID_ENDPOINT,
  COLLECTION_UPLOAD_IMAGE_ENDPOINT,
  COLLECTION_TRANSLATIONS_ENDPOINT,
  COLLECTION_TRANSLATION_BY_ID_ENDPOINT,
  COLLECTION_PRODUCTS_BATCH_ENDPOINT,
  COLLECTION_DELETE_PRODUCTS_BATCH_ENDPOINT,
  COLLECTIONS_BY_PRODUCT_ENDPOINT,
  // Review endpoints
  REVIEWS_ALL_ENDPOINT,
  REVIEW_SINGLE_ENDPOINT,
  REVIEW_STATUS_ENDPOINT,
  REVIEW_RESPONSE_ENDPOINT,
  REVIEW_DELETE_ENDPOINT,
  // Coupon endpoints
  COUPONS_ENDPOINT,
  COUPON_BY_ID_ENDPOINT,
  // Image upload endpoints
  CATEGORY_UPLOAD_IMAGE_ENDPOINT,
  BRAND_UPLOAD_IMAGE_ENDPOINT,
  // Tax class endpoints
  TAX_CLASSES_ENDPOINT,
  TAX_CLASS_BY_ID_ENDPOINT,
  // Language endpoints
  LANGUAGES_ENDPOINT,
  // Location endpoints
  COUNTRIES_ENDPOINT,
  COUNTRY_BY_ID_ENDPOINT,
  COUNTRY_CITIES_ENDPOINT,
  // Settings endpoints
  SETTINGS_ENDPOINT,
  SETTINGS_STORE_ENDPOINT,
  // User endpoints
  USER_ENDPOINT,
  USER_BY_ID_ENDPOINT
};
