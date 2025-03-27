
import React from "react";
import { Brain, Bell, FileCheck, RefreshCw, BarChart3 } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";

const Features: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-6 w-6 text-white" />,
      title: "AI That Reads Between the Lines",
      description: "We scan uploaded documents for signs of forgery, tampering, and data mismatches. Think: CRA notices, IDs, pay stubs, and more.",
      color: "from-primary to-primary/80",
    },
    {
      icon: <Bell className="h-6 w-6 text-white" />,
      title: "Real-Time Red Flag Alerts",
      description: "When something looks off, you know before it goes to the lender.",
      color: "from-destructive to-destructive/80",
    },
    {
      icon: <FileCheck className="h-6 w-6 text-white" />,
      title: "FSRA-Ready Checklists",
      description: "Built-in compliance steps so you don't miss disclosures or verification duties.",
      color: "from-primary/90 to-primary/70",
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-white" />,
      title: "Continuous Monitoring",
      description: "We flag new issues even after the deal closes. You stay protected — always.",
      color: "from-primary/80 to-primary/60",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-white" />,
      title: "Audit-Ready Reports in 1 Click",
      description: "No scrambling. No explaining. Just a clean file you can hand over.",
      color: "from-primary/70 to-primary/50",
    },
  ];

  return (
    <section id="features" className="section-padding bg-white relative">
      <div className="section-container">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            The Solution
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            What VerifyFlow Does For You
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Our platform is built specifically for Canadian mortgage brokers to detect fraud and protect your business.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal
              key={index}
              className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              delay={index * 150}
            >
              <div className="h-full flex flex-col">
                <div className={`p-5 bg-gradient-to-br ${feature.color}`}>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <div className="p-6 bg-white flex-grow border border-t-0 border-border/30 rounded-b-2xl">
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-16 bg-secondary rounded-2xl p-8 border border-border/30" delay={300}>
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-16 h-16 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center mb-6 md:mb-0 md:mr-6">
              <span className="text-primary text-xl">🇨🇦</span>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-semibold mb-3">Built for Canadian Brokers. Period.</h3>
              <ul className="text-foreground/70 space-y-2">
                <li className="flex items-center justify-center md:justify-start">
                  <span className="mr-2">•</span> No bloated CRM features.
                </li>
                <li className="flex items-center justify-center md:justify-start">
                  <span className="mr-2">•</span> No overseas "AI" gimmicks.
                </li>
                <li className="flex items-center justify-center md:justify-start">
                  <span className="mr-2">•</span> Just a fast, focused layer of protection between you and mortgage fraud.
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Features;
