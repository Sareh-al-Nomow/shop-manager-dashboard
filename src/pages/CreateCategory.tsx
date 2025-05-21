
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParentCategory {
  id: number;
  name: string;
}

export default function CreateCategory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for form data
  const [formData, setFormData] = useState({
    status: true,
    include_in_nav: true,
    show_products: true,
    parent_id: null,
    position: '',
    description: {
      name: '',
      short_description: '',
      description: '',
      meta_title: '',
      meta_keywords: '',
      meta_description: '',
      url_key: ''
    }
  });

  // State for image file
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch parent categories
  useEffect(() => {
    const fetchParentCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await axios.get("http://localhost:3250/api/categories", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        // With axios, the data is already parsed and available in response.data
        const { data } = response.data;

        // Extract categories with their names
        const categories = data.map((cat:any) => ({
          id: cat.id,
          name: cat.description.name
        }));

        setParentCategories(categories);
      } catch (error) {
        console.error("Error fetching parent categories:", error);
        toast({
          title: "Error",
          description: "Failed to load parent categories",
          variant: "destructive"
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchParentCategories();
  }, [toast]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    if (id === 'name' || id === 'description' || id === 'short_description' || id === 'meta-title' || 
        id === 'meta-keywords' || id === 'meta-description' || id === 'url-key') {
      // Map form field IDs to API field names
      const fieldMap: Record<string, string> = {
        'name': 'name',
        'description': 'description',
        'meta-title': 'meta_title',
        "short_description": "short_description",
        'meta-keywords': 'meta_keywords',
        'meta-description': 'meta_description',
        'url-key': 'url_key'
      };

      setFormData({
        ...formData,
        description: {
          ...formData.description,

          [fieldMap[id]]: value
        }
      },);
    } else if (id === 'position') {
      setFormData({
        ...formData,
        position: value
      });
    }
  };

  // Handle radio button changes
  const handleRadioChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value === 'yes' || value === 'enabled'
    });
  };

  // Handle parent category change
  const handleParentChange = (value: string) => {
    setFormData({
      ...formData,
      parent_id: value
    });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.name) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData object
      const apiFormData = new FormData();

      // Add image if selected
      if (imageFile) {
        apiFormData.append('image', imageFile);
      }

      // Add all form fields directly to FormData
      apiFormData.append('status', String(formData.status));
      apiFormData.append('include_in_nav', String(formData.include_in_nav));
      apiFormData.append('show_products', String(formData.show_products));

      // Handle parent_id (convert 'none' to null or convert to number)
      if (formData.parent_id === 'none') {
        apiFormData.append('parent_id', '');
      } else if (formData.parent_id) {
        apiFormData.append('parent_id', String(formData.parent_id));
      }

      // Add position if it exists
      if (formData.position) {
        apiFormData.append('position', formData.position);
      }

      // Add all description fields
      Object.entries(formData.description).forEach(([key, value]) => {
        apiFormData.append(`description[${key}]`, String(value));
      });

      // Send POST request using axios
      const response = await axios.post('http://localhost:3250/api/categories', apiFormData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data" // Axios sets this automatically for FormData
        }
      });

      // Axios automatically throws errors for non-2xx responses
      // and parses JSON responses, so we can access data directly
      const result = response.data;

      toast({
        title: "Success",
        description: "Category created successfully"
      });

      // Redirect to categories page
      navigate('/categories');

    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/categories">
            <Button type="button" variant="outline" size="icon">
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
                      <Input 
                        id="name" 
                        className="mt-1" 
                        value={formData.description.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="short_description">Short Description</Label>
                      <Textarea 
                        id="short_description" 
                        className="mt-1"
                        value={formData.description.short_description}
                        onChange={handleInputChange}
                        placeholder="Enter a brief description"
                      />
                    </div>

                    <div>
                      <Label htmlFor="parent">Parent category</Label>
                      <Select 
                        value={formData.parent_id} 
                        onValueChange={handleParentChange}
                        disabled={loadingCategories}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select parent category"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Root Category)</SelectItem>
                          {parentCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input 
                        id="position" 
                        className="mt-1" 
                        type="number"
                        value={formData.position}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        className="mt-1"
                        value={formData.description.description}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Search engine optimize</h2>

                  <div>
                    <Label htmlFor="url-key">Url key</Label>
                    <Input 
                      id="url-key" 
                      className="mt-1"
                      value={formData.description.url_key}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta-title">Meta title</Label>
                    <Input 
                      id="meta-title" 
                      className="mt-1"
                      value={formData.description.meta_title}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta-keywords">Meta keywords</Label>
                    <Input 
                      id="meta-keywords" 
                      className="mt-1"
                      value={formData.description.meta_keywords}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta-description">Meta description</Label>
                    <Textarea 
                      id="meta-description" 
                      className="mt-1"
                      value={formData.description.meta_description}
                      onChange={handleInputChange}
                    />
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
                <div 
                  className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Category banner preview" 
                      className="h-32 object-contain mb-4"
                    />
                  ) : (
                    <Upload className="h-12 w-12 text-gray-400" />
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? 'Change image' : 'Add image'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">click to upload an image</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">STATUS</h2>
                <RadioGroup 
                  value={formData.status ? "enabled" : "disabled"}
                  onValueChange={(value) => handleRadioChange('status', value)}
                >
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
                <RadioGroup 
                  value={formData.include_in_nav ? "yes" : "no"}
                  onValueChange={(value) => handleRadioChange('include_in_nav', value)}
                >
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
                <RadioGroup 
                  value={formData.show_products ? "yes" : "no"}
                  onValueChange={(value) => handleRadioChange('show_products', value)}
                >
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
            <Button 
              type="button" 
              variant="outline" 
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Cancel
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : 'Save'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
