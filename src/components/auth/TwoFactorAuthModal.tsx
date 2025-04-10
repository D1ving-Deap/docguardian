
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { KeyRound, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import { validateTwoFactorCode } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  session: any;
  email?: string;
}

const TwoFactorAuthModal = ({ isOpen, onClose, onVerify, session, email }: TwoFactorAuthModalProps) => {
  const { toast } = useToast();
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTwoFactorCode("");
      setCountdown(60);
      setCanResend(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: number | undefined;
    if (isOpen && countdown > 0) {
      timer = window.setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, isOpen]);

  const handleTwoFactorSubmit = async () => {
    if (!validateTwoFactorCode(twoFactorCode)) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onVerify(twoFactorCode);
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: "The code you entered is invalid or has expired. Please try again.",
        variant: "destructive",
      });
      setTwoFactorCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Unable to resend verification code. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate 2FA code resend for demonstration purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your email",
      });
      
      setCountdown(60);
      setCanResend(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open && session) return;
        !open && onClose();
      }}
    >
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
              {canResend ? (
                <>
                  Didn't receive a code? Check your spam folder or{" "}
                  <button 
                    className="text-primary hover:underline" 
                    type="button" 
                    onClick={handleResendCode}
                    disabled={isLoading}
                  >
                    click here to resend
                  </button>
                </>
              ) : (
                <>
                  You can request a new code in {countdown} seconds
                </>
              )}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleTwoFactorSubmit} 
            disabled={isLoading || twoFactorCode.length !== 6}
            className="w-full"
          >
            {isLoading ? (
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
  );
};

export default TwoFactorAuthModal;
