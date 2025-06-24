import React from 'react';
import { Permission } from '@/services/permissionService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from "lucide-react";

interface PermissionItemProps {
  permission: Permission;
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
}

const PermissionItem: React.FC<PermissionItemProps> = ({ 
  permission, 
  isSelected = false, 
  onSelect, 
  onRemove 
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div 
      className={`p-3 border rounded-md ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isSelected ? 'bg-muted border-primary' : onSelect ? 'hover:bg-muted/50' : ''
      }`}
      onClick={onSelect ? handleClick : undefined}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{permission.name}</h4>
          {permission.description && (
            <p className="text-sm text-muted-foreground mt-1">{permission.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{permission.service}</Badge>
            <Badge variant="secondary">{permission.action}</Badge>
            <Badge variant={permission.is_active ? "default" : "destructive"}>
              {permission.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        {onRemove && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRemoveClick}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default PermissionItem;
