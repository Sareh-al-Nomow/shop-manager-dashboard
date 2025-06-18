import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { collectionService, languageService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

export default function CreateCollection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    image: '',
    type: 'section' as "section" | "banner"
  });

  // State for image file
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for languages and translations
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [currentTranslation, setCurrentTranslation] = useState<Translation>({
    lang_code: '',
    name: '',
    description: ''
  });

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
    setFormData({
      ...formData,
      [id]: value
    });
  };

  // Handle type selection
  const handleTypeChange = (value: "section" | "banner") => {
    setFormData({
      ...formData,
      type: value
    });
  };

  // Handle translation input changes
  const handleTranslationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;

    // Map form field IDs to API field names
    const fieldMap: Record<string, string> = {
      'translation-name': 'name',
      'translation-description': 'description'
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
        description: ''
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
          description: ''
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
        if (img.width > 3000 || img.height > 2000) {
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
   * Validate the code field to ensure it matches the required pattern
   * Pattern: /^[a-z0-9-_]+$/
   */
  const validateCode = (code: string): boolean => {
    const pattern = /^[a-z0-9-_]+$/;
    return pattern.test(code);
  };

  /**
   * Handle form submission with comprehensive validation
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Validate all required text fields
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Collection name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.code) {
      toast({
        title: "Validation Error",
        description: "Collection code is required",
        variant: "destructive"
      });
      return;
    }

    // Validate code format
    if (!validateCode(formData.code)) {
      toast({
        title: "Validation Error",
        description: "Collection code must contain only lowercase letters, numbers, hyphens, and underscores",
        variant: "destructive"
      });
      return;
    }

    // Check code length
    if (formData.code.length > 50) {
      toast({
        title: "Validation Error",
        description: "Collection code must not exceed 50 characters",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 2: Upload the image if provided
      let imagePath = '';
      if (imageFile) {
        try {
          // Upload the image using the dedicated image upload endpoint
          const imageUploadResult = await collectionService.uploadCollectionImage(imageFile);
          console.log('Image upload result:', imageUploadResult);

          // Get the image path from the response
          if (imageUploadResult.imagePath) {
            imagePath = imageUploadResult.imagePath;
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

      // Step 3: Create collection data object
      const collectionData = {
        name: formData.name,
        description: formData.description || null,
        code: formData.code,
        type: formData.type,
        image: imagePath || null,
        translations: translations.length > 0 ? translations : undefined
      };

      console.log('Sending the following data:', collectionData);

      // Step 4: Create the collection
      const result = await collectionService.createCollection(collectionData);

      // Step 5: Show success message
      toast({
        title: "Success",
        description: "Collection created successfully"
      });

      // Step 6: Redirect to collections page
      navigate('/collections');

    } catch (error) {
      console.error('Error creating collection:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create collection",
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
          <Link to="/collections">
            <Button type="button" variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create a new collection</h1>
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
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          maxLength={255}
                        />
                      </div>

                      <div>
                        <Label htmlFor="code">Code</Label>
                        <Input 
                          id="code" 
                          className="mt-1" 
                          value={formData.code}
                          onChange={handleInputChange}
                          required
                          maxLength={50}
                          placeholder="e.g. summer-collection"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Only lowercase letters, numbers, hyphens, and underscores are allowed
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          className="mt-1"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Enter a description for this collection"
                        />
                      </div>

                      <div>
                        <Label className="mb-2 block">Collection Type</Label>
                        <RadioGroup 
                          value={formData.type} 
                          onValueChange={(value) => handleTypeChange(value as "section" | "banner")}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="section" id="type-section" />
                            <Label htmlFor="type-section">Section</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="banner" id="type-banner" />
                            <Label htmlFor="type-banner">Banner</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="translations" className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Translations</h2>
                      <div className="flex items-center space-x-2">
                        <select 
                          value={selectedLanguage} 
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          disabled={loadingLanguages}
                          className="border rounded-md p-2"
                        >
                          <option value="">Select language</option>
                          {languages.map((language) => (
                            <option key={language.id} value={language.languageCode}>
                              {language.languageName}
                            </option>
                          ))}
                        </select>
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
                            maxLength={255}
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

          {/* Right Column - Image */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Collection Image</h2>
                <div 
                  className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Collection image preview" 
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
                  <p className="text-sm text-muted-foreground mt-2">Click to upload an image (optional)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between">
          <Link to="/collections">
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
