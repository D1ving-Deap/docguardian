
import React from "react";
import { Upload, Sparkles, AlertTriangle, FileWarning, FileCheck, CheckCircle } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Upload className="h-6 w-6 text-primary" />,
      title: "Upload Documents",
      description: "Drag-and-drop client documents directly into VerifyFlow or connect your existing document management system."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "AI Analysis",
      description: "Our AI scans for inconsistencies, forgery signs, and cross-references data points to spot fraud patterns."
    },
    {
      icon: <FileWarning className="h-6 w-6 text-amber-500" />,
      title: "Get Red Flag Alerts",
      description: "Receive instant notifications about suspicious documents with specific details about the issues found."
    },
    {
      icon: <FileCheck className="h-6 w-6 text-green-500" />,
      title: "Generate Compliance Report",
      description: "Create one-click verification reports showing your due diligence for FSRA compliance."
    }
  ];

  return (
    <section id="how-it-works" className="section-padding bg-gradient-to-b from-white to-secondary/30 relative">
      <div className="section-container">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            The Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            How <span className="text-primary">VerifyFlow</span> Works
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Our AI-powered workflow seamlessly integrates with your existing process, making fraud detection effortless.
          </p>
        </ScrollReveal>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block"></div>
          
          <div className="space-y-12 md:space-y-0 relative">
            {steps.map((step, index) => (
              <ScrollReveal 
                key={index}
                className={`md:flex items-center gap-8 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
                delay={index * 200}
              >
                <div className={`w-full md:w-1/2 mb-6 md:mb-0 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-foreground/70">{step.description}</p>
                </div>
                
                <div className="relative flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-primary/20 flex items-center justify-center z-10">
                    {step.icon}
                  </div>
                  <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary/20">{index + 1}</span>
                  </div>
                </div>
                
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                  {index === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-border/30">
                      <div className="flex items-center justify-between border-b border-border/20 pb-2 mb-2">
                        <span className="text-sm font-medium">Document Upload</span>
                        <Upload className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-100 rounded-full w-3/4"></div>
                        <div className="h-2 bg-gray-100 rounded-full w-1/2"></div>
                      </div>
                    </div>
                  )}
                  
                  {index === 1 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-border/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">AI Processing</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full w-3/4 animate-pulse"></div>
                        </div>
                        <div className="text-xs text-right text-foreground/60">75%</div>
                      </div>
                    </div>
                  )}
                  
                  {index === 2 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-red-100">
                      <div className="flex items-center gap-2 text-red-600 mb-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Red Flag Alert</span>
                      </div>
                      <p className="text-xs text-foreground/70 mb-2">Notice of Assessment (2023)</p>
                      <div className="bg-red-50 rounded p-2 text-xs text-red-700">
                        <div className="flex justify-between">
                          <span>Income declared:</span>
                          <span className="relative font-medium">
                            $126,500 
                            <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-red-500"></span>
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>Previous year:</span>
                          <span>$68,200</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {index === 3 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Verification Complete</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <span className="text-xs">6 documents verified</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        </div>
                        <span className="text-xs">2 warnings addressed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        </div>
                        <span className="text-xs">1 red flag resolved</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
        
        <ScrollReveal className="mt-16 text-center" delay={200}>
          <AnimatedText
            className="text-2xl font-bold mb-6"
            text={<>Stop Fraud <span className="text-primary">Before</span> It Reaches Lenders</>}
          />
          <Button 
            onClick={() => {
              const waitlistSection = document.getElementById("waitlist");
              if (waitlistSection) {
                waitlistSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
          >
            Join Waitlist
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default HowItWorks;
