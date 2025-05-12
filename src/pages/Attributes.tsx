
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Attribute } from "lucide-react";

const attributesData = [
  { id: 1, name: "Color", values: ["Red", "Blue", "Green", "Black", "White"], products: 52 },
  { id: 2, name: "Size", values: ["S", "M", "L", "XL", "XXL"], products: 48 },
  { id: 3, name: "Material", values: ["Cotton", "Polyester", "Leather", "Denim"], products: 33 },
  { id: 4, name: "Weight", values: ["Light", "Medium", "Heavy"], products: 21 },
  { id: 5, name: "Storage", values: ["64GB", "128GB", "256GB", "512GB", "1TB"], products: 19 },
];

export default function Attributes() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attributes</h1>
            <p className="text-muted-foreground">Manage your product attributes</p>
          </div>
          <Button>
            <Attribute className="mr-2 h-4 w-4" />
            Add Attribute
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search attributes..."
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
                <TableHead>Values</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attributesData.map((attribute) => (
                <TableRow key={attribute.id}>
                  <TableCell>{attribute.id}</TableCell>
                  <TableCell className="font-medium">{attribute.name}</TableCell>
                  <TableCell>{attribute.values.join(", ")}</TableCell>
                  <TableCell className="text-right">{attribute.products}</TableCell>
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
