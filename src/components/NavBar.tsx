
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const NavBar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-6 md:px-12 lg:px-20 py-4",
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center">
          <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            VerifyFlow
          </span>
        </a>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#pain-points" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors animated-underline py-1">
            Pain Points
          </a>
          <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors animated-underline py-1">
            Features
          </a>
          <a href="#waitlist" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors animated-underline py-1">
            Join Waitlist
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/login"
            className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
