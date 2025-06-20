import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { UserProfile, Application, Client } from '@/integrations/supabase/custom-types';

interface AppDataContextType {
  userProfile: UserProfile | null;
  agents: UserProfile[];
  clients: Client[];
  applications: Application[];
  loading: boolean;
  refetchData: () => void;
  addAgent: (agentData: Pick<UserProfile, 'full_name' | 'email'>) => Promise<void>;
  addClient: (clientData: Pick<UserProfile, 'full_name' | 'email'>) => Promise<void>;
  createApplication: (appData: Partial<Application>) => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [agents, setAgents] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) throw profileError;
      setUserProfile(profileData);

      // Fetch role-specific data
      if (profileData.role === 'manager') {
        const { data: agentsData, error: agentsError } = await supabase
          .from('user_profiles')
          .select('*')
          .in('role', ['broker']);
        if (agentsError) throw agentsError;
        setAgents(agentsData || []);

        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select(`*, applicant:user_profiles!applicant_id(full_name, email), broker:user_profiles!broker_id(full_name)`);
        if (appsError) throw appsError;
        setApplications(appsData || []);
      }

      if (profileData.role === 'broker') {
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select(`*, client:user_profiles!client_user_id(full_name, email)`)
          .eq('broker_id', profileData.id);
        if (clientsError) throw clientsError;
        setClients(clientsData || []);

        const clientIds = (clientsData || []).map(c => c.client_user_id);
        if (clientIds.length > 0) {
          const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select(`*, applicant:user_profiles!applicant_id(full_name, email)`)
            .in('applicant_id', clientIds);
          if (appsError) throw appsError;
          setApplications(appsData || []);
        } else {
          setApplications([]);
        }
      }

      if (profileData.role === 'applicant') {
        const { data: appsData, error: appsError } = await supabase
          .from('applications')
          .select(`*, broker:user_profiles!broker_id(full_name)`)
          .eq('applicant_id', profileData.id);
        if (appsError) throw appsError;
        setApplications(appsData || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addAgent = async (agentData: Pick<UserProfile, 'full_name' | 'email'>) => {
    // This server-side logic should handle user creation and invitation.
    console.log("Inviting agent:", agentData);
  };

  const addClient = async (clientData: Pick<UserProfile, 'full_name' | 'email'>) => {
     console.log("Inviting client:", clientData);
  };

  const createApplication = async (appData: Partial<Application>) => {
    if (!userProfile) throw new Error("User not loaded");
    const { data, error } = await supabase
      .from('applications')
      .insert([{ ...appData, applicant_id: userProfile.id }])
      .select()
      .single();
    
    if (error) throw error;
    if (data) {
        setApplications(prev => [...prev, data]);
    }
    await fetchData(); // Refetch all data to ensure consistency
  };
  
  const value = {
    userProfile,
    agents,
    clients,
    applications,
    loading,
    refetchData: fetchData,
    addAgent,
    addClient,
    createApplication
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}; 