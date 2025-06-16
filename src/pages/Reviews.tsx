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
import { Search, MoreVertical, Loader2, Star, MessageSquare, Check, X, ExternalLink, Calendar, User, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { reviewService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Review } from "@/services/reviewService";

const Reviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Review details modal state
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const statusColors: Record<string, string> = {
    approved: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
    rejected: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  };

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {
          page,
          limit,
          status: selectedStatus || undefined,
          rating: selectedRating || undefined,
        };

        const result = await reviewService.getAllReviews(params);

        if (result && result.reviews) {
          setReviews(result.reviews);
          // Calculate total pages if pagination info is available
          if (result.meta && result.meta.totalPages) {
            setTotalPages(result.meta.totalPages);
          } else if (result.meta && result.meta.total) {
            // Calculate total pages if only total count is provided
            setTotalPages(Math.ceil(result.meta.total / limit));
          }
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setError("Failed to load reviews. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load reviews. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [page, limit, selectedStatus, selectedRating, toast]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value === "all" ? null : value);
    setPage(1); // Reset to first page when filter changes
  };

  // Handle rating filter change
  const handleRatingChange = (value: string) => {
    setSelectedRating(value === "all" ? null : parseInt(value));
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

  // Handle approve review
  const handleApproveReview = async (id: number) => {
    try {
      await reviewService.updateReviewStatus(id, "approved");
      // Update the review in the local state
      setReviews(reviews.map(review => 
        review.review_id === id ? { ...review, status: "approved" } : review
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
  const handleRejectReview = async (id: number) => {
    try {
      await reviewService.updateReviewStatus(id, "rejected");
      // Update the review in the local state
      setReviews(reviews.map(review => 
        review.review_id === id ? { ...review, status: "rejected" } : review
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

  // Filter reviews by search term
  const filteredReviews = reviews.filter(review => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      review.product.description.name.toLowerCase().includes(searchLower) ||
      review.customer.full_name.toLowerCase().includes(searchLower) ||
      review.review_text.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Customer Reviews</h2>
            <p className="text-muted-foreground">Manage product reviews from customers</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reviews..."
              className="pl-8 w-full md:w-80"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select onValueChange={handleStatusChange} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleRatingChange} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading reviews...</span>
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
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No reviews found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReviews.map((review) => (
                      <TableRow key={review.review_id}>
                        <TableCell>
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
                              <Link to={`/user/${review.customer.id}`} className="font-medium hover:underline">
                                {review.customer.full_name}
                              </Link>
                              <div className="text-xs text-muted-foreground">ID: {review.customer.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link to={`/product/${review.product.product_id}`} className="font-medium hover:underline">
                            {review.product.description.name}
                          </Link>
                        </TableCell>
                        <TableCell>{renderStarRating(review.rating)}</TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={review.review_text}>
                            {review.title && <div className="font-medium">{review.title}</div>}
                            <div className="text-sm text-muted-foreground">{review.review_text}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={statusColors[review.status] || "bg-gray-100 text-gray-800"}
                          >
                            {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(review.created_at)}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleOpenReviewModal(review)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/product/${review.product.product_id}`}>
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  <span>View Product</span>
                                </Link>
                              </DropdownMenuItem>
                              {review.status === "pending" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleApproveReview(review.review_id)}>
                                    <Check className="mr-2 h-4 w-4 text-green-600" />
                                    <span className="text-green-600">Approve</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRejectReview(review.review_id)}>
                                    <X className="mr-2 h-4 w-4 text-red-600" />
                                    <span className="text-red-600">Reject</span>
                                  </DropdownMenuItem>
                                </>
                              )}
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

                {/* Product Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Product Information:</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <Link 
                      to={`/product/${selectedReview.product.product_id}`} 
                      className="font-medium hover:underline flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {selectedReview.product.description.name}
                    </Link>
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
    </AdminLayout>
  );
};

export default Reviews;
