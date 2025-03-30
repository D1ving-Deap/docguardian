
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "../ScrollReveal";

interface WaitlistSignupFormProps {
  className?: string;
}

const WaitlistSignupForm: React.FC<WaitlistSignupFormProps> = ({ className }) => {
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
      const emailHash = await generateNumericHash(email);
      
      // Check if the email hash already exists in the waitlist
      const { data: existingEmails, error: selectError } = await supabase
        .from('Gmail Waitlist')
        .select('User Email')
        .eq('User Email', emailHash);
      
      if (selectError) {
        console.error("Error checking waitlist:", selectError);
        toast.error("Failed to check waitlist. Please try again.");
        setIsLoading(false);
        return;
      }
      
      if (existingEmails && existingEmails.length > 0) {
        toast.info("You're already on our waitlist!");
        setIsLoading(false);
        return;
      }
      
      // Insert the email hash into the waitlist
      const { error: insertError } = await supabase
        .from('Gmail Waitlist')
        .insert({ 'User Email': emailHash });
      
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

  // Generate a consistent numeric value from a string
  const generateNumericHash = async (str: string): Promise<number> => {
    // Using a more reliable method to generate numeric hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  return (
    <ScrollReveal
      className={cn("w-full max-w-md", className)}
      delay={900}
      animation="fade-in-up"
    >
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:flex-row gap-3 w-full"
      >
        <Input
          type="email"
          placeholder="Enter your email"
          className="h-12 px-5 ring-0 focus-visible:ring-1 focus-visible:ring-primary"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button 
          type="submit"
          className={cn(
            "h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 button-hover-effect",
            isLoading && "opacity-90 pointer-events-none"
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            "Joining..."
          ) : (
            <>
              Join Waitlist
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
      <p className="text-sm mt-3 text-foreground/60 text-center sm:text-left">
        Join 100+ Canadian mortgage brokers protecting their practice
      </p>
    </ScrollReveal>
  );
};

export default WaitlistSignupForm;
