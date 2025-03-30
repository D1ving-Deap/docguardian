
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
        // Just a simple query to test the connection
        const { data, error } = await supabase.from('_dummy_query').select('*').limit(1).maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          // If error is not the expected "relation does not exist" error
          console.error("Supabase connection error:", error);
          setConnectionStatus('error');
          return;
        }
        
        // If we get here, connection is working (even with the expected table missing error)
        setConnectionStatus('connected');
        console.log("Supabase connection successful");
      } catch (err) {
        console.error("Supabase connection test failed:", err);
        setConnectionStatus('error');
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
