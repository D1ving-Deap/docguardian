
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { validateEmail } from "@/utils/authUtils";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  onForgotPassword: () => void;
  loading: boolean;
  errorMessage: string | null;
}

const LoginForm = ({ onSubmit, onForgotPassword, loading, errorMessage }: LoginFormProps) => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      return;
    }
    
    if (!validateEmail(loginData.email)) {
      return;
    }
    
    await onSubmit(loginData.email, loginData.password);
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorMessage && (
        <div className="px-6 pt-2">
          <Alert variant="destructive" className="border-red-500 bg-red-50 text-red-800">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}
      
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
              onClick={onForgotPassword}
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
  );
};

export default LoginForm;
