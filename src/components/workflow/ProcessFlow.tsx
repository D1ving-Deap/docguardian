
import React from "react";
import { Upload, Sparkles, AlertTriangle, FileCheck, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="space-y-16">
          {/* Upload Documents */}
          <div className="relative">
            <h3 className="text-xl md:text-2xl font-bold mb-3">Upload Documents</h3>
            <p className="text-gray-600">
              Drag-and-drop client documents directly into VerifyFlow or 
              connect your existing document management system.
            </p>
            <div className="mt-4">
              <div className="flex items-center">
                <Sparkles className="text-primary w-5 h-5 mr-2" />
                <span className="text-sm font-medium">AI Processing</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: "75%" }}
                />
              </div>
              <div className="text-right text-sm text-gray-500 mt-1">75%</div>
            </div>
          </div>

          {/* Get Red Flag Alerts */}
          <div className="relative">
            <h3 className="text-xl md:text-2xl font-bold mb-3">Get Red Flag Alerts</h3>
            <p className="text-gray-600">
              Receive instant notifications about suspicious documents with
              specific details about the issues found.
            </p>
          </div>

          {/* Verification Complete */}
          <div className="relative">
            <h3 className="text-xl md:text-2xl font-bold mb-3 flex items-center">
              <FileCheck className="w-6 h-6 text-green-500 mr-2" />
              Verification Complete
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span>
                <span>6 documents verified</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></span>
                <span>2 warnings addressed</span>
              </li>
              <li className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span>
                <span>1 red flag resolved</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative">
          <div className="flex flex-col items-center">
            {/* Flow Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-100"></div>

            {/* Step 1: Upload */}
            <div className="relative z-10 mb-24">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border-2 border-blue-100">
                <Upload className="text-primary w-8 h-8" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-5 w-64 ml-6">
                <h4 className="font-bold mb-2">Document Upload</h4>
                <div className="w-full h-3 bg-gray-200 rounded-full mb-1.5"></div>
                <div className="w-3/4 h-3 bg-gray-200 rounded-full"></div>
              </div>
            </div>

            {/* Arrow Down 1 */}
            <div className="relative z-10 -mt-16 mb-8">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100 animate-bounce">
                <ChevronDown className="text-primary w-6 h-6" />
              </div>
            </div>

            {/* Step 2: Analysis */}
            <div className="relative z-10 mb-24">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border-2 border-blue-100">
                <Sparkles className="text-primary w-8 h-8" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-5 w-64 ml-6">
                <h4 className="font-bold mb-2">AI Analysis</h4>
                <p className="text-sm text-gray-600">
                  Our AI scans for inconsistencies, forgery signs, and cross-
                  references data points to spot fraud patterns.
                </p>
              </div>
            </div>

            {/* Arrow Down 2 */}
            <div className="relative z-10 -mt-16 mb-8">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100 animate-bounce">
                <ChevronDown className="text-primary w-6 h-6" />
              </div>
            </div>

            {/* Step 3: Alert */}
            <div className="relative z-10 mb-24">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border-2 border-blue-100">
                <AlertTriangle className="text-yellow-500 w-8 h-8" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-5 w-64 ml-6">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="text-red-500 w-4 h-4 mr-2" />
                  <h4 className="font-bold text-red-500">Red Flag Alert</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Notice of Assessment (2023)
                </p>
                <div className="flex justify-between text-sm mb-1">
                  <span>Income declared:</span>
                  <span className="font-medium text-red-500">$126,500</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Previous year:</span>
                  <span className="font-medium">$68,200</span>
                </div>
              </div>
            </div>

            {/* Arrow Down 3 */}
            <div className="relative z-10 -mt-16 mb-8">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-100 animate-bounce">
                <ChevronDown className="text-primary w-6 h-6" />
              </div>
            </div>

            {/* Step 4: Report */}
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 border-2 border-blue-100">
                <FileCheck className="text-green-500 w-8 h-8" />
              </div>
              <div className="bg-white rounded-lg shadow-md p-5 w-64 ml-6">
                <h4 className="font-bold mb-2">Generate Compliance Report</h4>
                <p className="text-sm text-gray-600">
                  Create one-click verification reports showing your due diligence
                  for FSRA compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessFlow;
