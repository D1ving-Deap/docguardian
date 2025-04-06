
import React from "react";
import { Quote } from "lucide-react";

const Testimonial: React.FC = () => {
  return (
    <div className="mt-8 pt-6 border-t border-border/30">
      <div className="bg-secondary/50 p-5 rounded-xl relative">
        <Quote className="absolute top-3 left-3 h-6 w-6 text-primary/20" />
        <p className="italic text-foreground/80 text-sm px-3">
          "This looks like exactly what we need. After that last FSRA audit, we've been looking for better document verification tools."
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">MB</span>
          </div>
          <div>
            <p className="text-foreground font-medium text-sm">
              Mark B.
            </p>
            <p className="text-xs text-foreground/60">
              Mortgage Broker, Toronto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
