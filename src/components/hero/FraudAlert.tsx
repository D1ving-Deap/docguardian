
import React from "react";
import { Flag, FileText, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "../ScrollReveal";

const FraudAlert: React.FC = () => {
  return (
    <ScrollReveal
      className="w-full"
      delay={800}
      animation="fade-in-right"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-border/30">
        <div className="bg-red-50 p-4 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Flag className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700">Mortgage Fraud Alert</h3>
              <p className="text-sm text-red-600">Common red flags that could put your license at risk</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <h4 className="text-md font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-red-600" />
                <span>Document Tampering</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-red-600 font-bold">!</span>
                  </div>
                  <span className="text-sm text-foreground/80">Inconsistent fonts or formatting</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-red-600 font-bold">!</span>
                  </div>
                  <span className="text-sm text-foreground/80">Pixelated text or uneven alignment</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-red-600 font-bold">!</span>
                  </div>
                  <span className="text-sm text-foreground/80">Missing security features</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-red-600 font-bold">!</span>
                  </div>
                  <span className="text-sm text-foreground/80">Digital editing artifacts</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <h4 className="text-md font-semibold flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Income Verification Issues</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white rounded border border-amber-100">
                  <span className="text-sm">NOA Income:</span>
                  <span className="text-sm font-medium">$85,000</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded border border-amber-100">
                  <span className="text-sm">Pay Stub YTD:</span>
                  <span className="text-sm font-medium text-amber-700 relative">
                    $68,000
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-amber-500"></span>
                  </span>
                </div>
                <div className="text-xs text-amber-700 italic mt-1">
                  * 20% difference detected (high risk)
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">VerifyFlow protects you from these risks</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="text-primary border-primary/30 hover:bg-primary/5"
                onClick={() => {
                  const featuresSection = document.getElementById("features");
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default FraudAlert;
