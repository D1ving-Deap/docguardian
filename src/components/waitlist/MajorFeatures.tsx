
import React from "react";
import { FileBarChart, RefreshCw, Brain } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const MajorFeatures: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-10 w-10 text-primary" />,
      title: "AI-Powered Cross-Referencing",
      description: "Our system automatically checks documents for inconsistencies, forgeries, and tampering in minutes, not hours.",
      color: "border-primary/30 shadow-md shadow-primary/10",
    },
    {
      icon: <RefreshCw className="h-10 w-10 text-red-600" />,
      title: "Continuous Monitoring",
      description: "We flag suspicious activities even after closing. Your protection remains active throughout the mortgage term.",
      color: "border-red-600/30 shadow-md shadow-red-500/10",
    },
    {
      icon: <FileBarChart className="h-10 w-10 text-blue-600" />,
      title: "One-Click Audit Reports",
      description: "Generate comprehensive verification reports instantly when FSRA calls, proving your due diligence.",
      color: "border-blue-600/30 shadow-md shadow-blue-500/10",
    },
  ];

  return (
    <div className="mb-12">
      <ScrollReveal>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Three <span className="text-primary">Major Features</span> That Make Us Different
        </h2>
      </ScrollReveal>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {features.map((feature, index) => (
          <ScrollReveal key={index} delay={index * 150}>
            <Card className={`h-full hover:translate-y-[-4px] transition-all duration-300 ${feature.color}`}>
              <CardHeader className="flex flex-col items-center text-center pb-2">
                <div className="p-2 rounded-full bg-background mb-4 w-16 h-16 flex items-center justify-center">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-foreground/70 text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

export default MajorFeatures;
