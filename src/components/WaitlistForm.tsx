
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
          <span className="inline-block py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 px-[11px] text-center">
            Limited Spots Available
          </span>
        </ScrollReveal>

        <MajorFeatures />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
          <Benefits />
          <WaitlistSignupSection />
        </div>
      </div>
    </section>
  );
};

export default WaitlistForm;
