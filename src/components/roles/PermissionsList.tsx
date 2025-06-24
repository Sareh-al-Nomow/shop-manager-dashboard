import React from 'react';
import { Permission } from '@/services/permissionService';
import PermissionItem from './PermissionItem';

interface PermissionsListProps {
  permissions: Permission[];
  selectedPermissions?: Permission[];
  onPermissionSelect?: (permission: Permission) => void;
  onRemove?: (permissionId: number) => void;
  selectable?: boolean;
  removable?: boolean;
}

const PermissionsList: React.FC<PermissionsListProps> = ({ 
  permissions, 
  selectedPermissions = [], 
  onPermissionSelect, 
  onRemove,
  selectable = false,
  removable = false
}) => {
  // Group permissions by service
  const groupedPermissions: Record<string, Permission[]> = {};

  permissions.forEach(permission => {
    if (!groupedPermissions[permission.service]) {
      groupedPermissions[permission.service] = [];
    }
    groupedPermissions[permission.service].push(permission);
  });

  // Get sorted service names
  const services = Object.keys(groupedPermissions).sort();

  return (
    <div className="space-y-6">
      {permissions.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No permissions found.</p>
      ) : (
        <>
          {services.map(service => (
            <div key={service} className="space-y-2">
              <h3 className="text-lg font-medium capitalize border-b pb-1">{service}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {groupedPermissions[service].map(permission => (
                  <PermissionItem 
                    key={permission.id} 
                    permission={permission}
                    isSelected={selectedPermissions.some(p => p.id === permission.id)}
                    onSelect={selectable ? () => onPermissionSelect?.(permission) : undefined}
                    onRemove={removable ? () => onRemove?.(permission.id) : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PermissionsList;
