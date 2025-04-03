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
  return <ScrollReveal animation="fade-in-right">
      
    </ScrollReveal>;
};
export default Benefits;