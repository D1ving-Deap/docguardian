
import React from "react";
import { Check, AlertTriangle, Zap } from "lucide-react";
import FeaturePoint from "./FeaturePoint";

const HeroFeaturesList: React.FC = () => {
  return (
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
  );
};

export default HeroFeaturesList;
