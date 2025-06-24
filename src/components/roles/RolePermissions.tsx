import React, { useState, useEffect } from 'react';
import { Role } from '@/services/roleService';
import { Permission, RolePermission } from '@/services/permissionService';
import permissionService from '@/services/permissionService';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Loader2 } from "lucide-react";
import PermissionsList from './PermissionsList';

interface RolePermissionsProps {
  role: Role;
  onPermissionsUpdated: () => void;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ role, onPermissionsUpdated }) => {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceFilter, setServiceFilter] = useState('all');
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('available');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [role.id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [permissionsData, rolePermissionsData] = await Promise.all([
        permissionService.getAllPermissions(),
        permissionService.getRolePermissions(role.id)
      ]);

      setAllPermissions(permissionsData);
      setRolePermissions(rolePermissionsData);

      // Extract unique services
      const services = [...new Set(permissionsData.map((p: Permission) => p.service))];
      setAvailableServices(services);

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch permissions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceFilterChange = (value: string) => {
    setServiceFilter(value);
  };

  const handlePermissionSelect = (permission: Permission) => {
    setSelectedPermissions(prev => {
      if (prev.some(p => p.id === permission.id)) {
        return prev.filter(p => p.id !== permission.id);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleAssignPermissions = async () => {
    if (selectedPermissions.length === 0) return;

    setIsLoading(true);
    try {
      await permissionService.assignMultiplePermissionsToRole(
        role.id, 
        selectedPermissions.map(p => p.id)
      );
      setSelectedPermissions([]);
      fetchData();
      onPermissionsUpdated();
      toast({
        title: "Success",
        description: "Permissions assigned successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to assign permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePermission = async (permissionId: number) => {
    setIsLoading(true);
    try {
      await permissionService.removePermissionFromRole(role.id, permissionId);
      fetchData();
      onPermissionsUpdated();
      toast({
        title: "Success",
        description: "Permission removed successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to remove permission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter permissions based on service filter
  const filteredPermissions = allPermissions.filter(permission => 
    serviceFilter === 'all' || permission.service === serviceFilter
  );

  // Get assigned permission IDs
  const assignedPermissionIds = rolePermissions.map(rp => rp.permission_id);

  // Filter available permissions (not already assigned)
  const availablePermissions = filteredPermissions.filter(
    permission => !assignedPermissionIds.includes(permission.id)
  );

  // Get assigned permissions with details
  const assignedPermissions = rolePermissions
    .filter(rp => rp.permission)
    .map(rp => rp.permission as Permission);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions for {role.role_name}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && (
          <>
            <div className="mb-4">
              <Select value={serviceFilter} onValueChange={handleServiceFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {availableServices.map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="available">Available Permissions</TabsTrigger>
                <TabsTrigger value="assigned">Assigned Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-4">
                <PermissionsList 
                  permissions={availablePermissions}
                  selectedPermissions={selectedPermissions}
                  onPermissionSelect={handlePermissionSelect}
                  selectable={true}
                />

                {selectedPermissions.length > 0 && (
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAssignPermissions}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        `Assign Selected Permissions (${selectedPermissions.length})`
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="assigned">
                <PermissionsList 
                  permissions={assignedPermissions}
                  onRemove={handleRemovePermission}
                  removable={true}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RolePermissions;
