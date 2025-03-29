
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown, ShieldCheck, AlertTriangle, Zap, Check } from "lucide-react";
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
          {/* Left Column - Text Content */}
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
            
            {/* Feature Bullets */}
            <div className="mt-8 space-y-3">
              <ScrollReveal delay={1000} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm">AI-powered document fraud detection</span>
              </ScrollReveal>
              <ScrollReveal delay={1100} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                </div>
                <span className="text-sm">Real-time red flag alerts</span>
              </ScrollReveal>
              <ScrollReveal delay={1200} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Zap className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-sm">One-click audit reports</span>
              </ScrollReveal>
            </div>
          </div>
          
          {/* Right Column - Dashboard Preview */}
          <div className="w-full md:w-1/2 mt-10 md:mt-0">
            <ScrollReveal
              className="w-full rounded-lg overflow-hidden shadow-xl"
              delay={800}
              animation="fade-in-right"
            >
              <div className="w-full bg-gradient-to-br from-primary/5 to-primary/20 p-4">
                <div className="rounded-lg border border-white/20 bg-white/95 backdrop-blur-sm overflow-hidden shadow-lg">
                  {/* Dashboard Header */}
                  <div className="bg-primary/10 p-3 border-b border-border/20">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold text-xs">VF</span>
                        </div>
                        <span className="font-semibold text-sm text-foreground">Document Analysis</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Document Analysis Preview */}
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold">Verification Results</h3>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">2 Issues Found</span>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Income Statement Analysis */}
                      <div className="p-3 border border-red-100 bg-red-50 rounded-md relative overflow-hidden">
                        <div className="flex gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Inconsistent Pay Stub</p>
                            <p className="text-xs text-red-700">YTD total doesn't match sum of payments</p>
                            <div className="mt-2 p-2 bg-white/80 rounded border border-red-200">
                              <div className="flex items-center justify-between text-xs">
                                <span>Reported YTD:</span>
                                <span className="text-red-600 font-medium relative">
                                  $42,350
                                  <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-red-500 rounded"></span>
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs mt-1">
                                <span>Calculated YTD:</span>
                                <span className="font-medium">$36,150</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Document Tampering Detection */}
                      <div className="p-3 border border-amber-100 bg-amber-50 rounded-md relative overflow-hidden">
                        <div className="flex gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">Digital Manipulation Detected</p>
                            <p className="text-xs text-amber-700">Tax Notice of Assessment shows editing artifacts</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Verified Document */}
                      <div className="p-3 border border-green-100 bg-green-50 rounded-md">
                        <div className="flex gap-2">
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Verified ID Document</p>
                            <p className="text-xs text-green-700">Security features validated successfully</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Scroll Down Button */}
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
