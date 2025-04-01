
import React from "react";
import { Upload, Sparkles, AlertTriangle, FileWarning, FileCheck, CheckCircle, Users, BarChart3, Folder, Flag } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";
import { Button } from "@/components/ui/button";
import MetadataDetection from "./MetadataDetection";

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
        
        {/* Add the new Metadata Detection component */}
        <ScrollReveal className="mt-20">
          <div className="text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              Advanced Features
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Document <span className="text-primary">Metadata</span> Verification
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Detect fraudulent documents by analyzing metadata for suspicious patterns and inconsistencies.
            </p>
          </div>
          
          <MetadataDetection />
        </ScrollReveal>
        
        {/* Broker Dashboard Preview */}
        <ScrollReveal className="mt-16" delay={200}>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/30 p-6">
            <h3 className="text-2xl font-bold mb-6 text-center">
              <span className="text-primary">Mortgage Broker</span> Dashboard
            </h3>
            
            <div className="overflow-hidden">
              {/* Dashboard Header */}
              <div className="bg-gray-50 p-4 rounded-t-lg border border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Client Overview</h4>
                      <p className="text-sm text-foreground/60">21 active applications</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Filter</Button>
                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90">New Client</Button>
                  </div>
                </div>
              </div>
              
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white border-x border-border/30">
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Verified Applications</h5>
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold mt-2">12</p>
                  <div className="text-xs text-green-700 mt-1 flex items-center gap-1">
                    <span>↑ 4 in the last week</span>
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Pending Review</h5>
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Flag className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold mt-2">7</p>
                  <div className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                    <span>3 with warnings</span>
                  </div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">Critical Issues</h5>
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold mt-2">2</p>
                  <div className="text-xs text-red-700 mt-1 flex items-center gap-1">
                    <span>Requires immediate action</span>
                  </div>
                </div>
              </div>
              
              {/* Client List */}
              <div className="bg-white p-4 border-x border-b border-border/30 rounded-b-lg">
                <h5 className="font-medium mb-3">Recent Client Activity</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white border border-border/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="font-medium text-gray-600">JD</span>
                      </div>
                      <div>
                        <h6 className="font-medium">John Doe</h6>
                        <p className="text-xs text-foreground/60">Updated 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Verified</div>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white border border-border/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="font-medium text-gray-600">JS</span>
                      </div>
                      <div>
                        <h6 className="font-medium">Jane Smith</h6>
                        <p className="text-xs text-foreground/60">Updated 5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">Review Needed</div>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white border border-border/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="font-medium text-gray-600">RJ</span>
                      </div>
                      <div>
                        <h6 className="font-medium">Robert Johnson</h6>
                        <p className="text-xs text-foreground/60">Updated 1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Issue Detected</div>
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
        
        <ScrollReveal className="mt-16 text-center" delay={200}>
          <AnimatedText
            text="Stop Fraud Before It Reaches Lenders"
            className="text-2xl font-bold mb-6"
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
