
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { validatePassword } from "@/utils/authUtils";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);

  // Get the access token from the URL
  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const type = searchParams.get("type");
    
    console.log("Password reset params:", { accessToken: !!accessToken, type });
    
    // Check if this is a valid reset password request
    if (!accessToken || type !== "recovery") {
      setExpired(true);
      toast({
        title: "Invalid or expired link",
        description: "This password reset link is invalid or has expired. Please request a new password reset.",
        variant: "destructive"
      });
    } else {
      // If we have a valid token, set the session
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: "",
      }).then(({ error }) => {
        if (error) {
          console.error("Error setting session:", error);
          setExpired(true);
          toast({
            title: "Invalid or expired token",
            description: "Please request a new password reset link.",
            variant: "destructive"
          });
        }
      });
    }
  }, [searchParams, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      
      // Update the user's password
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        console.error("Error updating password:", updateError);
        setError(updateError.message);
        toast({
          title: "Password reset failed",
          description: updateError.message,
          variant: "destructive"
        });
        return;
      }
      
      // Success
      setSuccess(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "An error occurred during password reset");
      toast({
        title: "Password reset failed",
        description: err.message || "An error occurred during password reset",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
          <CardDescription>
            {expired 
              ? "This link has expired. Please request a new password reset."
              : success 
                ? "Your password has been reset successfully."
                : "Enter your new password below."
            }
          </CardDescription>
        </CardHeader>
        
        {error && (
          <div className="px-6 pt-2">
            <Alert variant="destructive" className="border-red-500 bg-red-50 text-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        
        {success ? (
          <CardContent className="flex flex-col items-center justify-center gap-4 py-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-center text-gray-700">
              Your password has been reset successfully. Redirecting to login page...
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  placeholder="Enter new password" 
                  disabled={loading || expired || success}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  placeholder="Confirm new password" 
                  disabled={loading || expired || success}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || expired || success}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : expired ? (
                  "Link Expired"
                ) : (
                  "Reset Password"
                )}
              </Button>
            </CardFooter>
          </form>
        )}
        
        <div className="p-6 pt-0 text-center">
          <a href="/login" className="text-sm text-primary hover:underline">
            Return to login
          </a>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
