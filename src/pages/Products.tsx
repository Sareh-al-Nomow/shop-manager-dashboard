import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/context/AuthContext";
import { categoryService, productService } from "@/services";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
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
import { Link } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";

interface Product {
  product_id: number;
  uuid: string;
  type: string;
  variant_group_id: number;
  visibility: boolean;
  group_id: number;
  sku: string;
  price: number;
  old_price: number;
  weight: number;
  tax_class: number;
  status: boolean;
  created_at: string;
  updated_at: string;
  category_id: number;
  brand_id: number;
  description: {
    product_description_id: number;
    product_description_product_id: number;
    name: string;
    description: string;
    short_description: string;
    url_key: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
  };
  images: {
    product_image_id: number;
    product_image_product_id: number;
    origin_image: string;
    thumb_image: string;
    listing_image: string;
    single_image: string;
    is_main: boolean;
  }[];
  inventory: {
    product_inventory_id: number;
    product_inventory_product_id: number;
    qty: number;
    manage_stock: boolean;
    stock_availability: boolean;
  };
  category: {
    id: number;
    uuid: string;
    status: boolean;
    parent_id: number;
    include_in_nav: boolean;
    position: number;
    show_products: boolean;
    created_at: string;
    updated_at: string;
  };
  brand: {
    id: number;
    name: string;
    slug: string;
    image: string;
    description: string;
    isActive: boolean;
    created_at: string;
    updated_at: string;
  };
}

// Define the filter parameters interface
interface FilterParams {
  page: number;
  limit: number;
  sku: string;
  name: string;
  categoryId: string;
  brandId: string;
  visibility: string;
  status: string;
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

const Products = () => {
  const { token } = useAuth();
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: number; name: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);
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
    sku: '',
    name: '',
    categoryId: 'all',
    brandId: 'all',
    visibility: 'all',
    status: 'all',
    sortBy: 'product_id',
    sortOrder: 'desc'
  });

  // Function to update filters
  const updateFilter = (key: keyof FilterParams, value: string | number) => {
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
      sku: '',
      name: '',
      categoryId: 'all',
      brandId: 'all',
      visibility: 'all',
      status: 'all',
      sortBy: 'product_id',
      sortOrder: 'desc'
    });
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

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await categoryService.getCategories();
        const { data } = result;
        setCategories(data.map((cat: any) => ({ 
          id: cat.id, 
          name: cat.description.name 
        })));
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch brands for filter dropdown
  useEffect(() => {
    // In a real app, you would fetch brands from API
    // For now, we'll extract unique brands from products
    const extractBrands = () => {
      if (productsData.length > 0) {
        const uniqueBrands = Array.from(
          new Set(productsData.map(product => product.brand.id))
        ).map(id => {
          const product = productsData.find(p => p.brand.id === id);
          return {
            id: id as number,
            name: product ? product.brand.name : `Brand ${id}`
          };
        });
        setBrands(uniqueBrands);
      }
    };

    extractBrands();
  }, [productsData]);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Convert filters to ProductParams format
        const params = {
          page: filters.page,
          limit: filters.limit,
          search: filters.name || undefined,
          categoryId: filters.categoryId !== 'all' ? parseInt(filters.categoryId) : undefined,
          brandId: filters.brandId !== 'all' ? parseInt(filters.brandId) : undefined,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder as 'asc' | 'desc',
          // Add other filters as needed
        };

        const result = await productService.getProducts(params);
        setProductsData(result.data || []);

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
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const statusColors: Record<string, string> = {
    "in-stock": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    "out-of-stock": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
    "low-stock": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
  };

  // Helper function to determine stock status
  const getStockStatus = (qty: number): string => {
    if (qty === 0) return "out-of-stock";
    if (qty < 10) return "low-stock";
    return "in-stock";
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground">
              Manage your product inventory and details
            </p>
          </div>
          <Button asChild>
            <Link to="/create-product">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
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
                  <label className="text-sm font-medium">SKU</label>
                  <Input 
                    placeholder="Filter by SKU" 
                    value={filters.sku}
                    onChange={(e) => updateFilter('sku', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select 
                    value={filters.categoryId} 
                    onValueChange={(value) => updateFilter('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand</label>
                  <Select 
                    value={filters.brandId} 
                    onValueChange={(value) => updateFilter('brandId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <Select 
                    value={filters.visibility} 
                    onValueChange={(value) => updateFilter('visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Visible</SelectItem>
                      <SelectItem value="false">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={filters.status} 
                    onValueChange={(value) => updateFilter('status', value)}
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
        {(filters.sku || (filters.categoryId && filters.categoryId !== 'all') || (filters.brandId && filters.brandId !== 'all') || (filters.visibility && filters.visibility !== 'all') || (filters.status && filters.status !== 'all')) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>

            {filters.sku && (
              <Badge variant="outline" className="flex items-center gap-1">
                SKU: {filters.sku}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('sku', '')}
                />
              </Badge>
            )}

            {filters.categoryId && filters.categoryId !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Category: {categories.find(c => c.id.toString() === filters.categoryId)?.name || filters.categoryId}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('categoryId', 'all')}
                />
              </Badge>
            )}

            {filters.brandId && filters.brandId !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Brand: {brands.find(b => b.id.toString() === filters.brandId)?.name || filters.brandId}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('brandId', 'all')}
                />
              </Badge>
            )}

            {filters.visibility && filters.visibility !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Visibility: {filters.visibility === 'true' ? 'Visible' : 'Hidden'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('visibility', 'all')}
                />
              </Badge>
            )}

            {filters.status && filters.status !== 'all' && (
              <Badge variant="outline" className="flex items-center gap-1">
                Status: {filters.status === 'true' ? 'Active' : 'Inactive'}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter('status', 'all')}
                />
              </Badge>
            )}

            {(filters.sku || (filters.categoryId && filters.categoryId !== 'all') || (filters.brandId && filters.brandId !== 'all') || (filters.visibility && filters.visibility !== 'all') || (filters.status && filters.status !== 'all')) && (
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
                  className="cursor-pointer"
                  onClick={() => toggleSort('description.name')}
                >
                  <div className="flex items-center">
                    Product
                    {filters.sortBy === 'description.name' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('category_id')}
                >
                  <div className="flex items-center">
                    Category
                    {filters.sortBy === 'category_id' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('price')}
                >
                  <div className="flex items-center">
                    Price
                    {filters.sortBy === 'price' && (
                      <ArrowUpDown className={`ml-2 h-4 w-4 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => toggleSort('inventory.qty')}
                >
                  <div className="flex items-center">
                    Stock
                    {filters.sortBy === 'inventory.qty' && (
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
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : (
                productsData.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <img
                            src={
                              product.images.find((img) => img.is_main)?.single_image ||
                              product.images[0]?.single_image
                            }
                            alt={product.description.name}
                            className="h-8 w-8 object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{product.description.name}</div>
                          <div className="text-xs text-muted-foreground">{product.sku}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category.id}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.inventory.qty}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[getStockStatus(product.inventory.qty)]}
                      >
                        {getStockStatus(product.inventory.qty).replace("-", " ")}
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
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

        {/* Pagination controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {productsData.length > 0 ? (filters.page - 1) * paginationMeta.itemsPerPage + 1 : 0} to {Math.min(filters.page * paginationMeta.itemsPerPage, paginationMeta.totalItems)} of {paginationMeta.totalItems} products
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
    </AdminLayout>
  );
};

export default Products;
