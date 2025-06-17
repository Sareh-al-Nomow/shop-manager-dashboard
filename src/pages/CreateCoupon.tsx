
import React, { useState, useEffect } from "react";
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
import { CalendarIcon, ArrowLeft, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { couponService, groupService } from "@/services";
import { useToast } from "@/components/ui/use-toast";
import { Group } from "@/services/groupService";

const CreateCoupon = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    coupon: '',
    description: '',
    status: true,
    discount_amount: 0,
    free_shipping: false,
    discount_type: 'percentage',
    max_uses_time_per_coupon: 0,
    max_uses_time_per_customer: 0,
    target_products: {},
    condition: {},
    user_condition: {
      type: 'all', // Set default customer type
      groups: [],
      emails: '',
      purchased: ''
    },
    buyx_gety: {}
  });

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user groups
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true); 
      try {
        const groups = await groupService.getAll();
        setGroups(groups);
      } catch (error) {
        console.error('Error fetching user groups:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user groups',
          variant: 'destructive'
        });
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [toast]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'couponCode' ? 'coupon' : id]: value
    }));

    // Clear error for this field if it exists
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [id]: checked
    }));
  };

  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.coupon) newErrors.couponCode = 'Coupon code is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (formData.discount_amount <= 0) newErrors.discountAmount = 'Discount amount must be greater than 0';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';

    // Validate max uses
    if (formData.max_uses_time_per_coupon < 1) {
      newErrors.maxUsesPerCoupon = 'Maximum uses per coupon must be at least 1';
    }
    if (formData.max_uses_time_per_customer < 1) {
      newErrors.maxUsesPerCustomer = 'Maximum uses per customer must be at least 1';
    }

    // Validate dates
    if (startDate && endDate && startDate >= endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Validate emails if provided
    if (formData.user_condition?.emails) {
      const emails = formData.user_condition.emails.split(',').map(email => email.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      for (const email of emails) {
        if (email && !emailRegex.test(email)) {
          newErrors.customerEmails = 'Please enter valid email addresses';
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare data for submission
      const couponData = {
        ...formData,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString()
      };

      await couponService.create(couponData);

      toast({
        title: 'Success',
        description: 'Coupon created successfully'
      });

      navigate('/coupons');
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to create coupon',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/coupons")}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Create a new coupon</h1>
          </div>
          {loadingGroups && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading user groups...
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* General Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">General</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="couponCode">Coupon code</Label>
                <Input 
                  id="couponCode" 
                  placeholder="Enter coupon code" 
                  className={cn("mt-1", errors.couponCode && "border-red-500")}
                  value={formData.coupon}
                  onChange={handleInputChange}
                />
                {errors.couponCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.couponCode}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter description" 
                  className={cn("mt-1", errors.description && "border-red-500")}
                  value={formData.description}
                  onChange={handleInputChange}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="status">Status</Label>
                <Switch 
                  id="status" 
                  checked={formData.status}
                  onCheckedChange={(checked) => handleCheckboxChange('status', checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discountAmount">Discount amount</Label>
                  <Input 
                    id="discountAmount" 
                    type="number"
                    placeholder="Discount amount" 
                    className={cn("mt-1", errors.discountAmount && "border-red-500")}
                    value={formData.discount_amount || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      discount_amount: parseFloat(e.target.value) || 0
                    }))}
                  />
                  {errors.discountAmount && (
                    <p className="text-red-500 text-sm mt-1">{errors.discountAmount}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="startDate">Start date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !startDate && "text-muted-foreground",
                          errors.startDate && "border-red-500"
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
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate">End date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !endDate && "text-muted-foreground",
                          errors.endDate && "border-red-500"
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
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="freeShipping" 
                  checked={formData.free_shipping}
                  onCheckedChange={(checked) => handleCheckboxChange('free_shipping', checked === true)}
                />
                <Label htmlFor="freeShipping">Free shipping?</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUsesPerCoupon">Maximum uses per coupon</Label>
                  <Input 
                    id="maxUsesPerCoupon" 
                    type="number"
                    placeholder="Maximum uses per coupon" 
                    className={cn("mt-1", errors.maxUsesPerCoupon && "border-red-500")}
                    value={formData.max_uses_time_per_coupon || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      max_uses_time_per_coupon: parseInt(e.target.value) || 0
                    }))}
                  />
                  {errors.maxUsesPerCoupon && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxUsesPerCoupon}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="maxUsesPerCustomer">Maximum uses per customer</Label>
                  <Input 
                    id="maxUsesPerCustomer" 
                    type="number"
                    placeholder="Maximum uses per customer" 
                    className={cn("mt-1", errors.maxUsesPerCustomer && "border-red-500")}
                    value={formData.max_uses_time_per_customer || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      max_uses_time_per_customer: parseInt(e.target.value) || 0
                    }))}
                  />
                  {errors.maxUsesPerCustomer && (
                    <p className="text-red-500 text-sm mt-1">{errors.maxUsesPerCustomer}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Discount Type Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Discount Type</h2>

            <RadioGroup 
              value={formData.discount_type} 
              onValueChange={(value) => handleSelectChange('discount_type', value)}
            >
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Fixed discount</Label>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage">Percentage discount</Label>
              </div>
            </RadioGroup>

            {formData.discount_type === 'percentage' && (
              <div className="mt-4">
                <Label htmlFor="maximumPercentageAmount">Maximum percentage amount</Label>
                <Input 
                  id="maximumPercentageAmount" 
                  type="number"
                  placeholder="Enter maximum percentage amount" 
                  className="mt-1"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      condition: {
                        ...prev.condition,
                        maximum_percentage_amount: value
                      }
                    }));
                  }}
                />
                <p className="text-sm text-muted-foreground mt-1">Maximum amount when using percentage discount</p>
              </div>
            )}
          </div>

          {/* Order Conditions Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Order conditions</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="minPurchaseAmount">Minimum purchase amount</Label>
                <Input 
                  id="minPurchaseAmount" 
                  type="number"
                  placeholder="Enter minimum purchase amount" 
                  className="mt-1"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      condition: {
                        ...prev.condition,
                        min_purchase_amount: value
                      }
                    }));
                  }}
                />
              </div>

              <div>
                <Label htmlFor="minPurchaseQty">Minimum purchase qty</Label>
                <Input 
                  id="minPurchaseQty" 
                  type="number"
                  placeholder="Enter minimum purchase qty" 
                  className="mt-1"
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      condition: {
                        ...prev.condition,
                        min_purchase_qty: value
                      }
                    }));
                  }}
                />
              </div>
            </div>
          </div>

          {/* Customer Conditions Section */}
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Customer conditions</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="customerCondition">Customer type</Label>
                <Select 
                  value={formData.user_condition?.type || 'all'}
                  onValueChange={(value) => {
                    setFormData(prev => ({
                      ...prev,
                      user_condition: {
                        ...prev.user_condition,
                        type: value
                      }
                    }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select customer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All customers</SelectItem>
                    <SelectItem value="specific">Specific customer groups</SelectItem>
                    <SelectItem value="new">New customers only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.user_condition?.type === 'specific' && (
                <div>
                  <Label>Customer groups</Label>
                  <div className="mt-2 space-y-2">
                    {loadingGroups ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading groups...
                      </div>
                    ) : groups.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No customer groups found</p>
                    ) : (
                      groups.map((group) => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`group-${group.id}`}
                            onCheckedChange={(checked) => {
                              setFormData(prev => {
                                const selectedGroups = prev.user_condition?.groups || [];
                                const newGroups = checked 
                                  ? [...selectedGroups, group.id]
                                  : selectedGroups.filter(id => id !== group.id);

                                return {
                                  ...prev,
                                  user_condition: {
                                    ...prev.user_condition,
                                    groups: newGroups
                                  }
                                };
                              });
                            }}
                          />
                          <Label htmlFor={`group-${group.id}`}>{group.group_name}</Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="customerEmails">Customer emails</Label>
                <Input 
                  id="customerEmails" 
                  placeholder="Enter customer emails" 
                  className={cn("mt-1", errors.customerEmails && "border-red-500")}
                  value={formData.user_condition?.emails || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      user_condition: {
                        ...prev.user_condition,
                        emails: e.target.value
                      }
                    }));

                    // Clear error for this field if it exists
                    if (errors.customerEmails) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.customerEmails;
                        return newErrors;
                      });
                    }
                  }}
                />
                <p className="text-sm text-muted-foreground mt-1">Use comma when you have multi email (e.g., a@a.com, b@b.com)</p>
                {errors.customerEmails && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerEmails}</p>
                )}
              </div>

              <div>
                <Label htmlFor="minPurchasedAmount">Minimum purchased amount</Label>
                <Input 
                  id="minPurchasedAmount" 
                  type="number"
                  placeholder="Enter minimum purchased amount" 
                  className="mt-1"
                  value={formData.user_condition?.purchased || ''}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      user_condition: {
                        ...prev.user_condition,
                        purchased: e.target.value
                      }
                    }));
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/coupons")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Coupon'
              )}
            </Button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default CreateCoupon;
