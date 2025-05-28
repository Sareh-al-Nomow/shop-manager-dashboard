
import api from './api';

export interface Attribute {
  id: number;
  name: string;
  code: string;
  type: 'text' | 'select' | 'multiselect' | 'textarea';
  options?: string[];
  is_required: boolean;
  is_filterable: boolean;
  show_to_customers: boolean;
  sort_order: number;
  attribute_group_id?: number;
}

export interface AttributeGroup {
  id: number;
  name: string;
}

export interface CreateAttributeData {
  name: string;
  code: string;
  type: 'text' | 'select' | 'multiselect' | 'textarea';
  options?: string[];
  is_required: boolean;
  is_filterable: boolean;
  show_to_customers: boolean;
  sort_order: number;
  attribute_group_id?: number;
}

/**
 * Attribute service for handling attribute-related API calls
 */
const attributeService = {
  /**
   * Get all attributes
   * @returns Promise with list of attributes
   */
  getAll: async (): Promise<Attribute[]> => {
    const response = await api.get<Attribute[]>('/attributes');
    return response.data;
  },

  /**
   * Get attribute by ID
   * @param id Attribute ID
   * @returns Promise with attribute data
   */
  getById: async (id: number): Promise<Attribute> => {
    const response = await api.get<Attribute>(`/attributes/${id}`);
    return response.data;
  },

  /**
   * Create a new attribute
   * @param attributeData Attribute data
   * @returns Promise with created attribute data
   */
  create: async (attributeData: CreateAttributeData): Promise<Attribute> => {
    const response = await api.post<Attribute>('/attributes', attributeData);
    return response.data;
  },

  /**
   * Update an existing attribute
   * @param id Attribute ID
   * @param attributeData Updated attribute data
   * @returns Promise with updated attribute data
   */
  update: async (id: number, attributeData: Partial<CreateAttributeData>): Promise<Attribute> => {
    const response = await api.put<Attribute>(`/attributes/${id}`, attributeData);
    return response.data;
  },

  /**
   * Delete an attribute
   * @param id Attribute ID
   * @returns Promise with success status
   */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/attributes/${id}`);
  },

  /**
   * Get all attribute groups
   * @returns Promise with list of attribute groups
   */
  getGroups: async (): Promise<AttributeGroup[]> => {
    const response = await api.get<AttributeGroup[]>('/attribute-groups');
    return response.data;
  },

  /**
   * Create a new attribute group
   * @param name Group name
   * @returns Promise with created group data
   */
  createGroup: async (name: string): Promise<AttributeGroup> => {
    const response = await api.post<AttributeGroup>('/attribute-groups', { name });
    return response.data;
  },
};

export default attributeService;
