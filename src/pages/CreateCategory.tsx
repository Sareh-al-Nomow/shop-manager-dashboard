
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import {categoryService, imageService, languageService, categoryTranslationService} from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ParentCategory {
  id: number;
  name: string;
}

interface Language {
  id: number;
  languageCode: string;
  languageName: string;
  isActive: boolean;
  flagUrl: string;
}

interface Translation {
  lang_code: string;
  name: string;
  description?: string;
  short_description?: string;
  url_key?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
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

  // State for languages and translations
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [currentTranslation, setCurrentTranslation] = useState<Translation>({
    lang_code: '',
    name: '',
    description: '',
    short_description: '',
    url_key: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  // Fetch parent categories
  useEffect(() => {
    const fetchParentCategories = async () => {
      setLoadingCategories(true);
      try {
        const result = await categoryService.getCategories();
        const { data } = result;

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

  // Fetch languages
  useEffect(() => {
    const fetchLanguages = async () => {
      setLoadingLanguages(true);
      try {
        const result = await languageService.getLanguages();

        if (result && result.data) {
          setLanguages(result.data);

          // If languages are available, set the first active language as selected by default
          const activeLanguages = result.data.filter((lang: Language) => lang.isActive);
          if (activeLanguages.length > 0) {
            setSelectedLanguage(activeLanguages[0].languageCode);
            setCurrentTranslation({
              ...currentTranslation,
              lang_code: activeLanguages[0].languageCode
            });
          }
        }
      } catch (error) {
        console.error("Error fetching languages:", error);
        toast({
          title: "Error",
          description: "Failed to load languages",
          variant: "destructive"
        });
      } finally {
        setLoadingLanguages(false);
      }
    };

    fetchLanguages();
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

  // Handle translation input changes
  const handleTranslationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    // Map form field IDs to API field names
    const fieldMap: Record<string, string> = {
      'translation-name': 'name',
      'translation-description': 'description',
      'translation-short-description': 'short_description',
      'translation-meta-title': 'meta_title',
      'translation-meta-keywords': 'meta_keywords',
      'translation-meta-description': 'meta_description',
      'translation-url-key': 'url_key'
    };

    const field = fieldMap[id];
    if (field) {
      setCurrentTranslation({
        ...currentTranslation,
        [field]: value
      });
    }
  };

  // Handle language selection
  const handleLanguageChange = (languageCode: string) => {
    // Check if there's already a translation for this language
    const existingTranslation = translations.find(t => t.lang_code === languageCode);

    if (existingTranslation) {
      // If there's an existing translation, load it into the form
      setCurrentTranslation(existingTranslation);
    } else {
      // Otherwise, reset the form with just the language code
      setCurrentTranslation({
        lang_code: languageCode,
        name: '',
        description: '',
        short_description: '',
        url_key: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: ''
      });
    }

    setSelectedLanguage(languageCode);
  };

  // Add or update a translation
  const handleAddTranslation = () => {
    // Validate required fields
    if (!currentTranslation.name) {
      toast({
        title: "Validation Error",
        description: "Translation name is required",
        variant: "destructive"
      });
      return;
    }

    // Check if we're updating an existing translation
    const existingIndex = translations.findIndex(t => t.lang_code === currentTranslation.lang_code);

    if (existingIndex >= 0) {
      // Update existing translation
      const updatedTranslations = [...translations];
      updatedTranslations[existingIndex] = currentTranslation;
      setTranslations(updatedTranslations);

      toast({
        title: "Success",
        description: "Translation updated"
      });
    } else {
      // Add new translation
      setTranslations([...translations, currentTranslation]);

      toast({
        title: "Success",
        description: "Translation added"
      });
    }

    // Reset the form for a new translation
    if (languages.length > 0) {
      // Find a language that doesn't have a translation yet
      const untranslatedLanguage = languages.find(lang => 
        !translations.some(t => t.lang_code === lang.languageCode) && 
        lang.languageCode !== currentTranslation.lang_code
      );

      if (untranslatedLanguage) {
        setSelectedLanguage(untranslatedLanguage.languageCode);
        setCurrentTranslation({
          lang_code: untranslatedLanguage.languageCode,
          name: '',
          description: '',
          short_description: '',
          url_key: '',
          meta_title: '',
          meta_description: '',
          meta_keywords: ''
        });
      }
    }
  };

  // Remove a translation
  const handleRemoveTranslation = (langCode: string) => {
    setTranslations(translations.filter(t => t.lang_code !== langCode));

    toast({
      title: "Success",
      description: "Translation removed"
    });

    // If the removed translation was the current one, reset the form
    if (langCode === selectedLanguage) {
      // Find another language to select
      const nextLanguage = languages.find(lang => lang.languageCode !== langCode);
      if (nextLanguage) {
        handleLanguageChange(nextLanguage.languageCode);
      }
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

  /**
   * Helper function to validate basic image properties (type and size)
   * 
   * Validation requirements:
   * 1. File type must be one of: JPEG, JPG, PNG, GIF
   * 2. File size must not exceed 2MB
   * 
   * @param file - The image file to validate
   * @returns boolean - True if the image passes all validations, false otherwise
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

  /**
   * Handle file input change with comprehensive image validation
   * 
   * Validation process:
   * 1. Basic validation (type and size) using validateImageBasics helper
   * 2. Dimension validation:
   *    - Minimum dimensions: 200x200 pixels
   *    - Maximum dimensions: 2000x2000 pixels
   * 3. Image loading validation to ensure the file is a valid image
   * 
   * If all validations pass, the image is set in state and a preview is created
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Step 1: Validate basic properties (type and size)
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

        // If all validations pass, set the image file and preview
        setImageFile(file);

        // Create preview for display in the UI
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
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

  /**
   * Handle form submission with comprehensive validation
   * 
   * Validation process:
   * 1. Required text fields validation (name, descriptions, URL key)
   * 2. Image validation:
   *    - Check if an image is selected
   *    - Validate image properties using validateImageBasics helper
   * 
   * If all validations pass, the form is submitted to create a new category
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Validate all required text fields
    if (!formData.description.name) {
      toast({
        title: "Validation Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.short_description) {
      toast({
        title: "Validation Error",
        description: "Short description is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.description) {
      toast({
        title: "Validation Error",
        description: "Description is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.url_key) {
      toast({
        title: "Validation Error",
        description: "URL key is required",
        variant: "destructive"
      });
      return;
    }

    // Step 2: Validate image
    // Check if an image is selected
    if (!imageFile) {
      toast({
        title: "Validation Error",
        description: "Category image is required",
        variant: "destructive"
      });
      return;
    }

    // Validate image properties (type and size)
    if (!validateImageBasics(imageFile)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create JSON object for API
      const apiData: any = {
        status: formData.status,
        include_in_nav: formData.include_in_nav,
        show_products: formData.show_products,
        description: { ...formData.description },

      };

      // Handle parent_id (convert 'none' to null or convert to number)
      if (formData.parent_id === 'none') {
        apiData.parent_id = '';
      } else if (formData.parent_id) {
        apiData.parent_id = formData.parent_id;
      }

      // Add position if it exists
      if (formData.position) {
        apiData.position = parseInt(formData.position) ;
      }

      // Step 3: Upload the image and get the image path
      // This is a separate API call that happens before creating the category
      let imagePath = '';
      if (imageFile) {
        try {
          // Upload the image using the dedicated image upload endpoint
          const imageUploadResult = await imageService.uploadCategoryImage(imageFile);
          console.log('Image upload result:', imageUploadResult);

          // Get the image path from the response
          if (imageUploadResult.imagePath) {
            imagePath = imageUploadResult.imagePath;
            // Add the image path to the API data for category creation
            apiData.description.image = imagePath;
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

      // Step 4: Log the data being sent for debugging
      console.log('Sending the following data:', apiData);

      // Step 5: Send POST request to create the category
      // This uses the categoryService to handle the API call
      const result = await categoryService.createCategory(apiData);

      // Step 6: Save translations if any
      if (translations.length > 0) {
        try {
          // Get the category ID from the result
          const categoryId = result.data?.id || result.id;

          if (!categoryId) {
            throw new Error('Category ID not found in response');
          }

          // Save each translation
          const translationPromises = translations.map(translation => 
            categoryTranslationService.createTranslation({
              ...translation,
              category_id: categoryId
            })
          );

          await Promise.all(translationPromises);

          console.log('Translations saved successfully');
        } catch (translationError) {
          console.error('Error saving translations:', translationError);
          toast({
            title: "Warning",
            description: "Category created but translations could not be saved",
            variant: "destructive"
          });
        }
      }

      // Step 7: Show success message to the user
      toast({
        title: "Success",
        description: "Category created successfully"
      });

      // Step 8: Redirect to categories page after successful creation
      navigate('/categories');

    } catch (error) {
      // Handle any errors that occur during the category creation process
      console.error('Error creating category:', error);

      // Show error message to the user with specific error details if available
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive"
      });
    } finally {
      // Always reset the submitting state, regardless of success or failure
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
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="translations">Translations</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
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
                          required
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
                          required
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
                        required
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
                </TabsContent>

                <TabsContent value="translations" className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Translations</h2>
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={selectedLanguage} 
                          onValueChange={handleLanguageChange}
                          disabled={loadingLanguages}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={loadingLanguages ? "Loading languages..." : "Select language"} />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((language) => (
                              <SelectItem key={language.id} value={language.languageCode}>
                                {language.languageName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          onClick={handleAddTranslation}
                          disabled={!selectedLanguage}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Save Translation
                        </Button>
                      </div>
                    </div>

                    {/* Translation form */}
                    {selectedLanguage && (
                      <div className="space-y-4 border p-4 rounded-md">
                        <div>
                          <Label htmlFor="translation-name">Name</Label>
                          <Input 
                            id="translation-name" 
                            className="mt-1" 
                            value={currentTranslation.name}
                            onChange={handleTranslationChange}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="translation-short-description">Short Description</Label>
                          <Textarea 
                            id="translation-short-description" 
                            className="mt-1"
                            value={currentTranslation.short_description || ''}
                            onChange={handleTranslationChange}
                          />
                        </div>

                        <div>
                          <Label htmlFor="translation-description">Description</Label>
                          <Textarea 
                            id="translation-description" 
                            className="mt-1"
                            value={currentTranslation.description || ''}
                            onChange={handleTranslationChange}
                          />
                        </div>

                        <div>
                          <Label htmlFor="translation-url-key">URL Key</Label>
                          <Input 
                            id="translation-url-key" 
                            className="mt-1"
                            value={currentTranslation.url_key || ''}
                            onChange={handleTranslationChange}
                          />
                        </div>

                        <div>
                          <Label htmlFor="translation-meta-title">Meta Title</Label>
                          <Input 
                            id="translation-meta-title" 
                            className="mt-1"
                            value={currentTranslation.meta_title || ''}
                            onChange={handleTranslationChange}
                          />
                        </div>

                        <div>
                          <Label htmlFor="translation-meta-keywords">Meta Keywords</Label>
                          <Input 
                            id="translation-meta-keywords" 
                            className="mt-1"
                            value={currentTranslation.meta_keywords || ''}
                            onChange={handleTranslationChange}
                          />
                        </div>

                        <div>
                          <Label htmlFor="translation-meta-description">Meta Description</Label>
                          <Textarea 
                            id="translation-meta-description" 
                            className="mt-1"
                            value={currentTranslation.meta_description || ''}
                            onChange={handleTranslationChange}
                          />
                        </div>
                      </div>
                    )}

                    {/* List of saved translations */}
                    {translations.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-md font-medium mb-2">Saved Translations</h3>
                        <div className="space-y-2">
                          {translations.map((translation) => {
                            const language = languages.find(lang => lang.languageCode === translation.lang_code);
                            return (
                              <div key={translation.lang_code} className="flex justify-between items-center p-2 border rounded-md">
                                <div className="flex items-center">
                                  {language?.flagUrl && (
                                    <img 
                                      src={language.flagUrl} 
                                      alt={language.languageName} 
                                      className="h-4 w-6 mr-2"
                                    />
                                  )}
                                  <span>{language?.languageName || translation.lang_code}</span>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleLanguageChange(translation.lang_code)}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-500"
                                    onClick={() => handleRemoveTranslation(translation.lang_code)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
                    required
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
