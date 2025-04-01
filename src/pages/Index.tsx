
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
        
        // Try to check connection by getting table data instead of using rpc
        // This avoids the TypeScript error with the 'version' function that doesn't exist
        const { data: versionData, error: versionError } = await supabase
          .from('Gmail Waitlist')
          .select('created_at')
          .limit(1);

        console.log("Connection test response:", { versionData, versionError });
        
        if (versionError) {
          console.error("Supabase connection error:", versionError);
        } else {
          console.log("Supabase API connection successful");
        }
        
        // Also test connection to the waitlist table with our new RLS policies
        const { data, error } = await supabase
          .from('Gmail Waitlist')
          .select('created_at')
          .limit(1);
        
        console.log("Waitlist table test response:", { data, error });
        
        if (error) {
          console.error("Waitlist table access error:", error);
          toast.error(`Database connection issue: ${error.message}`);
          return;
        }
        
        // Connection successful
        console.log("Supabase waitlist table connection successful", data);
        toast.success("Database connection successful");
      } catch (err) {
        console.error("Supabase connection test failed:", err);
        toast.error("Failed to test database connection");
      }
    };
    
    // Run the connection test
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
