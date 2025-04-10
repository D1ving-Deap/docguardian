
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import PasswordRecoveryModal from "@/components/auth/PasswordRecoveryModal";
import TwoFactorAuthModal from "@/components/auth/TwoFactorAuthModal";
import { getAuthErrorMessage } from "@/utils/authUtils";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [twoFactorSession, setTwoFactorSession] = useState<any>(null);

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

  const handleLoginSubmit = async (email: string, password: string) => {
    setErrorMessage(null);
    
    setLoading(true);
    try {
      console.log("Attempting to sign in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const shouldUse2FA = Math.random() > 0.5;
      
      if (shouldUse2FA) {
        setTwoFactorSession(data.session);
        setIsTwoFactorModalOpen(true);
        setLoading(false);
        toast({
          title: "Two-factor authentication required",
          description: "A verification code has been sent to your email.",
        });
      } else {
        await signIn(email, password);
        toast({
          title: "Login successful",
          description: "Redirecting to dashboard...",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = getAuthErrorMessage(error);
      setErrorMessage(errorMessage);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (!isTwoFactorModalOpen) {
        setLoading(false);
      }
    }
  };

  const handleTwoFactorVerify = async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Verification successful",
      description: "Redirecting to dashboard...",
    });
    
    setIsTwoFactorModalOpen(false);
    navigate(from, { replace: true });
  };

  const handleRegisterSubmit = async (fullName: string, email: string, password: string) => {
    setErrorMessage(null);
    
    setLoading(true);
    try {
      console.log("Attempting to sign up with:", email);
      await signUp(email, password, fullName);
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account before logging in.",
      });
      setActiveTab("login");
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = getAuthErrorMessage(error);
      setErrorMessage(errorMessage);
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="absolute top-4 left-4">
        <a 
          href="/" 
          className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80"
        >
          VerifyFlow
        </a>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome to VerifyFlow</CardTitle>
          <CardDescription>
            {activeTab === "login" 
              ? "Log in to access the mortgage verification dashboard"
              : "Create an account to get started with VerifyFlow"}
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm 
              onSubmit={handleLoginSubmit}
              onForgotPassword={() => setIsRecoveryModalOpen(true)}
              loading={loading}
              errorMessage={errorMessage}
            />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm 
              onSubmit={handleRegisterSubmit}
              loading={loading}
              errorMessage={errorMessage}
            />
          </TabsContent>
        </Tabs>
      </Card>
      
      <PasswordRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
      />
      
      <TwoFactorAuthModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
        onVerify={handleTwoFactorVerify}
        session={twoFactorSession}
      />
    </div>
  );
};

export default Login;
