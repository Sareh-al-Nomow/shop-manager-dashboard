import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { brandService, productService } from "@/services";
import { Brand } from "@/services/brandService";
import { Product } from "@/services/productService";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define interfaces for the component
interface BrandDetails extends Brand {
  products?: Product[];
}

export default function BrandDetails() {
  const { id } = useParams<{ id: string }>();
  const [brand, setBrand] = useState<BrandDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch brand details and related products
  useEffect(() => {
    const fetchBrandDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch brand details
        const brandResult = await brandService.getBrandById(parseInt(id));
        
        // Fetch products related to this brand
        const productsResult = await productService.getProducts({ brandId: parseInt(id) });
        
        // Combine the data
        setBrand({
          ...brandResult,
          products: productsResult.data || []
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching brand details");
      } finally {
        setLoading(false);
      }
    };

    fetchBrandDetails();
  }, [id]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/brands">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Brand Details</h1>
              <p className="text-muted-foreground">View brand information and related products</p>
            </div>
          </div>
          {!loading && brand && (
            <Link to={`/edit-brand/${id}`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Brand
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-red-600">
                <p>{error}</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/brands">Back to Brands</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : brand ? (
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Brand Details</TabsTrigger>
              <TabsTrigger value="products">Related Products</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{brand.name}</CardTitle>
                  <CardDescription>Brand Information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-sm font-medium">ID:</div>
                          <div className="text-sm">{brand.id}</div>

                          <div className="text-sm font-medium">Name:</div>
                          <div className="text-sm">{brand.name}</div>

                          <div className="text-sm font-medium">Created:</div>
                          <div className="text-sm">{formatDate(brand.created_at)}</div>

                          <div className="text-sm font-medium">Updated:</div>
                          <div className="text-sm">{formatDate(brand.updated_at)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {brand.image && (
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-2">Brand Logo</h3>
                          <img 
                            src={brand.image}
                            alt={brand.name}
                            className="rounded-md max-h-48 object-contain border"
                          />
                        </div>
                      )}

                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                        <p className="text-sm mt-2">{brand.description || 'No description available'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Related Products</CardTitle>
                  <CardDescription>Products from the {brand.name} brand</CardDescription>
                </CardHeader>
                <CardContent>
                  {!brand.products || brand.products.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No products found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This brand doesn't have any products yet.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {brand.products.map((product) => (
                            <TableRow key={product.product_id}>
                              <TableCell>{product.product_id}</TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {product.images[0].origin_image && (
                                    <img 
                                      src={product.images[0].origin_image}
                                      alt={product.description.name}
                                      className="w-8 h-8 rounded-md object-cover"
                                    />
                                  )}
                                  {product.description.name}
                                </div>
                              </TableCell>
                              <TableCell>${product.price.toFixed(2)}</TableCell>
                              <TableCell>{product.category_id}</TableCell>
                              <TableCell>{formatDate(product.created_at)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </div>
    </AdminLayout>
  );
}