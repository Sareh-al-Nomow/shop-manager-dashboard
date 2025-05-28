import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { categoryService } from "@/services";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, ShoppingCart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define interfaces for the component
interface CategoryDetails {
  id: number;
  uuid: string;
  status: boolean;
  parent_id: number | null;
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
  products?: Product[];
}

interface Product {
  product_id: number;
  sku: string;
  description?: string;
  price: number;
  category_id: number;
  brand_id?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export default function CategoryDetails() {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<CategoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch category details
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const result = await categoryService.getCategoryById(parseInt(id));
        setCategory(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching category details");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
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
            <Link to="/categories">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Category Details</h1>
              <p className="text-muted-foreground">View category information and related products</p>
            </div>
          </div>
          {!loading && category && (
            <Link to={`/edit-category/${id}`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
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
                  <Link to="/categories">Back to Categories</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : category ? (
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Category Details</TabsTrigger>
              <TabsTrigger value="products">Related Products</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{category.description.name}</CardTitle>
                  <CardDescription>Category Information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-sm font-medium">ID:</div>
                          <div className="text-sm">{category.id}</div>

                          <div className="text-sm font-medium">Name:</div>
                          <div className="text-sm">{category.description.name}</div>

                          <div className="text-sm font-medium">URL Key:</div>
                          <div className="text-sm">{category.description.url_key}</div>

                          <div className="text-sm font-medium">Status:</div>
                          <div className="text-sm">
                            <Badge
                              variant="outline"
                              className={category.status ? 
                                "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : 
                                "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}
                            >
                              {category.status ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>

                          <div className="text-sm font-medium">Parent ID:</div>
                          <div className="text-sm">
                            {category.parent_id === null ? (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                                Root Category
                              </Badge>
                            ) : category.parent_id}
                          </div>

                          <div className="text-sm font-medium">Include in Navigation:</div>
                          <div className="text-sm">{category.include_in_nav ? 'Yes' : 'No'}</div>

                          <div className="text-sm font-medium">Show Products:</div>
                          <div className="text-sm">{category.show_products ? 'Yes' : 'No'}</div>

                          <div className="text-sm font-medium">Position:</div>
                          <div className="text-sm">{category.position}</div>

                          <div className="text-sm font-medium">Created:</div>
                          <div className="text-sm">{formatDate(category.created_at)}</div>

                          <div className="text-sm font-medium">Updated:</div>
                          <div className="text-sm">{formatDate(category.updated_at)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {category.description.image && (
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-2">Category Image</h3>
                          <img 
                            src={category.description.image} 
                            alt={category.description.name}
                            className="rounded-md max-h-48 object-contain border"
                          />
                        </div>
                      )}

                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                        <p className="text-sm mt-2">{category.description.description || 'No description available'}</p>
                      </div>

                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Short Description</h3>
                        <p className="text-sm mt-2">{category.description.short_description || 'No short description available'}</p>
                      </div>

                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">SEO Information</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-sm font-medium">Meta Title:</div>
                          <div className="text-sm">{category.description.meta_title || 'Not set'}</div>

                          <div className="text-sm font-medium">Meta Keywords:</div>
                          <div className="text-sm">{category.description.meta_keywords || 'Not set'}</div>

                          <div className="text-sm font-medium">Meta Description:</div>
                          <div className="text-sm">{category.description.meta_description || 'Not set'}</div>
                        </div>
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
                  <CardDescription>Products in the {category.description.name} category</CardDescription>
                </CardHeader>
                <CardContent>
                  {!category.products || category.products.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No products found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This category doesn't have any products yet.
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
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.products.map((product) => (
                            <TableRow key={product.product_id}>
                              <TableCell>{product.product_id}</TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {product.image_url && (
                                    <img 
                                      src={product.image_url} 
                                      alt={product.sku}
                                      className="w-8 h-8 rounded-md object-cover"
                                    />
                                  )}
                                  {product.sku}
                                </div>
                              </TableCell>
                              <TableCell>${product.price.toFixed(2)}</TableCell>
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
