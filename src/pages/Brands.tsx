
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brand } from "lucide-react";

const brandsData = [
  { id: 1, name: "Apple", logo: "apple.png", products: 28 },
  { id: 2, name: "Samsung", logo: "samsung.png", products: 35 },
  { id: 3, name: "Nike", logo: "nike.png", products: 19 },
  { id: 4, name: "Sony", logo: "sony.png", products: 12 },
  { id: 5, name: "Adidas", logo: "adidas.png", products: 16 },
];

export default function Brands() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
            <p className="text-muted-foreground">Manage your product brands</p>
          </div>
          <Button>
            <Brand className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search brands..."
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
                <TableHead>Logo</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandsData.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>{brand.id}</TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell>{brand.logo}</TableCell>
                  <TableCell className="text-right">{brand.products}</TableCell>
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
