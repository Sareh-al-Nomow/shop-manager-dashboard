
import api, { API_BASE_URL } from './api';
import authService from './authService';
import categoryService from './categoryService';
import productService from './productService';
import imageService from './imageService';
import brandService from './brandService';
import attributeService from './attributeService';

export {
  api,
  API_BASE_URL,
  authService,
  categoryService,
  productService,
  imageService,
  brandService,
  attributeService
};

// Default export for convenience
export default {
  api,
  auth: authService,
  categories: categoryService,
  products: productService,
  images: imageService,
  brands: brandService,
  attributes: attributeService
};
