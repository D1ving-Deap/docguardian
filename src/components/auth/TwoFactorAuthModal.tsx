
import { useState } from "react";
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

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  session: any;
}

const TwoFactorAuthModal = ({ isOpen, onClose, onVerify, session }: TwoFactorAuthModalProps) => {
  const { toast } = useToast();
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTwoFactorSubmit = async () => {
    if (twoFactorCode.length !== 6) {
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
        description: "The code you entered is invalid. Please try again.",
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
