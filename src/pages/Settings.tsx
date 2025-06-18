
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { settingsService, Setting, SettingUpdatePayload, locationService, languageService } from "@/services";
import { Country, City } from "@/services/locationService";
import { LanguageData } from "@/services/languageService";
import { CountryCitySelect } from "@/components/ui/country-city-select";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define validation schema based on the Joi schema from the API
const storeSettingsSchema = z.object({
  store_name: z.string().min(2).max(100),
  contact_email: z.string().email(),
  contact_phone: z.string().regex(/^[0-9+\-\s()]{7,20}$/),
  store_address: z.string().min(5).max(200),
  store_country: z.string().min(2).max(100),
  store_city: z.string().min(2).max(100),
  post_code: z.string().min(3).max(20),
  default_language: z.string().min(2).max(50),
  default_currency: z.string().min(2).max(10),
  store_logo: z.string() // Allow any string (URL or empty)
});

type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;

const Settings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<LanguageData[]>([]);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState<{ languageCode: string; languageName: string; isActive: boolean }>({
    languageCode: '',
    languageName: '',
    isActive: true
  });
  const [addingLanguage, setAddingLanguage] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      store_name: "",
      contact_email: "",
      contact_phone: "",
      store_address: "",
      store_country: "",
      store_city: "",
      post_code: "",
      default_language: "",
      default_currency: "",
      store_logo: ""
    }
  });

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsService.getAll();
        setSettings(data);

        // Fetch languages from API
        const languages = await languageService.getLanguages();
        console.log('Languages from API:', languages);
        console.log('Languages type:', typeof languages);
        console.log('Is languages an array?', Array.isArray(languages));
        if (Array.isArray(languages)) {
          console.log('Languages length:', languages.length);
          if (languages.length > 0) {
            console.log('First language:', languages[0]);
          }
        }
        setAvailableLanguages(languages);



        // Parse available currencies
        const currencies = settingsService.getSettingByName(data, 'available_currencies');

        if (Array.isArray(currencies)) {
          setAvailableCurrencies(currencies);
        }

        // Set form values from fetched settings
        form.reset({
          store_name: settingsService.getSettingByName(data, 'store_name') || "",
          contact_email: settingsService.getSettingByName(data, 'contact_email') || "",
          contact_phone: settingsService.getSettingByName(data, 'contact_phone') || "",
          store_address: settingsService.getSettingByName(data, 'store_address') || "",
          store_country: settingsService.getSettingByName(data, 'store_country') || "",
          store_city: settingsService.getSettingByName(data, 'store_city') || "",
          post_code: settingsService.getSettingByName(data, 'post_code') || "",
          default_language: settingsService.getSettingByName(data, 'default_language') || "",
          default_currency: settingsService.getSettingByName(data, 'default_currency') || "",
          store_logo: settingsService.getSettingByName(data, 'store_logo') || ""
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  // Handle form submission
  const handleSave = async (data: StoreSettingsFormValues) => {
    setSaving(true);
    try {
      // Prepare settings for update
      const settingsToUpdate: SettingUpdatePayload[] = Object.entries(data).map(([name, value]) => ({
        name,
        value,
        is_json: false
      }));

      await settingsService.updateBatch(settingsToUpdate);
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle adding a new language
  const handleAddLanguage = async () => {
    if (!newLanguage.languageCode || !newLanguage.languageName) {
      toast.error("Language code and name are required");
      return;
    }

    setAddingLanguage(true);
    try {
      await languageService.addLanguage(newLanguage);

      // Refresh languages list
      const languages = await languageService.getLanguages();
      setAvailableLanguages(languages);

      // Reset form and close modal
      setNewLanguage({
        languageCode: '',
        languageName: '',
        isActive: true
      });
      setIsAddLanguageOpen(false);

      toast.success("Language added successfully!");
    } catch (err) {
      console.error('Error adding language:', err);
      toast.error("Failed to add language. Please try again.");
    } finally {
      setAddingLanguage(false);
    }
  };

  // Handle logo file upload
  const handleLogoUpload = async (file: File) => {
    if (!file) return;

    setUploadingLogo(true);
    try {
      const response = await settingsService.uploadLogo(file);

      // API returns response with message and logoUrl
      if (response && response.logoUrl) {
        form.setValue("store_logo", response.logoUrl, { shouldValidate: true });
        toast.success(response.message || "Logo uploaded successfully!");
      } else {
        toast.error("Failed to upload logo. Invalid response from server.");
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">Manage your store preferences</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span>Loading settings...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                {error}
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(handleSave)} className="grid gap-6">
                {/* Store Information Section */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Store Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your store details and contact information
                  </p>
                </div>
                <Separator />
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="store_name">Store Name</Label>
                    <Input 
                      id="store_name" 
                      {...form.register("store_name")} 
                      aria-invalid={form.formState.errors.store_name ? "true" : "false"}
                    />
                    {form.formState.errors.store_name && (
                      <p className="text-red-500 text-sm">{form.formState.errors.store_name.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="store_logo">Store Logo</Label>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input 
                          id="store_logo" 
                          {...form.register("store_logo")} 
                          aria-invalid={form.formState.errors.store_logo ? "true" : "false"}
                          placeholder="Logo URL (automatically updated when you upload a file)"
                          readOnly
                        />
                        <div className="relative">
                          <Input
                            type="file"
                            id="logo-upload"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedLogo(file);
                                handleLogoUpload(file);
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            disabled={uploadingLogo}
                          >
                            {uploadingLogo ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Uploading...
                              </>
                            ) : (
                              'Upload Logo'
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Upload a logo image (PNG, JPG, SVG). Recommended size: 200x100px.
                      </p>
                    </div>
                    {form.formState.errors.store_logo && (
                      <p className="text-red-500 text-sm">{form.formState.errors.store_logo.message}</p>
                    )}
                    {form.watch("store_logo") && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Logo Preview:</p>
                        <img 
                          src={form.watch("store_logo")} 
                          alt="Store Logo" 
                          className="max-h-20 border rounded p-1"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/200x100?text=Invalid+Image+URL";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input 
                        id="contact_email" 
                        type="email" 
                        {...form.register("contact_email")} 
                        aria-invalid={form.formState.errors.contact_email ? "true" : "false"}
                      />
                      {form.formState.errors.contact_email && (
                        <p className="text-red-500 text-sm">{form.formState.errors.contact_email.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact_phone">Contact Phone</Label>
                      <Input 
                        id="contact_phone" 
                        type="tel" 
                        {...form.register("contact_phone")} 
                        aria-invalid={form.formState.errors.contact_phone ? "true" : "false"}
                      />
                      {form.formState.errors.contact_phone && (
                        <p className="text-red-500 text-sm">{form.formState.errors.contact_phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="store_address">Store Address</Label>
                    <Textarea 
                      id="store_address" 
                      rows={3} 
                      {...form.register("store_address")} 
                      aria-invalid={form.formState.errors.store_address ? "true" : "false"}
                    />
                    {form.formState.errors.store_address && (
                      <p className="text-red-500 text-sm">{form.formState.errors.store_address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <CountryCitySelect
                        countryLabel="Country"
                        cityLabel="City"
                        onCountryChange={(country) => {
                          setSelectedCountry(country);
                          if (country) {
                            form.setValue("store_country", country.name, { shouldValidate: true });
                          } else {
                            form.setValue("store_country", "", { shouldValidate: true });
                          }
                          // Reset city when country changes
                          form.setValue("store_city", "", { shouldValidate: true });
                        }}
                        onCityChange={(city) => {
                          setSelectedCity(city);
                          if (city) {
                            form.setValue("store_city", city.name, { shouldValidate: true });
                          } else {
                            form.setValue("store_city", "", { shouldValidate: true });
                          }
                        }}
                      />
                      {(form.formState.errors.store_country || form.formState.errors.store_city) && (
                        <div className="mt-1">
                          {form.formState.errors.store_country && (
                            <p className="text-red-500 text-sm">{form.formState.errors.store_country.message}</p>
                          )}
                          {form.formState.errors.store_city && (
                            <p className="text-red-500 text-sm">{form.formState.errors.store_city.message}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="post_code">Postal Code</Label>
                      <Input 
                        id="post_code" 
                        {...form.register("post_code")} 
                        aria-invalid={form.formState.errors.post_code ? "true" : "false"}
                      />
                      {form.formState.errors.post_code && (
                        <p className="text-red-500 text-sm">{form.formState.errors.post_code.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Localization Section */}
                <div className="space-y-2 pt-4">
                  <h3 className="text-lg font-medium">Localization</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure regional settings for your store
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="default_language">Default Language</Label>
                      <Dialog open={isAddLanguageOpen} onOpenChange={setIsAddLanguageOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Add Language
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Language</DialogTitle>
                            <DialogDescription>
                              Add a new language to your store. Fill in the details below.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="language-code">Language Code</Label>
                              <Input
                                id="language-code"
                                placeholder="en"
                                value={newLanguage.languageCode}
                                onChange={(e) => setNewLanguage({...newLanguage, languageCode: e.target.value})}
                              />
                              <p className="text-xs text-muted-foreground">
                                Use standard language codes (e.g., en, fr, es)
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="language-name">Language Name</Label>
                              <Input
                                id="language-name"
                                placeholder="English"
                                value={newLanguage.languageName}
                                onChange={(e) => setNewLanguage({...newLanguage, languageName: e.target.value})}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="language-active"
                                checked={newLanguage.isActive}
                                onCheckedChange={(checked) => setNewLanguage({...newLanguage, isActive: checked})}
                              />
                              <Label htmlFor="language-active">Active</Label>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddLanguageOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddLanguage} disabled={addingLanguage}>
                              {addingLanguage ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Adding...
                                </>
                              ) : (
                                'Add Language'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select 
                      value={form.watch("default_language")} 
                      onValueChange={(value) => form.setValue("default_language", value, { shouldValidate: true })}
                    >
                      <SelectTrigger id="default_language">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.length > 0 ? (
                          availableLanguages.map((lang) => (
                            <SelectItem key={lang.languageCode} value={lang.languageCode}>
                              {lang.languageCode.toUpperCase()} - {lang.languageName}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="en">EN - English</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.default_language && (
                      <p className="text-red-500 text-sm">{form.formState.errors.default_language.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="default_currency">Default Currency</Label>
                    <Select 
                      value={form.watch("default_currency")} 
                      onValueChange={(value) => form.setValue("default_currency", value, { shouldValidate: true })}
                    >
                      <SelectTrigger id="default_currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCurrencies.length > 0 ? (
                          availableCurrencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency} - {getCurrencyName(currency)}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.default_currency && (
                      <p className="text-red-500 text-sm">{form.formState.errors.default_currency.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <div className="grid gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update your account details and profile information
                </p>
              </div>
              <Separator />
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt="Admin User" />
                  <AvatarFallback className="text-2xl">AU</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h4 className="text-base font-medium">Profile Picture</h4>
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm">Upload New</Button>
                    <Button variant="outline" size="sm" className="text-red-500">Remove</Button>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" defaultValue="Admin" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" defaultValue="User" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="admin@example.com" />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Button variant="link" className="h-auto p-0">Forgot Password?</Button>
                  </div>
                  <Input id="current-password" type="password" />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <h3 className="text-lg font-medium">Security</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your account security settings
                </p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="login-alerts">Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications for new login activity
                    </p>
                  </div>
                  <Switch id="login-alerts" defaultChecked />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => toast.success("Account settings saved!")}>Save Changes</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="grid gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how and when you receive notifications
                </p>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="order-notifications">Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for new orders
                    </p>
                  </div>
                  <Switch id="order-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="stock-alerts">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when products are running low
                    </p>
                  </div>
                  <Switch id="stock-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="customer-feedback">Customer Feedback</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about new reviews and ratings
                    </p>
                  </div>
                  <Switch id="customer-feedback" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-updates">Marketing Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      News about promotions and marketing features
                    </p>
                  </div>
                  <Switch id="marketing-updates" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => toast.success("Notification settings saved!")}>Save Changes</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <div className="grid gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Shipping Options</h3>
                <p className="text-sm text-muted-foreground">
                  Configure shipping methods and delivery options
                </p>
              </div>
              <Separator />
              {/* Add shipping settings here */}
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Shipping settings saved!")}>Save Changes</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <div className="grid gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Payment Methods</h3>
                <p className="text-sm text-muted-foreground">
                  Configure available payment options for your customers
                </p>
              </div>
              <Separator />
              {/* Add payment settings here */}
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Payment settings saved!")}>Save Changes</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

// Helper function to get language name from code
function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    ar: "Arabic",
    zh: "Chinese",
    ru: "Russian",
    pt: "Portuguese",
    ja: "Japanese",
    it: "Italian"
  };

  return languages[code.toLowerCase()] || code;
}

// Helper function to get currency name from code
function getCurrencyName(code: string): string {
  const currencies: Record<string, string> = {
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    JPY: "Japanese Yen",
    CAD: "Canadian Dollar",
    AUD: "Australian Dollar",
    CHF: "Swiss Franc",
    CNY: "Chinese Yuan",
    INR: "Indian Rupee",
    BRL: "Brazilian Real"
  };

  return currencies[code.toUpperCase()] || code;
}

export default Settings;
