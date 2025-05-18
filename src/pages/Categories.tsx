
import React from "react";

interface Category {
  id: number;
  uuid: string;
  status: boolean;
  parent_id: number;
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
}
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tags } from "lucide-react";


export default function Categories() {
  const [categoriesData, setCategoriesData] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:3250/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const { data } = await response.json();
        setCategoriesData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : (
                categoriesData.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.id}</TableCell>
                    <TableCell className="font-medium">{category.description.name}</TableCell>
                    <TableCell>{category.description.url_key}</TableCell>
                    <TableCell className="text-right">{category.show_products ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}

