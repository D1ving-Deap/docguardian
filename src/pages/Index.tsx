
import React, { useEffect } from "react";
import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import PainPoints from "@/components/PainPoints";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import FeatureShowcase from "@/components/FeatureShowcase";
import WaitlistForm from "@/components/WaitlistForm";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index: React.FC = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Test Supabase connection
    const testConnection = async () => {
      try {
        console.log("Testing Supabase connection...");
        
        // Query the Gmail Waitlist table which exists in our database
        const { data, error } = await supabase
          .from('Gmail Waitlist')
          .select('*')
          .limit(1);
        
        if (error) {
          console.error("Supabase connection error:", error);
          toast.error("Could not connect to database");
          return;
        }
        
        // Connection successful
        console.log("Supabase connection successful:", data);
        toast.success("Connected to database");
      } catch (err) {
        console.error("Supabase connection test failed:", err);
        toast.error("Failed to test database connection");
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar />
      <main>
        <HeroSection />
        <PainPoints />
        <Features />
        <HowItWorks />
        <FeatureShowcase />
        <WaitlistForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
