import React from "react";
import { MessageSquare } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
const Testimonial: React.FC = () => {
  return <div className="w-full mt-10 mb-4">
      <h3 className="font-semibold text-center mb-4 text-lg flex items-center justify-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        What Our Users Are Saying
      </h3>
      
      <div className="rounded-xl p-6 shadow-md border border-gray-300 bg-zinc-100">
        <p className="italic text-gray-700 mb-4 text-base">
          "This software has completely transformed our mortgage verification process. We've reduced our review time by 70% and caught several discrepancies that would have been missed with our old manual process."
        </p>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center">
            <span className="text-white font-semibold">JD</span>
          </div>
          <div className="ml-3">
            <p className="text-gray-800 font-medium">Jamie Danforth</p>
            <p className="text-sm text-gray-600">
              Senior Mortgage Officer, Toronto
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default Testimonial;