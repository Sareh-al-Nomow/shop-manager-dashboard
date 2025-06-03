
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { attributeService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Attribute, AttributeGroup, AttributeGroupLink } from "@/services/attributeService";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  TagsIcon, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the filter parameters interface
interface FilterParams {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Define pagination metadata interface
interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function Attributes() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [attributesData, setAttributesData] = useState<Attribute[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Initialize filter state
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'attribute_id',
    sortOrder: 'desc'
  });

  // Function to update filters
  const updateFilter = (key: keyof FilterParams, value: string | number | boolean | 'all') => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when changing filters (except when changing page)
      ...(key !== 'page' ? { page: 1 } : {})
    }));
  };

  // Function to reset filters
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      sortBy: 'attribute_id',
      sortOrder: 'desc'
    });
  };

  // Function to handle attribute deletion
  const handleDeleteAttribute = async () => {
    if (!attributeToDelete) return;

    setDeleteLoading(true);
    try {
      await attributeService.delete(attributeToDelete.attribute_id);

      // Show success message
      toast({
        title: "Attribute deleted",
        description: `${attributeToDelete.attribute_name} has been successfully deleted.`,
        variant: "default",
      });

      // Refresh the attribute list
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      const result = await attributeService.getAll(params);
      setAttributesData(Array.isArray(result) ? result : result.data || []);

      // Update pagination metadata if available
      if (result && !Array.isArray(result) && result.meta) {
        setPaginationMeta({
          currentPage: result.meta.currentPage || 1,
          totalPages: result.meta.totalPages || 1,
          totalItems: result.meta.totalItems || 0,
          itemsPerPage: result.meta.itemsPerPage || 10
        });
      } else {
        // Set default pagination metadata if not available in the response
        const attributesArray = Array.isArray(result) ? result : (result?.data || []);
        setPaginationMeta({
          currentPage: 1,
          totalPages: 1,
          totalItems: attributesArray.length || 0,
          itemsPerPage: filters.limit
        });
      }
    } catch (err) {
      // Show error message
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete attribute",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setAttributeToDelete(null);
    }
  };

  // Function to toggle sort order
  const toggleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1
    }));
  };

  // Fetch attribute groups
  useEffect(() => {
    const fetchAttributeGroups = async () => {
      try {
        const groups = await attributeService.getGroups();
        setAttributeGroups(groups);
      } catch (err) {
        console.error("Failed to fetch attribute groups:", err);
      }
    };

    fetchAttributeGroups();
  }, []);

  // Fetch attributes with filters
  useEffect(() => {
    const fetchAttributes = async () => {
      setLoading(true);
      try {
        // Convert filters to AttributeParams format
        const params = {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        };

        const result = await attributeService.getAll(params);

        console.log(result);
        setAttributesData(Array.isArray(result) ? result : result.data || []);

        // Update pagination metadata if available
        if (result && !Array.isArray(result) && result.meta) {
          setPaginationMeta({
            currentPage: result.meta.currentPage || 1,
            totalPages: result.meta.totalPages || 1,
            totalItems: result.meta.totalItems || 0,
            itemsPerPage: result.meta.itemsPerPage || 10
          });
        } else {
          // Set default pagination metadata if not available in the response
          const attributesArray = Array.isArray(result) ? result : (result?.data || []);
          setPaginationMeta({
            currentPage: 1,
            totalPages: 1,
            totalItems: attributesArray.length || 0,
            itemsPerPage: filters.limit
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [filters]);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attributes</h1>
            <p className="text-muted-foreground">Manage your product attributes</p>
          </div>
          <Link to="/create-attribute">
            <Button>
              <TagsIcon className="mr-2 h-4 w-4" />
              Add Attribute
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search attributes..."
              className="pl-8 w-full md:w-80"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[80px] cursor-pointer"
                  onClick={() => toggleSort('attribute_id')}
                >
                  <div className="flex items-center">
                    ID
                    {filters.sortBy === 'attribute_id' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('attribute_name')}
                >
                  <div className="flex items-center">
                    Name
                    {filters.sortBy === 'attribute_name' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Groups</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Required</TableHead>

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Loading attributes...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : attributesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No attributes found.
                  </TableCell>
                </TableRow>
              ) : (
                attributesData.map((attribute) => (
                  <TableRow key={attribute.attribute_id}>
                    <TableCell>{attribute.attribute_id}</TableCell>
                    <TableCell className="font-medium">{attribute.attribute_name}</TableCell>
                    <TableCell>{attribute.attribute_code}</TableCell>
                    <TableCell>{attribute.type}</TableCell>
                    <TableCell>
                      {attribute.groups && attribute.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {attribute.groups.slice(0, 3).map((group) => (
                            <Badge key={group.attribute_group_link_id} variant="outline">
                              {attributeGroups.find(g => g.attribute_group_id === group.group_id)?.group_name || `Group ${group.group_id}`}
                            </Badge>
                          ))}
                          {attribute.groups.length > 3 && (
                            <Badge variant="outline">+{attribute.groups.length - 3} more</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No groups</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {attribute.options && attribute.options.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {attribute.options.slice(0, 3).map((option) => (
                            <Badge key={option.attribute_option_id} variant="outline">
                              {option.option_text}
                            </Badge>
                          ))}
                          {attribute.options.length > 3 && (
                            <Badge variant="outline">+{attribute.options.length - 3} more</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No options</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={attribute.is_required ? 
                          "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : 
                          "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}
                      >
                        {attribute.is_required ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    {/*<TableCell>*/}
                    {/*  <Badge*/}
                    {/*    variant="outline"*/}
                    {/*    className={attribute.is_filterable ? */}
                    {/*      "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : */}
                    {/*      "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}*/}
                    {/*  >*/}
                    {/*    {attribute.is_filterable ? 'Yes' : 'No'}*/}
                    {/*  </Badge>*/}
                    {/*</TableCell>*/}
                    <TableCell className="text-right">
                      <Link to={`/edit-attribute/${attribute.attribute_id}`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => {
                          setAttributeToDelete(attribute);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {attributesData.length > 0 ? (filters.page - 1) * paginationMeta.itemsPerPage + 1 : 0} to {Math.min(filters.page * paginationMeta.itemsPerPage, paginationMeta.totalItems)} of {paginationMeta.totalItems} attributes
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('page', Math.max(1, filters.page - 1))}
              disabled={filters.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Page</span>
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, paginationMeta.totalPages) }, (_, i) => {
                // Show pages around the current page
                let pageNum;
                if (paginationMeta.totalPages <= 5) {
                  // If 5 or fewer pages, show all
                  pageNum = i + 1;
                } else if (filters.page <= 3) {
                  // If near the start, show first 5 pages
                  pageNum = i + 1;
                } else if (filters.page >= paginationMeta.totalPages - 2) {
                  // If near the end, show last 5 pages
                  pageNum = paginationMeta.totalPages - 4 + i;
                } else {
                  // Otherwise show 2 before and 2 after current page
                  pageNum = filters.page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={filters.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilter('page', pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => updateFilter('page', Math.min(paginationMeta.totalPages, filters.page + 1))}
              disabled={filters.page >= paginationMeta.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Page</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the attribute
              {attributeToDelete && <strong> "{attributeToDelete.attribute_name}"</strong>} and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAttribute}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
