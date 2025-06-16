
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, MoreVertical, UserPlus, Edit, Trash2, Mail, Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { userService, roleService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface for user data
interface User {
  id: number;
  uuid: string;
  email: string;
  phone_number: string;
  full_name: string;
  avatar: string | null;
  is_banned: boolean;
  created_at: string;
  updated_at: string;
  role: {
    id: number;
    role_name: string;
    is_active: boolean;
  };
  group: {
    id: number;
    group_name: string;
    is_active: boolean;
  };
  Order: any[];
  Cart: any[];
}

const Customers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ id: number; role_name: string }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const result = await roleService.getRoles();
        if (result && result.data) {
          setRoles(result.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page,
          limit,
          email: searchTerm || undefined,
          isActive: isActive !== null ? isActive : undefined,
          role: selectedRole || undefined
        };

        const result = await userService.getUsers(params);

        if (result && result.data) {
          setUsers(result.data);
          // Calculate total pages if pagination info is available
          if (result.meta && result.meta.totalPages) {
            setTotalPages(result.meta.totalPages);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, limit, searchTerm, isActive, selectedRole, toast]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  // Handle role filter change
  const handleRoleChange = (value: string) => {
    setSelectedRole(value === "all" ? null : parseInt(value));
    setPage(1); // Reset to first page when filter changes
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    if (value === "all") {
      setIsActive(null);
    } else if (value === "active") {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
    setPage(1); // Reset to first page when filter changes
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
            <p className="text-muted-foreground">Manage your customer information</p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by email..."
              className="pl-8 w-full md:w-80"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select onValueChange={handleRoleChange} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={handleStatusChange} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading customers...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center p-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar || ""} alt={user.full_name} />
                              <AvatarFallback>
                                {user.full_name?user.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("") : "No Name"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link to={`/user/${user.id}`} className="font-medium hover:underline">
                                {user.full_name||"No Name"}
                              </Link>
                              <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.email}</div>
                          <div className="text-xs text-muted-foreground">{user.phone_number}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{user.role?.role_name || "No Role"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={statusColors[user.is_banned ? "inactive" : "active"]}
                          >
                            {user.is_banned ? "Banned" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.Order?.length || 0}</TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link to={`/user/${user.id}`}>
                                  <User className="mr-2 h-4 w-4" />
                                  <span>View Details</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                <span>Email</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Customers;
