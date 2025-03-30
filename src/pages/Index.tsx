
import React, { useEffect, useState } from "react";
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
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Test Supabase connection
    const testConnection = async () => {
      try {
        // Query the Gmail Waitlist table which exists in our database
        const { data, error } = await supabase.from('Gmail Waitlist').select('*').limit(1);
        
        if (error) {
          console.error("Supabase connection error:", error);
          setConnectionStatus('error');
          toast.error("Could not connect to database");
          return;
        }
        
        // Connection successful
        setConnectionStatus('connected');
        console.log("Supabase connection successful");
        toast.success("Connected to database");
      } catch (err) {
        console.error("Supabase connection test failed:", err);
        setConnectionStatus('error');
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
