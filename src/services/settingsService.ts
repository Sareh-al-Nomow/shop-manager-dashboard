import api, { SETTINGS_ENDPOINT, SETTINGS_STORE_ENDPOINT } from './api';

export interface Setting {
  setting_id: number;
  uuid: string;
  name: string;
  value: any;
  is_json: boolean;
}

export interface SettingUpdatePayload {
  name: string;
  value: any;
  is_json?: boolean;
}

/**
 * Settings service for handling store settings API calls
 */
const settingsService = {
  /**
   * Get all settings
   * @returns Promise with settings data
   */
  getAll: async (): Promise<Setting[]> => {
    const response = await api.get(SETTINGS_ENDPOINT);
    return response.data;
  },

  /**
   * Update multiple settings at once
   * @param settings Array of settings to update
   * @returns Promise with updated settings data
   */
  updateBatch: async (settings: SettingUpdatePayload[]): Promise<any> => {
    const response = await api.put(SETTINGS_STORE_ENDPOINT, { settings });
    return response.data;
  },

  /**
   * Get a setting by name
   * @param name Setting name
   * @returns The setting value or null if not found
   */
  getSettingByName: (settings: Setting[], name: string): any => {
    const setting = settings.find(s => s.name === name);
    if (!setting) return null;

    if (setting.is_json) {
      try {
        return typeof setting.value === 'string' 
          ? JSON.parse(setting.value) 
          : setting.value;
      } catch (e) {
        console.error(`Error parsing JSON value for setting ${name}:`, e);
        return setting.value;
      }
    }

    return setting.value;
  }
};

export default settingsService;
