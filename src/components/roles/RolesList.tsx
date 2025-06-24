import React from 'react';
import { Role } from '@/services/roleService';
import RoleItem from './RoleItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RolesListProps {
  roles: Role[];
  selectedRole: Role | null;
  onRoleSelect: (role: Role) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: () => void;
}

const RolesList: React.FC<RolesListProps> = ({ 
  roles, 
  selectedRole, 
  onRoleSelect, 
  onEditRole, 
  onDeleteRole 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Roles</CardTitle>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No roles found.</p>
        ) : (
          <div className="space-y-2">
            {roles.map(role => (
              <RoleItem 
                key={role.id} 
                role={role} 
                isSelected={selectedRole && selectedRole.id === role.id}
                onSelect={() => onRoleSelect(role)}
                onEdit={() => onEditRole(role)}
                onDelete={onDeleteRole}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RolesList;