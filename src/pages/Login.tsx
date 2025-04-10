
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, KeyRound, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Password recovery state
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);

  // Two-factor authentication state
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isTwoFactorLoading, setIsTwoFactorLoading] = useState(false);
  const [twoFactorSession, setTwoFactorSession] = useState<any>(null);

  // Get the intended destination from location state, if available
  const from = location.state?.from?.pathname || "/dashboard";

  // Parse tab from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [location]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Use a short timeout to ensure state has been fully updated
      const redirectTimer = setTimeout(() => {
        navigate(from, { replace: true });
      }, 100);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [user, navigate, from]);

  // Clear error message when switching tabs
  useEffect(() => {
    setErrorMessage(null);
  }, [activeTab]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Form validation
    if (!loginData.email || !loginData.password) {
      setErrorMessage("Please fill in all required fields");
      return;
    }
    
    if (!validateEmail(loginData.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Attempting to sign in with:", loginData.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      // Check if 2FA is enabled (for demo, we'll simulate this)
      // In a real app, you would check user metadata or a separate 2FA table
      const shouldUse2FA = Math.random() > 0.5; // Simulate randomized 2FA requirement
      
      if (shouldUse2FA) {
        setTwoFactorSession(data.session);
        setIsTwoFactorModalOpen(true);
        setLoading(false);
        // In a real implementation, you would send the code via email/SMS here
        toast({
          title: "Two-factor authentication required",
          description: "A verification code has been sent to your email.",
        });
      } else {
        await signIn(loginData.email, loginData.password);
        toast({
          title: "Login successful",
          description: "Redirecting to dashboard...",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // Handle specific error types
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

  const handleTwoFactorSubmit = async () => {
    if (twoFactorCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsTwoFactorLoading(true);
    try {
      // Here you would verify the 2FA code
      // For demo purposes, we'll accept any 6-digit code
      
      // In a real implementation, you would verify the code with your backend:
      // const { error } = await supabase.auth.verifyOTP({
      //   phone: user.phone,
      //   token: twoFactorCode,
      // });

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Verification successful",
        description: "Redirecting to dashboard...",
      });
      
      setIsTwoFactorModalOpen(false);
      
      // In a real app, you would use the session from the 2FA verification
      // For now, we'll just simulate a successful login
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: "The code you entered is invalid. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTwoFactorLoading(false);
    }
  };

  const handlePasswordRecovery = async () => {
    if (!validateEmail(recoveryEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsRecoveryLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) throw error;

      toast({
        title: "Recovery email sent",
        description: "Check your inbox for password recovery instructions",
      });
      
      setIsRecoveryModalOpen(false);
    } catch (error: any) {
      console.error("Password recovery error:", error);
      toast({
        title: "Error sending recovery email",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsRecoveryLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Form validation
    if (!registerData.fullName || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setErrorMessage("Please fill in all required fields");
      return;
    }
    
    if (!validateEmail(registerData.email)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    // Password strength check
    const hasUpperCase = /[A-Z]/.test(registerData.password);
    const hasLowerCase = /[a-z]/.test(registerData.password);
    const hasNumbers = /\d/.test(registerData.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(registerData.password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      setErrorMessage("Password must contain uppercase, lowercase, numbers, and special characters");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting to sign up with:", registerData.email);
      await signUp(registerData.email, registerData.password, registerData.fullName);
      // After successful registration, show a toast and switch to login tab
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account before logging in.",
      });
      setActiveTab("login");
      // Clear registration form
      setRegisterData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
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

  // Helper function to parse authentication errors
  const getAuthErrorMessage = (error: any): string => {
    const errorCode = error.code || "";
    
    // Handle Firebase-specific error codes
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email is already registered. Please log in instead.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/user-not-found":
        return "No account found with this email. Please register first.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later.";
      case "auth/weak-password":
        return "Password is too weak. It must be at least 6 characters.";
      case "auth/network-request-failed":
        return "Network error. Please check your connection and try again.";
      default:
        return error.message || "An unexpected error occurred. Please try again.";
    }
  };

  if (user) {
    return null; // Prevent flash of content before redirect
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
          
          {errorMessage && (
            <div className="px-6 pt-2">
              <Alert variant="destructive" className="border-red-500 bg-red-50 text-red-800">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            </div>
          )}
          
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button 
                      type="button"
                      onClick={() => setIsRecoveryModalOpen(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input 
                    id="login-password" 
                    type="password" 
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log in"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="John Doe" 
                    required
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input 
                    id="register-password" 
                    type="password" 
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    Password must be at least 6 characters with uppercase, lowercase, numbers, and special characters.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    disabled={loading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
                <p className="text-xs text-center text-gray-500">
                  By creating an account, you agree to our{" "}
                  <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{" "}
                  <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Password Recovery Modal */}
      <Dialog open={isRecoveryModalOpen} onOpenChange={setIsRecoveryModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recovery-email">Email</Label>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="recovery-email"
                  type="email"
                  placeholder="name@example.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setIsRecoveryModalOpen(false)} 
              variant="outline"
              disabled={isRecoveryLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordRecovery} 
              disabled={isRecoveryLoading || !recoveryEmail}
            >
              {isRecoveryLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send recovery email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Two-Factor Authentication Modal */}
      <Dialog open={isTwoFactorModalOpen} onOpenChange={(open) => {
        // Prevent closing by clicking outside (force user to complete 2FA)
        if (!open && twoFactorSession) return;
        setIsTwoFactorModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Two-factor authentication</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to your email or authentication app.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4 flex flex-col items-center">
              <KeyRound className="h-10 w-10 text-primary" />
              <InputOTP maxLength={6} value={twoFactorCode} onChange={setTwoFactorCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Didn't receive a code? Check your spam folder or{" "}
                <button 
                  className="text-primary hover:underline" 
                  type="button" 
                  onClick={() => {
                    toast({
                      title: "Code resent",
                      description: "A new verification code has been sent to your email",
                    });
                  }}
                >
                  click here to resend
                </button>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleTwoFactorSubmit} 
              disabled={isTwoFactorLoading || twoFactorCode.length !== 6}
              className="w-full"
            >
              {isTwoFactorLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify code"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
