
import React from "react";
import WaitlistSignupForm from "./waitlist/WaitlistSignupForm";
import FraudAlert from "./hero/FraudAlert";
import HeroHeader from "./hero/HeroHeader";
import HeroFeaturesList from "./hero/HeroFeaturesList";
import ScrollDownButton from "./hero/ScrollDownButton";
import { Button } from "./ui/button";
import { CheckCircle, AlertTriangle, Users, Flag, BarChart3 } from "lucide-react";

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
          
          <div className="w-full md:w-1/2 mt-10 md:mt-0 flex flex-col gap-4">
            {/* Mini Broker Dashboard */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-border/30 mb-4">
              <h3 className="text-lg font-bold p-3 bg-gray-50 border-b border-border/30 flex items-center">
                <Users className="h-4 w-4 text-primary mr-2" />
                <span>Mortgage Broker Dashboard</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-2 p-3">
                <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Verified</span>
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                  </div>
                  <p className="text-lg font-bold">12</p>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Pending</span>
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                      <Flag className="h-3 w-3 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-lg font-bold">7</p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Issues</span>
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                    </div>
                  </div>
                  <p className="text-lg font-bold">2</p>
                </div>
              </div>
              
              <div className="p-2 bg-white border-t border-border/30">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs"
                  onClick={() => {
                    const howItWorksSection = document.getElementById("how-it-works");
                    if (howItWorksSection) {
                      howItWorksSection.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                >
                  See full dashboard
                </Button>
              </div>
            </div>
            
            <FraudAlert />
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
