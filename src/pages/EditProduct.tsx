import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {categoryService, brandService, taxClassService, attributeService, productService} from "@/services";
import { Category } from "@/services/categoryService";
import { Brand } from "@/services/brandService";
import { TaxClass } from "@/services/taxClassService";
import { AttributeGroup, Attribute, AttributeOption } from "@/services/attributeService";
import { useToast } from "@/hooks/use-toast";

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const productId = id ? parseInt(id) : 0;

  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageErrors, setImageErrors] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [taxClasses, setTaxClasses] = useState<TaxClass[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [selectedAttributeGroupId, setSelectedAttributeGroupId] = useState<string | null>(null);
  const [selectedAttributeGroup, setSelectedAttributeGroup] = useState<AttributeGroup | null>(null);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<Record<number, string>>({});

  // Form data state
  const [formData, setFormData] = useState({
    // General
    name: '',
    sku: '',
    price: '',
    old_price: '',
    weight: '',
    categoryId: '',
    brandId: '',
    taxClassId: '',
    description: '',

    // SEO
    urlKey: '',
    metaTitle: '',
    metaKeywords: '',
    metaDescription: '',

    // Status
    status: true,
    visibility: true,

    // Inventory
    manageStock: true,
    stockAvailability: true,
    quantity: '0'
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [loading, setLoading] = useState({
    product: false,
    categories: false,
    brands: false,
    taxClasses: false,
    attributeGroups: false,
    submit: false
  });

  const [error, setError] = useState({
    product: null,
    categories: null,
    brands: null,
    taxClasses: null,
    attributeGroups: null
  });

  // Define the extended Category type with children
  type CategoryWithChildren = Category & { children: CategoryWithChildren[] };

  // Function to organize categories into a tree structure
  const organizeCategoriesIntoTree = (categories: Category[]): CategoryWithChildren[] => {
    // Create a map of all categories by id for quick lookup
    const categoryMap = new Map<number, CategoryWithChildren>();

    // Initialize each category with an empty children array
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Root categories array (categories with no parent)
    const rootCategories: CategoryWithChildren[] = [];

    // Populate the children arrays and root categories
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id);
      if (categoryWithChildren) {
        if (category.parent_id === null) {
          // This is a root category
          rootCategories.push(categoryWithChildren);
        } else {
          // This is a child category, add it to its parent's children array
          const parent = categoryMap.get(category.parent_id);
          if (parent) {
            parent.children.push(categoryWithChildren);
          } else {
            // If parent doesn't exist, treat as root category
            rootCategories.push(categoryWithChildren);
          }
        }
      }
    });

    return rootCategories;
  };

  // Function to recursively render the category tree
  const renderCategoryTree = (categories: CategoryWithChildren[], level = 0): React.ReactNode => {
    return categories.map(category => {
      // Create indentation based on level
      const indent = "—".repeat(level);
      const prefix = level > 0 ? indent + " " : "";

      return (
        <React.Fragment key={category.id}>
          <SelectItem value={category.id.toString()}>
            {prefix}{category.description?.name || "Unnamed Category"}
          </SelectItem>
          {/* Recursively render children */}
          {category.children.length > 0 && renderCategoryTree(category.children, level + 1)}
        </React.Fragment>
      );
    });
  };

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;

      try {
        setLoading(prev => ({ ...prev, product: true }));
        const response = await productService.getProductById(productId);

        if (!response) {
          throw new Error("Product not found");
        }

        const product = response;

        // Set form data from product
        setFormData({
          name: product.description?.name || '',
          sku: product.sku || '',
          price: product.price?.toString() || '',
          old_price: product.old_price?.toString() || '',
          weight: product.weight?.toString() || '',
          categoryId: product.category_id?.toString() || '',
          brandId: product.brand_id?.toString() || '',
          taxClassId: product.tax_class?.toString() || '',
          description: product.description?.description || '',
          urlKey: product.description?.url_key || '',
          metaTitle: product.description?.meta_title || '',
          metaKeywords: product.description?.meta_keywords || '',
          metaDescription: product.description?.meta_description || '',
          status: product.status !== undefined ? product.status : true,
          visibility: product.visibility !== undefined ? product.visibility : true,
          manageStock: product.inventory?.manage_stock !== undefined ? product.inventory.manage_stock : true,
          stockAvailability: product.inventory?.stock_availability !== undefined ? product.inventory.stock_availability : true,
          quantity: product.inventory?.qty?.toString() || '0'
        });

        // Set product images
        if (product.images && product.images.length > 0) {
          const images = product.images.map(img => img.origin_image);
          setProductImages(images);
        }

        // Set attribute group and values if available
        if (product.attributes && product.attributes.length > 0) {
          // This would require additional logic to determine the attribute group
          // and set the selected attribute values
        }

        setError(prev => ({ ...prev, product: null }));
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(prev => ({ ...prev, product: 'Failed to load product' }));
        toast({
          title: "Error",
          description: "Failed to load product. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(prev => ({ ...prev, product: false }));
      }
    };

    fetchProductData();
  }, [productId, toast]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(prev => ({ ...prev, categories: true }));
        const response = await categoryService.getCategories();
        setCategories(response.data || []);
        setError(prev => ({ ...prev, categories: null }));
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(prev => ({ ...prev, categories: 'Failed to load categories' }));
      } finally {
        setLoading(prev => ({ ...prev, categories: false }));
      }
    };

    fetchCategories();
  }, []);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(prev => ({ ...prev, brands: true }));
        const response = await brandService.getBrands();
        setBrands(response.data || []);
        setError(prev => ({ ...prev, brands: null }));
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError(prev => ({ ...prev, brands: 'Failed to load brands' }));
      } finally {
        setLoading(prev => ({ ...prev, brands: false }));
      }
    };

    fetchBrands();
  }, []);

  // Fetch tax classes
  useEffect(() => {
    const fetchTaxClasses = async () => {
      try {
        setLoading(prev => ({ ...prev, taxClasses: true }));
        const response = await taxClassService.getTaxClasses();
        setTaxClasses(response || []);
        setError(prev => ({ ...prev, taxClasses: null }));
      } catch (err) {
        console.error('Error fetching tax classes:', err);
        setError(prev => ({ ...prev, taxClasses: 'Failed to load tax classes' }));
      } finally {
        setLoading(prev => ({ ...prev, taxClasses: false }));
      }
    };

    fetchTaxClasses();
  }, []);

  // Fetch attribute groups
  useEffect(() => {
    const fetchAttributeGroups = async () => {
      try {
        setLoading(prev => ({ ...prev, attributeGroups: true }));
        const response = await attributeService.getGroups();
        setAttributeGroups(response || []);
        setError(prev => ({ ...prev, attributeGroups: null }));
      } catch (err) {
        console.error('Error fetching attribute groups:', err);
        setError(prev => ({ ...prev, attributeGroups: 'Failed to load attribute groups' }));
      } finally {
        setLoading(prev => ({ ...prev, attributeGroups: false }));
      }
    };

    fetchAttributeGroups();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if we've reached the maximum number of images
      if (productImages.length >= 5) {
        setImageErrors("Maximum of 5 images allowed");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImages(prev => [...prev, reader.result as string]);
        setImageErrors(null); // Clear any previous errors
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to remove an image at a specific index
  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  // Function to move an image to a different position (for reordering)
  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= productImages.length) return;

    setProductImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  // Function to validate images before form submission
  const validateImages = (): boolean => {
    // For product updates, we don't require any images, but if images are provided,
    // we validate that the number is within the allowed range (0-5)
    if (productImages.length > 5) {
      setImageErrors("Maximum of 5 images allowed");
      return false;
    }

    setImageErrors(null);
    return true;
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // For edit mode, we don't require any fields, but we validate the format of provided fields

    // Numeric fields validation - only validate if a value is provided
    if (formData.price && formData.price.trim() && isNaN(parseFloat(formData.price))) {
      errors.price = "Price must be a valid number";
    }

    if (formData.old_price && formData.old_price.trim() && isNaN(parseFloat(formData.old_price))) {
      errors.old_price = "Old price must be a valid number";
    }

    if (formData.weight && formData.weight.trim() && isNaN(parseFloat(formData.weight))) {
      errors.weight = "Weight must be a valid number";
    }

    if (formData.quantity && formData.quantity.trim() && isNaN(parseInt(formData.quantity))) {
      errors.quantity = "Quantity must be a valid number";
    }

    // Set validation errors
    setFormErrors(errors);

    // Check if images are valid only if there are images
    const imagesValid = productImages.length > 0 ? validateImages() : true;

    // Return true if no errors and images are valid
    return Object.keys(errors).length === 0 && imagesValid;
  };

  // Format data for API submission - only include fields that have been changed
  const formatProductData = () => {
    // Start with an empty object
    const productData: any = {};

    // Only add fields that have values (not empty strings or undefined)
    if (formData.sku.trim()) productData.sku = formData.sku;
    if (formData.price.trim()) productData.price = parseFloat(formData.price);
    if (formData.old_price && formData.old_price.trim()) productData.old_price = parseFloat(formData.old_price);
    if (formData.weight && formData.weight.trim()) productData.weight = parseFloat(formData.weight);

    // Boolean values are always defined, so include them if they're in the form
    productData.status = formData.status;
    productData.visibility = formData.visibility;

    // Only add IDs if they're not "none"
    if (formData.categoryId && formData.categoryId !== "none") productData.category_id = parseInt(formData.categoryId);
    if (formData.brandId && formData.brandId !== "none") productData.brand_id = parseInt(formData.brandId);
    if (formData.taxClassId && formData.taxClassId !== "none") productData.tax_class = parseInt(formData.taxClassId);

    // Only add description fields that have values
    const descriptionFields = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      url_key: formData.urlKey.trim(),
      meta_title: formData.metaTitle.trim(),
      meta_description: formData.metaDescription.trim(),
      meta_keywords: formData.metaKeywords.trim()
    };

    // Filter out empty description fields
    const filteredDescriptionFields = Object.fromEntries(
      Object.entries(descriptionFields).filter(([_, value]) => value !== '')
    );

    // Only add description object if there are any description fields
    if (Object.keys(filteredDescriptionFields).length > 0) {
      productData.description = filteredDescriptionFields;
    }

    // Only add inventory fields if they're defined
    const inventoryFields: any = {};
    if (formData.quantity) inventoryFields.qty = parseInt(formData.quantity);

    // Boolean values are always defined, so include them if they're in the form
    inventoryFields.manage_stock = formData.manageStock;
    inventoryFields.stock_availability = formData.stockAvailability;

    // Only add inventory object if there are any inventory fields
    if (Object.keys(inventoryFields).length > 0) {
      productData.inventory = inventoryFields;
    }

    return productData;
  };

  // Format image data for API submission
  const formatImageData = (productId: number) => {
    return {
      product_image_product_id: productId,
      images: productImages.map((image, index) => ({
        origin_image: image,
        is_main: index === 0
      }))
    };
  };

  // Format attribute data for API submission
  const formatAttributeData = (productId: number) => {
    return Object.entries(selectedAttributeValues).map(([attributeId, optionId]) => ({
      product_id: productId,
      attribute_id: parseInt(attributeId),
      option_id: optionId !== "none" ? parseInt(optionId) : undefined
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form data
    if (!validateForm()) {
      // Find the first error and scroll to it
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (imageErrors) {
        // If no field errors but image errors, scroll to media section
        const mediaCard = document.querySelector('[data-section="media"]');
        if (mediaCard) {
          mediaCard.scrollIntoView({ behavior: 'smooth' });
        }
      }
      return;
    }

    try {
      // Set loading state
      setLoading(prev => ({ ...prev, submit: true }));
      setIsSubmitting(true);
      setSubmitError(null);

      // Format data for submission
      const productData = formatProductData();

      // Step 1: Update the product
      const productResponse = await productService.updateProduct(productId, productData);

      // Step 2: Save product images
      // if (productImages.length > 0) {
      //   const imageData = formatImageData(productId);
      //   await productService.saveProductImages(imageData);
      // }

      // Step 3: Save product attributes
      if (Object.keys(selectedAttributeValues).length > 0) {
        const attributeData = formatAttributeData(productId);
        await productService.saveProductAttributes(attributeData);
      }

      // Set success state
      setSubmitSuccess(true);

      // Show success message
      toast({
        title: "Success",
        description: "Product updated successfully!",
        variant: "default"
      });

      // Navigate back to products page
      navigate('/products');

    } catch (error) {
      console.error("Error updating product:", error);
      setSubmitError("Failed to update product. Please try again.");

      // Show error message
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
      setIsSubmitting(false);
    }
  };

  // Handle attribute group selection
  const handleAttributeGroupChange = (value: string) => {
    if (value === "none") {
      setSelectedAttributeGroupId(null);
      setSelectedAttributeGroup(null);
      setSelectedAttributeValues({});
      return;
    }

    setSelectedAttributeGroupId(value);
    const groupId = parseInt(value);
    const group = attributeGroups.find(g => g.attribute_group_id === groupId) || null;
    setSelectedAttributeGroup(group);

    // Reset selected attribute values
    setSelectedAttributeValues({});
  };

  // Handle attribute value selection
  const handleAttributeValueChange = (attributeId: number, value: string) => {
    setSelectedAttributeValues(prev => ({
      ...prev,
      [attributeId]: value
    }));
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Clear validation error when field is updated
    if (formErrors[id]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  // Handle radio button changes
  const handleRadioChange = (id: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Clear validation error when field is updated
    if (formErrors[id]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
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
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        </div>

        {loading.product ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-2">Loading product data...</span>
          </div>
        ) : error.product ? (
          <div className="text-center p-8 text-red-500">
            <p>{error.product}</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/products">Back to Products</Link>
            </Button>
          </div>
        ) : (
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
                    <Input
                      id="name"
                      placeholder="Name"
                      className="mt-1"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {formErrors.name && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        placeholder="SKU"
                        className="mt-1"
                        value={formData.sku}
                        onChange={handleInputChange}
                      />
                      {formErrors.sku && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.sku}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <div className="flex mt-1">
                        <Input
                          id="price"
                          placeholder="Price"
                          className="rounded-r-none"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={handleInputChange}
                        />
                        <div className="bg-muted flex items-center justify-center px-3 border border-l-0 border-input rounded-r-md">
                          USD
                        </div>
                      </div>
                      {formErrors.price && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="old_price">Old Price</Label>
                      <div className="flex mt-1">
                        <Input
                          id="old_price"
                          placeholder="Old Price"
                          className="rounded-r-none"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.old_price}
                          onChange={handleInputChange}
                        />
                        <div className="bg-muted flex items-center justify-center px-3 border border-l-0 border-input rounded-r-md">
                          USD
                        </div>
                      </div>
                      {formErrors.old_price && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.old_price}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight</Label>
                      <div className="flex mt-1">
                        <Input
                          id="weight"
                          placeholder="Weight"
                          className="rounded-r-none"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.weight}
                          onChange={handleInputChange}
                        />
                        <div className="bg-muted flex items-center justify-center px-3 border border-l-0 border-input rounded-r-md">
                          kg
                        </div>
                      </div>
                      {formErrors.weight && (
                        <p className="text-sm text-red-500 mt-1">{formErrors.weight}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="categoryId">Category</Label>
                    <Select 
                      value={formData.categoryId} 
                      onValueChange={(value) => handleSelectChange('categoryId', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading.categories ? (
                          <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                        ) : error.categories ? (
                          <SelectItem value="error" disabled>{error.categories}</SelectItem>
                        ) : categories.length === 0 ? (
                          <SelectItem value="none" disabled>No categories available</SelectItem>
                        ) : (
                          <>
                            <SelectItem value="none">None</SelectItem>
                            {renderCategoryTree(organizeCategoriesIntoTree(categories))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.categoryId && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.categoryId}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="brandId">Brand</Label>
                    <Select 
                      value={formData.brandId} 
                      onValueChange={(value) => handleSelectChange('brandId', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading.brands ? (
                          <SelectItem value="loading" disabled>Loading brands...</SelectItem>
                        ) : error.brands ? (
                          <SelectItem value="error" disabled>{error.brands}</SelectItem>
                        ) : brands.length === 0 ? (
                          <SelectItem value="none" disabled>No brands available</SelectItem>
                        ) : (
                          <>
                            <SelectItem value="none">None</SelectItem>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id.toString()}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.brandId && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.brandId}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="taxClassId">Tax class</Label>
                    <Select 
                      value={formData.taxClassId} 
                      onValueChange={(value) => handleSelectChange('taxClassId', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select tax class" />
                      </SelectTrigger>
                      <SelectContent>
                        {loading.taxClasses ? (
                          <SelectItem value="loading" disabled>Loading tax classes...</SelectItem>
                        ) : error.taxClasses ? (
                          <SelectItem value="error" disabled>{error.taxClasses}</SelectItem>
                        ) : taxClasses.length === 0 ? (
                          <SelectItem value="none" disabled>No tax classes available</SelectItem>
                        ) : (
                          <>
                            <SelectItem value="none">None</SelectItem>
                            {taxClasses.map((taxClass) => (
                              <SelectItem key={taxClass.tax_class_id} value={taxClass.tax_class_id.toString()}>
                                {taxClass.name}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.taxClassId && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.taxClassId}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Type / to see the available blocks"
                      className="mt-1 min-h-[150px]"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                    {formErrors.description && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Media Card */}
              <Card data-section="media">
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Add between 2-5 images. The first image will be the main product image.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Error message */}
                  {imageErrors && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
                      {imageErrors}
                    </div>
                  )}

                  {/* Main image display */}
                  {productImages.length > 0 && (
                    <div className="space-y-4">
                      <div className="border rounded-md p-4">
                        <div className="font-medium mb-2">Main Image</div>
                        <div className="relative">
                          <img 
                            src={productImages[0]} 
                            alt="Main Product" 
                            className="mx-auto max-h-[250px] object-contain"
                          />
                        </div>
                      </div>

                      {/* Image thumbnails and controls */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {productImages.map((image, index) => (
                          <div 
                            key={index} 
                            className={`border rounded-md p-2 relative ${index === 0 ? 'ring-2 ring-teal-500' : ''}`}
                          >
                            <div className="aspect-square relative">
                              <img 
                                src={image} 
                                alt={`Product ${index + 1}`} 
                                className="absolute inset-0 w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex justify-between mt-2">
                              <div className="flex space-x-1">
                                {/* Move left button */}
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  disabled={index === 0}
                                  onClick={() => handleMoveImage(index, index - 1)}
                                >
                                  <ArrowLeft className="h-4 w-4" />
                                </Button>

                                {/* Move right button */}
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-7 w-7"
                                  disabled={index === productImages.length - 1}
                                  onClick={() => handleMoveImage(index, index + 1)}
                                >
                                  <ArrowLeft className="h-4 w-4 rotate-180" />
                                </Button>
                              </div>

                              {/* Remove button */}
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-7 w-7 text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                  <path d="M18 6L6 18M6 6l12 12"></path>
                                </svg>
                              </Button>
                            </div>
                            {index === 0 && (
                              <div className="absolute top-0 left-0 bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-br-md">
                                Main
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add image button (if less than 5 images) */}
                        {productImages.length < 5 && (
                          <div className="border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center aspect-square">
                            <div className="text-teal-500 mb-2">
                              <Upload className="h-6 w-6" />
                            </div>
                            <Button variant="outline" size="sm" className="relative" asChild>
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
                    </div>
                  )}

                  {/* Empty state - no images yet */}
                  {productImages.length === 0 && (
                    <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center min-h-[200px]">
                      <div className="text-center flex flex-col items-center">
                        <div className="text-teal-500 mb-4">
                          <Upload className="h-10 w-10" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Upload at least 2 product images. The first image will be the main product image.
                        </p>
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
                    </div>
                  )}
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
                    <Input
                      id="urlKey"
                      placeholder=""
                      className="mt-1"
                      value={formData.urlKey}
                      onChange={handleInputChange}
                    />
                    {formErrors.urlKey && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.urlKey}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="metaTitle">Meta title</Label>
                    <Input
                      id="metaTitle"
                      placeholder=""
                      className="mt-1"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                    />
                    {formErrors.metaTitle && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.metaTitle}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="metaKeywords">Meta keywords</Label>
                    <Input
                      id="metaKeywords"
                      placeholder=""
                      className="mt-1"
                      value={formData.metaKeywords}
                      onChange={handleInputChange}
                    />
                    {formErrors.metaKeywords && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.metaKeywords}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="metaDescription">Meta description</Label>
                    <Textarea
                      id="metaDescription"
                      placeholder=""
                      className="mt-1"
                      value={formData.metaDescription}
                      onChange={handleInputChange}
                    />
                    {formErrors.metaDescription && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.metaDescription}</p>
                    )}
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
                    <RadioGroup
                      value={formData.status ? "enabled" : "disabled"}
                      onValueChange={(value) => handleRadioChange('status', value === "enabled")}
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
                    {formErrors.status && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.status}</p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2">Visibility</p>
                    <RadioGroup
                      value={formData.visibility ? "visible" : "not-visible"}
                      onValueChange={(value) => handleRadioChange('visibility', value === "visible")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="not-visible" id="not-visible" />
                        <Label htmlFor="not-visible">Not visible</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="visible" id="visible" />
                        <Label htmlFor="visible">Visible</Label>
                      </div>
                    </RadioGroup>
                    {formErrors.visibility && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.visibility}</p>
                    )}
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
                    <RadioGroup
                      value={formData.manageStock ? "yes" : "no"}
                      onValueChange={(value) => handleRadioChange('manageStock', value === "yes")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="manage-stock-no" />
                        <Label htmlFor="manage-stock-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="manage-stock-yes" />
                        <Label htmlFor="manage-stock-yes">Yes</Label>
                      </div>
                    </RadioGroup>
                    {formErrors.manageStock && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.manageStock}</p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2">Stock availability</p>
                    <RadioGroup
                      value={formData.stockAvailability ? "yes" : "no"}
                      onValueChange={(value) => handleRadioChange('stockAvailability', value === "yes")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="stock-availability-no" />
                        <Label htmlFor="stock-availability-no">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="stock-availability-yes" />
                        <Label htmlFor="stock-availability-yes">Yes</Label>
                      </div>
                    </RadioGroup>
                    {formErrors.stockAvailability && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.stockAvailability}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Quantity"
                      className="mt-1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="0"
                    />
                    {formErrors.quantity && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.quantity}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Attribute Group Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="uppercase text-sm font-semibold">Attribute Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={handleAttributeGroupChange} value={selectedAttributeGroupId || "none"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select attribute group" />
                    </SelectTrigger>
                    <SelectContent>
                      {loading.attributeGroups ? (
                        <SelectItem value="loading" disabled>Loading attribute groups...</SelectItem>
                      ) : error.attributeGroups ? (
                        <SelectItem value="error" disabled>{error.attributeGroups}</SelectItem>
                      ) : attributeGroups.length === 0 ? (
                        <SelectItem value="none" disabled>No attribute groups available</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="none">None</SelectItem>
                          {attributeGroups.map((group) => (
                            <SelectItem key={group.attribute_group_id} value={group.attribute_group_id.toString()}>
                              {group.group_name}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Attributes Card - Dynamically generated based on selected attribute group */}
              {selectedAttributeGroup && selectedAttributeGroup.links && selectedAttributeGroup.links.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="uppercase text-sm font-semibold">Attributes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedAttributeGroup.links.map((link) => (
                      link.attribute && (
                        <div key={link.attribute_id}>
                          <Label htmlFor={`attribute-${link.attribute_id}`}>{link.attribute.attribute_name}</Label>
                          <Select 
                            onValueChange={(value) => handleAttributeValueChange(link.attribute_id, value)}
                            value={selectedAttributeValues[link.attribute_id] || "none"}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Please select" />
                            </SelectTrigger>
                            <SelectContent>
                              {link.attribute.options && link.attribute.options.length > 0 ? (
                                link.attribute.options.map((option) => (
                                  <SelectItem 
                                    key={option.attribute_option_id} 
                                    value={option.attribute_option_id.toString()}
                                  >
                                    {option.option_text}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>No options available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="destructive" asChild disabled={isSubmitting}>
            <Link to="/products">Cancel</Link>
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={isSubmitting || loading.product}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : "Update Product"}
          </Button>
        </div>

        {/* Success message */}
        {submitSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
            Product updated successfully!
          </div>
        )}

        {/* Error message */}
        {submitError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {submitError}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EditProduct;
