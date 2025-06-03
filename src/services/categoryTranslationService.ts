import api from './api';

/**
 * Category translation service for handling translation-related API calls
 */
const categoryTranslationService = {
  /**
   * Create a new category translation
   * @param translationData The translation data to create
   * @returns Promise with the created translation data
   */
  createTranslation: async (translationData: {
    category_id: number;
    lang_code: string;
    name: string;
    description?: string;
    short_description?: string;
    url_key?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  }) => {
    const response = await api.post('/categoryTranslation', translationData);
    return response.data;
  },

  /**
   * Get translations for a category
   * @param categoryId The ID of the category
   * @returns Promise with the list of translations
   */
  getTranslationsForCategory: async (categoryId: number) => {
    const response = await api.get(`/categoryTranslation/${categoryId}`);
    return response.data;
  },

  /**
   * Get a specific translation for a category by language code
   * @param categoryId The ID of the category
   * @param langCode The language code
   * @returns Promise with the translation data
   */
  getTranslationByLang: async (categoryId: number, langCode: string) => {
    const response = await api.get(`/categoryTranslation/category/${categoryId}/lang/${langCode}`);
    return response.data;
  },
};

export default categoryTranslationService;
