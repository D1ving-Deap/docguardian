import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import PainPoints from "@/components/PainPoints";
import HowItWorks from "@/components/HowItWorks";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MetadataDetection from "@/components/MetadataDetection";
import AnimatedText from '@/components/AnimatedText';
import Features from '@/components/Features';
import FeatureShowcase from '@/components/FeatureShowcase';

const Index: React.FC = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main className="flex-grow">
        <HeroSection />
        <MetadataDetection />
        <PainPoints />
        <HowItWorks />
        <Features />
        <FeatureShowcase />
        <WaitlistForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
