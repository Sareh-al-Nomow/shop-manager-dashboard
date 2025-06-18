
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { categoryService, languageService } from "@/services";
import { LanguageData } from "@/services/languageService";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  uuid: string;
  status: boolean;
  parent_id: number;
  include_in_nav: boolean;
  position: number;
  show_products: boolean;
  created_at: string;
  updated_at: string;
  description: {
    category_description_id: number;
    category_description_category_id: number;
    name: string;
    short_description: string;
    description: string;
    image: string;
    meta_title: string;
    meta_keywords: string;
    meta_description: string;
    url_key: string;
  };
}

// Define the filter parameters interface
interface FilterParams {
  page: number;
  limit: number;
  name: string;
  status: boolean | 'all';
  parentId: string;
  lang: string;
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

import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Tags, 
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


export default function Categories() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<{ id: number; name: string }[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageData[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
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
    name: '',
    status: 'all',
    parentId: 'all',
    lang: 'all',
    sortBy: 'id',
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
      name: '',
      status: 'all',
      parentId: 'all',
      lang: 'all',
      sortBy: 'id',
      sortOrder: 'desc'
    });
  };

  // Function to handle category deletion
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setDeleteLoading(true);
    try {
      await categoryService.deleteCategory(categoryToDelete.id);

      // Show success message
      toast({
        title: "Category deleted",
        description: `${categoryToDelete.description.name} has been successfully deleted.`,
        variant: "default",
      });

      // Refresh the category list
      const params = {
        page: filters.page,
        limit: filters.limit,
        search: filters.name || undefined,
        parentId: filters.parentId === 'null' ? null : 
                 filters.parentId !== 'all' ? parseInt(filters.parentId) : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        lang: filters.lang !== 'all' ? filters.lang : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      const result = await categoryService.getCategories(params);
      setCategoriesData(result.data || []);

      // Update pagination metadata based on the API response format
      // Check for the format described in the issue description first
      if (result.total !== undefined && result.page !== undefined && 
          result.limit !== undefined && result.totalPages !== undefined) {
        setPaginationMeta({
          currentPage: result.page,
          totalPages: result.totalPages,
          totalItems: result.total,
          itemsPerPage: result.limit
        });
      } 
      // Fall back to the previous format if available
      else if (result.meta) {
        setPaginationMeta({
          currentPage: result.meta.currentPage || 1,
          totalPages: result.meta.totalPages || 1,
          totalItems: result.meta.totalItems || 0,
          itemsPerPage: result.meta.itemsPerPage || 10
        });
      } else {
        // Set default pagination metadata if not available in any format
        setPaginationMeta({
          currentPage: 1,
          totalPages: 1,
          totalItems: result.data?.length || 0,
          itemsPerPage: filters.limit
        });
      }
    } catch (err) {
      // Show error message
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
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

  // Fetch parent categories and languages for filter dropdowns
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch parent categories
        const categoriesResult = await categoryService.getRootCategories();
        const { data } = categoriesResult;
        setParentCategories(data.map((cat: Category) => ({ 
          id: cat.id, 
          name: cat.description.name 
        })));

        // Fetch languages
        const languagesResult = await languageService.getLanguages();
        setAvailableLanguages(languagesResult);
      } catch (err) {
        console.error("Error fetching filter data:", err);
        toast({
          title: "Error",
          description: "Failed to load filter data",
          variant: "destructive"
        });
      }
    };

    fetchFilterData();
  }, [toast]);

  // Fetch categories with filters
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Convert filters to CategoryParams format
        const params = {
          page: filters.page,
          limit: filters.limit,
          search: filters.name || undefined,
          parentId: filters.parentId === 'null' ? null : 
                   filters.parentId !== 'all' ? parseInt(filters.parentId) : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          lang: filters.lang !== 'all' ? filters.lang : undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        };

        const result = await categoryService.getCategories(params);
        setCategoriesData(result.data || []);

        // Update pagination metadata based on the API response format
        // Check for the format described in the issue description first
        if (result.total !== undefined && result.page !== undefined && 
            result.limit !== undefined && result.totalPages !== undefined) {
          setPaginationMeta({
            currentPage: result.page,
            totalPages: result.totalPages,
            totalItems: result.total,
            itemsPerPage: result.limit
          });
        } 
        // Fall back to the previous format if available
        else if (result.meta) {
          setPaginationMeta({
            currentPage: result.meta.currentPage || 1,
            totalPages: result.meta.totalPages || 1,
            totalItems: result.meta.totalItems || 0,
            itemsPerPage: result.meta.itemsPerPage || 10
          });
        } else {
          // Set default pagination metadata if not available in any format
          setPaginationMeta({
            currentPage: 1,
            totalPages: 1,
            totalItems: result.data?.length || 0,
            itemsPerPage: filters.limit
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [filters]);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Manage your product categories</p>
          </div>
          <Link to="/create-category">
            <Button>
              <Tags className="mr-2 h-4 w-4" />
              Add Category
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
              value={filters.name}
              onChange={(e) => updateFilter('name', e.target.value)}
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
                  <label className="text-sm font-medium">Parent Category</label>
                  <Select 
                    value={filters.parentId} 
                    onValueChange={(value) => updateFilter('parentId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="null">Root Categories</SelectItem>
                      {parentCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={filters.status === true ? 'true' : filters.status === false ? 'false' : 'all'} 
                    onValueChange={(value) => updateFilter('status', value === 'true' ? true : value === 'false' ? false : 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select 
                    value={filters.lang} 
                    onValueChange={(value) => updateFilter('lang', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Languages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      {availableLanguages.map((language) => (
                        <SelectItem key={language.languageCode} value={language.languageCode}>
                          {language.languageName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
        {(filters.name || (filters.parentId && filters.parentId !== 'all') || (filters.status && filters.status !== 'all') || (filters.lang && filters.lang !== 'all')) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>

            {filters.name && (
              <Badge variant="outline" className="flex items-center gap-1">
                Name: {filters.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('name', '')}
                />
              </Badge>
            )}

            {filters.parentId && filters.parentId !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Parent: {filters.parentId === 'null' ? 'Root Categories' : 
                  parentCategories.find(c => c.id.toString() === filters.parentId)?.name || filters.parentId}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('parentId', 'all')}
                />
              </Badge>
            )}

            {filters.status !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {filters.status === true ? 'Active' : 'Inactive'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('status', 'all')}
                />
              </Badge>
            )}

            {filters.lang !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Language: {availableLanguages.find(l => l.languageCode === filters.lang)?.languageName || filters.lang}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('lang', 'all')}
                />
              </Badge>
            )}

            {(filters.name || (filters.parentId && filters.parentId !== 'all') || filters.status !== 'all' || filters.lang !== 'all') && (
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
                  onClick={() => toggleSort('id')}
                >
                  <div className="flex items-center">
                    ID
                    {filters.sortBy === 'id' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('description.name')}
                >
                  <div className="flex items-center">
                    Name
                    {filters.sortBy === 'description.name' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>Slug</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('parent_id')}
                >
                  <div className="flex items-center">
                    Parent
                    {filters.sortBy === 'parent_id' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {filters.sortBy === 'status' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : (
                categoriesData.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell className="font-medium">{category.description.name}</TableCell>
                    <TableCell>{category.description.url_key}</TableCell>
                    <TableCell>
                      {category.parent_id === 0 || category.parent_id === null ? (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                          Root
                        </Badge>
                      ) : (
                        parentCategories.find(c => c.id === category.parent_id)?.name || category.parent_id
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={category.status ? 
                          "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : 
                          "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}
                      >
                        {category.status ? 'Active' : 'Inactive'}
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
                            <Link to={`/category/${category.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/edit-category/${category.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              setCategoryToDelete(category);
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
            Showing {categoriesData.length > 0 ? (filters.page - 1) * paginationMeta.itemsPerPage + 1 : 0} to {Math.min(filters.page * paginationMeta.itemsPerPage, paginationMeta.totalItems)} of {paginationMeta.totalItems} categories
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
              This action cannot be undone. This will permanently delete the category
              {categoryToDelete && <strong> "{categoryToDelete.description.name}"</strong>} and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
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
