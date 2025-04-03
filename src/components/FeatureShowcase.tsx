
import React from "react";
import { Check, Flag, Info, ListCheck, Users, BarChart3, Folder, Cloud } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FeatureShowcase: React.FC = () => {
  return (
    <section className="py-16 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-white to-secondary/10">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            Management Platform
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Protecting Your Business At Every Step
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            Track brokers, monitor document processes, and detect fraud with our comprehensive management platform.
          </p>
        </ScrollReveal>

        <div className="mt-16">
          {/* Management Dashboard Visualization */}
          <ScrollReveal animation="fade-in-up">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-border/20 mb-20">
              <div className="p-6 md:p-8 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Management Dashboard</h3>
                </div>
                <p className="text-foreground/70 mb-6">
                  Get a comprehensive view of all broker activities, document statuses, and fraud alerts from one central location.
                </p>
                
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="overview">Dashboard</TabsTrigger>
                    <TabsTrigger value="brokers">Broker Tracking</TabsTrigger>
                    <TabsTrigger value="documents">Document Processing</TabsTrigger>
                    <TabsTrigger value="alerts">Fraud Alerts</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="pt-2">
                    <div className="bg-secondary/20 p-6 rounded-lg border border-border/10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-sm">Active Brokers</h4>
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-2xl font-bold">24</p>
                          <p className="text-xs text-green-600">+3 this month</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-sm">Documents Processed</h4>
                            <Folder className="h-4 w-4 text-primary" />
                          </div>
                          <p className="text-2xl font-bold">187</p>
                          <p className="text-xs text-green-600">+42 this week</p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-sm">Fraud Alerts</h4>
                            <Flag className="h-4 w-4 text-red-500" />
                          </div>
                          <p className="text-2xl font-bold">7</p>
                          <p className="text-xs text-amber-600">Needs review</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                        <h4 className="font-medium mb-3">Processing Timeline</h4>
                        <div className="h-[180px] w-full relative">
                          {/* Line chart visualization */}
                          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gray-200"></div>
                          <div className="absolute left-0 bottom-0 top-0 w-[1px] bg-gray-200"></div>
                          
                          {/* Chart lines */}
                          <svg className="w-full h-full" viewBox="0 0 300 150" preserveAspectRatio="none">
                            <path 
                              d="M0,120 C20,100 40,110 60,90 C80,70 100,80 120,60 C140,80 160,30 180,50 C200,70 220,40 240,30 C260,20 280,40 300,30" 
                              fill="none" 
                              stroke="#3b82f6" 
                              strokeWidth="2"
                            />
                            <path 
                              d="M0,130 C20,120 40,125 60,115 C80,105 100,110 120,100 C140,110 160,90 180,95 C200,100 220,85 240,80 C260,75 280,85 300,80" 
                              fill="none" 
                              stroke="#10b981" 
                              strokeWidth="2"
                            />
                          </svg>
                          
                          {/* Legend */}
                          <div className="absolute top-0 right-0 flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-xs">Documents</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-xs">Approvals</span>
                            </div>
                          </div>
                          
                          {/* X-axis labels */}
                          <div className="absolute bottom-[-20px] left-0 right-0 flex justify-between">
                            <span className="text-xs">Jan</span>
                            <span className="text-xs">Mar</span>
                            <span className="text-xs">May</span>
                            <span className="text-xs">Jul</span>
                            <span className="text-xs">Sep</span>
                            <span className="text-xs">Nov</span>
                          </div>
                        </div>
                      </div>
                    
                      <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors">
                        View Full Analytics
                      </button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="brokers" className="pt-2">
                    <div className="bg-secondary/20 p-6 rounded-lg border border-border/10">
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">Sarah Johnson</h4>
                              <p className="text-xs text-foreground/60">Premium Broker</p>
                            </div>
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                              Active
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-xs text-foreground/60">Clients</p>
                              <p className="font-medium">16</p>
                            </div>
                            <div>
                              <p className="text-xs text-foreground/60">Processing</p>
                              <p className="font-medium">4</p>
                            </div>
                            <div>
                              <p className="text-xs text-foreground/60">Completed</p>
                              <p className="font-medium">12</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-foreground/60 mb-1">Completion Rate</p>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{width: '75%'}}></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">Michael Rodriguez</h4>
                              <p className="text-xs text-foreground/60">Standard Broker</p>
                            </div>
                            <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs">
                              Attention
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-xs text-foreground/60">Clients</p>
                              <p className="font-medium">8</p>
                            </div>
                            <div>
                              <p className="text-xs text-foreground/60">Processing</p>
                              <p className="font-medium">5</p>
                            </div>
                            <div>
                              <p className="text-xs text-foreground/60">Completed</p>
                              <p className="font-medium">3</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-foreground/60 mb-1">Completion Rate</p>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{width: '38%'}}></div>
                            </div>
                          </div>
                        </div>
                        
                        <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors">
                          View All Brokers
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documents" className="pt-2">
                    <div className="bg-secondary/20 p-6 rounded-lg border border-border/10">
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">Income Verification</h4>
                              <p className="text-xs text-foreground/60">Client ID: #4872</p>
                            </div>
                            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                              Processing
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mb-1">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <p className="text-xs text-center">Upload</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mb-1">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <p className="text-xs text-center">Scan</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mb-1">
                                <div className="h-2 w-2 rounded-full bg-white"></div>
                              </div>
                              <p className="text-xs text-center">Verify</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mb-1">
                                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                              </div>
                              <p className="text-xs text-center">Approve</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">Bank Statements</h4>
                              <p className="text-xs text-foreground/60">Client ID: #4865</p>
                            </div>
                            <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                              Issue Detected
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mb-1">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <p className="text-xs text-center">Upload</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mb-1">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <p className="text-xs text-center">Scan</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center mb-1">
                                <Flag className="h-3 w-3 text-white" />
                              </div>
                              <p className="text-xs text-center">Verify</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mb-1">
                                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                              </div>
                              <p className="text-xs text-center">Approve</p>
                            </div>
                          </div>
                          <div className="mt-3 p-2 bg-red-50 rounded border border-red-100 text-xs text-red-700">
                            Possible manipulation detected in transaction history. Manual review required.
                          </div>
                        </div>
                        
                        <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors">
                          View All Documents
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="alerts" className="pt-2">
                    <div className="bg-secondary/20 p-6 rounded-lg border border-border/10">
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                          <div className="flex items-start gap-3">
                            <Flag className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium">High Priority: Document Tampering</h4>
                              <p className="text-xs text-foreground/60 mb-2">Client ID: #4853 • Detected 1 hour ago</p>
                              <p className="text-sm">Evidence of digital manipulation found in employment verification letter. Income appears to be altered.</p>
                              <div className="mt-3 flex gap-2">
                                <button className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">
                                  Review Now
                                </button>
                                <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                  Mark as Reviewed
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-amber-500">
                          <div className="flex items-start gap-3">
                            <Flag className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium">Warning: Inconsistent Information</h4>
                              <p className="text-xs text-foreground/60 mb-2">Client ID: #4871 • Detected 3 hours ago</p>
                              <p className="text-sm">Discrepancy detected between reported income on tax return and employment verification.</p>
                              <div className="mt-3 flex gap-2">
                                <button className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                                  Review Now
                                </button>
                                <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                  Mark as Reviewed
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                          <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="font-medium">Note: Document Expiration</h4>
                              <p className="text-xs text-foreground/60 mb-2">Client ID: #4862 • Detected 1 day ago</p>
                              <p className="text-sm">Client's identification document will expire in 30 days. Renewal reminder sent.</p>
                              <div className="mt-3 flex gap-2">
                                <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                  Set Follow-up
                                </button>
                                <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors">
                          View All Alerts
                        </button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ScrollReveal>
          
          {/* Cloud Access and Storage */}
          <ScrollReveal animation="fade-in-up" className="mb-20">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-border/20">
              <div className="p-6 md:p-8 pb-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Cloud className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Secure Document Cloud Access</h3>
                </div>
                <p className="text-foreground/70 mb-6">
                  Access all client documents securely from anywhere with role-based permissions and complete audit trails.
                </p>
              </div>
              
              <div className="relative bg-secondary/20 p-6 md:p-8 mt-6 overflow-hidden">
                <div className="bg-white rounded-lg shadow-sm border border-border/20 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">Document Repository</h4>
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      256-bit Encrypted
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-primary" />
                        <span className="text-sm">Client Applications</span>
                      </div>
                      <span className="text-xs text-foreground/60">24 files</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-primary" />
                        <span className="text-sm">Income Verifications</span>
                      </div>
                      <span className="text-xs text-foreground/60">43 files</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-primary" />
                        <span className="text-sm">Bank Statements</span>
                      </div>
                      <span className="text-xs text-foreground/60">78 files</span>
                    </div>
                  </div>
                  
                  <div className="mt-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium">Storage usage</span>
                      <span className="text-xs text-foreground/60">5.2 GB of 10 GB</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{width: '52%'}}></div>
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
                    <h4 className="font-medium mt-2 mb-2">Broker Dashboard</h4>
                    <p className="text-sm text-foreground/70">
                      Monitor broker activity and document processing status from a central dashboard.
                    </p>
                  </div>
                  
                  <div className="flex-1 bg-white rounded-lg shadow-sm border border-border/20 p-5 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      2
                    </div>
                    <h4 className="font-medium mt-2 mb-2">AI Document Verification</h4>
                    <p className="text-sm text-foreground/70">
                      Automated scanning for fraud patterns, inconsistencies and compliance issues.
                    </p>
                  </div>
                  
                  <div className="flex-1 bg-white rounded-lg shadow-sm border border-border/20 p-5 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      3
                    </div>
                    <h4 className="font-medium mt-2 mb-2">Compliance Reporting</h4>
                    <p className="text-sm text-foreground/70">
                      Generate detailed compliance reports showing due diligence for FSRA requirements.
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
