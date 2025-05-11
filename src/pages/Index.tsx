
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your store.
            </p>
          </div>
        </div>

        <DashboardMetrics />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-10 w-10 object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{product.name}</h4>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${product.price}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Store Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storeActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`mt-0.5 h-2 w-2 rounded-full ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <SalesChart />
        <RecentOrders />
      </div>
    </AdminLayout>
  );
};

const topProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    category: "Electronics",
    price: 249.99,
    sales: 189,
    image: "https://via.placeholder.com/40",
  },
  {
    id: 2,
    name: "Designer Leather Wallet",
    category: "Accessories",
    price: 79.99,
    sales: 145,
    image: "https://via.placeholder.com/40",
  },
  {
    id: 3,
    name: "Fitness Smartwatch Pro",
    category: "Electronics",
    price: 199.99,
    sales: 132,
    image: "https://via.placeholder.com/40",
  },
  {
    id: 4,
    name: "Organic Cotton T-Shirt",
    category: "Clothing",
    price: 34.99,
    sales: 125,
    image: "https://via.placeholder.com/40",
  },
];

const storeActivity = [
  {
    message: "New order #ORD-5524 received",
    time: "10 minutes ago",
    color: "bg-green-500",
  },
  {
    message: "Customer requested refund for order #ORD-5489",
    time: "35 minutes ago",
    color: "bg-orange-500",
  },
  {
    message: "Inventory low alert: Wireless Headphones",
    time: "1 hour ago",
    color: "bg-yellow-500",
  },
  {
    message: "New customer registered",
    time: "2 hours ago",
    color: "bg-blue-500",
  },
  {
    message: "Product review received (5★)",
    time: "3 hours ago",
    color: "bg-purple-500",
  },
];

export default Index;
