
import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateAttribute() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/attributes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create a new attribute</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - Attribute Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" className="mt-1" />
                    </div>
                    
                    <div>
                      <Label htmlFor="code">Attribute code</Label>
                      <Input id="code" className="mt-1" />
                    </div>
                    
                    <div>
                      <Label>Type</Label>
                      <RadioGroup defaultValue="text">
                        <div className="flex items-center space-x-2 mt-2">
                          <RadioGroupItem value="text" id="type-text" />
                          <Label htmlFor="type-text">Text</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="select" id="type-select" />
                          <Label htmlFor="type-select">Select</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="multiselect" id="type-multiselect" />
                          <Label htmlFor="type-multiselect">Multiselect</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="textarea" id="type-textarea" />
                          <Label htmlFor="type-textarea">Textarea</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold uppercase">Attribute group</h2>
                  <p className="text-sm">Select groups the attribute belongs to</p>
                  
                  <div className="flex gap-4">
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Information</SelectItem>
                        <SelectItem value="physical">Physical Properties</SelectItem>
                        <SelectItem value="appearance">Appearance</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Create a new group
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Options */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Is Required?</h2>
                <RadioGroup defaultValue="not-required">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-required" id="not-required" />
                    <Label htmlFor="not-required">Not required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="required" id="required" />
                    <Label htmlFor="required">Required</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Is Filterable?</h2>
                <RadioGroup defaultValue="no">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="filter-no" />
                    <Label htmlFor="filter-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="filter-yes" />
                    <Label htmlFor="filter-yes">Yes</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Show to customers?</h2>
                <RadioGroup defaultValue="no">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="show-no" />
                    <Label htmlFor="show-no">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="show-yes" />
                    <Label htmlFor="show-yes">Yes</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Sort order</h2>
                <Input type="number" min="0" defaultValue="0" />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Link to="/attributes">
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">Cancel</Button>
          </Link>
          <Button>Save</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
