
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const CreateProduct = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* General Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Name" className="mt-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" placeholder="SKU" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <div className="flex mt-1">
                      <Input id="price" placeholder="Price" className="rounded-r-none" />
                      <div className="bg-muted flex items-center justify-center px-3 border border-l-0 border-input rounded-r-md">
                        USD
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <div className="flex mt-1">
                      <Input id="weight" placeholder="Weight" className="rounded-r-none" />
                      <div className="bg-muted flex items-center justify-center px-3 border border-l-0 border-input rounded-r-md">
                        kg
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <div className="mt-1">
                    <Button variant="outline" className="w-full justify-start text-left text-blue-600">
                      Select category
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="taxClass">Tax class</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="reduced">Reduced</SelectItem>
                    </SelectContent>
                  </Select>
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

            {/* Media Card */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
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
                    <div className="text-center flex flex-col items-center">
                      <div className="text-teal-500 mb-4">
                        <Upload className="h-10 w-10" />
                      </div>
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
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Search Engine Optimize Card */}
            <Card>
              <CardHeader>
                <CardTitle>Search engine optimize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="urlKey">URL key</Label>
                  <Input id="urlKey" placeholder="" className="mt-1" />
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

          {/* Right Column */}
          <div className="space-y-6">
            {/* Product Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Product status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="mb-2">Status</p>
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
                </div>

                <div>
                  <p className="mb-2">Visibility</p>
                  <RadioGroup defaultValue="visible">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-visible" id="not-visible" />
                      <Label htmlFor="not-visible">Not visible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="visible" id="visible" />
                      <Label htmlFor="visible">Visible</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Card */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="mb-2">Manage stock?</p>
                  <RadioGroup defaultValue="yes">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="manage-stock-no" />
                      <Label htmlFor="manage-stock-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="manage-stock-yes" />
                      <Label htmlFor="manage-stock-yes">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <p className="mb-2">Stock availability</p>
                  <RadioGroup defaultValue="yes">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="stock-availability-no" />
                      <Label htmlFor="stock-availability-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="stock-availability-yes" />
                      <Label htmlFor="stock-availability-yes">Yes</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" placeholder="Quantity" className="mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Attribute Group Card */}
            <Card>
              <CardHeader>
                <CardTitle className="uppercase text-sm font-semibold">Attribute Group</CardTitle>
              </CardHeader>
              <CardContent>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Colors and Size Card */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="black">Black</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="size">Size</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Please select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xs">XS</SelectItem>
                      <SelectItem value="s">S</SelectItem>
                      <SelectItem value="m">M</SelectItem>
                      <SelectItem value="l">L</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="destructive" asChild>
            <Link to="/products">Cancel</Link>
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">Save</Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateProduct;
