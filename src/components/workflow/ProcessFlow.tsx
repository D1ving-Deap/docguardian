
import React from "react";
import { Upload, Sparkles, AlertTriangle, FileCheck, ChevronRight, CloudCog, Shield, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const ProcessFlow: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-10 text-center">
        <span className="inline-block py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 px-[11px] text-center">
          The Process
        </span>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          How <span className="text-primary">VerifyFlow</span> Works
        </h2>
        
        <p className="text-lg text-center text-gray-600 mb-8 max-w-3xl mx-auto">
          Our AI-powered workflow seamlessly integrates with your existing process, making
          fraud detection effortless.
        </p>
      </div>

      {/* Step 1 (Left) to Step 2 (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 mb-10">
        {/* Step 1: Upload Documents */}
        <Card className="md:col-span-5 overflow-visible">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-start">
              <div className="w-full md:w-1/4 bg-blue-50 p-6 flex flex-col items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Upload className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center">1. Upload Documents</h3>
              </div>
              
              <div className="p-6 w-full md:w-3/4">
                <p className="text-gray-700 mb-6">
                  Users can drag-and-drop documents into VerifyFlow or connect their current document system.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Sparkles className="text-primary w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">AI Processing</span>
                    </div>
                    <span className="text-sm text-gray-500">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  {/* AI Processing Features */}
                  <div className="grid grid-cols-3 gap-2 pt-4">
                    <div className="flex flex-col items-center text-center p-2 border border-gray-100 rounded-lg bg-gray-50">
                      <FileSearch className="h-5 w-5 text-blue-600 mb-1" />
                      <span className="text-xs font-medium">Document Reading</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 border border-gray-100 rounded-lg bg-gray-50">
                      <CloudCog className="h-5 w-5 text-blue-600 mb-1" />
                      <span className="text-xs font-medium">Amazon Cloud</span>
                    </div>
                    <div className="flex flex-col items-center text-center p-2 border border-gray-100 rounded-lg bg-gray-50">
                      <Shield className="h-5 w-5 text-blue-600 mb-1" />
                      <span className="text-xs font-medium">Cybersecurity</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Arrow from Step 1 to Step 2 */}
        <div className="hidden md:flex md:col-span-1 items-center justify-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
            <ChevronRight className="text-primary w-6 h-6" />
          </div>
        </div>
        
        {/* Step 2: AI Analysis */}
        <Card className="md:col-span-5 overflow-visible">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-start">
              <div className="w-full md:w-1/4 bg-blue-50 p-6 flex flex-col items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Sparkles className="text-primary w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center">2. AI Analysis</h3>
              </div>
              
              <div className="p-6 w-full md:w-3/4">
                <p className="text-gray-700 mb-4">
                  The system checks for inconsistencies, signs of forgery, and cross-references data.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="text-red-500 w-5 h-5 mr-2" />
                    <h4 className="font-bold text-red-500 text-sm">Red Flag Alert</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Notice of Assessment (2023)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <p className="text-xs text-gray-500">Current Income</p>
                        <p className="font-bold text-red-500">$126,500</p>
                      </div>
                      <div className="bg-white p-2 rounded-md shadow-sm">
                        <p className="text-xs text-gray-500">Previous Year</p>
                        <p className="font-medium">$68,200</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step 2 (Right) to Step 3 (Left) */}
      <div className="flex justify-end md:hidden my-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <ChevronRight className="rotate-90 text-primary w-6 h-6" />
        </div>
      </div>

      {/* Step 3 (Left) to Step 4 (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4">
        {/* Step 3: Get Red Flag Alerts */}
        <Card className="md:col-span-5 overflow-visible">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-start">
              <div className="w-full md:w-1/4 bg-blue-50 p-6 flex flex-col items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <AlertTriangle className="text-yellow-500 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center">3. Get Red Flag Alerts</h3>
              </div>
              
              <div className="p-6 w-full md:w-3/4">
                <p className="text-gray-700 mb-4">
                  Instant notifications are sent for any suspicious documents.
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Document Verification Status</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center bg-green-50 p-2 rounded-md">
                      <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                      <span className="font-medium text-sm">6 documents verified</span>
                    </li>
                    <li className="flex items-center bg-yellow-50 p-2 rounded-md">
                      <span className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></span>
                      <span className="font-medium text-sm">2 warnings addressed</span>
                    </li>
                    <li className="flex items-center bg-red-50 p-2 rounded-md">
                      <span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span>
                      <span className="font-medium text-sm">1 red flag resolved</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Arrow from Step 3 to Step 4 */}
        <div className="hidden md:flex md:col-span-1 items-center justify-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
            <ChevronRight className="text-primary w-6 h-6" />
          </div>
        </div>
        
        {/* Step 4: Generate Compliance Report */}
        <Card className="md:col-span-5 overflow-visible">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-start">
              <div className="w-full md:w-1/4 bg-blue-50 p-6 flex flex-col items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <FileCheck className="text-green-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-center">4. Generate Compliance Report</h3>
              </div>
              
              <div className="p-6 w-full md:w-3/4">
                <p className="text-gray-700 mb-4">
                  A one-click report generator helps firms show FSRA compliance, proving due diligence.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center">
                  <FileCheck className="text-green-600 w-10 h-10 mr-3" />
                  <div>
                    <h4 className="font-bold mb-1">Compliance Report Ready</h4>
                    <p className="text-sm text-gray-600">All verification steps completed and documented for regulatory review</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessFlow;
