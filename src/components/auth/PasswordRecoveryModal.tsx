
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { validateEmail } from "@/utils/authUtils";

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PasswordRecoveryModal = ({ isOpen, onClose }: PasswordRecoveryModalProps) => {
  const { toast } = useToast();
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordRecovery = async () => {
    if (!validateEmail(recoveryEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Updated to use production redirect URL with the exact format
      const resetPasswordURL = "https://verify-flow.com/reset-password";
      console.log("Reset password redirect URL:", resetPasswordURL);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: resetPasswordURL,
      });

      if (error) throw error;

      toast({
        title: "Recovery email sent",
        description: "Check your inbox for password recovery instructions",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Password recovery error:", error);
      toast({
        title: "Error sending recovery email",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            onClick={onClose} 
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordRecovery} 
            disabled={isLoading || !recoveryEmail}
          >
            {isLoading ? (
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
  );
};

export default PasswordRecoveryModal;
