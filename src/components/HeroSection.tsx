import React from "react";
import WaitlistSignupForm from "./waitlist/WaitlistSignupForm";
import FraudAlert from "./hero/FraudAlert";
import HeroHeader from "./hero/HeroHeader";
import HeroFeaturesList from "./hero/HeroFeaturesList";
import ScrollDownButton from "./hero/ScrollDownButton";
const HeroSection: React.FC = () => {
  return <section className="pt-24 pb-16 px-6 md:px-12 lg:px-20 relative overflow-hidden">
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
          </div>
        </div>
        
        
      </div>
    </section>;
};
export default HeroSection;