
import React from "react";
import { FileBarChart, RefreshCw, Brain } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const MajorFeatures: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "AI-Powered Cross-Referencing",
      description: "Our system automatically checks documents for inconsistencies, forgeries, and tampering in minutes, not hours.",
      color: "border-primary/30 shadow-md shadow-primary/10",
    },
    {
      icon: <RefreshCw className="h-8 w-8 text-red-600" />,
      title: "Continuous Monitoring",
      description: "We flag suspicious activities even after closing. Your protection remains active throughout the mortgage term.",
      color: "border-red-600/30 shadow-md shadow-red-500/10",
    },
    {
      icon: <FileBarChart className="h-8 w-8 text-blue-600" />,
      title: "One-Click Audit Reports",
      description: "Generate comprehensive verification reports instantly when FSRA calls, proving your due diligence.",
      color: "border-blue-600/30 shadow-md shadow-blue-500/10",
    },
  ];

  return (
    <div>
      <ScrollReveal>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center lg:text-left">
          <span className="text-primary">Major Features</span>
        </h2>
      </ScrollReveal>
      
      <div className="space-y-4">
        {features.map((feature, index) => (
          <ScrollReveal key={index} delay={index * 150}>
            <Card className={`hover:translate-y-[-4px] transition-all duration-300 ${feature.color}`}>
              <div className="flex items-start p-4">
                <div className="p-2 rounded-full bg-background mr-4 w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <CardTitle className="text-lg mb-1">{feature.title}</CardTitle>
                  <CardDescription className="text-foreground/70 text-sm">
                    {feature.description}
                  </CardDescription>
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
