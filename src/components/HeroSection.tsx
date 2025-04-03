
import React from "react";
import WaitlistSignupForm from "./waitlist/WaitlistSignupForm";
import FraudAlert from "./hero/FraudAlert";
import HeroHeader from "./hero/HeroHeader";
import HeroFeaturesList from "./hero/HeroFeaturesList";
import ScrollDownButton from "./hero/ScrollDownButton";
import { FileCheck, Shield, AlertTriangle, Upload } from "lucide-react";

const HeroSection: React.FC = () => {
  const detectionSteps = [
    {
      icon: <Upload className="h-5 w-5 text-primary" />,
      title: "Upload Documents",
      description: "Securely upload client mortgage documents"
    },
    {
      icon: <Shield className="h-5 w-5 text-primary" />,
      title: "AI Analysis",
      description: "Our AI scans for inconsistencies & fraud patterns"
    },
    {
      icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
      title: "Fraud Alerts",
      description: "Get instant alerts on suspicious documents"
    },
    {
      icon: <FileCheck className="h-5 w-5 text-green-600" />,
      title: "Verification Report",
      description: "Generate compliance reports for due diligence"
    }
  ];

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
          
          <div className="w-full md:w-1/2 mt-10 md:mt-0 flex flex-col gap-6">
            {/* Process Steps */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-border/30">
              <h3 className="text-lg font-bold p-3 bg-gray-50 border-b border-border/30">
                <span>How VerifyFlow Works</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4 p-4">
                {detectionSteps.map((step, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-border/30 transition-all hover:shadow-md hover:border-primary/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {step.icon}
                      </div>
                      <h4 className="font-medium text-sm">{step.title}</h4>
                    </div>
                    <p className="text-xs text-foreground/70">{step.description}</p>
                  </div>
                ))}
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
