
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";

const HeroSection: React.FC = () => {
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
    <section className="pt-32 pb-20 px-6 md:px-12 lg:px-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center mb-12">
          <ScrollReveal animation="fade-in-up">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              Mortgage Fraud Detection
            </span>
          </ScrollReveal>
          
          <AnimatedText
            text="You're One Fake Document Away From a Lawsuit."
            tag="h1"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto tracking-tight text-balance"
            delay={300}
          />
          
          <AnimatedText
            text="Mortgage fraud is getting smarter. Are your tools keeping up?"
            tag="p"
            className="text-xl text-foreground/80 max-w-2xl mx-auto mb-10"
            delay={600}
          />
          
          <ScrollReveal
            className="w-full max-w-md mx-auto"
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
          </ScrollReveal>
        </div>
        
        <ScrollReveal
          className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl glass"
          delay={1200}
          animation="fade-in-up"
        >
          <div className="w-full aspect-[16/9] bg-gradient-to-br from-primary/5 to-primary/20 p-6 sm:p-8">
            <div className="h-full rounded-xl border border-white/20 bg-white/30 backdrop-blur-sm flex flex-col justify-center items-center p-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="text-primary text-2xl">🔒</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-center">Protect Your License. Protect Your Business.</h3>
              <p className="text-center text-foreground/70 max-w-lg">
                VerifyFlow helps you catch fraudulent documents before they become your problem.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HeroSection;
