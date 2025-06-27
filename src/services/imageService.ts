import api, { CATEGORY_UPLOAD_IMAGE_ENDPOINT, BRAND_UPLOAD_IMAGE_ENDPOINT } from './api';

/**
 * Image service for handling image upload API calls
 */
const imageService = {
  /**
   * Upload an image for categories
   * @param imageFile The image file to upload
   * @returns Promise with the uploaded image data including the image path
   */
  uploadCategoryImage: async (imageFile: File) => {
    // Create FormData for the image upload
    const formData = new FormData();
    formData.append('image', imageFile);

    // Use multipart/form-data for file uploads
    const response = await api.post(CATEGORY_UPLOAD_IMAGE_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log(response.data);
    return response.data;
  },

  /**
   * Upload a logo for brands
   * @param logoFile The logo file to upload
   * @returns Promise with the uploaded logo data including the image path
   */
  uploadBrandLogo: async (logoFile: File) => {
    // Create FormData for the logo upload
    const formData = new FormData();
    formData.append('image', logoFile);

    // Use multipart/form-data for file uploads
    const response = await api.post(BRAND_UPLOAD_IMAGE_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

export default imageService;
