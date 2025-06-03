import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import attributeService, { Attribute, CreateAttributeData, CreateAttributeOptionData } from "@/services/attributeService";

const attributeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Attribute code is required"),
  type: z.enum(["text", "select", "multiselect", "textarea"]),
  is_required: z.boolean(),
  is_filterable: z.boolean(),
  show_to_customers: z.boolean(),
  sort_order: z.number().min(0),
  // attribute_group_id: z.number().optional(),
});

type AttributeFormData = z.infer<typeof attributeSchema>;

export default function EditAttribute() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const attributeId = id ? parseInt(id) : 0;
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [originalOptions, setOriginalOptions] = useState<string[]>([]);

  const form = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "select",
      is_required: false,
      is_filterable: false,
      show_to_customers: false,
      sort_order: 0,
    },
  });

  const watchedType = form.watch("type");

  // Fetch attribute groups
  const { data: attributeGroups = [] } = useQuery({
    queryKey: ['attribute-groups'],
    queryFn: attributeService.getGroups,
  });

  // Fetch attribute data
  useEffect(() => {
    const fetchAttributeData = async () => {
      if (!attributeId) return;

      setLoading(true);
      try {
        const result = await attributeService.getById(attributeId);
        
        // Check if result exists
        if (!result) {
          throw new Error("Attribute data not found");
        }

        // Handle both possible API response structures
        const attribute = result.data || result;

        // Set form values
        form.reset({
          name: attribute.attribute_name,
          code: attribute.attribute_code,
          type: attribute.type,
          is_required: attribute.is_required,
          is_filterable: attribute.is_filterable,
          show_to_customers: attribute.display_on_frontend,
          sort_order: attribute.sort_order,
     //     attribute_group_id: attribute.attribute_group_id,
        });

        // Set options if available
        if (attribute.options && attribute.options.length > 0) {
          const optionTexts = attribute.options.map(option => option.option_text);
          setOptions(optionTexts);
          setOriginalOptions([...optionTexts]); // Store original options for comparison
        }
      } catch (error) {
        console.error("Error fetching attribute:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load attribute",
          variant: "destructive"
        });
        navigate('/attributes');
      } finally {
        setLoading(false);
      }
    };

    fetchAttributeData();
  }, [attributeId, form, navigate]);

  // Update attribute mutation
  const updateAttributeMutation = useMutation({
    mutationFn: (data: { id: number, attributeData: Partial<CreateAttributeData> }) => 
      attributeService.update(data.id, data.attributeData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attribute updated successfully",
      });
      navigate("/attributes");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update attribute",
        variant: "destructive",
      });
    },
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: (name: string) => attributeService.createGroup(name),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attribute group created successfully",
      });
      setShowCreateGroup(false);
      setNewGroupName("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create attribute group",
        variant: "destructive",
      });
    },
  });

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      createGroupMutation.mutate(newGroupName.trim());
    }
  };

  const onSubmit = async (data: AttributeFormData) => {
    const attributeData: Partial<CreateAttributeData> = {
      attribute_name: data.name,
      attribute_code: data.code,
      type: data.type,
      is_required: data.is_required,
      is_filterable: data.is_filterable,
      display_on_frontend: data.show_to_customers,
      sort_order: data.sort_order,
    //  attribute_group_id: data.attribute_group_id,
    };

    // Update the attribute
    updateAttributeMutation.mutate({ id: attributeId, attributeData }, {
      onSuccess: async (updatedAttribute) => {
        // Handle options for select and multiselect types
        if ((data.type === "select" || data.type === "multiselect")) {
          try {
            // Get current options to compare with new options
            const currentAttribute = await attributeService.getById(attributeId);
            const currentOptions = currentAttribute.options || [];
            
            // Create new options
            const newOptions = options.filter(option => !originalOptions.includes(option));
            const createOptionsPromises = newOptions.map(optionText => {
              const optionData: CreateAttributeOptionData = {
                attribute_id: updatedAttribute.attribute_id,
                attribute_code: updatedAttribute.attribute_code,
                option_text: optionText
              };
              return attributeService.createOption(optionData);
            });

            // Wait for all options to be created
            if (newOptions.length > 0) {
              await Promise.all(createOptionsPromises);
            }

            toast({
              title: "Success",
              description: "Attribute and options updated successfully",
            });
            navigate("/attributes");
          } catch (error) {
            toast({
              title: "Warning",
              description: "Attribute updated but some options failed to update: " + (error as Error).message,
              variant: "destructive",
            });
          }
        } else {
          // No options to update, just navigate
          toast({
            title: "Success",
            description: "Attribute updated successfully",
          });
          navigate("/attributes");
        }
      }
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading attribute data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/attributes">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit attribute</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column - General Information */}
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">General</h2>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attribute code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="mt-2"
                              >
                                <div className="flex items-center space-x-2">
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Attribute Options - only show for select and multiselect */}
                  {(watchedType === "select" || watchedType === "multiselect") && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 uppercase tracking-wide">ATTRIBUTE OPTIONS</h3>
                      <div className="space-y-2">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input value={option} readOnly className="flex-1" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove option
                            </Button>
                          </div>
                        ))}
                        <div className="flex items-center gap-2">
                          <Input
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            placeholder="Enter option"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addOption();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={addOption}
                            className="text-blue-600"
                          >
                            Add option
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attribute Group */}
                  {/*<div>*/}
                  {/*  <h3 className="text-sm font-medium mb-2 uppercase tracking-wide">ATTRIBUTE GROUP</h3>*/}
                  {/*  <p className="text-sm text-gray-600 mb-3">Select groups the attribute belongs to</p>*/}

                  {/*  <div className="space-y-3">*/}
                  {/*    <FormField*/}
                  {/*      control={form.control}*/}
                  {/*      name="attribute_group_id"*/}
                  {/*      render={({ field }) => (*/}
                  {/*        <FormItem>*/}
                  {/*          <FormControl>*/}
                  {/*            <Select */}
                  {/*              onValueChange={(value) => field.onChange(Number(value))}*/}
                  {/*              value={field.value?.toString()}*/}
                  {/*            >*/}
                  {/*              <SelectTrigger>*/}
                  {/*                <SelectValue placeholder="Select..." />*/}
                  {/*              </SelectTrigger>*/}
                  {/*              <SelectContent>*/}
                  {/*                {attributeGroups.map((group) => (*/}
                  {/*                  <SelectItem key={group.attribute_group_id} value={group.attribute_group_id.toString()}>*/}
                  {/*                    {group.group_name}*/}
                  {/*                  </SelectItem>*/}
                  {/*                ))}*/}
                  {/*              </SelectContent>*/}
                  {/*            </Select>*/}
                  {/*          </FormControl>*/}
                  {/*          <FormMessage />*/}
                  {/*        </FormItem>*/}
                  {/*      )}*/}
                  {/*    />*/}

                  {/*    {showCreateGroup ? (*/}
                  {/*      <div className="flex items-center gap-2">*/}
                  {/*        <Input*/}
                  {/*          value={newGroupName}*/}
                  {/*          onChange={(e) => setNewGroupName(e.target.value)}*/}
                  {/*          placeholder="Group name"*/}
                  {/*          className="flex-1"*/}
                  {/*        />*/}
                  {/*        <Button*/}
                  {/*          type="button"*/}
                  {/*          onClick={handleCreateGroup}*/}
                  {/*          disabled={createGroupMutation.isPending}*/}
                  {/*          size="sm"*/}
                  {/*        >*/}
                  {/*          Save*/}
                  {/*        </Button>*/}
                  {/*        <Button*/}
                  {/*          type="button"*/}
                  {/*          variant="ghost"*/}
                  {/*          onClick={() => setShowCreateGroup(false)}*/}
                  {/*          size="sm"*/}
                  {/*        >*/}
                  {/*          <X className="h-4 w-4" />*/}
                  {/*        </Button>*/}
                  {/*      </div>*/}
                  {/*    ) : (*/}
                  {/*      <Button*/}
                  {/*        type="button"*/}
                  {/*        variant="outline"*/}
                  {/*        onClick={() => setShowCreateGroup(true)}*/}
                  {/*        className="flex items-center gap-1"*/}
                  {/*      >*/}
                  {/*        <Plus className="h-4 w-4" />*/}
                  {/*        Create a new group*/}
                  {/*      </Button>*/}
                  {/*    )}*/}
                  {/*  </div>*/}
                  {/*</div>*/}
                </CardContent>
              </Card>

              {/* Right Column - Settings */}
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">Setting</h2>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="is_required"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Is Required?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === "true")}
                              value={field.value ? "true" : "false"}
                              className="mt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="not-required" />
                                <Label htmlFor="not-required">Not required</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="required" />
                                <Label htmlFor="required">Required</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_filterable"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Is Filterable?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === "true")}
                              value={field.value ? "true" : "false"}
                              className="mt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="filter-no" />
                                <Label htmlFor="filter-no">No</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="filter-yes" />
                                <Label htmlFor="filter-yes">Yes</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="show_to_customers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Show to customers?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => field.onChange(value === "true")}
                              value={field.value ? "true" : "false"}
                              className="mt-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id="show-no" />
                                <Label htmlFor="show-no">No</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id="show-yes" />
                                <Label htmlFor="show-yes">Yes</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sort_order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort order</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between">
              <Link to="/attributes">
                <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={updateAttributeMutation.isPending}>
                {updateAttributeMutation.isPending ? "Updating..." : "Update Attribute"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}