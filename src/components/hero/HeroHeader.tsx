
import React from "react";
import { ShieldCheck } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import AnimatedText from "../AnimatedText";

const HeroHeader: React.FC = () => {
  return (
    <>
      <ScrollReveal animation="fade-in-up">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 gap-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Protect Your License & Livelihood</span>
        </div>
      </ScrollReveal>
      
      <AnimatedText
        text="Don't Let Mortgage Fraud Put Your Business at Risk"
        tag="h1"
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 max-w-4xl tracking-tight text-balance"
        delay={300}
      />
      
      <AnimatedText
        text="VerifyFlow uses AI to detect forged documents, spot inconsistencies, and keep you FSRA-compliant."
        tag="p"
        className="text-xl text-foreground/80 max-w-2xl mb-8"
        delay={600}
      />
    </>
  );
};

export default HeroHeader;
