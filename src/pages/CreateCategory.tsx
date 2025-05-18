
import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";

export default function CreateCategory() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/categories">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create a new category</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - General Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">General</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" className="mt-1" />
                    </div>
                    
                    <div>
                      <Label htmlFor="parent">Parent category</Label>
                      <div className="flex items-center mt-1 gap-2">
                        <div className="border rounded px-3 py-2 flex-1 text-sm text-gray-500">Men</div>
                        <Button variant="outline" size="sm">Change</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Unlink</Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="search">Search</Label>
                      <Input id="search" className="mt-1" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Search engine optimize</h2>
                  
                  <div>
                    <Label htmlFor="url-key">Url key</Label>
                    <Input id="url-key" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta-title">Meta title</Label>
                    <Input id="meta-title" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta-keywords">Meta keywords</Label>
                    <Input id="meta-keywords" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta-description">Meta description</Label>
                    <Textarea id="meta-description" className="mt-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Banner, Status, Options */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Category banner</h2>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <Button variant="outline" className="mt-4">Add image</Button>
                  <p className="text-sm text-muted-foreground mt-2">click to upload an image</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">STATUS</h2>
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
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">INCLUDE IN STORE MENU</h2>
                <RadioGroup defaultValue="yes">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="menu-no" />
                    <Label htmlFor="menu-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="menu-yes" />
                    <Label htmlFor="menu-yes">Yes</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">SHOW PRODUCTS?</h2>
                <RadioGroup defaultValue="yes">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="products-no" />
                    <Label htmlFor="products-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="products-yes" />
                    <Label htmlFor="products-yes">Yes</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Link to="/categories">
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">Cancel</Button>
          </Link>
          <Button>Save</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
