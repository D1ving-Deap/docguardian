import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { env, isAdminLoginAllowed } from "@/config/environment";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string, captchaToken: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, captchaToken: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up auth state listener");
    
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

  const signIn = async (email: string, password: string, captchaToken: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting sign in for:", email);
      
      // Check for admin login (ONLY if enabled)
      if (isAdminLoginAllowed() && 
          email === env.admin.email && 
          password === env.admin.password) {
        console.log("Admin login detected");
        
        // Create a mock admin user
        const mockUser: User = {
          id: 'admin-test-user',
          email: env.admin.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          app_metadata: {
            provider: 'email',
            providers: ['email']
          },
          user_metadata: {
            full_name: env.admin.name
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
          description: `Welcome ${env.admin.name}`,
        });
        
        return;
      }
      
      // Regular Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken,
        },
      });

      if (error) {
        console.error("Login error:", error.message);
        
        // Handle specific captcha-related errors
        if (error.message.includes('captcha') || error.message.includes('verification')) {
          toast({
            title: "Verification Required",
            description: "Our system detected unusual activity. Please complete the captcha challenge if visible, or try again later. If this persists, check your network, try a different browser, or contact support.",
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

  const signUp = async (email: string, password: string, fullName: string, captchaToken: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting sign up for:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
          captchaToken,
        },
      });

      if (error) {
        console.error("Registration error:", error.message);
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      if (data.user && !data.session) {
        toast({
          title: "Registration successful",
          description: "Please check your email to confirm your account.",
        });
      } else if (data.session) {
        toast({
          title: "Registration successful",
          description: "Welcome! You have been signed in.",
        });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
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
      
      setUser(null);
      setSession(null);
      
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw error;
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
