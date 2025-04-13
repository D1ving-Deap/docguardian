
import { Database as OriginalDatabase, Json } from './types';

// Extend the Database type with our mortgage_applications and documents tables
export interface CustomDatabase extends OriginalDatabase {
  public: {
    Tables: {
      "Gmail Waitlist": OriginalDatabase['public']['Tables']['Gmail Waitlist'];
      profiles: OriginalDatabase['public']['Tables']['profiles'];
      user_profiles: OriginalDatabase['public']['Tables']['user_profiles'];
      mortgage_applications: {
        Row: {
          id: string;
          client_name: string;
          email: string;
          stage: string;
          progress: number;
          status: string;
          fraud_score: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          client_name: string;
          email: string;
          stage?: string;
          progress?: number;
          status?: string;
          fraud_score?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          client_name?: string;
          email?: string;
          stage?: string;
          progress?: number;
          status?: string;
          fraud_score?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          application_id: string | null;
          document_type: string;
          file_path: string;
          filename: string;
          raw_text: string | null;
          structured_data: Json | null;
          uploaded_at: string;
          verified: boolean | null;
        };
        Insert: {
          id?: string;
          application_id?: string | null;
          document_type: string;
          file_path: string;
          filename: string;
          raw_text?: string | null;
          structured_data?: Json | null;
          uploaded_at?: string;
          verified?: boolean | null;
        };
        Update: {
          id?: string;
          application_id?: string | null;
          document_type?: string;
          file_path?: string;
          filename?: string;
          raw_text?: string | null;
          structured_data?: Json | null;
          uploaded_at?: string;
          verified?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_application_id_fkey";
            columns: ["application_id"];
            isOneToOne: false;
            referencedRelation: "mortgage_applications";
            referencedColumns: ["id"];
          }
        ];
      };
      fraud_alerts: {
        Row: {
          id: string;
          document_id: string | null;
          issue: string;
          severity: string;
          created_at: string;
          resolved: boolean;
        };
        Insert: {
          id?: string;
          document_id?: string | null;
          issue: string;
          severity: string;
          created_at?: string;
          resolved?: boolean;
        };
        Update: {
          id?: string;
          document_id?: string | null;
          issue?: string;
          severity?: string;
          created_at?: string;
          resolved?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: OriginalDatabase['public']['Views'];
    Functions: OriginalDatabase['public']['Functions'];
    Enums: OriginalDatabase['public']['Enums'];
    CompositeTypes: OriginalDatabase['public']['CompositeTypes'];
  };
}

// Create a custom Supabase client type
export type CustomSupabaseClient = ReturnType<typeof createCustomClient>;

// Create a function to cast the supabase client to our custom type
import { createClient } from '@supabase/supabase-js';
export function createCustomClient(supabaseUrl: string, supabaseKey: string) {
  return createClient<CustomDatabase>(supabaseUrl, supabaseKey);
}
