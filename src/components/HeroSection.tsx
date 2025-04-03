
import React from "react";
import WaitlistSignupForm from "./waitlist/WaitlistSignupForm";
import FraudAlert from "./hero/FraudAlert";
import HeroHeader from "./hero/HeroHeader";
import HeroFeaturesList from "./hero/HeroFeaturesList";
import ScrollDownButton from "./hero/ScrollDownButton";

const HeroSection: React.FC = () => {
  return (
    <section className="pt-24 pb-16 px-6 md:px-12 lg:px-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <HeroHeader />
            
            <WaitlistSignupForm />
            
            <HeroFeaturesList />
          </div>
          
          <div className="w-full md:w-1/2 mt-10 md:mt-0">
            <FraudAlert />
            
            <div className="mt-10 relative flex flex-col items-center">
              <ScrollReveal animation="fade-in-up" delay={800}>
                <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-primary/10">
                  <h3 className="text-lg font-semibold text-primary mb-2">Try our Metadata Checker</h3>
                  <p className="text-sm text-muted-foreground mb-4">Prevent document fraud with our advanced metadata analysis</p>
                  <div className="flex justify-center">
                    <img 
                      src="/lovable-uploads/ea4cd89e-46b3-43e7-ab3d-5cfa5f658eff.png" 
                      alt="Curved arrow pointing to metadata checker" 
                      className="w-16 h-16 object-contain mb-2"
                    />
                  </div>
                  <a 
                    href="#metadata-detection" 
                    className="block w-full text-center bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Check a document now
                  </a>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <ScrollDownButton targetId="pain-points" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
