import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { productService, reviewService, collectionService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Edit,
  Star,
  Package,
  Bookmark,
  MessageSquare,
  Check,
  X,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/services/productService";
import { Review } from "@/services/reviewService";
import { Collection } from "@/services/collectionService";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0");
  const { toast } = useToast();
  const { token } = useAuth();

  // Product state
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLimit] = useState(5);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);

  // Review details modal state
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);

  // Status colors for badges
  const statusColors: Record<string, string> = {
    "in-stock": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    "out-of-stock": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
    "low-stock": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    "approved": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    "pending": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    "rejected": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  };

  // Helper function to determine stock status
  const getStockStatus = (qty: number): string => {
    if (qty === 0) return "out-of-stock";
    if (qty < 10) return "low-stock";
    return "in-stock";
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

  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}/5</span>
      </div>
    );
  };

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        const result = await productService.getProductById(productId);
        setProduct(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Fetch product reviews
  useEffect(() => {
    const fetchProductReviews = async () => {
      if (!productId) return;

      setReviewsLoading(true);
      setReviewsError(null);

      try {
        const params = {
          product_id: productId,
          page: reviewsPage,
          limit: reviewsLimit,
        };

        const result = await reviewService.getAllReviews(params);

        if (result && result.reviews) {
          setReviews(result.reviews);
          // Calculate total pages if pagination info is available
          if (result.meta && result.meta.totalPages) {
            setReviewsTotalPages(result.meta.totalPages);
          } else if (result.meta && result.meta.total) {
            // Calculate total pages if only total count is provided
            setReviewsTotalPages(Math.ceil(result.meta.total / reviewsLimit));
          }
        }
      } catch (err) {
        setReviewsError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchProductReviews();
  }, [productId, reviewsPage, reviewsLimit]);

  // Fetch collections that include this product
  useEffect(() => {
    const fetchProductCollections = async () => {
      if (!productId) return;

      setCollectionsLoading(true);
      setCollectionsError(null);

      try {
        const result = await collectionService.getCollectionsByProductId(productId);
        setCollections(Array.isArray(result) ? result : result.collections || []);
      } catch (err) {
        setCollectionsError(err instanceof Error ? err.message : "Failed to load collections");
      } finally {
        setCollectionsLoading(false);
      }
    };

    fetchProductCollections();
  }, [productId]);

  // Handle approve review
  const handleApproveReview = async (reviewId: number) => {
    try {
      await reviewService.updateReviewStatus(reviewId, "approved");
      // Update the review in the local state
      setReviews(reviews.map(review => 
        review.review_id === reviewId ? { ...review, status: "approved" } : review
      ));
      toast({
        title: "Success",
        description: "Review approved successfully.",
      });
    } catch (error) {
      console.error("Error approving review:", error);
      toast({
        title: "Error",
        description: "Failed to approve review. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle reject review
  const handleRejectReview = async (reviewId: number) => {
    try {
      await reviewService.updateReviewStatus(reviewId, "rejected");
      // Update the review in the local state
      setReviews(reviews.map(review => 
        review.review_id === reviewId ? { ...review, status: "rejected" } : review
      ));
      toast({
        title: "Success",
        description: "Review rejected successfully.",
      });
    } catch (error) {
      console.error("Error rejecting review:", error);
      toast({
        title: "Error",
        description: "Failed to reject review. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle opening review details modal
  const handleOpenReviewModal = (review: Review) => {
    setSelectedReview(review);
    setIsReviewModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-2">Loading product details...</p>
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
            <Link to="/products">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p>Product not found</p>
            <Link to="/products">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
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
          <Link to="/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{product.description.name}</h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>
          <Link to={`/edit-product/${product.product_id}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">
              <Package className="mr-2 h-4 w-4" />
              Product Details
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <MessageSquare className="mr-2 h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="collections">
              <Bookmark className="mr-2 h-4 w-4" />
              Collections
            </TabsTrigger>
          </TabsList>

          {/* Product Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Product Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                  <CardDescription>Basic details about this product</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ID</p>
                      <p>{product.product_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">SKU</p>
                      <p>{product.sku}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Price</p>
                      <p>${product.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Old Price</p>
                      <p>{product.old_price ? `$${product.old_price.toFixed(2)}` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Stock</p>
                      <div className="flex items-center">
                        <Badge 
                          variant="outline" 
                          className={statusColors[getStockStatus(product.inventory.qty)]}
                        >
                          {getStockStatus(product.inventory.qty).replace("-", " ")}
                        </Badge>
                        <span className="ml-2">{product.inventory.qty} units</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge 
                        variant="outline" 
                        className={product.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {product.status ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p>{product.description.description || "No description"}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Short Description</p>
                    <p>{product.description.short_description || "No short description"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p>{formatDate(product.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Updated</p>
                      <p>{formatDate(product.updated_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  {product.images && product.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {product.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={image.origin_image} 
                            alt={`${product.description.name} - Image ${index + 1}`} 
                            className="w-full h-auto rounded-md object-cover aspect-square"
                          />
                          {image.is_main && (
                            <Badge className="absolute top-2 right-2 bg-primary">Main</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-muted rounded-md">
                      <p className="text-muted-foreground">No images available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Product Attributes */}
            {product.attributes && product.attributes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Attributes</CardTitle>
                  <CardDescription>Specific characteristics of this product</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Attribute</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.attributes.map((attr) => (
                          <TableRow key={attr.product_attribute_value_index_id}>
                            <TableCell>
                              <div className="font-medium">{attr.attribute.attribute_name}</div>
                              <div className="text-xs text-muted-foreground">{attr.attribute.attribute_code}</div>
                            </TableCell>
                            <TableCell>{attr.option.option_text}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {attr.attribute.type}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4 w-full max-w-screen-xl">
            <Card className="w-full">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>Reviews for this product</CardDescription>
                </div>
                {product.meanRating > 0 && (
                  <div className="mt-2 sm:mt-0 flex items-center bg-muted p-2 rounded-md">
                    <div className="mr-2">
                      <span className="font-medium">Average Rating:</span>
                    </div>
                    {renderStarRating(product.meanRating)}
                  </div>
                )}
              </CardHeader>
              <CardContent className="w-full">
                {reviewsLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="ml-2">Loading reviews...</span>
                  </div>
                ) : reviewsError ? (
                  <div className="flex items-center justify-center h-40 text-red-600">
                    <p>{reviewsError}</p>
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="flex items-center justify-center h-40 bg-muted rounded-md">
                    <p className="text-muted-foreground">No reviews available for this product</p>
                  </div>
                ) : (
                  <div className="space-y-6 w-full">
                    {reviews.map((review) => (
                      <div 
                        key={review.review_id} 
                        className="border rounded-lg p-4 space-y-3 w-full hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleOpenReviewModal(review)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.customer.avatar || ""} alt={review.customer.full_name} />
                              <AvatarFallback>
                                {review.customer.full_name
                                  ? review.customer.full_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                  : "NA"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link 
                                to={`/user/${review.customer.id}`} 
                                className="font-medium hover:underline"
                                onClick={(e) => e.stopPropagation()} // Prevent modal from opening when clicking the link
                              >
                                {review.customer.full_name}
                              </Link>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(review.created_at)}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={statusColors[review.status] || "bg-gray-100 text-gray-800"}
                          >
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="w-full">
                          {renderStarRating(review.rating)}
                          {review.title && <h4 className="font-medium mt-2">{review.title}</h4>}
                          <p className="mt-1 break-words whitespace-normal overflow-hidden w-full line-clamp-2">{review.review_text}</p>
                        </div>

                        {review.admin_response && (
                          <div className="bg-muted p-3 rounded-md mt-2 w-full">
                            <p className="text-sm font-medium">Admin Response:</p>
                            <p className="text-sm w-full break-words line-clamp-2">{review.admin_response}</p>
                          </div>
                        )}

                        {review.status === "pending" && (
                          <div className="flex gap-2 mt-2 w-full">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-600 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent modal from opening
                                handleApproveReview(review.review_id);
                              }}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent modal from opening
                                handleRejectReview(review.review_id);
                              }}
                            >
                              <X className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Pagination */}
                    {reviewsTotalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4 w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setReviewsPage(prev => Math.max(prev - 1, 1))}
                          disabled={reviewsPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {reviewsPage} of {reviewsTotalPages}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setReviewsPage(prev => Math.min(prev + 1, reviewsTotalPages))}
                          disabled={reviewsPage === reviewsTotalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Collections</CardTitle>
                <CardDescription>Collections that include this product</CardDescription>
              </CardHeader>
              <CardContent>
                {collectionsLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <span className="ml-2">Loading collections...</span>
                  </div>
                ) : collectionsError ? (
                  <div className="flex items-center justify-center h-40 text-red-600">
                    <p>{collectionsError}</p>
                  </div>
                ) : collections.length === 0 ? (
                  <div className="flex items-center justify-center h-40 bg-muted rounded-md">
                    <p className="text-muted-foreground">This product is not included in any collections</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Image</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Products</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {collections.map((collection) => (
                          <TableRow key={collection.collection_id}>
                            <TableCell>
                              {collection.image ? (
                                <img 
                                  src={collection.image} 
                                  alt={collection.name} 
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                  <Bookmark className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{collection.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={collection.type === "section" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                                {collection.type || "section"}
                              </Badge>
                            </TableCell>
                            <TableCell>{collection.products?.length || 0} products</TableCell>
                            <TableCell>
                              <Link to={`/collection/${collection.collection_id}`}>
                                <Button variant="outline" size="sm">
                                  View Collection
                                </Button>
                              </Link>
                            </TableCell>
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

        {/* Review Details Modal */}
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedReview && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <span>Review Details</span>
                    <Badge 
                      variant="outline" 
                      className={statusColors[selectedReview.status] || "bg-gray-100 text-gray-800"}
                    >
                      {selectedReview.status.charAt(0).toUpperCase() + selectedReview.status.slice(1)}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    Review for {selectedReview.product.description.name}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="flex items-start gap-4 border-b pb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedReview.customer.avatar || ""} alt={selectedReview.customer.full_name} />
                      <AvatarFallback className="text-lg">
                        {selectedReview.customer.full_name
                          ? selectedReview.customer.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : "NA"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-lg">
                          <Link to={`/user/${selectedReview.customer.id}`} className="hover:underline">
                            {selectedReview.customer.full_name}
                          </Link>
                        </h3>
                        {selectedReview.is_verified_purchase && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">Verified Purchase</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(selectedReview.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>Customer ID: {selectedReview.customer_id}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {renderStarRating(selectedReview.rating)}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span>{selectedReview.helpful_votes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                          <span>{selectedReview.not_helpful_votes}</span>
                        </div>
                      </div>
                    </div>

                    {selectedReview.title && (
                      <h3 className="text-lg font-medium">{selectedReview.title}</h3>
                    )}

                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="whitespace-pre-line">{selectedReview.review_text}</p>
                    </div>
                  </div>

                  {/* Admin Response */}
                  {selectedReview.admin_response && (
                    <div className="space-y-2 border-t pt-4">
                      <h4 className="font-medium">Admin Response:</h4>
                      <div className="bg-blue-50 p-4 rounded-md">
                        <p className="whitespace-pre-line">{selectedReview.admin_response}</p>
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Admin Actions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReview.status === "pending" && (
                        <>
                          <Button 
                            variant="outline" 
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => {
                              handleApproveReview(selectedReview.review_id);
                              setIsReviewModalOpen(false);
                            }}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve Review
                          </Button>
                          <Button 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              handleRejectReview(selectedReview.review_id);
                              setIsReviewModalOpen(false);
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject Review
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => {
                          // Here you would implement the functionality to add/edit admin response
                          // For now, we'll just close the modal
                          setIsReviewModalOpen(false);
                        }}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {selectedReview.admin_response ? "Edit Response" : "Add Response"}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
