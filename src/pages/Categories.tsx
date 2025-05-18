
import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tags } from "lucide-react";

const categoriesData = [
  { id: 1, name: "Electronics", slug: "electronics", products: 42 },
  { id: 2, name: "Clothing", slug: "clothing", products: 36 },
  { id: 3, name: "Home & Kitchen", slug: "home-kitchen", products: 28 },
  { id: 4, name: "Beauty", slug: "beauty", products: 15 },
  { id: 5, name: "Sports", slug: "sports", products: 20 },
];

export default function Categories() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Manage your product categories</p>
          </div>
          <Link to="/create-category">
            <Button>
              <Tags className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search categories..."
            className="max-w-sm"
          />
          <Button variant="outline">Search</Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoriesData.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell className="text-right">{category.products}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
