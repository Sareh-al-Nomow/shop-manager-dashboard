
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BadgePercent, Loader2, Trash2 } from "lucide-react";
import { couponService } from "@/services";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {Coupon} from "@/services/couponService.ts";
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
import { useToast } from "@/components/ui/use-toast";

export default function Coupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination and filter state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filter state
  const [couponFilter, setCouponFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch coupons with current filters and pagination
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await couponService.getAll({
        page,
        limit,
        coupon: couponFilter || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      setCoupons(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load coupons on initial render and when filters/pagination change
  useEffect(() => {
    fetchCoupons();
  }, [page, limit, statusFilter]);

  // Handle search button click
  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchCoupons();
  };

  // Handle coupon filter input change
  const handleCouponFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when changing filter
  };

  // Handle delete button click
  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;

    setDeleting(true);
    try {
      await couponService.delete(couponToDelete.coupon_id);

      // Remove the deleted coupon from the state
      setCoupons(coupons.filter(c => c.coupon_id !== couponToDelete.coupon_id));

      // Update total items count
      setTotalItems(prev => prev - 1);

      // If we deleted the last item on the page, go to previous page
      if (coupons.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        // Otherwise, refresh the current page
        fetchCoupons();
      }

      toast({
        title: "Success",
        description: `Coupon "${couponToDelete.coupon}" has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Error",
        description: "Failed to delete coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
            <p className="text-muted-foreground">Manage your discount coupons</p>
          </div>
          <Link to="/create-coupon">
            <Button>
              <BadgePercent className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by coupon..."
            className="max-w-sm"
            value={couponFilter}
            onChange={handleCouponFilterChange}
          />
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleSearch}>Search</Button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Coupon</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading coupons...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No coupons found.
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.coupon_id}>
                    <TableCell>{coupon.coupon_id}</TableCell>
                    <TableCell className="font-medium">{coupon.coupon}</TableCell>
                    <TableCell>
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_amount}%` 
                        : `$${coupon.discount_amount.toFixed(2)}`}
                    </TableCell>
                    <TableCell>{coupon.used_time}/{coupon.max_uses_time_per_coupon}</TableCell>
                    <TableCell>{new Date(coupon.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          coupon.status ? "default" : "destructive"
                        }
                      >
                        {coupon.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/coupons/${coupon.coupon_id}`}>Edit</Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500"
                        onClick={() => handleDeleteClick(coupon)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
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
        {!loading && coupons.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} coupons
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {page} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
              <Select 
                value={limit.toString()} 
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="10 per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the coupon "{couponToDelete?.coupon}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
