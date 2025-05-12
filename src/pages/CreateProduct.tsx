
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Form, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const CreateProduct = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const form = useForm();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create a new product</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Product name" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <div className="mt-1">
                    <Button variant="outline" className="w-full justify-start text-left">
                      Select category
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <div className="mt-1">
                    <Button variant="outline" className="w-full justify-start text-left">
                      Select brand
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Type / to see the available blocks" 
                    className="mt-1 min-h-[150px]" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="regularPrice">Regular price</Label>
                    <Input id="regularPrice" type="number" placeholder="0.00" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Sale price</Label>
                    <Input id="salePrice" type="number" placeholder="0.00" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" placeholder="Stock keeping unit" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock quantity</Label>
                    <Input id="stock" type="number" placeholder="0" className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search engine optimize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="urlKey">URL key</Label>
                  <Input id="urlKey" placeholder="product-url-key" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="metaTitle">Meta title</Label>
                  <Input id="metaTitle" placeholder="" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="metaKeywords">Meta keywords</Label>
                  <Input id="metaKeywords" placeholder="" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta description</Label>
                  <Textarea id="metaDescription" placeholder="" className="mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]">
                  {selectedImage ? (
                    <div className="relative w-full">
                      <img 
                        src={selectedImage} 
                        alt="Product" 
                        className="mx-auto max-h-[200px] object-contain"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="mt-4 mx-auto block"
                        onClick={() => setSelectedImage(null)}
                      >
                        Remove image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-muted rounded-full p-3 mb-3">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center space-y-3">
                        <Button variant="outline" className="relative" asChild>
                          <label>
                            Add image
                            <input 
                              type="file" 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                              onChange={handleImageChange}
                              accept="image/*"
                            />
                          </label>
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          click to upload an image
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="enabled">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="disabled" id="disabled" />
                    <Label htmlFor="disabled">Disabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="enabled" id="enabled" />
                    <Label htmlFor="enabled">Enabled</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Featured</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="no">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="not-featured" />
                    <Label htmlFor="not-featured">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="featured" />
                    <Label htmlFor="featured">Yes</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link to="/products">Cancel</Link>
          </Button>
          <Button>Save</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateProduct;
