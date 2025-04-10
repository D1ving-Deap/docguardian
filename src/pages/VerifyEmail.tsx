
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { resendVerificationEmail, validateEmail } from "@/utils/authUtils";

const VerifyEmail = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    setEmailError(null);
    
    if (!email || !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsResending(true);
    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
      toast({
        title: "Verification email resent",
        description: "Please check your inbox for the verification link.",
      });
    } catch (error: any) {
      console.error("Error resending verification:", error);
      setEmailError(error.message || "Failed to resend verification email.");
      toast({
        title: "Error resending verification",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">Email Verification Sent</h1>
        <p className="mb-6">Please check your inbox and click the verification link to activate your account.</p>
        
        {resendSuccess && (
          <Alert className="bg-green-50 border-green-200 text-green-800 mb-4">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Verification email resent! Please check your inbox.
            </AlertDescription>
          </Alert>
        )}
        
        {emailError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{emailError}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Didn't receive an email? Enter your email address to resend the verification link:</p>
          
          <div className="flex flex-col space-y-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isResending}
              className="w-full"
            />
            
            <Button 
              onClick={handleResendVerification} 
              disabled={isResending || !email}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-100">
            <p>Need to go back?</p>
            <Link to="/login?tab=register" className="text-primary hover:underline">
              Return to sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
