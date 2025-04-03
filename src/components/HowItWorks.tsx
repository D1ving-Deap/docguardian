
import React from "react";
import { Shield, FileCheck, FileBarChart } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import MortgageDashboard from "./workflow/MortgageDashboard";
import ProcessFlow from "./workflow/ProcessFlow";

const HowItWorks: React.FC = () => {
  return <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <ProcessFlow />
        </ScrollReveal>

        {/* Adding extra margin/padding here to create more space */}
        <div className="mt-24"></div>

        <ScrollReveal>
          <div className="flex justify-center">
            <span className="inline-block py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 px-[11px] text-center">
              The Demo
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Protecting Your Business At <span className="text-primary">Every Step</span>
          </h2>
          <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Our comprehensive document verification platform helps you manage your mortgage application workflow securely and efficiently.
          </p>
        </ScrollReveal>

        {/* Mortgage Application Dashboard */}
        <ScrollReveal delay={200}>
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 mb-16 overflow-hidden">
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-center">
              Mortgage Application Management Dashboard
            </h3>
            <MortgageDashboard />
          </div>
        </ScrollReveal>

        {/* Process Steps */}
        <ScrollReveal delay={300}>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Document Upload</h3>
              <p className="text-gray-600">
                Documents are securely uploaded to our cloud platform with end-to-end encryption and access controls to protect sensitive information.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FileCheck className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Intelligent Verification</h3>
              <p className="text-gray-600">
                Our AI-powered verification engine analyzes document metadata, content, and formatting to detect inconsistencies and potential fraud.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileBarChart className="text-purple-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Comprehensive Reporting</h3>
              <p className="text-gray-600">
                Generate detailed audit reports instantly, showing verification results, detected issues, and document history for compliance purposes.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>;
};
export default HowItWorks;
