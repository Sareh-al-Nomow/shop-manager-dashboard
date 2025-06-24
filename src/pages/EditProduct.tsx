import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
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

  const [productImages, setProductImages] = useState<{id: number, url: string}[]>([]);
  const [originalImages, setOriginalImages] = useState<{id: number, url: string}[]>([]);
  const [imageErrors, setImageErrors] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [taxClasses, setTaxClasses] = useState<TaxClass[]>([]);
  const [attributeGroups, setAttributeGroups] = useState<AttributeGroup[]>([]);
  const [selectedAttributeGroupId, setSelectedAttributeGroupId] = useState<string | null>(null);
  const [selectedAttributeGroup, setSelectedAttributeGroup] = useState<AttributeGroup | null>(null);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<Record<number, string>>({});
  const [originalAttributes, setOriginalAttributes] = useState<Array<{
    product_attribute_value_index_id: number;
    product_id: number;
    attribute_id: number;
    option_id: number;
    option_text: string;
    attribute_text: string;
  }>>([]);

  // Variant-related state
  const [hasVariants, setHasVariants] = useState<boolean>(false);
  const [variantGroupId, setVariantGroupId] = useState<number | null>(null);
  const [variantGroup, setVariantGroup] = useState<any>(null);
  const [selectedVariantAttributes, setSelectedVariantAttributes] = useState<number[]>([]);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState<boolean>(false);
  const [variantFormData, setVariantFormData] = useState({
    sku: '',
    qty: '0',
    status: true,
    visibility: true,
    images: [] as string[],
    attributeValues: {} as Record<number, string>
  });
  const [variantFormErrors, setVariantFormErrors] = useState<Record<string, string>>({});
  const [isCreatingVariantGroup, setIsCreatingVariantGroup] = useState<boolean>(false);

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
    submit: false,
    deleteImage: false,
    variantImage: false,
    image: false,
    variantGroup: false
  });

  const [error, setError] = useState({
    product: null,
    categories: null,
    brands: null,
    taxClasses: null,
    attributeGroups: null,
    variantGroup: null
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
          const images = product.images.map(img => ({
            id: img.product_image_id,
            url: img.origin_image
          }));
          setProductImages(images);
          setOriginalImages(images); // Store original images for comparison
        }

        // Check if product has variants or is part of a variant group
        if (product.variant_group_id) {
          setVariantGroupId(product.variant_group_id);

          // Fetch the variant group information
          try {
            setLoading(prev => ({ ...prev, variantGroup: true }));
            setError(prev => ({ ...prev, variantGroup: null }));

            const variantGroupResponse = await productService.getVariantGroupById(product.variant_group_id);

            if (variantGroupResponse) {
              setVariantGroup(variantGroupResponse);
              setHasVariants(true);
            } else {
              setHasVariants(false);
              setVariantGroup(null);
              setError(prev => ({ ...prev, variantGroup: 'Variant group not found' }));
            }
          } catch (err) {
            console.error('Error fetching variant group:', err);
            setHasVariants(false);
            setVariantGroup(null);
            setError(prev => ({ ...prev, variantGroup: 'Failed to load variant group' }));
          } finally {
            setLoading(prev => ({ ...prev, variantGroup: false }));
          }
        } else {
          setHasVariants(false);
          setVariantGroupId(null);
          setVariantGroup(null);
        }

        // Set attribute group and values if available
        if (product.attributes && product.attributes.length > 0) {
          // Store original attributes for later comparison
          setOriginalAttributes(product.attributes);

          // Get the first attribute to find its group
          const firstAttribute = product.attributes[0];
          console.log('Product attributes:', product.attributes);

          // Wait for attribute groups to be loaded
          const checkAttributeGroups = () => {
            console.log('Checking attribute groups:', attributeGroups);
            if (attributeGroups.length > 0) {
              // Find the attribute group that contains this attribute
              const foundGroup = attributeGroups.find(group => {
                console.log('Checking group:', group);
                return group.links?.some(link => {
                  console.log('Checking link:', link, 'against attribute ID:', firstAttribute.attribute_id);
                  return link.attribute_id === firstAttribute.attribute_id;
                });
              });

              console.log('Found group:', foundGroup);

              if (foundGroup) {
                // Set the selected attribute group
                setSelectedAttributeGroupId(foundGroup.attribute_group_id.toString());
                setSelectedAttributeGroup(foundGroup);

                // Set the selected attribute values
                const attributeValues: Record<number, string> = {};
                product.attributes.forEach(attr => {
                  attributeValues[attr.attribute_id] = attr.option_id.toString();
                });
                console.log('Setting attribute values:', attributeValues);
                setSelectedAttributeValues(attributeValues);
              } else {
                // If no group is found, try to create a temporary group with the attributes from the product
                console.log('No group found, creating temporary group');
                const tempGroup: AttributeGroup = {
                  attribute_group_id: 999, // Use a temporary ID
                  uuid: 'temp',
                  group_name: 'Product Attributes',
                  links: product.attributes.map(attr => ({
                    attribute_group_link_id: 999, // Use a temporary ID
                    attribute_id: attr.attribute_id,
                    group_id: 999, // Use a temporary ID
                    attribute: {
                      attribute_id: attr.attribute_id,
                      uuid: attr.attribute.uuid,
                      attribute_code: attr.attribute.attribute_code,
                      attribute_name: attr.attribute.attribute_name,
                      type: attr.attribute.type,
                      is_required: attr.attribute.is_required,
                      display_on_frontend: attr.attribute.display_on_frontend,
                      sort_order: attr.attribute.sort_order,
                      is_filterable: attr.attribute.is_filterable,
                      options: [attr.option] // Add the option from the product attribute
                    }
                  }))
                };
                console.log('Created temporary group:', tempGroup);
                setSelectedAttributeGroupId(tempGroup.attribute_group_id.toString());
                setSelectedAttributeGroup(tempGroup);

                // Set the selected attribute values
                const attributeValues: Record<number, string> = {};
                product.attributes.forEach(attr => {
                  attributeValues[attr.attribute_id] = attr.option_id.toString();
                });
                console.log('Setting attribute values:', attributeValues);
                setSelectedAttributeValues(attributeValues);
              }
            } else if (!loading.attributeGroups) {
              // If attribute groups are loaded but none found, try again after a short delay
              console.log('No attribute groups found, retrying...');
              setTimeout(checkAttributeGroups, 500);
            }
          };

          checkAttributeGroups();
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
  }, [productId, toast, attributeGroups, loading.attributeGroups]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(prev => ({ ...prev, categories: true }));
        const response = await categoryService.getCategoriesShorts();
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
        const response = await brandService.getBrandsShorts();
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
        console.log('Attribute groups response:', response);
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

      setLoading(prev => ({ ...prev, image: true }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImages(prev => [...prev, { id: 0, url: reader.result as string }]);
        setImageErrors(null); // Clear any previous errors
        setLoading(prev => ({ ...prev, image: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to remove an image at a specific index
  const handleRemoveImage = async (index: number) => {
    const image = productImages[index];

    // If the image has an ID (i.e., it's saved on the server), delete it
    if (image.id > 0) {
      try {
        setLoading(prev => ({ ...prev, deleteImage: true }));
        await productService.deleteProductImage(image.id);
        toast({
          title: "Success",
          description: "Image deleted successfully",
          variant: "default"
        });
      } catch (error) {
        console.error("Error deleting image:", error);
        toast({
          title: "Error",
          description: "Failed to delete image. Please try again.",
          variant: "destructive"
        });
        return; // Don't remove from state if deletion failed
      } finally {
        setLoading(prev => ({ ...prev, deleteImage: false }));
      }
    }

    // Remove the image from the state
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

    // For edit mode, we don't require most fields, but we validate the format of provided fields

    // Required fields validation
    if (!formData.categoryId || formData.categoryId === "none") {
      errors.categoryId = "Category is required";
    }

    if (!formData.brandId || formData.brandId === "none") {
      errors.brandId = "Brand is required";
    }

    // Numeric fields validation - only validate if a value is provided
    if (formData.price && formData.price.trim()) {
      if (isNaN(parseFloat(formData.price))) {
        errors.price = "Price must be a valid number";
      } else if (parseFloat(formData.price) <= 0) {
        errors.price = "Price must be greater than 0";
      }
    }

    if (formData.old_price && formData.old_price.trim()) {
      if (isNaN(parseFloat(formData.old_price))) {
        errors.old_price = "Old price must be a valid number";
      } else if (parseFloat(formData.old_price) <= 0) {
        errors.old_price = "Old price must be greater than 0";
      }
    }

    if (formData.weight && formData.weight.trim()) {
      if (isNaN(parseFloat(formData.weight))) {
        errors.weight = "Weight must be a valid number";
      } else if (parseFloat(formData.weight) <= 0) {
        errors.weight = "Weight must be greater than 0";
      }
    }

    if (formData.quantity && formData.quantity.trim()) {
      if (isNaN(parseInt(formData.quantity))) {
        errors.quantity = "Quantity must be a valid number";
      } else if (parseInt(formData.quantity) <= 0) {
        errors.quantity = "Quantity must be greater than 0";
      }
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
        origin_image: image.url,
        is_main: index === 0
      }))
    };
  };

  // Format attribute data for API submission
  const formatAttributeData = (productId: number) => {
    return Object.entries(selectedAttributeValues).map(([attributeId, optionId]) => {
      // Find the attribute in the selected attribute group
      const attributeIdNum = parseInt(attributeId);
      const link = selectedAttributeGroup?.links?.find(link => link.attribute_id === attributeIdNum);
      const attribute = link?.attribute;

      // Find the option in the attribute's options
      const optionIdNum = optionId !== "none" ? parseInt(optionId) : undefined;
      const option = attribute?.options?.find(opt => opt.attribute_option_id === optionIdNum);

      // Create the attribute data object
      const attributeData = {
        product_id: productId,
        attribute_id: attributeIdNum,
        option_id: optionIdNum,
        attribute_text: attribute?.attribute_name || "",
        option_text: option?.option_text || "",
        group_id: parseInt(selectedAttributeGroupId)
      };


      return attributeData;
    });
  };

  // Find an existing attribute by attribute_id and option_id
  const findExistingAttribute = (attributeId: number, optionId: number) => {
    return originalAttributes.find(attr => 
      attr.attribute_id === attributeId
    );
  };

  // Check if images have been changed
  const haveImagesChanged = (): boolean => {
    // If the number of images is different, they've changed
    if (productImages.length !== originalImages.length) {
      return true;
    }

    // Check if any image has changed
    for (let i = 0; i < productImages.length; i++) {
      if (productImages[i].id !== originalImages[i].id || productImages[i].url !== originalImages[i].url) {
        return true;
      }
    }

    // No changes detected
    return false;
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

      // Step 2: Save product images only if they've changed
      if (productImages.length > 0 && haveImagesChanged()) {
        const imageData = formatImageData(productId);
        await productService.saveProductImages(imageData);
      }

      // Step 3: Save or update product attributes
      if (Object.keys(selectedAttributeValues).length > 0) {
        const attributeData = formatAttributeData(productId);

        // Process each attribute individually
        for (const attribute of attributeData) {
          // Check if this attribute already exists
          const existingAttribute = findExistingAttribute(attribute.attribute_id, attribute.option_id);

          if (existingAttribute) {
            // Update existing attribute
            await productService.updateProductAttribute(existingAttribute.product_attribute_value_index_id, attribute);
          } else {
            // Create new attribute
            await productService.saveProductAttribute(attribute);
          }
        }
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

  // Handle creating a variant group
  const handleCreateVariantGroup = async () => {
    if (selectedVariantAttributes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one attribute for the variant group.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true }));

      // Create variant group
      if (!selectedAttributeGroupId) {
        toast({
          title: "Error",
          description: "Please select an attribute group first.",
          variant: "destructive"
        });
        return;
      }


      // Map selected attributes to attribute_one through attribute_five
      const attributeFields: { [key: string]: number } = {};
      selectedVariantAttributes.forEach((attrId, index) => {
        if (index < 5) {
          const fieldName = `attribute_${['one', 'two', 'three', 'four', 'five'][index]}`;
          attributeFields[fieldName] = attrId;
        }
      });

      const variantGroupDataCreate = {
        attribute_group_id: parseInt(selectedAttributeGroupId),
        ...attributeFields,
        visibility: true,
        product_ids: [productId]
      };

      const response = await productService.createVariantGroup(variantGroupDataCreate);

      // Update state with new variant group ID
      setVariantGroupId(response.variant_group_id);
      setHasVariants(true);
      setIsCreatingVariantGroup(false);

      // Fetch the newly created variant group to update the UI
      try {
        setLoading(prev => ({ ...prev, variantGroup: true }));
        const variantGroupResponse = await productService.getVariantGroupById(response.variant_group_id);
        if (variantGroupResponse) {
          setVariantGroup(variantGroupResponse);
        }
      } catch (err) {
        console.error('Error fetching variant group after creation:', err);
        // Don't show an error toast here as the variant group was created successfully
      } finally {
        setLoading(prev => ({ ...prev, variantGroup: false }));
      }

      toast({
        title: "Success",
        description: "Variant group created successfully!",
        variant: "default"
      });

    } catch (error) {
      console.error("Error creating variant group:", error);
      toast({
        title: "Error",
        description: "Failed to create variant group. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  // Handle variant image change
  const handleVariantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if we've reached the maximum number of images
      if (variantFormData.images.length >= 5) {
        setVariantFormErrors(prev => ({
          ...prev,
          images: "Maximum of 5 images allowed"
        }));
        return;
      }

      setLoading(prev => ({ ...prev, variantImage: true }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setVariantFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result as string]
        }));
        // Clear any previous errors
        setVariantFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.images;
          return newErrors;
        });
        setLoading(prev => ({ ...prev, variantImage: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle removing a variant image
  const handleRemoveVariantImage = (index: number) => {
    setVariantFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle variant attribute value change
  const handleVariantAttributeValueChange = (attributeId: number, value: string) => {
    setVariantFormData(prev => ({
      ...prev,
      attributeValues: {
        ...prev.attributeValues,
        [attributeId]: value
      }
    }));
  };

  // Validate variant form
  const validateVariantForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!variantFormData.sku.trim()) errors.sku = "SKU is required";
    if (!variantFormData.qty.trim() || parseInt(variantFormData.qty) < 0) errors.qty = "Quantity must be a valid number";
    if (variantFormData.images.length === 0) errors.images = "At least one image is required";

    // Check if all variant attributes have values
    if (selectedVariantAttributes.length > 0) {
      for (const attrId of selectedVariantAttributes) {
        if (!variantFormData.attributeValues[attrId]) {
          errors.attributes = "All variant attributes must have values";
          break;
        }
      }
    }

    setVariantFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle creating a variant
  const handleCreateVariant = async () => {
    if (!validateVariantForm()) {
      toast({
        title: "Error",
        description: "Please fix the errors in the form.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true }));

      // Format attribute values for API
      const attributeValues = Object.entries(variantFormData.attributeValues).map(([attributeId, optionId]) => ({
        attribute_id: parseInt(attributeId),
        option_id: parseInt(optionId)
      }));

      // First, save the images using saveProductImages
      const imageData = {
        product_image_product_id: productId,
        images: variantFormData.images.map((image, index) => ({
          origin_image: image,
          is_main: index === 0
        }))
      };

      // Save images and get the response
      const imageResponse = await productService.saveProductImages(imageData);

      // Extract the origin_image URLs from the response
      // The response format is expected to be an array of image objects
      const uploadedImages = Array.isArray(imageResponse) ? imageResponse : [];

      // If no images were uploaded, show an error
      if (uploadedImages.length === 0) {
        throw new Error("Failed to upload images");
      }

      // Create variant data with the uploaded image URLs
      const variantData = {
        product_id: productId,
        sku: variantFormData.sku,
        qty: parseInt(variantFormData.qty),
        status: variantFormData.status,
        visibility: variantFormData.visibility,
        images: uploadedImages.map((img: any, index: number) => ({
          origin_image: img.origin_image,
          thumb_image: img.thumb_image || "null",
          listing_image: img.listing_image || "null",
          single_image: img.single_image || "null",
          is_main: index === 0
        })),
        attributeValues
      };

      // Create variant
      await productService.createVariant(variantGroupId!, variantData);

      // Reset form and close modal
      setVariantFormData({
        sku: '',
        qty: '0',
        status: true,
        visibility: true,
        images: [],
        attributeValues: {}
      });
      setIsVariantModalOpen(false);

      // Refresh the variant group data to show the new variant
      try {
        setLoading(prev => ({ ...prev, variantGroup: true }));
        if (variantGroupId) {
          const updatedVariantGroup = await productService.getVariantGroupById(variantGroupId);
          if (updatedVariantGroup) {
            setVariantGroup(updatedVariantGroup);
          }
        }
      } catch (err) {
        console.error('Error refreshing variant group data:', err);
        // Don't show an error toast here as the variant was created successfully
      } finally {
        setLoading(prev => ({ ...prev, variantGroup: false }));
      }

      toast({
        title: "Success",
        description: "Variant created successfully!",
        variant: "default"
      });

    } catch (error) {
      console.error("Error creating variant:", error);
      toast({
        title: "Error",
        description: "Failed to create variant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
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
                            src={productImages[0].url}
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
                                src={image.url}
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
                                disabled={loading.deleteImage}
                              >
                                {loading.deleteImage ? (
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M18 6L6 18M6 6l12 12"></path>
                                  </svg>
                                )}
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="relative" 
                              asChild
                              disabled={loading.image}
                            >
                              <label>
                                {loading.image ? (
                                  <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                  </div>
                                ) : "Add image"}
                                <input
                                  type="file"
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  onChange={handleImageChange}
                                  accept="image/*"
                                  disabled={loading.image}
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
                        <Button 
                          variant="outline" 
                          className="relative" 
                          asChild
                          disabled={loading.image}
                        >
                          <label>
                            {loading.image ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                              </div>
                            ) : "Add image"}
                            <input
                              type="file"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={handleImageChange}
                              accept="image/*"
                              disabled={loading.image}
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

              {/* Variants Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="uppercase text-sm font-semibold">Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading.variantGroup ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading variant group...</span>
                      </div>
                  ) : error.variantGroup ? (
                      <div className="text-center py-4">
                        <p className="text-red-500 mb-2">{error.variantGroup}</p>
                        <p className="text-sm text-muted-foreground">
                          You can create a new variant group for this product.
                        </p>
                        <Button
                            onClick={() => setIsCreatingVariantGroup(true)}
                            className="bg-teal-600 hover:bg-teal-700 mt-4"
                        >
                          Create Variant Group
                        </Button>
                      </div>
                  ) : hasVariants && variantGroup ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-sm text-muted-foreground">
                            This product is part of a variant group. You can add new variants to this group.
                          </p>
                          <Button
                              onClick={() => {
                                // Set selectedVariantAttributes based on the variant group's attributes
                                const variantAttributes = [];
                                if (variantGroup.attribute_one) variantAttributes.push(variantGroup.attribute_one);
                                if (variantGroup.attribute_two) variantAttributes.push(variantGroup.attribute_two);
                                if (variantGroup.attribute_three) variantAttributes.push(variantGroup.attribute_three);
                                if (variantGroup.attribute_four) variantAttributes.push(variantGroup.attribute_four);
                                if (variantGroup.attribute_five) variantAttributes.push(variantGroup.attribute_five);
                                setSelectedVariantAttributes(variantAttributes);
                                setIsVariantModalOpen(true);
                              }}
                              className="bg-teal-600 hover:bg-teal-700"
                          >
                            Add Variant
                          </Button>
                        </div>

                        {/* Variants Table */}
                        {variantGroup.products && variantGroup.products.length > 0 ? (
                            <div className="border rounded-md overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  {/* Attribute columns */}
                                  {variantGroup.attribute_one && (
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {variantGroup.products[0]?.attributes?.find(attr => attr.attribute_id === variantGroup.attribute_one)?.attribute_text || 'Attribute 1'}
                                      </th>
                                  )}
                                  {variantGroup.attribute_two && (
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {variantGroup.products[0]?.attributes?.find(attr => attr.attribute_id === variantGroup.attribute_two)?.attribute_text || 'Attribute 2'}
                                      </th>
                                  )}
                                  {variantGroup.attribute_three && (
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {variantGroup.products[0]?.attributes?.find(attr => attr.attribute_id === variantGroup.attribute_three)?.attribute_text || 'Attribute 3'}
                                      </th>
                                  )}
                                  {variantGroup.attribute_four && (
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {variantGroup.products[0]?.attributes?.find(attr => attr.attribute_id === variantGroup.attribute_four)?.attribute_text || 'Attribute 4'}
                                      </th>
                                  )}
                                  {variantGroup.attribute_five && (
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {variantGroup.products[0]?.attributes?.find(attr => attr.attribute_id === variantGroup.attribute_five)?.attribute_text || 'Attribute 5'}
                                      </th>
                                  )}
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {variantGroup.products.map(product => (
                                    <tr 
                                      key={product.product_id} 
                                      className="hover:bg-gray-50 cursor-pointer"
                                      onClick={() => navigate(`/product/${product.product_id}`)}
                                    >
                                      <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex items-center">
                                          {product.images && product.images.length > 0 ? (
                                              <img
                                                  src={product.images.find(img => img.is_main)?.origin_image || product.images[0].origin_image}
                                                  alt={product.description?.name || 'Product'}
                                                  className="h-10 w-10 object-cover rounded-md mr-2"
                                              />
                                          ) : (
                                              <div className="h-10 w-10 bg-gray-200 rounded-md mr-2 flex items-center justify-center text-gray-500">
                                                No img
                                              </div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{product.inventory?.qty || 0}</td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {product.status ? 'Enabled' : 'Disabled'}
                                    </span>
                                      </td>
                                      {/* Attribute values */}
                                      {variantGroup.attribute_one && (
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {product.attributes?.find(attr => attr.attribute_id === variantGroup.attribute_one)?.option_text || '-'}
                                          </td>
                                      )}
                                      {variantGroup.attribute_two && (
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {product.attributes?.find(attr => attr.attribute_id === variantGroup.attribute_two)?.option_text || '-'}
                                          </td>
                                      )}
                                      {variantGroup.attribute_three && (
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {product.attributes?.find(attr => attr.attribute_id === variantGroup.attribute_three)?.option_text || '-'}
                                          </td>
                                      )}
                                      {variantGroup.attribute_four && (
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {product.attributes?.find(attr => attr.attribute_id === variantGroup.attribute_four)?.option_text || '-'}
                                          </td>
                                      )}
                                      {variantGroup.attribute_five && (
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                            {product.attributes?.find(attr => attr.attribute_id === variantGroup.attribute_five)?.option_text || '-'}
                                          </td>
                                      )}
                                    </tr>
                                ))}
                                </tbody>
                              </table>
                            </div>
                        ) : (
                            <p className="text-center py-4 text-gray-500">No variants found for this product.</p>
                        )}
                      </div>
                  ) : (
                      <div>
                        <p className="text-sm text-muted-foreground mb-4">
                          This product has no variants. You can create a variant group with attributes like color or size.
                        </p>
                        <Button
                            onClick={() => setIsCreatingVariantGroup(true)}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                          Create Variant Group
                        </Button>

                        {isCreatingVariantGroup && (
                            <div className="mt-4 border rounded-md p-4">
                              <h3 className="font-medium mb-2">Select Attributes for Variants</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Select attributes from the current attribute group to use for creating variants.
                              </p>

                              {selectedAttributeGroup && selectedAttributeGroup.links && selectedAttributeGroup.links.length > 0 ? (
                                  <div className="space-y-4">
                                    {selectedAttributeGroup.links.map((link) => (
                                        link.attribute && (
                                            <div key={link.attribute_id} className="flex items-center space-x-2">
                                              <input
                                                  type="checkbox"
                                                  id={`variant-attr-${link.attribute_id}`}
                                                  checked={selectedVariantAttributes.includes(link.attribute_id)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setSelectedVariantAttributes(prev => [...prev, link.attribute_id]);
                                                    } else {
                                                      setSelectedVariantAttributes(prev => prev.filter(id => id !== link.attribute_id));
                                                    }
                                                  }}
                                                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                              />
                                              <Label htmlFor={`variant-attr-${link.attribute_id}`}>
                                                {link.attribute.attribute_name}
                                              </Label>
                                            </div>
                                        )
                                    ))}

                                    <div className="flex justify-end space-x-2 mt-4">
                                      <Button
                                          variant="outline"
                                          onClick={() => {
                                            setIsCreatingVariantGroup(false);
                                            setSelectedVariantAttributes([]);
                                          }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                          onClick={handleCreateVariantGroup}
                                          className="bg-teal-600 hover:bg-teal-700"
                                          disabled={selectedVariantAttributes.length === 0}
                                      >
                                        Create
                                      </Button>
                                    </div>
                                  </div>
                              ) : (
                                  <p className="text-sm text-amber-600">
                                    Please select an attribute group with attributes first.
                                  </p>
                              )}
                            </div>
                        )}
                      </div>
                  )}
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
                              {console.log('Rendering options for attribute:', link.attribute)}
                              {link.attribute.options && link.attribute.options.length > 0 ? (
                                link.attribute.options.map((option) => {
                                  console.log('Rendering option:', option);
                                  return (
                                    <SelectItem
                                      key={option.attribute_option_id}
                                      value={option.attribute_option_id.toString()}
                                    >
                                      {option.option_text}
                                    </SelectItem>
                                  );
                                })
                              ) : (
                                <>
                                  <SelectItem value="none" disabled>No options available</SelectItem>
                                  {console.log('No options available for attribute:', link.attribute)}
                                </>
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

      {/* Variant Modal */}
      {isVariantModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Variant</h2>
                <button 
                  onClick={() => setIsVariantModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="font-medium mb-2">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="variant-sku">SKU</Label>
                      <Input
                        id="variant-sku"
                        placeholder="SKU"
                        value={variantFormData.sku}
                        onChange={(e) => setVariantFormData(prev => ({ ...prev, sku: e.target.value }))}
                        className="mt-1"
                      />
                      {variantFormErrors.sku && (
                        <p className="text-sm text-red-500 mt-1">{variantFormErrors.sku}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="variant-qty">Quantity</Label>
                      <Input
                        id="variant-qty"
                        type="number"
                        placeholder="Quantity"
                        value={variantFormData.qty}
                        onChange={(e) => setVariantFormData(prev => ({ ...prev, qty: e.target.value }))}
                        className="mt-1"
                        min="0"
                      />
                      {variantFormErrors.qty && (
                        <p className="text-sm text-red-500 mt-1">{variantFormErrors.qty}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="mb-2">Status</p>
                      <RadioGroup
                        value={variantFormData.status ? "enabled" : "disabled"}
                        onValueChange={(value) => setVariantFormData(prev => ({ ...prev, status: value === "enabled" }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="disabled" id="variant-disabled" />
                          <Label htmlFor="variant-disabled">Disabled</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="enabled" id="variant-enabled" />
                          <Label htmlFor="variant-enabled">Enabled</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <p className="mb-2">Visibility</p>
                      <RadioGroup
                        value={variantFormData.visibility ? "visible" : "not-visible"}
                        onValueChange={(value) => setVariantFormData(prev => ({ ...prev, visibility: value === "visible" }))}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="not-visible" id="variant-not-visible" />
                          <Label htmlFor="variant-not-visible">Not visible</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="visible" id="variant-visible" />
                          <Label htmlFor="variant-visible">Visible</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Variant Attributes */}
                {selectedVariantAttributes.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Variant Attributes</h3>
                    <div className="space-y-4">
                      {selectedVariantAttributes.map(attributeId => {
                        const attribute = selectedAttributeGroup?.links?.find(link => link.attribute_id === attributeId)?.attribute;
                        return attribute ? (
                          <div key={attributeId}>
                            <Label htmlFor={`variant-attr-${attributeId}`}>{attribute.attribute_name}</Label>
                            <Select
                              onValueChange={(value) => handleVariantAttributeValueChange(attributeId, value)}
                              value={variantFormData.attributeValues[attributeId] || ""}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                {attribute.options && attribute.options.length > 0 ? (
                                  attribute.options.map((option) => (
                                    <SelectItem
                                      key={option.attribute_option_id}
                                      value={option.attribute_option_id.toString()}
                                    >
                                      {option.option_text}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="" disabled>No options available</SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : null;
                      })}
                      {variantFormErrors.attributes && (
                        <p className="text-sm text-red-500">{variantFormErrors.attributes}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Variant Images */}
                <div>
                  <h3 className="font-medium mb-2">Images</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add at least one image for the variant. The first image will be the main image.
                  </p>

                  {variantFormErrors.images && (
                    <p className="text-sm text-red-500 mb-2">{variantFormErrors.images}</p>
                  )}

                  {/* Image thumbnails */}
                  {variantFormData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                      {variantFormData.images.map((image, index) => (
                        <div
                          key={index}
                          className={`border rounded-md p-2 relative ${index === 0 ? 'ring-2 ring-teal-500' : ''}`}
                        >
                          <div className="aspect-square relative">
                            <img
                              src={image}
                              alt={`Variant ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-contain"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:text-red-700 bg-white"
                            onClick={() => handleRemoveVariantImage(index)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                              <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                          </Button>
                          {index === 0 && (
                            <div className="absolute top-0 left-0 bg-teal-500 text-white text-xs px-1.5 py-0.5 rounded-br-md">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add image button */}
                  <Button variant="outline" className="relative" asChild>
                    <label>
                      Add image
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleVariantImageChange}
                        accept="image/*"
                      />
                    </label>
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsVariantModalOpen(false);
                      setVariantFormData({
                        sku: '',
                        qty: '0',
                        status: true,
                        visibility: true,
                        images: [],
                        attributeValues: {}
                      });
                      setVariantFormErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateVariant}
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={loading.submit}
                  >
                    {loading.submit ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : "Create Variant"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default EditProduct;
