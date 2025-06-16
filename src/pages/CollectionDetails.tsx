import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { collectionService, productService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  X,
  Package,
  ChevronLeft,
  ChevronRight,
  Edit
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import { Collection, ProductCollection } from "@/services/collectionService";
import { Product } from "@/services/productService";

// Define pagination metadata interface
interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function CollectionDetails() {
  const { id } = useParams<{ id: string }>();
  const collectionId = parseInt(id || "0");
  const { toast } = useToast();
  const { token } = useAuth();

  // Collection state
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Product management state
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [productPagination, setProductPagination] = useState<PaginationMeta>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Remove product state
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [productsToRemove, setProductsToRemove] = useState<number[]>([]);
  const [removeLoading, setRemoveLoading] = useState(false);

  // Fetch collection details
  useEffect(() => {
    const fetchCollectionDetails = async () => {
      if (!collectionId) return;

      setLoading(true);
      try {
        const result = await collectionService.getCollectionById(collectionId);
        setCollection(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [collectionId]);

  // Fetch available products for adding to collection
  const fetchAvailableProducts = async (page = 1) => {
    setProductLoading(true);
    setProductError(null);

    try {
      const result = await productService.getProducts({
        page,
        limit: 10,
        name: productSearch || undefined, // This is used to search by name in the API
      });

      // Filter out products that are already in the collection
      const existingProductIds = collection?.products?.map(p => p.product_id) || [];
      const filteredProducts = result.data.filter((product: Product) => 
        !existingProductIds.includes(product.id)
      );

      setAvailableProducts(filteredProducts);

      if (result.meta) {
        setProductPagination({
          currentPage: page, // Use the requested page to ensure pagination state is correct
          totalPages: result.meta.totalPages || 1,
          totalItems: result.meta.totalItems || 0,
          itemsPerPage: result.meta.itemsPerPage || 10
        });
      }
    } catch (err) {
      setProductError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setProductLoading(false);
    }
  };

  // Handle adding products to collection
  const handleAddProducts = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No products selected",
        description: "Please select at least one product to add to the collection",
        variant: "destructive",
      });
      return;
    }

    try {
      await collectionService.addProductsToCollection(collectionId, selectedProducts);

      // Refresh collection details
      const result = await collectionService.getCollectionById(collectionId);
      setCollection(result);

      // Reset state
      setSelectedProducts([]);
      setShowAddProductDialog(false);

      toast({
        title: "Products added",
        description: `${selectedProducts.length} products have been added to the collection`,
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add products",
        variant: "destructive",
      });
    }
  };

  // Handle removing products from collection
  const handleRemoveProducts = async () => {
    if (productsToRemove.length === 0) return;

    setRemoveLoading(true);
    try {
      await collectionService.removeProductsFromCollection(collectionId, productsToRemove);

      // Refresh collection details
      const result = await collectionService.getCollectionById(collectionId);
      setCollection(result);

      // Reset state
      setProductsToRemove([]);
      setShowRemoveDialog(false);

      toast({
        title: "Products removed",
        description: `${productsToRemove.length} products have been removed from the collection`,
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to remove products",
        variant: "destructive",
      });
    } finally {
      setRemoveLoading(false);
    }
  };

  // Toggle product selection for adding
  const toggleProductSelection = (productId: number) => {
    // Ensure productId is a number
    const numericProductId = Number(productId);

    if (selectedProducts.includes(numericProductId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== numericProductId));
    } else {
      setSelectedProducts([...selectedProducts, numericProductId]);
    }
  };

  // Toggle product selection for removing
  const toggleProductRemoval = (productId: number) => {
    // Ensure productId is a number
    const numericProductId = Number(productId);

    if (productsToRemove.includes(numericProductId)) {
      setProductsToRemove(productsToRemove.filter(id => id !== numericProductId));
    } else {
      setProductsToRemove([...productsToRemove, numericProductId]);
    }
  };

  // Handle opening the add product dialog
  const handleOpenAddDialog = () => {
    setShowAddProductDialog(true);
    // Don't reset selected products when opening dialog
    // This allows selections to persist between dialog opens
    fetchAvailableProducts();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-2">Loading collection details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
            <Link to="/collections">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Collections
              </Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!collection) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p>Collection not found</p>
            <Link to="/collections">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Collections
              </Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link to="/collections">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{collection.name}</h1>
            <p className="text-muted-foreground">Collection details and product management</p>
          </div>
          <Link to={`/edit-collection/${collection.collection_id}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Collection
            </Button>
          </Link>
        </div>

        {/* Collection details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Collection Information</CardTitle>
              <CardDescription>Basic details about this collection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID</p>
                  <p>{collection.collection_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Code</p>
                  <p>{collection.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge variant="outline" className={collection.type === "section" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                    {collection.type || "section"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p>{collection.description || "No description"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{new Date(collection.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Updated</p>
                  <p>{new Date(collection.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {collection.image && (
            <Card>
              <CardHeader>
                <CardTitle>Collection Image</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <img 
                  src={collection.image} 
                  alt={collection.name} 
                  className="max-h-64 object-contain rounded-md"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Products section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Products in Collection</h2>
            <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Products
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add Products to Collection</DialogTitle>
                  <DialogDescription>
                    Search and select products to add to this collection
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search products by name..."
                        className="pl-8"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            fetchAvailableProducts();
                          }
                        }}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => fetchAvailableProducts()}
                      disabled={productLoading}
                    >
                      Search
                    </Button>
                  </div>

                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Select</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              Loading products...
                            </TableCell>
                          </TableRow>
                        ) : productError ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-red-600">
                              {productError}
                            </TableCell>
                          </TableRow>
                        ) : availableProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              No products found or all products are already in this collection
                            </TableCell>
                          </TableRow>
                        ) : (
                          availableProducts.map((product) => (
                            <TableRow 
                              key={product.product_id} 
                              className={selectedProducts.includes(product.product_id) ? "bg-primary/10" : ""}
                            >
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`product-${product.product_id}`}
                                    checked={selectedProducts.includes(product.product_id)}
                                    onCheckedChange={() => toggleProductSelection(product.product_id)}
                                  />
                                  <Label 
                                    htmlFor={`product-${product.product_id}`}
                                    className="sr-only"
                                  >
                                    Select product {product.name}
                                  </Label>
                                </div>
                              </TableCell>
                              <TableCell>{product.product_id}</TableCell>
                              <TableCell>{product.description.name}</TableCell>
                              <TableCell>{product.sku}</TableCell>
                              <TableCell>${product.price.toFixed(2)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {availableProducts.length > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {selectedProducts.length} products selected
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchAvailableProducts(Math.max(1, productPagination.currentPage - 1))}
                          disabled={productPagination.currentPage <= 1 || productLoading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {productPagination.currentPage} of {productPagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchAvailableProducts(Math.min(productPagination.totalPages, productPagination.currentPage + 1))}
                          disabled={productPagination.currentPage >= productPagination.totalPages || productLoading}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddProducts}
                    disabled={selectedProducts.length === 0}
                  >
                    Add Selected Products
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collection.products && collection.products.length > 0 ? (
                  collection.products.map((productCollection: ProductCollection) => (
                    <TableRow key={productCollection.product_collection_id}>
                      <TableCell>{productCollection.product_id}</TableCell>
                      <TableCell>
                        {productCollection.product.images && productCollection.product.images.length > 0 && (
                          <img 
                            src={productCollection.product.images[0].origin_image} 
                            alt={productCollection.product.description.name} 
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell>{productCollection.product.description.name}</TableCell>
                      <TableCell>{productCollection.product.sku}</TableCell>
                      <TableCell>${productCollection.product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          onClick={() => {
                            setProductsToRemove([productCollection.product_id]);
                            setShowRemoveDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No products in this collection
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Remove Products Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {productsToRemove.length} product(s) from this collection?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveProducts}
              disabled={removeLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {removeLoading ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
