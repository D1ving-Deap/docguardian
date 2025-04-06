
import React from "react";
import { CheckCircle2, Clock, Users, Lock, Zap, Trophy } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

const Benefits: React.FC = () => {
  const benefitsList = [
    {
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      text: "Early access to the beta platform"
    },
    {
      icon: <Trophy className="h-5 w-5 text-primary" />,
      text: "50% discount on full subscription"
    },
    {
      icon: <Users className="h-5 w-5 text-green-500" />,
      text: "Priority support from our team"
    },
    {
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      text: "Input on new feature development"
    }
  ];
  
  return (
    <ScrollReveal animation="fade-in-up" delay={200}>
      <div className="mt-6 pt-6 border-t border-border/30">
        <h3 className="font-semibold text-center mb-4">Benefits of Joining</h3>
        <ul className="grid grid-cols-1 gap-3">
          {benefitsList.map((benefit, index) => (
            <li key={index} className="flex items-center">
              <div className="mr-3 p-1.5 bg-background rounded-full">{benefit.icon}</div>
              <span className="text-sm">{benefit.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal>
  );
};

export default Benefits;
