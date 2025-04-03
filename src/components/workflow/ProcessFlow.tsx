
import React from "react";
import { Upload, Sparkles, AlertTriangle, FileCheck, ChevronDown, ArrowDownCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ProcessFlow: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-16 text-center">
        <span className="inline-block py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 px-[11px] text-center">
          The Process
        </span>
        
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          How <span className="text-primary">VerifyFlow</span> Works
        </h2>
        
        <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Our AI-powered workflow seamlessly integrates with your existing process, making
          fraud detection effortless.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-16">
        {/* Step 1: Upload Documents */}
        <div className="relative">
          <Card className="overflow-visible">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-start">
                <div className="md:w-1/4 bg-blue-50 p-6 flex flex-col items-center justify-center rounded-tl-lg rounded-bl-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="text-primary w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-center">1. Upload Documents</h3>
                </div>
                
                <div className="p-6 md:w-3/4">
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
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Arrow Down */}
          <div className="flex justify-center my-4">
            <ArrowDownCircle className="text-primary animate-bounce w-10 h-10" />
          </div>
        </div>
        
        {/* Step 2: AI Analysis */}
        <div className="relative">
          <Card className="overflow-visible">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-start">
                <div className="md:w-1/4 bg-blue-50 p-6 flex flex-col items-center justify-center rounded-tl-lg rounded-bl-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="text-primary w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-center">2. AI Analysis</h3>
                </div>
                
                <div className="p-6 md:w-3/4">
                  <p className="text-gray-700 mb-6">
                    The system checks for inconsistencies, signs of forgery, and cross-references data.
                  </p>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <AlertTriangle className="text-red-500 w-5 h-5 mr-2" />
                      <h4 className="font-bold text-red-500">Example: Red Flag Alert</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Notice of Assessment (2023)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white p-3 rounded-md shadow-sm">
                          <p className="text-xs text-gray-500">Current Income</p>
                          <p className="font-bold text-red-500">$126,500</p>
                        </div>
                        <div className="bg-white p-3 rounded-md shadow-sm">
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
          
          {/* Arrow Down */}
          <div className="flex justify-center my-4">
            <ArrowDownCircle className="text-primary animate-bounce w-10 h-10" />
          </div>
        </div>
        
        {/* Step 3: Get Red Flag Alerts */}
        <div className="relative">
          <Card className="overflow-visible">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-start">
                <div className="md:w-1/4 bg-blue-50 p-6 flex flex-col items-center justify-center rounded-tl-lg rounded-bl-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="text-yellow-500 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-center">3. Get Red Flag Alerts</h3>
                </div>
                
                <div className="p-6 md:w-3/4">
                  <p className="text-gray-700 mb-6">
                    Instant notifications are sent for any suspicious documents.
                  </p>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold">Document Verification Status</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center bg-green-50 p-3 rounded-md">
                        <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                        <span className="font-medium">6 documents verified</span>
                      </li>
                      <li className="flex items-center bg-yellow-50 p-3 rounded-md">
                        <span className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></span>
                        <span className="font-medium">2 warnings addressed</span>
                      </li>
                      <li className="flex items-center bg-red-50 p-3 rounded-md">
                        <span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span>
                        <span className="font-medium">1 red flag resolved</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Arrow Down */}
          <div className="flex justify-center my-4">
            <ArrowDownCircle className="text-primary animate-bounce w-10 h-10" />
          </div>
        </div>
        
        {/* Step 4: Generate Compliance Report */}
        <div className="relative">
          <Card className="overflow-visible">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-start">
                <div className="md:w-1/4 bg-blue-50 p-6 flex flex-col items-center justify-center rounded-tl-lg rounded-bl-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FileCheck className="text-green-600 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-center">4. Generate Compliance Report</h3>
                </div>
                
                <div className="p-6 md:w-3/4">
                  <p className="text-gray-700">
                    A one-click report generator helps firms show FSRA compliance, proving due diligence.
                  </p>
                  
                  <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center">
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
    </div>
  );
};

export default ProcessFlow;
