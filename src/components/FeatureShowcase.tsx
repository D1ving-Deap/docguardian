
import React from "react";
import { Check, Clock, Shield, FileText, BarChart } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";

const FeatureShowcase: React.FC = () => {
  return <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="flex justify-center">
            <span className="inline-block py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 px-[11px] text-center">
              Features
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Simplify Your <span className="text-primary">Mortgage Workflow</span>
          </h2>
          <p className="text-lg text-center text-gray-600 mb-12 max-w-3xl mx-auto">
            Our comprehensive platform helps mortgage brokers save time and prevent fraud with powerful AI-driven tools.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <ScrollReveal delay={100}>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Time-Saving Automation</h3>
              <p className="text-gray-600">
                Automate repetitive tasks in your mortgage processing workflow, reducing processing time by up to 60%.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-green-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fraud Prevention</h3>
              <p className="text-gray-600">
                Advanced AI algorithms detect document tampering, inconsistencies, and other red flags that could indicate fraud.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-purple-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">FSRA Compliance</h3>
              <p className="text-gray-600">
                Stay compliant with Financial Services Regulatory Authority requirements with our automated compliance checks.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <BarChart className="text-orange-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Performance Analytics</h3>
              <p className="text-gray-600">
                Track key metrics for your mortgage brokerage, identifying bottlenecks and opportunities for process improvement.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={500}>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Check className="text-red-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Streamlined Approvals</h3>
              <p className="text-gray-600">
                Accelerate the approval process with automated document verification and status tracking for mortgage applications.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={600}>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-cyan-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Document Storage</h3>
              <p className="text-gray-600">
                Store sensitive mortgage documents with bank-level encryption and role-based access controls for your team.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>;
};

export default FeatureShowcase;
