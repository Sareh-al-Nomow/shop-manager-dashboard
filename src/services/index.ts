import api, { API_BASE_URL } from './api';
import authService from './authService';
import categoryService from './categoryService';
import productService from './productService';
import imageService from './imageService';
import brandService from './brandService';
import attributeService from './attributeService';
import taxClassService from './taxClassService';
import couponService from './couponService';
import groupService from './groupService';
import languageService from './languageService';
import categoryTranslationService from './categoryTranslationService';
import userService from './userService';
import roleService from './roleService';
import collectionService from './collectionService';
import reviewService from './reviewService';
import settingsService from './settingsService';
import locationService from './locationService';


export {
  api,
  API_BASE_URL,
  authService,
  categoryService,
  productService,
  imageService,
  brandService,
  attributeService,
  taxClassService,
  couponService,
  groupService,
  languageService,
  categoryTranslationService,
  userService,
  roleService,
  collectionService,
  reviewService,
  settingsService,
  locationService
};

// Default export for convenience
export default {
  api,
  auth: authService,
  categories: categoryService,
  products: productService,
  images: imageService,
  brands: brandService,
  attributes: attributeService,
  taxClasses: taxClassService,
  coupons: couponService,
  groups: groupService,
  languages: languageService,
  categoryTranslations: categoryTranslationService,
  users: userService,
  roles: roleService,
  collections: collectionService,
  reviews: reviewService,
  settings: settingsService,
  locations: locationService
};
