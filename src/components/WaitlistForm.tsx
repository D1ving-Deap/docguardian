
import React from "react";
import ScrollReveal from "./ScrollReveal";
import Benefits from "./waitlist/Benefits";
import WaitlistSignupSection from "./waitlist/WaitlistSignupSection";
import MajorFeatures from "./waitlist/MajorFeatures";
import { Clock } from "lucide-react";

const WaitlistForm: React.FC = () => {
  return (
    <section id="waitlist" className="section-padding bg-gradient-to-b from-secondary/80 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
      
      <div className="section-container relative z-10">
        <ScrollReveal className="text-center mb-10">
          <div className="bg-primary/10 py-3 px-6 rounded-xl inline-flex items-center justify-center gap-2 mb-6">
            <Clock className="text-primary h-5 w-5 animate-pulse" />
            <span className="font-semibold text-primary text-lg">Limited Spots Available</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            Join Our <span className="text-primary">Exclusive Waitlist</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Be among the first to experience our cutting-edge mortgage verification platform and shape the future of fraud detection.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          <div className="lg:col-span-6">
            <MajorFeatures />
          </div>
          
          <div className="lg:col-span-6 flex items-center">
            <div className="w-full bg-white rounded-2xl shadow-lg border border-border/30 overflow-hidden">
              <div className="bg-primary/5 p-8 border-b border-border/30">
                <h3 className="text-4xl lg:text-5xl font-bold text-center mb-3">
                  Secure Your Early Access
                </h3>
                <p className="text-center text-muted-foreground text-lg">
                  Only <span className="text-[#1EAEDB] font-bold text-4xl">50</span> spots remaining for our beta program
                </p>
              </div>
              <div className="p-6">
                <WaitlistSignupSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
