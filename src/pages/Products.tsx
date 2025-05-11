
import React from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye } from "lucide-react";

const productsData = [
  {
    id: "PROD-1001",
    name: "Premium Wireless Headphones",
    category: "Electronics",
    price: 249.99,
    stock: 34,
    status: "in-stock",
    image: "https://via.placeholder.com/40",
  },
  {
    id: "PROD-1002",
    name: "Designer Leather Wallet",
    category: "Accessories",
    price: 79.99,
    stock: 12,
    status: "in-stock",
    image: "https://via.placeholder.com/40",
  },
  {
    id: "PROD-1003",
    name: "Fitness Smartwatch Pro",
    category: "Electronics",
    price: 199.99,
    stock: 0,
    status: "out-of-stock",
    image: "https://via.placeholder.com/40",
  },
  {
    id: "PROD-1004",
    name: "Organic Cotton T-Shirt",
    category: "Clothing",
    price: 34.99,
    stock: 45,
    status: "in-stock",
    image: "https://via.placeholder.com/40",
  },
  {
    id: "PROD-1005",
    name: "Professional Camera Lens",
    category: "Photography",
    price: 599.99,
    stock: 7,
    status: "low-stock",
    image: "https://via.placeholder.com/40",
  },
  {
    id: "PROD-1006",
    name: "Stainless Steel Water Bottle",
    category: "Kitchen",
    price: 24.99,
    stock: 32,
    status: "in-stock",
    image: "https://via.placeholder.com/40",
  },
  {
    id: "PROD-1007",
    name: "Bluetooth Portable Speaker",
    category: "Electronics",
    price: 89.99,
    stock: 2,
    status: "low-stock",
    image: "https://via.placeholder.com/40",
  },
];

const Products = () => {
  const statusColors: Record<string, string> = {
    "in-stock": "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    "out-of-stock": "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
    "low-stock": "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100",
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
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 w-full md:w-80"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsData.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-8 w-8 object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[product.status]}>
                      {product.status.replace("-", " ")}
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Products;
