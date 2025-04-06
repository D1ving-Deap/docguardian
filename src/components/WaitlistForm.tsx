
import React from "react";
import ScrollReveal from "./ScrollReveal";
import Benefits from "./waitlist/Benefits";
import WaitlistSignupSection from "./waitlist/WaitlistSignupSection";
import MajorFeatures from "./waitlist/MajorFeatures";

const WaitlistForm: React.FC = () => {
  return (
    <section id="waitlist" className="section-padding bg-gradient-to-b from-secondary to-white relative">
      <div className="section-container">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block py-2 px-4 rounded-full bg-primary/10 text-primary font-medium text-base mb-6 text-center">
            Limited Spots Available
          </span>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <MajorFeatures />
          </div>
          
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <Benefits />
              <WaitlistSignupSection />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
