
import React from "react";
import { CheckCircle2, Clock, Users, Lock } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

const Benefits: React.FC = () => {
  const benefitsList = [{
    icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
    text: "Early access to the beta"
  }, {
    icon: <Users className="h-5 w-5 text-primary" />,
    text: "Priority support from our team"
  }, {
    icon: <Clock className="h-5 w-5 text-primary" />,
    text: "A say in what we build next"
  }];
  
  return (
    <ScrollReveal animation="fade-in-right">
      <div className="p-6 bg-white rounded-lg shadow-sm border border-border/30">
        <h3 className="text-xl font-bold mb-6">Join Our Waitlist Benefits</h3>
        
        <ul className="space-y-4">
          {benefitsList.map((benefit, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                {benefit.icon}
              </div>
              <span className="text-foreground/80">{benefit.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal>
  );
};

export default Benefits;
