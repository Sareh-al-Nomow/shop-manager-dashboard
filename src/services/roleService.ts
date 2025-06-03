import api from './api';

export interface Role {
  id: number;
  uuid: string;
  role_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
    const response = await api.get('/roles');
    return response.data;
  },

  /**
   * Get a role by ID
   * @param id Role ID to retrieve
   * @returns Promise with role data
   */
  getRoleById: async (id: number) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Add other role-related API methods as needed
};

export default roleService;
