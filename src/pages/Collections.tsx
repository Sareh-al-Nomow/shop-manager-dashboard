import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { collectionService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  X,
  Package
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { Collection } from "@/services/collectionService";

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

export default function Collections() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [collectionsData, setCollectionsData] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null);
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
    sortBy: 'collection_id',
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
      sortBy: 'collection_id',
      sortOrder: 'desc'
    });
  };

  // Function to handle collection deletion
  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return;

    setDeleteLoading(true);
    try {
      await collectionService.deleteCollection(collectionToDelete.collection_id);

      // Show success message
      toast({
        title: "Collection deleted",
        description: `${collectionToDelete.name} has been successfully deleted.`,
        variant: "default",
      });

      // Refresh the collection list
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.search || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      const result = await collectionService.getCollections(params);
      setCollectionsData(result.collections || []);

      // Update pagination metadata if available
      if (result.meta) {
        setPaginationMeta({
          currentPage: result.meta.currentPage || 1,
          totalPages: result.meta.totalPages || 1,
          totalItems: result.meta.totalItems || 0,
          itemsPerPage: result.meta.itemsPerPage || 10
        });
      }
    } catch (err) {
      // Show error message
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete collection",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setCollectionToDelete(null);
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

  // Fetch collections with filters
  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        // Convert filters to CollectionParams format
        const params = {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        };

        const result = await collectionService.getCollections(params);
        setCollectionsData(result.collections || []);

        // Update pagination metadata if available
        if (result.meta) {
          setPaginationMeta({
            currentPage: result.meta.currentPage || 1,
            totalPages: result.meta.totalPages || 1,
            totalItems: result.meta.totalItems || 0,
            itemsPerPage: result.meta.itemsPerPage || 10
          });
        } else {
          // Set default pagination metadata if not available in the response
          setPaginationMeta({
            currentPage: 1,
            totalPages: 1,
            totalItems: result.collections?.length || 0,
            itemsPerPage: filters.limit
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [filters]);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
            <p className="text-muted-foreground">Manage your product collections</p>
          </div>
          <Link to="/create-collection">
            <Button>
              <Package className="mr-2 h-4 w-4" />
              Add Collection
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name..."
              className="pl-8 w-full md:w-80"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className={showFilters ? "bg-accent" : ""}>
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Filters</h4>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Items per page</label>
                  <Select 
                    value={filters.limit.toString()} 
                    onValueChange={(value) => updateFilter('limit', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Active filters display */}
        {filters.search && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>

            {filters.search && (
              <Badge variant="outline" className="flex items-center gap-1">
                Name: {filters.search}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('search', '')}
                />
              </Badge>
            )}

            {filters.search && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs" 
                onClick={resetFilters}
              >
                Clear all
              </Button>
            )}
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[80px] cursor-pointer"
                  onClick={() => toggleSort('collection_id')}
                >
                  <div className="flex items-center">
                    ID
                    {filters.sortBy === 'collection_id' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {filters.sortBy === 'name' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading collections...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : collectionsData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No collections found
                  </TableCell>
                </TableRow>
              ) : (
                collectionsData.map((collection) => (
                  <TableRow key={collection.collection_id}>
                    <TableCell>{collection.collection_id}</TableCell>
                    <TableCell className="font-medium">
                      <Link 
                        to={`/collection/${collection.collection_id}`}
                        className="hover:underline text-primary"
                      >
                        {collection.name}
                      </Link>
                    </TableCell>
                    <TableCell>{collection.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={collection.type === "section" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                        {collection.type || "section"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {collection.image && (
                        <img 
                          src={collection.image} 
                          alt={collection.name} 
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {collection.products?.length || 0} products
                      </Badge>
                    </TableCell>
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
                            <Link to={`/collection/${collection.collection_id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/edit-collection/${collection.collection_id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setCollectionToDelete(collection);
                              setDeleteDialogOpen(true);
                            }}
                          >
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

        {/* Pagination controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {collectionsData.length > 0 ? (filters.page - 1) * paginationMeta.itemsPerPage + 1 : 0} to {Math.min(filters.page * paginationMeta.itemsPerPage, paginationMeta.totalItems)} of {paginationMeta.totalItems} collections
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
              This action cannot be undone. This will permanently delete the collection
              {collectionToDelete && <strong> "{collectionToDelete.name}"</strong>} and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
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
