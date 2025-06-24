
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Products from "./pages/Products";
import CreateProduct from "./pages/CreateProduct";
import EditProduct from "./pages/EditProduct";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import CreateCategory from "./pages/CreateCategory";
import EditCategory from "./pages/EditCategory";
import CategoryDetails from "./pages/CategoryDetails";
import Brands from "./pages/Brands";
import BrandDetails from "./pages/BrandDetails";
import CreateBrand from "./pages/CreateBrand";
import EditBrand from "./pages/EditBrand";
import Attributes from "./pages/Attributes";
import CreateAttribute from "./pages/CreateAttribute";
import EditAttribute from "./pages/EditAttribute";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import ShowUser from "./pages/ShowUser";
import Coupons from "./pages/Coupons";
import Reviews from "./pages/Reviews";
import CreateCoupon from "./pages/CreateCoupon";
import EditCoupon from "./pages/EditCoupon";
import Collections from "./pages/Collections";
import CreateCollection from "./pages/CreateCollection";
import CollectionDetails from "./pages/CollectionDetails";
import EditCollection from "./pages/EditCollection";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import RolesManagement from "./pages/RolesManagement";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/create-product" element={<ProtectedRoute><CreateProduct /></ProtectedRoute>} />
            <Route path="/edit-product/:id" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/create-category" element={<ProtectedRoute><CreateCategory /></ProtectedRoute>} />
            <Route path="/edit-category/:id" element={<ProtectedRoute><EditCategory /></ProtectedRoute>} />
            <Route path="/category/:id" element={<ProtectedRoute><CategoryDetails /></ProtectedRoute>} />
            <Route path="/brands" element={<ProtectedRoute><Brands /></ProtectedRoute>} />
            <Route path="/create-brand" element={<ProtectedRoute><CreateBrand /></ProtectedRoute>} />
            <Route path="/edit-brand/:id" element={<ProtectedRoute><EditBrand /></ProtectedRoute>} />
            <Route path="/brand/:id" element={<ProtectedRoute><BrandDetails /></ProtectedRoute>} />
            <Route path="/attributes" element={<ProtectedRoute><Attributes /></ProtectedRoute>} />
            <Route path="/create-attribute" element={<ProtectedRoute><CreateAttribute /></ProtectedRoute>} />
            <Route path="/edit-attribute/:id" element={<ProtectedRoute><EditAttribute /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/user/:id" element={<ProtectedRoute><ShowUser /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
            <Route path="/coupons/:id" element={<ProtectedRoute><EditCoupon /></ProtectedRoute>} />
            <Route path="/create-coupon" element={<ProtectedRoute><CreateCoupon /></ProtectedRoute>} />
            <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />
            <Route path="/create-collection" element={<ProtectedRoute><CreateCollection /></ProtectedRoute>} />
            <Route path="/collection/:id" element={<ProtectedRoute><CollectionDetails /></ProtectedRoute>} />
            <Route path="/edit-collection/:id" element={<ProtectedRoute><EditCollection /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin/roles" element={<ProtectedRoute><RolesManagement /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
