// Environment configuration for NOBILIS-IA
// Centralized configuration to handle all environment variables

interface EnvironmentConfig {
  // Supabase Configuration
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // App Configuration
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  
  // Security Configuration
  security: {
    enableAuditLogs: boolean;
    sessionTimeout: number; // in seconds
    maxLoginAttempts: number;
    enableRegistration: boolean;
    enablePasswordReset: boolean;
  };
  
  // Feature Flags
  features: {
    enableDebugMode: boolean;
    enableAnalytics: boolean;
    enableAI: boolean;
  };
}

// Validate required environment variables
const validateEnvironmentVariable = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Get boolean environment variable with default
const getBooleanEnv = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

// Get number environment variable with default
const getNumberEnv = (key: string, defaultValue: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Load and validate configuration
const loadConfig = (): EnvironmentConfig => {
  const config: EnvironmentConfig = {
    supabase: {
      url: validateEnvironmentVariable('VITE_SUPABASE_URL', import.meta.env.VITE_SUPABASE_URL),
      anonKey: validateEnvironmentVariable('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY),
    },
    
    app: {
      name: import.meta.env.VITE_APP_NAME || 'NOBILIS-IA',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: (import.meta.env.VITE_APP_ENVIRONMENT as any) || 'development',
    },
    
    security: {
      enableAuditLogs: getBooleanEnv('VITE_ENABLE_AUDIT_LOGS', true),
      sessionTimeout: getNumberEnv('VITE_SESSION_TIMEOUT', 3600), // 1 hour default
      maxLoginAttempts: getNumberEnv('VITE_MAX_LOGIN_ATTEMPTS', 5),
      enableRegistration: getBooleanEnv('VITE_ENABLE_REGISTRATION', true),
      enablePasswordReset: getBooleanEnv('VITE_ENABLE_PASSWORD_RESET', true),
    },
    
    features: {
      enableDebugMode: getBooleanEnv('VITE_DEBUG_MODE', false),
      enableAnalytics: getBooleanEnv('VITE_ENABLE_ANALYTICS', false),
      enableAI: getBooleanEnv('VITE_ENABLE_AI', true),
    },
  };
  
  // Validate configuration based on environment
  if (config.app.environment === 'production') {
    // Production-specific validations
    if (config.security.sessionTimeout > 7200) { // Max 2 hours in production
      console.warn('Session timeout is too long for production environment');
    }
    
    if (config.security.maxLoginAttempts > 10) {
      console.warn('Max login attempts is too high for production environment');
    }
    
    if (config.features.enableDebugMode) {
      console.warn('Debug mode should be disabled in production');
    }
  }
  
  return config;
};

// Export singleton configuration
export const config = loadConfig();

// Export utility functions
export const isProduction = () => config.app.environment === 'production';
export const isStaging = () => config.app.environment === 'staging';
export const isDevelopment = () => config.app.environment === 'development';

// Security utilities
export const getSecurityConfig = () => config.security;
export const getAppConfig = () => config.app;
export const getFeatureFlags = () => config.features;

// Logger configuration based on environment
export const logLevel = isDevelopment() ? 'debug' : isStaging() ? 'info' : 'error';

// CSP (Content Security Policy) configuration
export const getCSPConfig = () => {
  const baseCSP = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", config.supabase.url],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  };
  
  if (isDevelopment()) {
    baseCSP.scriptSrc.push("'unsafe-eval'");
    baseCSP.connectSrc.push("ws://localhost:*", "http://localhost:*");
  }
  
  return baseCSP;
};

// Rate limiting configuration
export const getRateLimitConfig = () => ({
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.security.maxLoginAttempts,
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per 15 minutes
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Max 3 password reset requests per hour
  },
});

// Export types for TypeScript
export type { EnvironmentConfig }; 