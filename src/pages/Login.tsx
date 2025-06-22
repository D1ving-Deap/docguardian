import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import PasswordRecoveryModal from "@/components/auth/PasswordRecoveryModal";
import { getAuthErrorMessage, resendVerificationEmail } from "@/utils/authUtils";

const CAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "YOUR_RECAPTCHA_SITE_KEY";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      const redirectTimer = setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, navigate, from]);

  useEffect(() => {
    setErrorMessage(null);
  }, [activeTab]);

  const handleLoginSubmit = async (email: string, password: string, captchaToken: string) => {
    setErrorMessage(null);
    setLoading(true);
    
    try {
      console.log("Attempting to sign in with:", email);
      await signIn(email, password, captchaToken);
      
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = getAuthErrorMessage(error);
      setErrorMessage(errorMessage);
      
      // Check if the error is due to unverified email
      if (error.message?.includes("Email not confirmed") || 
          error.message?.includes("not confirmed") ||
          error.message?.includes("not verified")) {
        toast({
          title: "Email not verified",
          description: (
            <div>
              Please verify your email before logging in.
              <div className="mt-2">
                Didn't get the verification email?{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={async () => {
                    try {
                      await resendVerificationEmail(email);
                      toast({
                        title: "Verification resent",
                        description: "Check your inbox for the new verification link.",
                      });
                      navigate("/verify-email");
                    } catch (resendErr: any) {
                      toast({
                        title: "Error resending verification",
                        description: resendErr.message,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Resend verification
                </button>
              </div>
            </div>
          ),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (fullName: string, email: string, password: string, captchaToken: string) => {
    setErrorMessage(null);
    setLoading(true);
    
    try {
      console.log("Attempting to sign up with:", email);
      await signUp(email, password, fullName, captchaToken);
      
      // Navigate to verification page
      navigate("/verify-email");
      
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = getAuthErrorMessage(error);
      setErrorMessage(errorMessage);
      
      // If the error indicates the user already exists but email is not verified
      if (error.message?.includes("already registered") || 
          error.message?.includes("already exists")) {
        toast({
          title: "Email already registered",
          description: (
            <div>
              This email is already registered. If you haven't verified your email yet:
              <div className="mt-2">
                <button
                  className="text-primary hover:underline"
                  onClick={async () => {
                    try {
                      await resendVerificationEmail(email);
                      toast({
                        title: "Verification resent",
                        description: "Check your inbox for the new verification link.",
                      });
                      navigate("/verify-email");
                    } catch (resendErr: any) {
                      toast({
                        title: "Error resending verification",
                        description: resendErr.message,
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Resend verification email
                </button>
              </div>
            </div>
          ),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="absolute top-4 right-4 h-10 w-10 p-0"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>

      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">VF</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">VerifyFlow</h1>
          <p className="text-muted-foreground">
            Secure document processing and mortgage application management
          </p>
        </div>

        {/* Login/Register Card */}
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {activeTab === 'login' ? 'Welcome back' : 'Create account'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' 
                ? 'Enter your credentials to access your account' 
                : 'Fill in your details to create a new account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <LoginForm 
                  onSubmit={handleLoginSubmit}
                  onForgotPassword={() => setIsRecoveryModalOpen(true)}
                  loading={loading && activeTab === "login"}
                  errorMessage={activeTab === "login" ? errorMessage : null}
                  captchaSiteKey={CAPTCHA_SITE_KEY}
                />
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <RegisterForm 
                  onSubmit={handleRegisterSubmit}
                  loading={loading && activeTab === "register"}
                  errorMessage={activeTab === "register" ? errorMessage : null}
                  onTabChange={setActiveTab}
                  captchaSiteKey={CAPTCHA_SITE_KEY}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Need help?{' '}
            <Link to="/support" className="text-primary hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
      
      <PasswordRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
      />
    </div>
  );
};

export default Login;
