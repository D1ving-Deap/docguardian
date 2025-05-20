
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Here you can integrate with an email service like Resend, SendGrid, etc.
    // For now, let's log the email that would be sent
    console.log(`Sending welcome email to ${email}`);
    
    // Example response structure (you'd replace this with actual email API response)
    const emailResponse = {
      success: true,
      message: `Welcome email sent to ${email}`,
      timestamp: new Date().toISOString()
    };

    // Log the email to the console 
    console.log(`Welcome to VerifyFlow!

Dear ${email},

Thank you for joining our waitlist. We're excited to have you as part of the VerifyFlow family!

We'll keep you updated on our launch and provide early access when we're ready.

Best regards,
The VerifyFlow Team`);

    return new Response(
      JSON.stringify(emailResponse),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error in send-welcome-email function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
