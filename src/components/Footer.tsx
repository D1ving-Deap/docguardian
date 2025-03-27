
import React from "react";
import { cn } from "@/lib/utils";

const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-6 md:px-12 lg:px-20 bg-white border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-6">
            <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              VerifyFlow
            </span>
          </div>
          
          <div className="flex space-x-6 mb-6">
            <a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors animated-underline py-1">
              Privacy
            </a>
            <a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors animated-underline py-1">
              Terms
            </a>
            <a href="#" className="text-sm text-foreground/60 hover:text-primary transition-colors animated-underline py-1">
              Contact
            </a>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-foreground/60">
              Built in Canada, for Canada. 🇨🇦
            </p>
            <p className="text-sm text-foreground/60 mt-2">
              © {new Date().getFullYear()} VerifyFlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
