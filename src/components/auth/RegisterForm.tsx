
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { validateEmail, validatePassword } from "@/utils/authUtils";
import { useToast } from "@/components/ui/use-toast";

interface RegisterFormProps {
  onSubmit: (fullName: string, email: string, password: string) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
  onTabChange: (tab: string) => void;
}

const RegisterForm = ({ onSubmit, loading, errorMessage, onTabChange }: RegisterFormProps) => {
  const { toast } = useToast();
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    if (!registerData.fullName || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setValidationError("Please fill in all required fields");
      return;
    }
    
    if (!validateEmail(registerData.email)) {
      setValidationError("Please enter a valid email address");
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(registerData.password);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }

    try {
      await onSubmit(registerData.fullName, registerData.email, registerData.password);
      
      // Reset form after successful submission
      // The toast notification is now handled in the Login component
      setRegisterData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      // Error handling is done in the Login component
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {(errorMessage || validationError) && (
        <div className="px-6 pt-2">
          <Alert variant="destructive" className="border-red-500 bg-red-50 text-red-800">
            <AlertDescription>{validationError || errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}
      
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
  );
};

export default RegisterForm;
