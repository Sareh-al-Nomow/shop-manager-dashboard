import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { brandService, imageService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { isEqual } from "lodash";

export default function EditBrand() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams<{ id: string }>();
  const brandId = id ? parseInt(id) : 0;

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    isActive: true
  });

  // State to store the original form data for comparison
  const [originalFormData, setOriginalFormData] = useState({
    name: '',
    description: '',
    slug: '',
    isActive: true
  });

  // State for logo file
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch brand data
  useEffect(() => {
    const fetchBrandData = async () => {
      if (!brandId) return;

      setLoading(true);
      try {
        const result = await brandService.getBrandById(brandId);

        // Check if result exists
        if (!result) {
          throw new Error("Brand data not found");
        }

        // Handle both possible API response structures
        const brand = result.data || result;

        // Create form data object from brand with null checks
        const newFormData = {
          name: brand?.name || '',
          description: brand?.description || '',
          slug: brand?.slug || '',
          isActive: brand?.isActive !== undefined ? brand.isActive : true
        };

        // Set both form data and original form data
        setFormData(newFormData);
        setOriginalFormData(JSON.parse(JSON.stringify(newFormData)));

        // Set logo preview if available
        if (brand?.logo_url) {
          setLogoPreview(brand.logo_url);
        }
      } catch (error) {
        console.error("Error fetching brand:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load brand",
          variant: "destructive"
        });
        navigate('/brands');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, [brandId, navigate, toast]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value
    });
  };

  // Handle radio button changes
  const handleRadioChange = (value: string) => {
    setFormData({
      ...formData,
      isActive: value === 'enabled'
    });
  };

  /**
   * Helper function to validate basic image properties (type and size)
   */
  const validateImageBasics = (file: File): boolean => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPEG, JPG, PNG, GIF)",
        variant: "destructive"
      });
      return false;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Image size should not exceed 2MB",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate the file
      if (!validateImageBasics(file)) {
        return;
      }

      // Step 2: Validate image dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        // Check minimum dimensions (at least 200x200 pixels)
        if (img.width < 200 || img.height < 200) {
          toast({
            title: "Image Too Small",
            description: "Image dimensions should be at least 200x200 pixels",
            variant: "destructive"
          });
          return;
        }

        // Check maximum dimensions (at most 2000x2000 pixels)
        if (img.width > 2000 || img.height > 2000) {
          toast({
            title: "Image Too Large",
            description: "Image dimensions should not exceed 2000x2000 pixels",
            variant: "destructive"
          });
          return;
        }

        setLogoFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      };

      // Step 3: Handle image loading errors
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        toast({
          title: "Invalid Image",
          description: "The selected file is not a valid image",
          variant: "destructive"
        });
      };

      img.src = objectUrl;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Brand name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create brand data object with only changed fields
      const brandData: any = {};

      // Check name
      if (!isEqual(formData.name, originalFormData.name)) {
        brandData.name = formData.name;
      }

      // Check description
      if (!isEqual(formData.description, originalFormData.description)) {
        brandData.description = formData.description;
      }

      // Check slug
      if (!isEqual(formData.slug, originalFormData.slug)) {
        brandData.slug = formData.slug;
      }

      // Check isActive
      if (!isEqual(formData.isActive, originalFormData.isActive)) {
        brandData.isActive = formData.isActive;
      }

      // Handle logo upload if a new logo is selected
      if (logoFile) {
        try {
          // Upload the logo first
          const logoUploadResult = await imageService.uploadBrandLogo(logoFile);

          // Get the logo path from the response
          if (logoUploadResult && logoUploadResult.logo_path) {
            // Add the logo path to the API data
            brandData.logo_url = logoUploadResult.logo_path;
          } else {
            throw new Error('Logo upload failed: No logo path returned');
          }
        } catch (imageError) {
          console.error('Error uploading logo:', imageError);
          toast({
            title: "Error",
            description: imageError instanceof Error ? imageError.message : "Failed to upload logo",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Only proceed with update if there are changes
      if (Object.keys(brandData).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were made to the brand",
          variant: "default"
        });
        setIsSubmitting(false);
        return;
      }

      // Log the data being sent for debugging
      console.log('Sending the following changed fields:', brandData);

      // Send PUT request using brandService
      await brandService.updateBrand(brandId, brandData);

      toast({
        title: "Success",
        description: "Brand updated successfully"
      });

      // Redirect to brands page
      navigate('/brands');

    } catch (error) {
      console.error('Error updating brand:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update brand",
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
          <p>Loading brand data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/brands">
            <Button type="button" variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Edit Brand</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column - General Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">General Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        className="mt-1"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        className="mt-1"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter a description of the brand"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">Slug</Label>
                      <Input 
                        id="slug" 
                        className="mt-1" 
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="Enter a URL-friendly slug"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Logo Upload */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Brand Logo</h2>
                <div
                  className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Brand logo preview" 
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
                    {logoPreview ? 'Change logo' : 'Add logo'}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">Click to upload a logo</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Status</h2>
                <RadioGroup 
                  value={formData.isActive ? "enabled" : "disabled"}
                  onValueChange={handleRadioChange}
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
          </div>
        </div>

        <div className="flex justify-between">
          <Link to="/brands">
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
                Updating...
              </span>
            ) : 'Update Brand'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
