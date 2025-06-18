import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { categoryService, imageService, languageService, categoryTranslationService } from "@/services";
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
import { isEqual } from "lodash";

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
  id?: number;
  lang_code: string;
  name: string;
  description?: string;
  short_description?: string;
  url_key?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
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
    parent_id: 0,
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
    parent_id: 0,
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
        if (category?.description.image) {
          setImagePreview(`${category?.description.image}`);
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

  // Fetch languages and translations
  useEffect(() => {
    const fetchLanguagesAndTranslations = async () => {
      if (!categoryId) return;

      setLoadingLanguages(true);
      try {
        // Fetch languages
        const languagesResult = await languageService.getLanguages();

        if (languagesResult && languagesResult.data) {
          setLanguages(languagesResult.data);

          // Fetch existing translations for this category
          const translationsResult = await categoryTranslationService.getTranslationsForCategory(categoryId);

          if (translationsResult && translationsResult.data) {
            // Map API response to our Translation interface
            const categoryTranslations = translationsResult.data.map((translation: any) => ({
              id: translation.id,
              lang_code: translation.lang_code,
              name: translation.name || '',
              description: translation.description || '',
              short_description: translation.short_description || '',
              url_key: translation.url_key || '',
              meta_title: translation.meta_title || '',
              meta_description: translation.meta_description || '',
              meta_keywords: translation.meta_keywords || ''
            }));

            setTranslations(categoryTranslations);

            // If translations exist and languages are available, set the first one as selected
            if (categoryTranslations.length > 0 && languagesResult.data.length > 0) {
              const firstTranslation = categoryTranslations[0];
              setSelectedLanguage(firstTranslation.lang_code);
              setCurrentTranslation(firstTranslation);
            } else if (languagesResult.data.length > 0) {
              // If no translations but languages are available, set the first active language as selected
              const activeLanguages = languagesResult.data.filter((lang: Language) => lang.isActive);
              if (activeLanguages.length > 0) {
                setSelectedLanguage(activeLanguages[0].languageCode);
                setCurrentTranslation({
                  ...currentTranslation,
                  lang_code: activeLanguages[0].languageCode
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching languages and translations:", error);
        toast({
          title: "Error",
          description: "Failed to load languages and translations",
          variant: "destructive"
        });
      } finally {
        setLoadingLanguages(false);
      }
    };

    fetchLanguagesAndTranslations();
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
  const handleLanguageChange = async (languageCode: string) => {
    setSelectedLanguage(languageCode);

    try {
      // First check if there's already a translation for this language in our local state
      const existingTranslation = translations.find(t => t.lang_code === languageCode);

      if (existingTranslation) {
        // If there's an existing translation in local state, load it into the form
        setCurrentTranslation(existingTranslation);
      } else {
        // Otherwise, try to fetch it from the API
        try {
          const result = await categoryTranslationService.getTranslationByLang(categoryId, languageCode);

          if (result) {
            // Map API response to our Translation interface
            const translation = {
              id: result.id,
              lang_code: result.lang_code,
              name: result.name || '',
              description: result.description || '',
              short_description: result.short_description || '',
              url_key: result.url_key || '',
              meta_title: result.meta_title || '',
              meta_description: result.meta_description || '',
              meta_keywords: result.meta_keywords || ''
            };

            // Update local state with the fetched translation
            setCurrentTranslation(translation);

            // Add this translation to our local translations array
            setTranslations(prev => [...prev, translation]);
          }
        } catch (error) {
          console.log("No translation found for this language, creating a new one");

          // If API call fails or no translation exists, reset the form with just the language code
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
      }
    } catch (error) {
      console.error("Error handling language change:", error);
      toast({
        title: "Error",
        description: "Failed to load translation for selected language",
        variant: "destructive"
      });
    }
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
      parent_id: value === 'none' ? 0 : parseInt(value)
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

      // Handle parent_id (convert 'none' to 0 or convert to number)
      if (!isEqual(formData.parent_id, originalFormData.parent_id)) {
        if (formData.parent_id === 'none' || formData.parent_id === null) {
          apiData.parent_id = 0;
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
          if (imageUploadResult && imageUploadResult.imagePath) {
            // Add the image path to the API data
            apiData.image_path = imageUploadResult.imagePath;
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

      // Save translations if any
      if (translations.length > 0) {
        try {
          // Save each translation
          const translationPromises = translations.map(translation => {
            // If translation has an ID, update it, otherwise create a new one
            if (translation.id) {
              return categoryTranslationService.updateTranslation(
                translation.id,
                {
                  name: translation.name,
                  description: translation.description,
                  short_description: translation.short_description,
                  url_key: translation.url_key,
                  meta_title: translation.meta_title,
                  meta_description: translation.meta_description,
                  meta_keywords: translation.meta_keywords
                }
              );
            } else {
              return categoryTranslationService.createTranslation({
                ...translation,
                category_id: categoryId
              });
            }
          });

          await Promise.all(translationPromises);

          console.log('Translations saved successfully');
        } catch (translationError) {
          console.error('Error saving translations:', translationError);
          toast({
            title: "Warning",
            description: "Category updated but translations could not be saved",
            variant: "destructive"
          });
        }
      }

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
