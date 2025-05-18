
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Bell,
  Menu,
  LogOut,
  Tags,
  TagsIcon,
  Bookmark,
  BadgePercent,
  Award,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

// Navigation menu items
const navItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    requiredRole: "dashboard_access",
  },
  {
    title: "Products",
    icon: Package,
    path: "/products",
    requiredRole: "product_manager",
  },
  {
    title: "Categories",
    icon: Tags,
    path: "/categories",
    requiredRole: "product_manager",
  },
  {
    title: "Brands",
    icon: Award,
    path: "/brands",
    requiredRole: "product_manager",
  },
  {
    title: "Attributes",
    icon: TagsIcon,
    path: "/attributes",
    requiredRole: "product_manager",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    path: "/orders",
    requiredRole: "order_manager",
  },
  {
    title: "Customers",
    icon: Users,
    path: "/customers",
    requiredRole: "customer_manager",
  },
  {
    title: "Coupons",
    icon: BadgePercent,
    path: "/coupons",
    requiredRole: "marketing_manager",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/analytics",
    requiredRole: "admin",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
    requiredRole: "settings_access",
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout, user, hasRole } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1">
          <header className="border-b bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <h1 className="hidden text-xl font-semibold md:block">E-Commerce Admin</h1>
              </div>
              <div className="flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>New order received</DropdownMenuItem>
                    <DropdownMenuItem>Low stock alert for 3 products</DropdownMenuItem>
                    <DropdownMenuItem>Customer support request</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user?.name || "User"} />
                        <AvatarFallback>{user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.name || "My Account"}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AdminSidebar() {
  const { logout, user, hasRole } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="h-14 border-b border-sidebar-border px-4 flex items-center">
        <span className="text-xl font-bold tracking-tight">ShopAdmin</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // Check if the item requires a specific role
                const shouldRender = item.requiredRole 
                  ? hasRole(item.requiredRole) 
                  : item.title === "Dashboard" || user?.role_id === 1;

                return shouldRender ? (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null;
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 border-sidebar-border">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={user?.name || "User"} />
            <AvatarFallback>{user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm">{user?.email || ""}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.roles?.join(", ") || ""}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
