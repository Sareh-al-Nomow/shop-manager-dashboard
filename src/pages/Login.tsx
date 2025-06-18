
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign, KeyRound, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    // Only redirect if authentication check is complete and user is authenticated
    if (!authLoading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate, authLoading]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast({
          title: "Success",
          description: "You have successfully logged in",
        });

        // Redirect to dashboard
        navigate("/");
      } else {
        // Check if this is a blocked account
        if (result.errorType === "account_blocked") {
          toast({
            title: "Account Blocked",
            description: "Your account has been disabled. Please contact an administrator.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Authentication Failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">ShopAdmin</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="email@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                {/*<div className="flex items-center justify-between">*/}
                {/*  <Label htmlFor="password">Password</Label>*/}
                {/*  <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">*/}
                {/*    Forgot password?*/}
                {/*  </Link>*/}
                {/*</div>*/}
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/*<div className="text-center text-sm text-muted-foreground">*/}
        {/*  <p>*/}
        {/*    Don't have an account?{" "}*/}
        {/*    <Link to="/register" className="font-medium text-primary hover:underline">*/}
        {/*      Contact your administrator*/}
        {/*    </Link>*/}
        {/*  </p>*/}
        {/*</div>*/}
      </div>
    </div>
  );
};

export default Login;
