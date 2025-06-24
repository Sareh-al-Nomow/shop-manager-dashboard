import React, { useState, useEffect } from 'react';
import { Role, RoleCreateData, RoleUpdateData } from '@/services/roleService';
import roleService from '@/services/roleService';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from "lucide-react";

interface RoleFormProps {
  role: Role | null;
  isEdit: boolean;
  onClose: () => void;
  onRoleCreated: () => void;
  onRoleUpdated: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ 
  role, 
  isEdit, 
  onClose, 
  onRoleCreated, 
  onRoleUpdated 
}) => {
  const [formData, setFormData] = useState<RoleCreateData>({
    role_name: '',
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isEdit && role) {
      setFormData({
        role_name: role.role_name,
        is_active: role.is_active
      });
    }
  }, [isEdit, role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEdit && role) {
        const updateData: RoleUpdateData = {
          role_name: formData.role_name,
          is_active: formData.is_active
        };
        await roleService.updateRole(role.id, updateData);
        onRoleUpdated();
      } else {
        await roleService.createRole(formData);
        onRoleCreated();
      }
    } catch (error: any) {
      console.error('Error updating role:', error);
      console.log('Role ID:', role?.id);
      console.log('Update data:', updateData);

      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Role' : 'Create New Role'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role_name">Role Name</Label>
            <Input
              id="role_name"
              name="role_name"
              value={formData.role_name}
              onChange={handleInputChange}
              placeholder="Enter role name"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEdit ? 'Update Role' : 'Create Role'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RoleForm;
