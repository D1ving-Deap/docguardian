// Environment configuration with security considerations

export interface EnvironmentConfig {
  // Supabase Configuration (Safe for production)
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // reCAPTCHA Configuration (Safe for production)
  recaptcha: {
    siteKey: string;
  };
  
  // Admin Configuration (Development only)
  admin: {
    enabled: boolean;
    email: string;
    password: string;
    name: string;
  };
  
  // Environment flags
  isDevelopment: boolean;
  isProduction: boolean;
}

// Validate required environment variables
const validateEnvironment = (): void => {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_RECAPTCHA_SITE_KEY'
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Initialize environment configuration
export const getEnvironmentConfig = (): EnvironmentConfig => {
  // Validate required variables
  validateEnvironment();
  
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  // Admin configuration (development only)
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || '';
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '';
  const adminName = import.meta.env.VITE_ADMIN_NAME || 'Admin User';
  
  const adminEnabled = isDevelopment && adminEmail && adminPassword;
  
  return {
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL!,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY!,
    },
    recaptcha: {
      siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY!,
    },
    admin: {
      enabled: adminEnabled,
      email: adminEmail,
      password: adminPassword,
      name: adminName,
    },
    isDevelopment,
    isProduction,
  };
};

// Export the configuration
export const env = getEnvironmentConfig();

// Security check function
export const isAdminLoginAllowed = (): boolean => {
  return env.admin.enabled;
};

// Log environment status (development only)
if (env.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    isDevelopment: env.isDevelopment,
    isProduction: env.isProduction,
    adminEnabled: env.admin.enabled,
    supabaseUrl: env.supabase.url ? '✅ Set' : '❌ Missing',
    recaptchaKey: env.recaptcha.siteKey ? '✅ Set' : '❌ Missing',
  });
} 