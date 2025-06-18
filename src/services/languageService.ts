import api from './api';

/**
 * Interface for language data
 */
export interface LanguageData {
  languageCode: string;
  languageName: string;
  isActive?: boolean;
}

/**
 * Language service for handling language-related API calls
 */
const languageService = {
  /**
   * Get all languages
   * @returns Promise with the list of languages
   */
  getLanguages: async () => {
    const response = await api.get('/languages');
    console.log('API response:', response);
    console.log('API response.data:', response.data);

    let languages = [];

    // Check if response.data is an object with a data property (common API pattern)
    if (response.data && typeof response.data === 'object' && response.data.data) {
      console.log('Found nested data property:', response.data.data);
      languages = response.data.data;
    } else {
      languages = response.data;
    }

    // Transform the data if needed to match the expected LanguageData structure
    if (Array.isArray(languages)) {
      // Check the structure of the first item to determine if transformation is needed
      if (languages.length > 0) {
        const firstItem = languages[0];
        console.log('First language item:', firstItem);

        // If the API returns a different structure, transform it to match LanguageData
        if (firstItem && typeof firstItem === 'object') {
          // Check if the item has language_code instead of languageCode
          if (firstItem.language_code !== undefined && firstItem.languageCode === undefined) {
            console.log('Transforming language_code to languageCode');
            return languages.map(lang => ({
              languageCode: lang.language_code,
              languageName: lang.language_name || lang.name || '',
              isActive: lang.is_active !== undefined ? lang.is_active : true
            }));
          }

          // Check if the item has code instead of languageCode
          if (firstItem.code !== undefined && firstItem.languageCode === undefined) {
            console.log('Transforming code to languageCode');
            return languages.map(lang => ({
              languageCode: lang.code,
              languageName: lang.name || '',
              isActive: lang.is_active !== undefined ? lang.is_active : true
            }));
          }
        }
      }
    }

    return languages;
  },

  /**
   * Add a new language
   * @param languageData Language data to create
   * @returns Promise with created language data
   */
  addLanguage: async (languageData: LanguageData) => {
    const response = await api.post('/languages', languageData);
    return response.data;
  },
};

export default languageService;
