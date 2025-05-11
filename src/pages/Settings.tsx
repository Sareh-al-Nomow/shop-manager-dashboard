
import React from "react";
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
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Settings = () => {
  const handleSave = () => {
    toast.success("Settings saved successfully!");
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
            <div className="grid gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Store Information</h3>
                <p className="text-sm text-muted-foreground">
                  Update your store details and contact information
                </p>
              </div>
              <Separator />
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input id="store-name" defaultValue="MyStore" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input id="contact-email" type="email" defaultValue="contact@mystore.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact-phone">Contact Phone</Label>
                    <Input id="contact-phone" type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="store-address">Store Address</Label>
                  <Textarea id="store-address" rows={3} defaultValue="123 E-Commerce St, Suite 101&#10;Shopping City, SC 12345&#10;United States" />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <h3 className="text-lg font-medium">Localization</h3>
                <p className="text-sm text-muted-foreground">
                  Configure regional settings for your store
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD - US Dollar</SelectItem>
                      <SelectItem value="eur">EUR - Euro</SelectItem>
                      <SelectItem value="gbp">GBP - British Pound</SelectItem>
                      <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="aud">AUD - Australian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="est">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">PST - Pacific Standard Time</SelectItem>
                      <SelectItem value="mst">MST - Mountain Standard Time</SelectItem>
                      <SelectItem value="cst">CST - Central Standard Time</SelectItem>
                      <SelectItem value="est">EST - Eastern Standard Time</SelectItem>
                      <SelectItem value="gmt">GMT - Greenwich Mean Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
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
                <Button onClick={handleSave}>Save Changes</Button>
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
                <Button onClick={handleSave}>Save Changes</Button>
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
                <Button onClick={handleSave}>Save Changes</Button>
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
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Settings;
