
import React from "react";
import { Check, Flag, Info, ListCheck } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";

const FeatureShowcase: React.FC = () => {
  return (
    <section className="py-16 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white to-secondary/10">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Protecting Your Business At Every Step
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            VerifyFlow simplifies document verification and fraud detection with a powerful yet intuitive interface.
          </p>
        </ScrollReveal>

        <div className="mt-16">
          {/* Document Analysis Visualization */}
          <ScrollReveal animation="fade-in-up" className="mb-20">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-border/20">
              <div className="p-6 md:p-8 pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ListCheck className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Document Analysis</h3>
                </div>
                <p className="text-foreground/70 mb-6">
                  Our AI automatically scans uploaded documents for signs of forgery, tampering, and inconsistencies.
                </p>
              </div>
              
              <div className="relative bg-secondary/20 p-6 md:p-8 mt-6 overflow-hidden">
                <div className="relative z-10 bg-white rounded-lg shadow-sm border border-border/20 p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium">Employment Verification</h4>
                      <p className="text-sm text-foreground/60">Uploaded 2 minutes ago</p>
                    </div>
                    <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                      Review Needed
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-2">
                      <Flag className="h-4 w-4 text-amber-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Suspicious employer phone number</p>
                        <p className="text-xs text-foreground/60">Number not associated with company domain</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Flag className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Document modification detected</p>
                        <p className="text-xs text-foreground/60">Possible alteration in income section</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Suggested action</p>
                        <p className="text-xs text-foreground/60">Request direct verification from employer HR department</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute right-4 bottom-0 opacity-10 w-40 h-40">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-primary">
                    <path d="M9 12L11 14L15 10M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Real-time Alerts Visualization */}
          <ScrollReveal animation="fade-in-up" className="mb-20">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-border/20">
              <div className="p-6 md:p-8 pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Flag className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Real-Time Red Flag Alerts</h3>
                </div>
                <p className="text-foreground/70 mb-6">
                  Get instant notifications when suspicious activities or documents are detected.
                </p>
              </div>
              
              <div className="relative bg-secondary/20 p-6 md:p-8 mt-6 overflow-hidden">
                <div className="flex flex-col gap-3">
                  <div className="bg-white rounded-lg shadow-sm border border-border/20 p-4 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium">High Priority Alert</h4>
                      <span className="text-xs text-foreground/60">10:45 AM</span>
                    </div>
                    <p className="text-sm text-foreground/80">
                      Possible identity discrepancy detected in client ID documents.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                        Review Now
                      </button>
                      <button className="text-xs bg-secondary px-3 py-1 rounded-full text-foreground/70">
                        Dismiss
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border border-border/20 p-4 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium">Warning</h4>
                      <span className="text-xs text-foreground/60">09:30 AM</span>
                    </div>
                    <p className="text-sm text-foreground/80">
                      Income statements show inconsistencies with previous declarations.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                        Review Now
                      </button>
                      <button className="text-xs bg-secondary px-3 py-1 rounded-full text-foreground/70">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Application Steps Visualization */}
          <ScrollReveal animation="fade-in-up">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-border/20">
              <div className="p-6 md:p-8 pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">FSRA-Ready Application Process</h3>
                </div>
                <p className="text-foreground/70 mb-6">
                  Streamlined verification steps ensure you meet all compliance requirements.
                </p>
              </div>
              
              <div className="relative bg-secondary/20 p-6 md:p-8 mt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 bg-white rounded-lg shadow-sm border border-border/20 p-5 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      1
                    </div>
                    <h4 className="font-medium mt-2 mb-2">Upload Documents</h4>
                    <p className="text-sm text-foreground/70">
                      Securely upload client documents through our encrypted platform.
                    </p>
                  </div>
                  
                  <div className="flex-1 bg-white rounded-lg shadow-sm border border-border/20 p-5 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      2
                    </div>
                    <h4 className="font-medium mt-2 mb-2">AI Verification</h4>
                    <p className="text-sm text-foreground/70">
                      Our AI scans for fraud patterns, inconsistencies and compliance issues.
                    </p>
                  </div>
                  
                  <div className="flex-1 bg-white rounded-lg shadow-sm border border-border/20 p-5 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      3
                    </div>
                    <h4 className="font-medium mt-2 mb-2">Review Findings</h4>
                    <p className="text-sm text-foreground/70">
                      Analyze issues and follow suggested actions to ensure compliance.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center mt-10">
                  <a
                    href="#waitlist"
                    className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    Join the Waitlist
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
