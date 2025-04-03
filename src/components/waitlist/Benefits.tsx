
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
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Join Our <span className="text-primary">Waitlist</span>
        </h2>
        <ul className="space-y-4">
          {benefitsList.map((benefit, index) => (
            <li key={index} className="flex items-center">
              <div className="mr-3">{benefit.icon}</div>
              <span>{benefit.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal>
  );
};

export default Benefits;
