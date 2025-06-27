import api, { COUNTRIES_ENDPOINT, COUNTRY_BY_ID_ENDPOINT, COUNTRY_CITIES_ENDPOINT } from './api';

// Types
export interface City {
  id: number;
  name: string;
  city_code: string;
  country_id: number;
  is_active: boolean;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  id: number;
  uuid: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: number;
  uuid: string;
  name: string;
  country_code: string;
  currency_id: number;
  flag_url: string | null;
  is_active: boolean;
  latitude: string;
  longitude: string;
  created_at: string;
  updated_at: string;
  currency: Currency;
  Cities: City[];
  ShippingZone: any[];
}

// Service functions
const locationService = {
  /**
   * Get all countries with their cities
   * @returns Promise with countries data
   */
  getCountries: async (): Promise<Country[]> => {
    const response = await api.get(COUNTRIES_ENDPOINT);
    return response.data;
  },

  /**
   * Get cities by country ID
   * @param countryId - The ID of the country
   * @returns Promise with cities data
   */
  getCitiesByCountry: async (countryId: number): Promise<City[]> => {
    const response = await api.get(COUNTRY_CITIES_ENDPOINT(countryId));
    return response.data;
  },

  /**
   * Get a specific country by ID
   * @param countryId - The ID of the country
   * @returns Promise with country data
   */
  getCountry: async (countryId: number): Promise<Country> => {
    const response = await api.get(COUNTRY_BY_ID_ENDPOINT(countryId));
    return response.data;
  }
};

export default locationService;
