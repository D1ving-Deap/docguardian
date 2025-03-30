
import React from "react";
import { ChevronDown } from "lucide-react";

interface ScrollDownButtonProps {
  targetId: string;
}

const ScrollDownButton: React.FC<ScrollDownButtonProps> = ({ targetId }) => {
  const scrollToSection = () => {
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button 
      onClick={scrollToSection}
      className="animate-bounce p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors duration-300"
      aria-label={`Scroll down to ${targetId}`}
    >
      <ChevronDown className="h-6 w-6 text-primary" />
    </button>
  );
};

export default ScrollDownButton;
