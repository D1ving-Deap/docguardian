
import React from "react";

const Testimonial: React.FC = () => {
  return (
    <div className="mt-8 pt-6 border-t border-border/30">
      <div className="bg-secondary/50 p-4 rounded-lg">
        <p className="italic text-foreground/60 text-center">
          "This looks like exactly what we need. After that last FSRA audit, we've been looking for better document verification tools."
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">MB</span>
          </div>
          <p className="text-foreground/60 font-medium">
            Mark B., Mortgage Broker
          </p>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
