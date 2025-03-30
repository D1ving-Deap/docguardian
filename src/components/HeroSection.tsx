import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown, ShieldCheck, AlertTriangle, Zap, Check, FileText, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";
import { supabase } from "@/integrations/supabase/client";

const HeroSection: React.FC = () => {
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
      const { data: existingEmails } = await supabase
        .from('Waitlist')
        .select('email')
        .eq('email', email);
      
      if (existingEmails && existingEmails.length > 0) {
        toast.info("You're already on our waitlist!");
        setIsLoading(false);
        return;
      }
      
      const { error } = await supabase
        .from('Waitlist')
        .insert([{ email }]);
      
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

  const scrollToNextSection = () => {
    const nextSection = document.getElementById("pain-points");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="pt-24 pb-16 px-6 md:px-12 lg:px-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <ScrollReveal animation="fade-in-up">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Protect Your License & Livelihood</span>
              </div>
            </ScrollReveal>
            
            <AnimatedText
              text="Don't Let Mortgage Fraud Put Your Business at Risk"
              tag="h1"
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 max-w-4xl tracking-tight text-balance"
              delay={300}
            />
            
            <AnimatedText
              text="VerifyFlow uses AI to detect forged documents, spot inconsistencies, and keep you FSRA-compliant."
              tag="p"
              className="text-xl text-foreground/80 max-w-2xl mb-8"
              delay={600}
            />
            
            <ScrollReveal
              className="w-full max-w-md"
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
            
            <div className="mt-8 space-y-3">
              <ScrollReveal delay={1000} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm">AI-powered document <span className="text-primary font-semibold">fraud detection</span></span>
              </ScrollReveal>
              <ScrollReveal delay={1100} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                </div>
                <span className="text-sm">Real-time <span className="text-primary font-semibold">red flag alerts</span></span>
              </ScrollReveal>
              <ScrollReveal delay={1200} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Zap className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-sm">One-click <span className="text-primary font-semibold">audit reports</span></span>
              </ScrollReveal>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 mt-10 md:mt-0">
            <ScrollReveal
              className="w-full"
              delay={800}
              animation="fade-in-right"
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/30">
                <div className="bg-red-50 p-4 border-b border-red-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <Flag className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-700">Mortgage Fraud Alert</h3>
                      <p className="text-sm text-red-600">Common red flags that could put your license at risk</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                      <h4 className="text-md font-semibold flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-red-600" />
                        <span>Document Tampering</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-red-600 font-bold">!</span>
                          </div>
                          <span className="text-sm text-foreground/80">Inconsistent fonts or formatting</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-red-600 font-bold">!</span>
                          </div>
                          <span className="text-sm text-foreground/80">Pixelated text or uneven alignment</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-red-600 font-bold">!</span>
                          </div>
                          <span className="text-sm text-foreground/80">Missing security features</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-red-600 font-bold">!</span>
                          </div>
                          <span className="text-sm text-foreground/80">Digital editing artifacts</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                      <h4 className="text-md font-semibold flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span>Income Verification Issues</span>
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-amber-100">
                          <span className="text-sm">NOA Income:</span>
                          <span className="text-sm font-medium">$85,000</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded border border-amber-100">
                          <span className="text-sm">Pay Stub YTD:</span>
                          <span className="text-sm font-medium text-amber-700 relative">
                            $68,000
                            <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-amber-500"></span>
                          </span>
                        </div>
                        <div className="text-xs text-amber-700 italic mt-1">
                          * 20% difference detected (high risk)
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">VerifyFlow protects you from these risks</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-primary border-primary/30 hover:bg-primary/5"
                        onClick={() => {
                          const featuresSection = document.getElementById("features");
                          if (featuresSection) {
                            featuresSection.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <button 
            onClick={scrollToNextSection}
            className="animate-bounce p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors duration-300"
            aria-label="Scroll down to learn more"
          >
            <ChevronDown className="h-6 w-6 text-primary" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
