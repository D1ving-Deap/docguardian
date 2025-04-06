
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
      // Check if email already exists in waitlist
      const {
        data: existingEmails,
        error: selectError
      } = await supabase.from('Gmail Waitlist').select().eq('User Email', email);
      
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

      // Insert the email into the waitlist
      const {
        data: insertData,
        error: insertError
      } = await supabase.from('Gmail Waitlist').insert({
        'User Email': email
      }).select();
      
      console.log("Insert response:", {
        insertData,
        insertError
      });
      
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
    <ScrollReveal delay={100}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
            Email Address
          </label>
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            className="h-12 px-5 text-base focus-visible:ring-primary" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        <Button 
          type="submit" 
          className={cn(
            "w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 button-hover-effect text-base",
            isLoading && "opacity-90 pointer-events-none"
          )} 
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : (
            <>
              Join Waitlist Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1 mt-3 mb-6">
          <Lock className="h-3 w-3" />
          Your information is secure and will never be shared
        </p>
      </form>
      
      {/* Explicitly render the Testimonial component */}
      <Testimonial />
    </ScrollReveal>
  );
};

export default WaitlistSignupSection;
