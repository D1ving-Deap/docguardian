
import React from "react";
import { Quote, Star, MessageSquare } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

const Testimonial: React.FC = () => {
  const testimonials = [
    {
      quote: "This looks like exactly what we need. After that last FSRA audit, we've been looking for better document verification tools.",
      name: "Mark B.",
      title: "Mortgage Broker, Toronto",
      initials: "MB",
      color: "bg-primary/10",
      textColor: "text-primary"
    },
    {
      quote: "We've cut our verification time by 85% using this platform. The AI cross-referencing has caught several discrepancies we would have missed.",
      name: "Sarah K.",
      title: "Loan Officer, Vancouver",
      initials: "SK",
      color: "bg-green-500/10",
      textColor: "text-green-500"
    },
    {
      quote: "The continuous monitoring feature gives us peace of mind. We were alerted to a potential fraud attempt just last month that we would have missed.",
      name: "David L.",
      title: "Compliance Manager, Montreal",
      initials: "DL",
      color: "bg-blue-500/10",
      textColor: "text-blue-500"
    }
  ];

  return (
    <div className="mt-10 pt-6 border-t border-border/30">
      <h3 className="font-semibold text-center mb-6 text-lg flex items-center justify-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        What Our Beta Users Are Saying
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {testimonials.map((testimonial, index) => (
          <ScrollReveal key={index} delay={index * 100} animation="fade-in-up">
            <div className="bg-secondary/50 p-5 rounded-xl relative h-full">
              <Quote className="absolute top-3 left-3 h-5 w-5 text-primary/20" />
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="italic text-foreground/80 text-sm px-3 mb-4">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center`}>
                  <span className={`${testimonial.textColor} font-semibold`}>{testimonial.initials}</span>
                </div>
                <div>
                  <p className="text-foreground font-medium text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-foreground/60">
                    {testimonial.title}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
