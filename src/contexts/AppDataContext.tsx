import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Simplified types that match the actual database
interface SimpleUserProfile {
  id: number;
  user_id: string | null;
  username: string | null;
  created_at: string | null;
}

interface MortgageApplication {
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
}

interface AppDataContextType {
  userProfile: SimpleUserProfile | null;
  agents: SimpleUserProfile[];
  applications: MortgageApplication[];
  loading: boolean;
  error: string | null;
  refetchData: () => void;
  addAgent: (agentData: { full_name: string; email: string }) => Promise<void>;
  createApplication: (appData: Partial<MortgageApplication>) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<SimpleUserProfile | null>(null);
  const [agents, setAgents] = useState<SimpleUserProfile[]>([]);
  const [applications, setApplications] = useState<MortgageApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) {
        // If user profile doesn't exist, create a default one
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([{
              user_id: user.id,
              username: user.email?.split('@')[0] || 'user'
            }])
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating user profile:', createError);
            setError('Failed to create user profile');
            return;
          }
          
          setUserProfile(newProfile);
        } else {
          console.error('Error fetching user profile:', profileError);
          setError('Failed to load user profile');
          return;
        }
      } else {
        setUserProfile(profileData);
      }

      // Fetch all agents (simplified - just get all user profiles)
      const { data: agentsData, error: agentsError } = await supabase
        .from('user_profiles')
        .select('*');
      if (agentsError) {
        console.error('Error fetching agents:', agentsError);
      } else {
        setAgents(agentsData || []);
      }

      // Fetch mortgage applications
      const { data: appsData, error: appsError } = await supabase
        .from('mortgage_applications')
        .select('*');
      if (appsError) {
        console.error('Error fetching applications:', appsError);
      } else {
        setApplications(appsData || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addAgent = async (agentData: { full_name: string; email: string }) => {
    try {
      console.log("Inviting agent:", agentData);
      toast({
        title: "Agent invitation sent",
        description: `${agentData.full_name} has been invited to join your team.`,
      });
    } catch (error) {
      console.error('Error adding agent:', error);
      toast({
        title: "Error inviting agent",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const createApplication = async (appData: Partial<MortgageApplication>) => {
    if (!userProfile) throw new Error("User not loaded");
    
    try {
      const { data, error } = await supabase
        .from('mortgage_applications')
        .insert([{
          client_name: appData.client_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client',
          email: appData.email || user.email || '',
          stage: appData.stage || 'initial',
          status: appData.status || 'pending',
          progress: appData.progress || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      if (data) {
        setApplications(prev => [...prev, data]);
        toast({
          title: "Application created",
          description: "Your application has been submitted successfully.",
        });
      }
    } catch (error) {
      console.error('Error creating application:', error);
      toast({
        title: "Error creating application",
        description: "Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const value = {
    userProfile,
    agents,
    applications,
    loading,
    error,
    refetchData: fetchData,
    addAgent,
    createApplication
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}; 