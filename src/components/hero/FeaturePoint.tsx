
import React from "react";
import { LucideIcon } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

interface FeaturePointProps {
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  delay: number;
  children: React.ReactNode;
}

const FeaturePoint: React.FC<FeaturePointProps> = ({
  icon: Icon,
  bgColor,
  iconColor,
  delay,
  children
}) => {
  return (
    <ScrollReveal delay={delay} className="flex items-center gap-2">
      <div className={`flex-shrink-0 w-6 h-6 rounded-full ${bgColor} flex items-center justify-center`}>
        <Icon className={`h-3 w-3 ${iconColor}`} />
      </div>
      <span className="text-sm">{children}</span>
    </ScrollReveal>
  );
};

export default FeaturePoint;
