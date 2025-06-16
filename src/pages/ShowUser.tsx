import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { userService } from "@/services";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, ShoppingCart, Package, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ShowUser() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const result = await userService.getUserById(parseInt(id));
        setUser(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching user details");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
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

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/customers">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
              <p className="text-muted-foreground">View user information, orders, and cart</p>
            </div>
          </div>
          {!loading && user && (
            <Link to={`/edit-user/${id}`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
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
                  <Link to="/customers">Back to Customers</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : user ? (
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">User Details</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="cart">Current Cart</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{user.full_name}</CardTitle>
                  <CardDescription>User Information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={user.avatar || ""} alt={user.full_name} />
                          <AvatarFallback className="text-2xl">
                            {user.full_name?user.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("") : "No Name"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-xl font-bold">{user.full_name}</h2>
                          <p className="text-muted-foreground">{user.role?.role_name || "No Role"}</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-sm font-medium">ID:</div>
                          <div className="text-sm">{user.id}</div>

                          <div className="text-sm font-medium">UUID:</div>
                          <div className="text-sm">{user.uuid}</div>

                          <div className="text-sm font-medium">Email:</div>
                          <div className="text-sm">{user.email}</div>

                          <div className="text-sm font-medium">Phone:</div>
                          <div className="text-sm">{user.phone_number || "Not provided"}</div>

                          <div className="text-sm font-medium">Status:</div>
                          <div className="text-sm">
                            <Badge
                              variant="outline"
                              className={!user.is_banned ? 
                                "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : 
                                "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}
                            >
                              {!user.is_banned ? 'Active' : 'Banned'}
                            </Badge>
                          </div>

                          <div className="text-sm font-medium">Role:</div>
                          <div className="text-sm">{user.role?.role_name || "No Role"}</div>

                          <div className="text-sm font-medium">Group:</div>
                          <div className="text-sm">{user.group?.group_name || "No Group"}</div>

                          <div className="text-sm font-medium">Created:</div>
                          <div className="text-sm">{formatDate(user.created_at)}</div>

                          <div className="text-sm font-medium">Updated:</div>
                          <div className="text-sm">{formatDate(user.updated_at)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Account Information</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-sm font-medium">Provider:</div>
                          <div className="text-sm">{user.provider || "Email"}</div>

                          <div className="text-sm font-medium">Email Verified:</div>
                          <div className="text-sm">
                            <Badge
                              variant="outline"
                              className={user.is_email_verified ? 
                                "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : 
                                "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}
                            >
                              {user.is_email_verified ? 'Yes' : 'No'}
                            </Badge>
                          </div>

                          <div className="text-sm font-medium">Phone Verified:</div>
                          <div className="text-sm">
                            <Badge
                              variant="outline"
                              className={user.is_phone_verified ? 
                                "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" : 
                                "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"}
                            >
                              {user.is_phone_verified ? 'Yes' : 'No'}
                            </Badge>
                          </div>

                          <div className="text-sm font-medium">Terms Accepted:</div>
                          <div className="text-sm">{user.is_terms_accepted ? 'Yes' : 'No'}</div>

                          <div className="text-sm font-medium">Privacy Policy Accepted:</div>
                          <div className="text-sm">{user.is_privacy_policy_accepted ? 'Yes' : 'No'}</div>

                          <div className="text-sm font-medium">Newsletter Subscribed:</div>
                          <div className="text-sm">{user.is_newsletter_accepted ? 'Yes' : 'No'}</div>

                          <div className="text-sm font-medium">Birthday:</div>
                          <div className="text-sm">{user.birthday ? formatDate(user.birthday) : 'Not provided'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>Order history for {user.full_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {!user.Order || user.Order.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No orders found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This user hasn't placed any orders yet.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Items</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.Order.map((order: any) => (
                            <TableRow key={order.order_id}>
                              <TableCell>{order.order_id}</TableCell>
                              <TableCell>{formatDate(order.created_at)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    order.status === 'completed' || order.status === 'delivered' ? "bg-green-100 text-green-800" :
                                    order.status === 'processing' ? "bg-blue-100 text-blue-800" :
                                    order.status === 'cancelled' ? "bg-red-100 text-red-800" :
                                    "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatPrice(order.grand_total)}</TableCell>
                              <TableCell>{order.total_qty || 0}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cart">
              <Card>
                <CardHeader>
                  <CardTitle>Current Cart</CardTitle>
                  <CardDescription>Items in {user.full_name}'s shopping cart</CardDescription>
                </CardHeader>
                <CardContent>
                  {!user.Cart || user.Cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">Cart is empty</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This user doesn't have any items in their cart.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cart ID</TableHead>
                            <TableHead>Subtotal</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.Cart.map((item: any) => (
                            <TableRow key={item.cart_id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {/* Display cart information */}
                                  Cart #{item.cart_id}
                                </div>
                              </TableCell>
                              <TableCell>{formatPrice(item.sub_total || 0)}</TableCell>
                              <TableCell>{item.total_qty || 0}</TableCell>
                              <TableCell>{formatPrice(item.grand_total || 0)}</TableCell>
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
