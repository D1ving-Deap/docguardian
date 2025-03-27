
import React from "react";
import { ClipboardList, Search, BookOpen, Briefcase } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import AnimatedText from "./AnimatedText";

const PainPoints: React.FC = () => {
  const painPoints = [
    {
      icon: <ClipboardList className="h-6 w-6 text-primary" />,
      title: "Too many documents, too little time",
      description: "You're juggling emails, PDFs, and portals. Fraud slips through the cracks.",
    },
    {
      icon: <Search className="h-6 w-6 text-primary" />,
      title: "You're not a forensic expert",
      description: "Fake docs are getting better. One click from a client, and now it's your liability.",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      title: "Compliance is confusing and constant",
      description: "FSRA wants proof you did your due diligence — and that proof takes hours.",
    },
    {
      icon: <Briefcase className="h-6 w-6 text-primary" />,
      title: "Your license is your livelihood",
      description: "One overlooked red flag can mean a damaged reputation, fines, or worse.",
    },
  ];

  return (
    <section id="pain-points" className="section-padding relative bg-gradient-to-b from-white to-secondary/50">
      <div className="section-container">
        <ScrollReveal className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            The Real Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            They Don't Talk About This, But You Know It's True
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            You've probably seen it: A "verified" job letter that doesn't feel right. A client claiming income that doesn't match the lifestyle. An ID that looks... off.
          </p>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto mt-4 font-medium italic">
            "What if I miss something? What if this blows back on me?"
          </p>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto mt-4">
            You're not being paranoid. FSRA can audit you even if you didn't commit the fraud, and you're still on the hook.
          </p>
        </ScrollReveal>

        <div className="mt-12">
          <h3 className="text-2xl font-bold text-center mb-10">
            <AnimatedText text="The Real Pain Brokers Face" />
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {painPoints.map((point, index) => (
              <ScrollReveal
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-border/30 hover:shadow-md transition-all duration-300"
                delay={index * 150}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    {point.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-2">{point.title}</h4>
                    <p className="text-foreground/70">{point.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PainPoints;
