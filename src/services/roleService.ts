import api, { ROLES_ENDPOINT, ROLE_BY_ID_ENDPOINT } from './api';

export interface Role {
  id: number;
  uuid: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleCreateData {
  role_name: string;
  is_active: boolean;
}

export interface RoleUpdateData {
  role_name?: string;
  is_active?: boolean;
}

/**
 * Role service for handling role-related API calls
 */
const roleService = {
  /**
   * Get all roles
   * @returns Promise with roles data
   */
  getRoles: async () => {
    const response = await api.get(ROLES_ENDPOINT);
    return response.data;
  },

  /**
   * Get a role by ID
   * @param id Role ID to retrieve
   * @returns Promise with role data
   */
  getRoleById: async (id: number) => {
    const response = await api.get(ROLE_BY_ID_ENDPOINT(id));
    return response.data;
  },

  /**
   * Create a new role
   * @param roleData Data for the new role
   * @returns Promise with created role data
   */
  createRole: async (roleData: RoleCreateData) => {
    const response = await api.post(ROLES_ENDPOINT, roleData);
    return response.data;
  },

  /**
   * Update an existing role
   * @param id Role ID to update
   * @param roleData Updated role data
   * @returns Promise with updated role data
   */
  updateRole: async (id: number, roleData: RoleUpdateData) => {
    const response = await api.put(ROLE_BY_ID_ENDPOINT(id), roleData);
    return response.data;
  },

  /**
   * Delete a role
   * @param id Role ID to delete
   * @returns Promise with deletion result
   */
  deleteRole: async (id: number) => {
    const response = await api.delete(ROLE_BY_ID_ENDPOINT(id));
    return response.data;
  }
};

export default roleService;
