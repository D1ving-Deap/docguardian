
import React, { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";

const WaitlistForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Thanks for joining our waitlist!");
      setEmail("");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <section id="waitlist" className="section-padding bg-gradient-to-b from-secondary to-white relative">
      <div className="section-container">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            Limited Spots Available
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            What Happens When You Join the Waitlist?
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal animation="fade-in-right">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border/30">
              <h3 className="text-2xl font-semibold mb-6">You'll get:</h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-primary mr-3 text-xl">•</span>
                  <span>Early access to the beta</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 text-xl">•</span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 text-xl">•</span>
                  <span>A say in what we build next</span>
                </li>
              </ul>
              <div className="rounded-xl bg-secondary p-6">
                <p className="text-foreground/80 mb-3">
                  We're only opening <span className="font-semibold">100 early tester spots</span>.
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
                  Get early access to VerifyFlow and be the first to know when we launch.
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
                    "Joining..."
                  ) : (
                    <>
                      Join the Waitlist
                      <Lock className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-border/30 text-center">
                <p className="italic text-foreground/60 text-sm">
                  "I wish I had this 6 months ago. Would've saved us a serious headache."
                </p>
                <p className="text-foreground/60 text-sm mt-1">
                  — Test Broker
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
