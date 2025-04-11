
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { CustomDatabase, CustomSupabaseClient } from './custom-types';

const SUPABASE_URL = "https://spjkuuxxzlgljjtihwot.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwamt1dXh4emxnbGpqdGlod290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzQ4MzEsImV4cCI6MjA1ODg1MDgzMX0.wLgy-0mZ0TdsfYBNRMEEJnxEm88gfOvzAGTSBcSGJKw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

const originalClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
export const supabase = originalClient as unknown as CustomSupabaseClient;

// Export the URL for use in other components
export const supabaseUrl = SUPABASE_URL;
