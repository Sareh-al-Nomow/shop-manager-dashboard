import { useAuth } from "@/context/AuthContext";

/**
 * A hook that provides permission checking functionality.
 * @returns An object with functions for checking permissions.
 */
const usePermission = () => {
  const { hasPermission } = useAuth();

  /**
   * Check if the user has the required permission.
   * @param permission The permission to check.
   * @returns True if the user has the permission, false otherwise.
   */
  const check = (permission: string): boolean => {
    return hasPermission(permission);
  };

  /**
   * Check if the user has any of the required permissions.
   * @param permissions An array of permissions to check.
   * @returns True if the user has any of the permissions, false otherwise.
   */
  const checkAny = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * Check if the user has all of the required permissions.
   * @param permissions An array of permissions to check.
   * @returns True if the user has all of the permissions, false otherwise.
   */
  const checkAll = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    check,
    checkAny,
    checkAll
  };
};

export default usePermission;