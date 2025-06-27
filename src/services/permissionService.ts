import api, { 
  PERMISSIONS_ENDPOINT, 
  PERMISSIONS_BY_SERVICE_ENDPOINT, 
  ROLE_PERMISSIONS_ENDPOINT, 
  ROLE_PERMISSIONS_BATCH_ENDPOINT, 
  ROLE_PERMISSION_BY_ID_ENDPOINT 
} from './api';

export interface Permission {
  id: number;
  uuid: string;
  name: string;
  description: string;
  service: string;
  action: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: number;
  role_id: number;
  permission_id: number;
  permission?: Permission;
  created_at: string;
  updated_at: string;
}

/**
 * Permission service for handling permission-related API calls
 */
const permissionService = {
  /**
   * Get all permissions
   * @returns Promise with permissions data
   */
  getAllPermissions: async () => {
    const response = await api.get(PERMISSIONS_ENDPOINT);
    return response.data;
  },

  /**
   * Get permissions by service
   * @param service Service name to filter by
   * @returns Promise with filtered permissions data
   */
  getPermissionsByService: async (service: string) => {
    const response = await api.get(PERMISSIONS_BY_SERVICE_ENDPOINT(service));
    return response.data;
  },

  /**
   * Get all permissions for a role
   * @param roleId Role ID to get permissions for
   * @returns Promise with role permissions data
   */
  getRolePermissions: async (roleId: number) => {
    const response = await api.get(ROLE_PERMISSIONS_ENDPOINT(roleId));
    return response.data;
  },

  /**
   * Assign a permission to a role
   * @param roleId Role ID to assign permission to
   * @param permissionId Permission ID to assign
   * @returns Promise with assignment result
   */
  assignPermissionToRole: async (roleId: number, permissionId: number) => {
    const response = await api.post(ROLE_PERMISSIONS_ENDPOINT(roleId), {
      permission_id: permissionId
    });
    return response.data;
  },

  /**
   * Assign multiple permissions to a role
   * @param roleId Role ID to assign permissions to
   * @param permissionIds Array of permission IDs to assign
   * @returns Promise with assignment result
   */
  assignMultiplePermissionsToRole: async (roleId: number, permissionIds: number[]) => {
    const response = await api.post(ROLE_PERMISSIONS_BATCH_ENDPOINT(roleId), {
      permission_ids: permissionIds
    });
    return response.data;
  },

  /**
   * Remove a permission from a role
   * @param roleId Role ID to remove permission from
   * @param permissionId Permission ID to remove
   * @returns Promise with removal result
   */
  removePermissionFromRole: async (roleId: number, permissionId: number) => {
    const response = await api.delete(ROLE_PERMISSION_BY_ID_ENDPOINT(roleId, permissionId));
    return response.data;
  },

  /**
   * Remove all permissions from a role
   * @param roleId Role ID to remove all permissions from
   * @returns Promise with removal result
   */
  removeAllPermissionsFromRole: async (roleId: number) => {
    const response = await api.delete(ROLE_PERMISSIONS_ENDPOINT(roleId));
    return response.data;
  }
};

export default permissionService;
