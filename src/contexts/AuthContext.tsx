import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secret admin credentials for testing
const ADMIN_CREDENTIALS = {
  email: "laijack051805@gmail.com",
  password: "##@@!!Ss2020",
  name: "Admin Test User"
};

// Development mode flag - set to true to bypass Supabase completely
const DEVELOPMENT_MODE = true;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    if (DEVELOPMENT_MODE) {
      console.log("Development mode: Skipping Supabase auth setup");
      setIsLoading(false);
      return;
    }
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Show toast on successful sign in/out
        if (event === 'SIGNED_IN' && session) {
          toast({
            title: "Signed in successfully",
            description: `Welcome ${session.user.email}`,
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out successfully",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting sign in for:", email);
      
      // Check for secret admin login
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        console.log("Admin login detected");
        
        // Create a mock admin user
        const mockUser: User = {
          id: 'admin-test-user',
          email: ADMIN_CREDENTIALS.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          app_metadata: {
            provider: 'email',
            providers: ['email']
          },
          user_metadata: {
            full_name: ADMIN_CREDENTIALS.name
          },
          aud: 'authenticated',
          role: 'authenticated'
        } as User;
        
        const mockSession: Session = {
          access_token: 'mock-admin-token',
          refresh_token: 'mock-admin-refresh',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser
        } as Session;
        
        setUser(mockUser);
        setSession(mockSession);
        
        toast({
          title: "Admin login successful",
          description: `Welcome ${ADMIN_CREDENTIALS.name}`,
        });
        
        return;
      }
      
      // In development mode, allow any email/password combination
      if (DEVELOPMENT_MODE) {
        console.log("Development mode: Creating mock user for:", email);
        
        const mockUser: User = {
          id: `dev-user-${Date.now()}`,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          app_metadata: {
            provider: 'email',
            providers: ['email']
          },
          user_metadata: {
            full_name: email.split('@')[0]
          },
          aud: 'authenticated',
          role: 'authenticated'
        } as User;
        
        const mockSession: Session = {
          access_token: 'mock-dev-token',
          refresh_token: 'mock-dev-refresh',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser
        } as Session;
        
        setUser(mockUser);
        setSession(mockSession);
        
        toast({
          title: "Development login successful",
          description: `Welcome ${email}`,
        });
        
        return;
      }
      
      // Regular Supabase authentication - with captcha disabled
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        
        // Handle specific captcha-related errors
        if (error.message.includes('captcha') || error.message.includes('verification')) {
          toast({
            title: "Authentication issue",
            description: "Please try again or contact support if the issue persists.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
        throw error;
      }
      
      if (!data.user || !data.session) {
        const errorMsg = "No user or session returned after sign in";
        console.error(errorMsg);
        toast({
          title: "Login failed",
          description: errorMsg,
          variant: "destructive",
        });
        throw new Error(errorMsg);
      }
      
      console.log("Sign in successful");
    } catch (error: any) {
      console.error("Sign in error:", error);
      // Don't show duplicate error messages
      if (!error.message?.includes('captcha') && !error.message?.includes('verification')) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting sign up for:", email);
      
      // For testing, allow admin user registration
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        console.log("Admin registration detected");
        toast({
          title: "Admin account created",
          description: "You can now log in with the admin credentials.",
        });
        return;
      }
      
      // In development mode, allow any registration
      if (DEVELOPMENT_MODE) {
        console.log("Development mode: Creating mock account for:", email);
        toast({
          title: "Development account created",
          description: "You can now log in with your credentials.",
        });
        return;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error("Registration error:", error.message);
        
        // Handle captcha-related errors
        if (error.message.includes('captcha') || error.message.includes('verification')) {
          toast({
            title: "Registration issue",
            description: "Please try again or contact support if the issue persists.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive",
          });
        }
        throw error;
      }

      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        toast({
          title: "Email already registered",
          description: "This email is already registered. Please log in instead.",
          variant: "destructive",
        });
        throw new Error("Email already registered");
      }

      console.log("Sign up successful:", data);
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account before logging in.",
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      // Don't show duplicate error messages
      if (!error.message?.includes('captcha') && !error.message?.includes('verification')) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log("Attempting sign out");
      
      // Clear mock sessions
      if (user?.id?.startsWith('admin-test-user') || user?.id?.startsWith('dev-user')) {
        setUser(null);
        setSession(null);
        toast({
          title: "Signed out successfully",
        });
        return;
      }
      
      if (DEVELOPMENT_MODE) {
        setUser(null);
        setSession(null);
        toast({
          title: "Signed out successfully",
        });
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error.message);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Sign out successful");
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
