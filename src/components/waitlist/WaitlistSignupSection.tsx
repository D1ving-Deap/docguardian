
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateNumericHash } from "@/utils/hashUtils";
import ScrollReveal from "../ScrollReveal";
import Testimonial from "./Testimonial";

const WaitlistSignupSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailHash = 'example@example.com'; // Replace with the actual email you want to check
checkWaitlist(emailHash);

  return (
    <ScrollReveal delay={200}>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-border/30">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-semibold mb-3">Join the Waitlist</h3>
          <p className="text-foreground/70">
            Get early access to VerifyFlow and start protecting your practice today.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-12 px-5 ring-0 focus-visible:ring-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit"
            className={cn(
              "w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 button-hover-effect",
              isLoading && "opacity-90 pointer-events-none"
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                Secure My Spot
                <Lock className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        
        <Testimonial />
      </div>
    </ScrollReveal>
  );
};

export default WaitlistSignupSection;
