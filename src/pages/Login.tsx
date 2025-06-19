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
import { getAuthErrorMessage, resendVerificationEmail } from "@/utils/authUtils";

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
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState<string>("");

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
    setCurrentEmail(email);
    setCurrentPassword(password);
    
    setLoading(true);
    try {
      console.log("Attempting to sign in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check for unverified email error
        if (error.message.includes("Email not confirmed") || 
            error.message.includes("not confirmed")) {
          throw new Error("Your email is not verified. Please check your inbox for the verification link.");
        }
        throw error;
      }

      // For demonstration purposes, randomly require 2FA
      // In a real application, this would be based on user configuration or your security policy
      const shouldUse2FA = Math.random() > 0.7; // Reduced probability for better UX
      
      if (shouldUse2FA && data.session) {
        // Send 2FA code via email
        const { error: otpError } = await supabase.auth.resend({
          type: 'signup',
          email: email,
        });
        
        if (otpError) {
          console.error("Failed to send 2FA code:", otpError);
          // Continue with normal login if 2FA fails
          await signIn(email, password);
          toast({
            title: "Login successful",
            description: "Redirecting to dashboard...",
          });
        } else {
          setIsTwoFactorModalOpen(true);
          setLoading(false);
          toast({
            title: "Two-factor authentication required",
            description: "A verification code has been sent to your email.",
          });
        }
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
                      // Redirect to verification page with email
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
      if (!isTwoFactorModalOpen) {
        setLoading(false);
      }
    }
  };

  const handleTwoFactorVerify = async (code: string) => {
    try {
      setLoading(true);
      
      // Verify the OTP code
      const { error } = await supabase.auth.verifyOtp({
        email: currentEmail,
        token: code,
        type: 'email'
      });
      
      if (error) throw error;
      
      // After successful 2FA verification, complete the sign-in
      await signIn(currentEmail, currentPassword);
      
      toast({
        title: "Verification successful",
        description: "Redirecting to dashboard...",
      });
      
      setIsTwoFactorModalOpen(false);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error("2FA verification error:", error);
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (fullName: string, email: string, password: string) => {
    setErrorMessage(null);
    
    setLoading(true);
    try {
      console.log("Attempting to sign up with:", email);
      await signUp(email, password, fullName);
      
      // Navigate to verification page
      navigate("/verify-email");
      
      // The toast notification is now handled in the RegisterForm component
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
              onTabChange={setActiveTab}
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
        session={null}
        email={currentEmail}
      />
    </div>
  );
};

export default Login;
