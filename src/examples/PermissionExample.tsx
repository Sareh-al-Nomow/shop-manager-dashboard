import React from "react";
import { Button } from "@/components/ui/button";
import PermissionGuard from "@/components/auth/PermissionGuard";
import usePermission from "@/hooks/usePermission";

/**
 * An example component that demonstrates how to use the permission system.
 */
const PermissionExample: React.FC = () => {
  const { check, checkAny, checkAll } = usePermission();

  // Example of using the usePermission hook directly in JSX
  const canCreateProduct = check("create:product");
  const canManageUsers = checkAny(["create:user", "update:user", "delete:user"]);
  const isFullAdmin = checkAll(["manage:user", "manage:product", "manage:order"]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Permission Examples</h2>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Using the usePermission hook</h3>
        {canCreateProduct && (
          <Button>Create Product</Button>
        )}

        {canManageUsers && (
          <div className="p-4 bg-muted rounded-md">
            <p>User management controls would go here</p>
          </div>
        )}

        {isFullAdmin && (
          <div className="p-4 bg-primary/10 rounded-md">
            <p>Admin-only content would go here</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Using the PermissionGuard component</h3>
        
        <PermissionGuard requiredPermission="create:product">
          <Button>Create Product</Button>
        </PermissionGuard>

        <PermissionGuard 
          requiredPermission="update:product" 
          fallback={<p className="text-muted-foreground">You don't have permission to edit products</p>}
        >
          <Button variant="outline">Edit Product</Button>
        </PermissionGuard>

        <PermissionGuard requiredPermission="delete:product">
          <Button variant="destructive">Delete Product</Button>
        </PermissionGuard>
      </div>
    </div>
  );
};

export default PermissionExample;