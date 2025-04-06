
import React from "react";
import { ClipboardList, Bell, FileCheck, RefreshCw, FileBarChart, Shield, AlertTriangle, Eye } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";
import { Button } from "./ui/button";

const PainPoints: React.FC = () => {
  const painPoints = [
    {
      icon: <ClipboardList className="h-6 w-6 text-primary" />,
      title: "FSRA Compliance is Time-Consuming",
      description: "Hours spent manually cross-referencing documents while staying compliant with changing regulations.",
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      title: "Missing One Document Can Be Costly",
      description: "Regulatory fines, damaged reputation, and potential license suspension if fraud slips through.",
    },
    {
      icon: <Eye className="h-6 w-6 text-primary" />,
      title: "FSRA Can Audit You Anytime",
      description: "Even if you didn't commit the fraud, you need proof of due diligence when regulators call.",
    },
  ];

  const solutions = [
    {
      icon: <Bell className="h-6 w-6 text-white" />,
      title: "AI-Powered Cross-Referencing",
      description: "Our system automatically checks documents for inconsistencies, forgeries, and tampering in minutes, not hours.",
      color: "from-primary to-primary/80",
    },
    {
      icon: <RefreshCw className="h-6 w-6 text-white" />,
      title: "Continuous Monitoring",
      description: "We flag new issues even after closing. Your protection remains active throughout the mortgage term.",
      color: "from-primary/80 to-primary/60",
    },
    {
      icon: <FileBarChart className="h-6 w-6 text-white" />,
      title: "One-Click Audit Reports",
      description: "Generate comprehensive verification reports instantly when FSRA calls, proving your due diligence.",
      color: "from-primary/60 to-primary/40",
    },
  ];

  return (
    <section id="pain-points" className="section-padding relative bg-gradient-to-b from-white to-secondary/50">
      <div className="section-container">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            The Problem & Solution
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-primary">FSRA Compliance</span> Shouldn't Keep You Up At Night
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Mortgage brokers face intense regulatory scrutiny. Every document must be verified, every claim cross-referenced, and every check documented — or your license is at risk.
          </p>
        </ScrollReveal>

        <div className="mt-8 mb-16">
          <h3 className="text-2xl font-bold text-center mb-10">
            <AnimatedText text="The Real Challenges Brokers Face" />
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {painPoints.map((point, index) => (
              <ScrollReveal
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-border/30 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]"
                delay={index * 150}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {point.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{point.title}</h4>
                    <p className="text-foreground/70">{point.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal className="text-center mb-12" delay={200}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Your <span className="text-primary">Shield</span> Against FSRA Compliance Headaches
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-10">
            VerifyFlow is the only platform built specifically for Canadian mortgage brokers to automate compliance and protect your practice.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {solutions.map((solution, index) => (
            <ScrollReveal
              key={index}
              className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              delay={index * 150 + 300}
            >
              <div className="h-full flex flex-col">
                <div className={`p-5 bg-gradient-to-br ${solution.color}`}>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {solution.icon}
                  </div>
                </div>
                <div className="p-6 bg-white flex-grow border border-t-0 border-border/30 rounded-b-xl">
                  <h3 className="text-xl font-semibold mb-3">{solution.title}</h3>
                  <p className="text-foreground/70">{solution.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="flex justify-center" delay={600}>
          <Button 
            onClick={() => {
              const waitlistSection = document.getElementById("waitlist");
              if (waitlistSection) {
                waitlistSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Join the Waitlist
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default PainPoints;
