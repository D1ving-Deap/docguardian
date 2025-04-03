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
      <div className="p-8 rounded-2xl shadow-sm border border-border/30 bg-zinc-600">
        <h3 className="text-2xl font-semibold mb-6">Early Access Benefits:</h3>
        <ul className="space-y-6 mb-8">
          {benefitsList.map((benefit, index) => <li key={index} className="flex items-start">
              <div className="mr-3 p-1.5 bg-primary/10 rounded-full">
                {benefit.icon}
              </div>
              <span className="text-lg">{benefit.text}</span>
            </li>)}
        </ul>
        <div className="rounded-xl bg-secondary p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-primary/10 p-1 rounded-full">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <p className="font-semibold">Limited availability</p>
          </div>
          <p className="text-foreground/80 mb-3">
            We're only opening <span className="font-semibold">100 early tester spots</span> to ensure quality support.
          </p>
          <p className="text-foreground/80 font-medium">
            Be part of shaping the future of mortgage compliance in Canada.
          </p>
        </div>
      </div>
    </ScrollReveal>;
};
export default Benefits;