
import React from "react";
import { FileBarChart, RefreshCw, Brain, Check } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { Card, CardContent } from "../ui/card";

const MajorFeatures: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "AI-Powered Cross-Referencing",
      description: "Our system automatically checks documents for inconsistencies, forgeries, and tampering in minutes, not hours.",
      color: "border-primary/40 shadow-lg shadow-primary/10",
      benefits: ["90% faster verification", "Catches hidden inconsistencies", "Continuous learning system"]
    },
    {
      icon: <RefreshCw className="h-10 w-10 text-red-600" />,
      title: "Continuous Monitoring",
      description: "We flag suspicious activities even after closing. Your protection remains active throughout the mortgage term.",
      color: "border-red-600/40 shadow-lg shadow-red-500/10",
      benefits: ["Real-time alerts", "Ongoing protection", "Automatic updates"]
    },
    {
      icon: <FileBarChart className="h-10 w-10 text-blue-600" />,
      title: "One-Click Audit Reports",
      description: "Generate comprehensive verification reports instantly when FSRA calls, proving your due diligence.",
      color: "border-blue-600/40 shadow-lg shadow-blue-500/10",
      benefits: ["FSRA compliant", "Detailed audit trails", "Instant report generation"]
    },
  ];

  return (
    <div className="h-full">
      <ScrollReveal>
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center lg:text-left">
          <span className="text-primary">Major Features</span>
        </h2>
      </ScrollReveal>
      
      <div className="space-y-6">
        {features.map((feature, index) => (
          <ScrollReveal key={index} delay={index * 150}>
            <Card className={`hover:translate-y-[-4px] transition-all duration-300 ${feature.color}`}>
              <div className="p-6">
                <div className="flex items-start">
                  <div className="p-3 rounded-full bg-background mr-4 w-16 h-16 flex-shrink-0 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-foreground/70 mb-4">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

export default MajorFeatures;
