import React from "react";
import ScrollReveal from "./ScrollReveal";
import Benefits from "./waitlist/Benefits";
import WaitlistSignupSection from "./waitlist/WaitlistSignupSection";
const WaitlistForm: React.FC = () => {
  return <section id="waitlist" className="section-padding bg-gradient-to-b from-secondary to-white relative">
      <div className="section-container">
        <ScrollReveal className="text-center mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            Limited Spots Available
          </span>
          
          
        </ScrollReveal>

        <div className="grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Benefits />
          <WaitlistSignupSection />
        </div>
      </div>
    </section>;
};
export default WaitlistForm;