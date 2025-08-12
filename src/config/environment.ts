// Configuração do ambiente
export const config = {
  // Configuração do Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // Configuração do backend local
  backend: {
    url: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002',
  },
  
  // Configuração da OpenAI
  openai: {
    apiKey: import.meta.env.OPENAI_API_KEY,
  },
  
  // Configurações da aplicação
  app: {
    name: import.meta.env.VITE_APP_NAME || 'NOBILIS-IA',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },
  
  // Verificar se o Supabase está configurado
  isSupabaseConfigured: () => {
    return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  },
  
  // Verificar se o backend local está disponível
  isBackendAvailable: () => {
    return import.meta.env.VITE_BACKEND_URL || true; // Assume que está disponível se não especificado
  },
  
  // Obter o backend ativo
  getActiveBackend: () => {
    if (config.isSupabaseConfigured()) {
      return 'supabase';
    } else if (config.isBackendAvailable()) {
      return 'local';
    } else {
      return 'none';
    }
  }
};

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
    connectSrc: ["'self'", config.supabase.url, "https://api.openai.com"],
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