
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Convert the email to a numeric value for the database
      const emailHash = generateNumericHash(email);
      console.log("Generated hash:", emailHash);
      
      // Check if email already exists in waitlist
      const { data: existingEmails, error: selectError } = await supabase
        .from('Gmail Waitlist')
        .select()
        .eq('User Email', emailHash);
      
      if (selectError) {
        console.error("Error checking waitlist:", selectError);
        toast.error("Failed to check waitlist. Please try again.");
        setIsLoading(false);
        return;
      }
      
      console.log("Existing emails check:", existingEmails);
      
      if (existingEmails && existingEmails.length > 0) {
        toast.info("You're already on our waitlist!");
        setIsLoading(false);
        return;
      }
      
      // Insert the email hash into the waitlist
      const { data: insertData, error: insertError } = await supabase
        .from('Gmail Waitlist')
        .insert({ 'User Email': emailHash })
        .select();
      
      console.log("Insert response:", { insertData, insertError });
      
      if (insertError) {
        console.error("Error adding to waitlist:", insertError);
        toast.error("Failed to join waitlist. Please try again.");
        setIsLoading(false);
        return;
      }
      
      toast.success("Thanks for joining our waitlist!");
      setEmail("");
    } catch (err) {
      console.error("Waitlist submission error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
