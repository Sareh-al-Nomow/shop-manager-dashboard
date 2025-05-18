
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CreateCoupon = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/coupons")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create a new coupon</h1>
        </div>

        <div className="space-y-6">
          {/* General Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">General</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="couponCode">Coupon code</Label>
                <Input id="couponCode" placeholder="Enter coupon code" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter description" className="mt-1" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="status">Status</Label>
                <Switch id="status" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discountAmount">Discount amount</Label>
                  <Input id="discountAmount" placeholder="Discount amount" className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="startDate">Start date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="endDate">End date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="freeShipping" />
                <Label htmlFor="freeShipping">Free shipping?</Label>
              </div>
            </div>
          </div>
          
          {/* Discount Type Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Discount Type</h2>
            
            <RadioGroup defaultValue="fixed">
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Fixed discount to specific products</Label>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage">Percentage discount to specific products</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buyXgetY" id="buyXgetY" />
                <Label htmlFor="buyXgetY">Buy X get Y</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Order Conditions Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Order conditions</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="minPurchaseAmount">Minimum purchase amount</Label>
                <Input id="minPurchaseAmount" placeholder="Enter minimum purchase amount" className="mt-1" />
              </div>
              
              <div>
                <Label htmlFor="minPurchaseQty">Minimum purchase qty</Label>
                <Input id="minPurchaseQty" placeholder="Enter minimum purchase qty" className="mt-1" />
              </div>
              
              <div>
                <Label className="block mb-2">Order must contains product matched bellow conditions(All)</Label>
                <div className="border rounded-md p-4">
                  <div className="grid grid-cols-4 gap-4 mb-2 font-medium">
                    <div>Key</div>
                    <div>Operator</div>
                    <div>Value</div>
                    <div>Minimum quantity</div>
                  </div>
                  <div className="text-center py-4 text-muted-foreground">No conditions added</div>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add product
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Customer Conditions Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Customer conditions</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerCondition">Select...</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All customers</SelectItem>
                    <SelectItem value="specific">Specific customer groups</SelectItem>
                    <SelectItem value="new">New customers only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="customerEmail">Customer email (empty for all)</Label>
                <div className="relative mt-1">
                  <Input id="customerEmail" placeholder="Enter customer emails" />
                  <Button variant="ghost" size="icon" className="absolute right-0 top-0">
                    <i className="i-lucide-mail h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Use comma when you have multi email</p>
              </div>
              
              <div>
                <Label htmlFor="customerPurchase">Customer's purchase</Label>
                <Input id="customerPurchase" placeholder="Enter purchased amount" className="mt-1" />
                <Label htmlFor="minPurchasedAmount" className="mt-2">Minimum purchased amount</Label>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/coupons")}>
              Cancel
            </Button>
            <Button>
              Save
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateCoupon;
