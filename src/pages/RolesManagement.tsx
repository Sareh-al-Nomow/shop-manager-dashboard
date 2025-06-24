import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Role } from '@/services/roleService';
import roleService from '@/services/roleService';
import RolesList from '@/components/roles/RolesList';
import RoleForm from '@/components/roles/RoleForm';
import RolePermissions from '@/components/roles/RolePermissions';
import Layout from '@/components/layout/AdminLayout';

const RolesManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to fetch roles. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleRoleCreated = () => {
    fetchRoles();
    setIsFormOpen(false);
    toast({
      title: "Success",
      description: "Role created successfully.",
    });
  };

  const handleRoleUpdated = () => {
    fetchRoles();
    setIsFormOpen(false);
    toast({
      title: "Success",
      description: "Role updated successfully.",
    });
  };

  const handleRoleDeleted = () => {
    fetchRoles();
    setSelectedRole(null);
    toast({
      title: "Success",
      description: "Role deleted successfully.",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Roles Management</h1>
          <button 
            onClick={handleCreateRole}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          >
            Create New Role
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <RolesList 
                roles={roles} 
                selectedRole={selectedRole}
                onRoleSelect={handleRoleSelect}
                onEditRole={handleEditRole}
                onDeleteRole={handleRoleDeleted}
              />
            )}
          </div>

          <div className="md:col-span-2">
            {selectedRole && !isFormOpen && (
              <RolePermissions 
                role={selectedRole} 
                onPermissionsUpdated={fetchRoles}
              />
            )}

            {isFormOpen && (
              <RoleForm 
                role={isEditMode ? selectedRole : null}
                isEdit={isEditMode}
                onClose={handleFormClose}
                onRoleCreated={handleRoleCreated}
                onRoleUpdated={handleRoleUpdated}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RolesManagement;
