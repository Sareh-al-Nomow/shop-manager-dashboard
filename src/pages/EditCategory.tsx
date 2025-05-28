import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { categoryService, imageService } from "@/services";
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
import { isEqual } from "lodash";

interface ParentCategory {
  id: number;
  name: string;
}

export default function EditCategory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams<{ id: string }>();
  const categoryId = id ? parseInt(id) : 0;

  // State for form data
  const [formData, setFormData] = useState({
    status: true,
    include_in_nav: true,
    show_products: true,
    parent_id: null,
    position: '1',
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

  // State to store the original form data for comparison
  const [originalFormData, setOriginalFormData] = useState({
    status: true,
    include_in_nav: true,
    show_products: true,
    parent_id: null,
    position: '1',
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
  const [loading, setLoading] = useState(true);

  // Fetch category data
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categoryId) return;

      setLoading(true);
      try {

        const result = await categoryService.getCategoryById(categoryId);

        // Check if result exists
        if (!result) {
          throw new Error("Category data not found");
        }

        // Handle both possible API response structures
        const category = result.data || result;

        // Create form data object from category with null checks
        const newFormData = {
          status: category?.status ?? "true",
          include_in_nav: category?.include_in_nav ?? "true",
          show_products: category?.show_products ?? "true",
          parent_id: category?.parent_id ? category.parent_id : 0,
          position: category?.position ? category.position.toString() : '1',
          description: {
            name: category?.description?.name || '',
            short_description: category?.description?.short_description || '',
            description: category?.description?.description || '',
            meta_title: category?.description?.meta_title || '',
            meta_keywords: category?.description?.meta_keywords || '',
            meta_description: category?.description?.meta_description || '',
            url_key: category?.description?.url_key || ''
          }
        };

        // Set both form data and original form data
        setFormData(newFormData);
        setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));

        // Set image preview if available
        if (category?.image_url) {
          setImagePreview(`http://192.168.100.13:3250${category.image}`);
        }
        // Check if image is in a different location in the API response
        else if (category?.image) {
          setImagePreview(category.image);
        }
        // Check if image is in the description object
        else if (category?.description?.image) {
          setImagePreview(`http://localhost:3250${category.description.image}`);
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load category",
          variant: "destructive"
        });
        navigate('/categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId, navigate, toast]);

  // Fetch parent categories
  useEffect(() => {
    const fetchParentCategories = async () => {
      setLoadingCategories(true);
      try {
        const result = await categoryService.getCategories();

        // Check if result and result.data exist
        if (!result || !result.data) {
          throw new Error("Parent categories data not found");
        }

        const { data } = result;

        // Extract categories with their names with null checks
        const categories = data
          .filter((cat: any) => cat && cat.id !== categoryId) // Exclude current category
          .map((cat: any) => ({
            id: cat.id,
            name: cat.description?.name || 'Unnamed Category'
          }));

        setParentCategories(categories);
      } catch (error) {
        console.error("Error fetching parent categories:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load parent categories",
          variant: "destructive"
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchParentCategories();
  }, [categoryId, toast]);

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
      parent_id: value === 'none' ? null : parseInt(value)
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

    // Only validate image if there's no existing image
    if (!imageFile && !imagePreview) {
      toast({
        title: "Validation Error",
        description: "Category image is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create JSON object for API
      const apiData: any = {};

      // Always include status as it's required by the server
      apiData.status = formData.status;

      // Check include_in_nav
      if (!isEqual(formData.include_in_nav, originalFormData.include_in_nav)) {
        apiData.include_in_nav = formData.include_in_nav;
      }

      // Check show_products
      if (!isEqual(formData.show_products, originalFormData.show_products)) {
        apiData.show_products = formData.show_products;
      }

      // Handle parent_id (convert 'none' to null or convert to number)
      if (!isEqual(formData.parent_id, originalFormData.parent_id)) {
        if (formData.parent_id === 'none' || formData.parent_id === null) {
          apiData.parent_id = '';
        } else if (formData.parent_id) {
          apiData.parent_id = formData.parent_id;
        }
      }

      // Add position if it exists and has changed
      if (formData.position && !isEqual(formData.position, originalFormData.position)) {
        apiData.position = formData.position;
      }

      // Compare and add only changed description fields
      const descriptionChanges: any = {};
      let hasDescriptionChanges = false;

      Object.entries(formData.description).forEach(([key, value]) => {
        const originalValue = originalFormData.description[key as keyof typeof originalFormData.description];
        if (!isEqual(value, originalValue)) {
          descriptionChanges[key] = value;
          hasDescriptionChanges = true;
        }
      });

      if (hasDescriptionChanges) {
        apiData.description = descriptionChanges;
      }

      // Handle image upload if a new image is selected
      if (imageFile) {
        try {
          // Upload the image first
          const imageUploadResult = await imageService.uploadCategoryImage(imageFile);
          console.log('Image upload result:', imageUploadResult);

          // Get the image path from the response
          if (imageUploadResult && imageUploadResult.image_path) {
            // Add the image path to the API data
            apiData.image_path = imageUploadResult.image_path;
          } else {
            throw new Error('Image upload failed: No image path returned');
          }
        } catch (imageError) {
          console.error('Error uploading image:', imageError);
          toast({
            title: "Error",
            description: imageError instanceof Error ? imageError.message : "Failed to upload image",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Log the data being sent for debugging
      console.log('Sending the following changed fields:', apiData);

      // Send PUT request using categoryService
      const result = await categoryService.updateCategory(categoryId, apiData);

      toast({
        title: "Success",
        description: "Category updated successfully"
      });

      // Redirect to categories page
      navigate('/categories');

    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading category data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/categories">
            <Button type="button" variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit Category</h1>
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
                        value={formData.parent_id.toString() || 'none'}
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
                <h2 className="text-lg font-semibold mb-4">SHOW PRODUCTS</h2>
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

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? 'Updating...' : 'Update Category'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
