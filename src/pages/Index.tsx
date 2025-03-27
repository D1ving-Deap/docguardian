
import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import PainPoints from "@/components/PainPoints";
import Features from "@/components/Features";
import FeatureShowcase from "@/components/FeatureShowcase";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";

const Index: React.FC = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main>
        <HeroSection />
        <PainPoints />
        <Features />
        <FeatureShowcase />
        <WaitlistForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
