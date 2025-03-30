
import React from "react";
import { ChevronDown, ShieldCheck, AlertTriangle, Zap, Check } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";
import WaitlistSignupForm from "./waitlist/WaitlistSignupForm";
import FeaturePoint from "./hero/FeaturePoint";
import FraudAlert from "./hero/FraudAlert";

const HeroSection: React.FC = () => {
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
            
            <WaitlistSignupForm />
            
            <div className="mt-8 space-y-3">
              <FeaturePoint 
                icon={Check}
                bgColor="bg-green-100"
                iconColor="text-green-600"
                delay={1000}
              >
                AI-powered document <span className="text-primary font-semibold">fraud detection</span>
              </FeaturePoint>
              
              <FeaturePoint 
                icon={AlertTriangle}
                bgColor="bg-amber-100"
                iconColor="text-amber-600"
                delay={1100}
              >
                Real-time <span className="text-primary font-semibold">red flag alerts</span>
              </FeaturePoint>
              
              <FeaturePoint 
                icon={Zap}
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
                delay={1200}
              >
                One-click <span className="text-primary font-semibold">audit reports</span>
              </FeaturePoint>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 mt-10 md:mt-0">
            <FraudAlert />
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
