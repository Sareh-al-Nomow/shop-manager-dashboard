import api, { LANGUAGES_ENDPOINT } from './api';

/**
 * Language service for handling language-related API calls
 */
const languageService = {
  /**
   * Get all languages
   * @returns Promise with the list of languages
   */
  getLanguages: async () => {
    const response = await api.get(LANGUAGES_ENDPOINT);
    return response.data;
  },
};

export default languageService;
