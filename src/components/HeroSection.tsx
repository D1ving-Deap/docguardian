
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronDown } from "lucide-react";
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
          className="w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl glass mt-12"
          delay={1200}
          animation="fade-in-up"
        >
          <div className="w-full aspect-[16/9] bg-gradient-to-br from-primary/5 to-primary/20 p-6 sm:p-8">
            <div className="h-full rounded-xl border border-white/20 bg-white/30 backdrop-blur-sm flex flex-col justify-center items-center p-6 relative overflow-hidden">
              {/* Dashboard Preview */}
              <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg border border-border/20 overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-primary/10 p-4 border-b border-border/20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold">VF</span>
                      </div>
                      <span className="font-semibold text-foreground">VerifyFlow Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Document Verification Status</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">3 alerts</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 border border-red-100 bg-red-50 rounded-md">
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mt-0.5"><path d="M12 9v4"/><path d="M12 16h.01"/><circle cx="12" cy="12" r="10"/></svg>
                        <div>
                          <p className="text-sm font-medium text-red-700">High Risk: CRA Notice of Assessment</p>
                          <p className="text-xs text-red-600">Document appears to be modified</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border border-amber-100 bg-amber-50 rounded-md">
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mt-0.5"><path d="M12 9v4"/><path d="M12 16h.01"/><path d="M9.7 17h4.6"/><path d="M4 8l2.1 2.8L4 14"/><path d="M20 8l-2.1 2.8L20 14"/><path d="M12 2v2"/><path d="M12 20v2"/></svg>
                        <div>
                          <p className="text-sm font-medium text-amber-700">Warning: Employment Letter</p>
                          <p className="text-xs text-amber-600">Phone number doesn't match employer records</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 border border-green-100 bg-green-50 rounded-md">
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mt-0.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        <div>
                          <p className="text-sm font-medium text-green-700">Verified: Driver's License</p>
                          <p className="text-xs text-green-600">Document passed all verification checks</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <a
                  href="#waitlist"
                  className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center"
                >
                  Get Early Access
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
        
        {/* Scroll Down Button */}
        <div className="flex justify-center mt-10">
          <button 
            onClick={scrollToNextSection}
            className="animate-bounce p-2 rounded-full bg-white/80 shadow-md hover:bg-white transition-colors duration-300"
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
