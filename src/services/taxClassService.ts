import api, { TAX_CLASSES_ENDPOINT, TAX_CLASS_BY_ID_ENDPOINT } from './api';

export interface TaxClass {
  tax_class_id: number;
  uuid: string;
  name: string;
  // rate?: number;
  // description?: string;
}

/**
 * Tax Class service for handling tax class-related API calls
 */
const taxClassService = {
  /**
   * Get all tax classes
   * @returns Promise with tax classes data
   */
  getTaxClasses: async () => {
    const response = await api.get(TAX_CLASSES_ENDPOINT);
    return response.data;
  },

  /**
   * Get a tax class by ID
   * @param id Tax Class ID to retrieve
   * @returns Promise with tax class data
   */
  getTaxClassById: async (id: number) => {
    const response = await api.get(TAX_CLASS_BY_ID_ENDPOINT(id));
    return response.data;
  },
};

export default taxClassService;
