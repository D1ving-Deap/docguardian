
import React, { useState } from "react";
import { ArrowRight, Lock, CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";
import { supabase } from "@/integrations/supabase/client";

const WaitlistForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if email already exists in the waitlist
      const { data: existingEmails } = await supabase
        .from('Gmail Waitlist')
        .select('User Email')
        .eq('User Email', email);
      
      if (existingEmails && existingEmails.length > 0) {
        toast.info("You're already on our waitlist!");
        setIsLoading(false);
        return;
      }
      
      // Insert new email into the waitlist
      const { error } = await supabase
        .from('Gmail Waitlist')
        .insert([{ 'User Email': email }]);
      
      if (error) {
        console.error("Error adding to waitlist:", error);
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

  const benefits = [
    {
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      text: "Early access to the beta",
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      text: "Priority support from our team",
    },
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      text: "A say in what we build next",
    },
  ];

  return (
    <section id="waitlist" className="section-padding bg-gradient-to-b from-secondary to-white relative">
      <div className="section-container">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            Limited Spots Available
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join the Pioneers in Mortgage Fraud Protection
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            We're creating the future of mortgage verification, and we want you to be part of it.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal animation="fade-in-right">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border/30">
              <h3 className="text-2xl font-semibold mb-6">Early Access Benefits:</h3>
              <ul className="space-y-6 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-3 p-1.5 bg-primary/10 rounded-full">
                      {benefit.icon}
                    </div>
                    <span className="text-lg">{benefit.text}</span>
                  </li>
                ))}
              </ul>
              <div className="rounded-xl bg-secondary p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-primary/10 p-1 rounded-full">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-semibold">Limited availability</p>
                </div>
                <p className="text-foreground/80 mb-3">
                  We're only opening <span className="font-semibold">100 early tester spots</span> to ensure quality support.
                </p>
                <p className="text-foreground/80 font-medium">
                  Be part of shaping the future of mortgage compliance in Canada.
                </p>
              </div>
            </div>
          </ScrollReveal>
          
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
              
              <div className="mt-8 pt-6 border-t border-border/30">
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="italic text-foreground/60 text-center">
                    "This looks like exactly what we need. After that last FSRA audit, we've been looking for better document verification tools."
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">MB</span>
                    </div>
                    <p className="text-foreground/60 font-medium">
                      Mark B., Mortgage Broker
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
