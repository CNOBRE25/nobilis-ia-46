
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  updatePassword: (password: string) => Promise<{ error?: AuthError }>;
  isAccountLocked: boolean;
  sessionExpiresAt: Date | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<Date | null>(null);
  const { toast } = useToast();

  // Session timeout configuration
  const SESSION_TIMEOUT = parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600') * 1000; // Convert to ms
  const MAX_LOGIN_ATTEMPTS = parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS || '5');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session) {
        setSessionExpiresAt(new Date(Date.now() + SESSION_TIMEOUT));
        setupSessionTimeout();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session) {
          setSessionExpiresAt(new Date(Date.now() + SESSION_TIMEOUT));
          setupSessionTimeout();
        } else {
          setSessionExpiresAt(null);
        }

        // Log authentication events for audit with enhanced security
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          await logSecurityEvent(event, session?.user?.id, {
            event,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            ip_address: await getClientIP()
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  };

  const setupSessionTimeout = () => {
    // Clear any existing timeout
    if (typeof window !== 'undefined' && window.sessionTimeout) {
      clearTimeout(window.sessionTimeout);
    }

    // Set up automatic logout after session timeout
    if (typeof window !== 'undefined') {
      window.sessionTimeout = setTimeout(() => {
        toast({
          title: "Sessão Expirada",
          description: "Sua sessão expirou. Você será redirecionado para a tela de login.",
          variant: "destructive",
        });
        signOut();
      }, SESSION_TIMEOUT);
    }
  };

  const logSecurityEvent = async (
    eventType: string, 
    userId?: string, 
    metadata?: any
  ) => {
    try {
      const ip = await getClientIP();
      await supabase.rpc('log_security_event', {
        event_type: eventType,
        user_id: userId,
        metadata: metadata || {},
        ip_address: ip,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const trackLoginAttempt = async (email: string, success: boolean): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('track_login_attempt', {
        user_email: email,
        success: success
      });

      if (error) {
        console.error('Failed to track login attempt:', error);
        return true; // Allow login attempt if tracking fails
      }

      return data;
    } catch (error) {
      console.error('Failed to track login attempt:', error);
      return true; // Allow login attempt if tracking fails
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // First check if account is locked
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('failed_login_attempts, account_locked_until')
        .eq('email', email)
        .single();

      if (userData?.account_locked_until) {
        const lockoutTime = new Date(userData.account_locked_until);
        if (lockoutTime > new Date()) {
          setIsAccountLocked(true);
          toast({
            title: "Conta Bloqueada",
            description: `Sua conta está temporariamente bloqueada até ${lockoutTime.toLocaleString()}`,
            variant: "destructive",
          });
          await logSecurityEvent('LOGIN_BLOCKED', undefined, {
            email,
            reason: 'Account locked due to failed attempts',
            locked_until: lockoutTime.toISOString()
          });
          return { error: { message: 'Account locked' } as AuthError };
        }
      }

      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Track login attempt
      if (error) {
        const canTryAgain = await trackLoginAttempt(email, false);
        if (!canTryAgain) {
          setIsAccountLocked(true);
          toast({
            title: "Conta Bloqueada",
            description: `Muitas tentativas falharam. Sua conta foi bloqueada temporariamente.`,
            variant: "destructive",
          });
        } else {
          const attemptsLeft = MAX_LOGIN_ATTEMPTS - (userData?.failed_login_attempts || 0) - 1;
          toast({
            title: "Erro no login",
            description: `${error.message}. Tentativas restantes: ${attemptsLeft}`,
            variant: "destructive",
          });
        }
        await logSecurityEvent('LOGIN_FAILED', undefined, {
          email,
          error: error.message,
          attempts_left: MAX_LOGIN_ATTEMPTS - (userData?.failed_login_attempts || 0) - 1
        });
      } else {
        await trackLoginAttempt(email, true);
        setIsAccountLocked(false);
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao NOBILIS-IA",
        });
        await logSecurityEvent('LOGIN_SUCCESS', data.user?.id, {
          email,
          login_method: 'email_password'
        });
      }

      return { error };
    } catch (error) {
      console.error('Login error:', error);
      return { error: { message: 'An unexpected error occurred' } as AuthError };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Validate password strength
      const { data: passwordValidation, error: validationError } = await supabase
        .rpc('validate_password_strength', { password });

      if (validationError || !passwordValidation?.valid) {
        const feedback = passwordValidation?.feedback || ['Password does not meet requirements'];
        toast({
          title: "Senha Inválida",
          description: Array.isArray(feedback) ? feedback.join(', ') : feedback,
          variant: "destructive",
        });
        return { error: { message: 'Password does not meet requirements' } as AuthError };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
        await logSecurityEvent('SIGNUP_FAILED', undefined, {
          email,
          error: error.message
        });
      } else {
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmar a conta.",
        });
        await logSecurityEvent('SIGNUP_SUCCESS', data.user?.id, {
          email,
          userData: userData
        });
      }

      return { error };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: { message: 'An unexpected error occurred' } as AuthError };
    }
  };

  const signOut = async () => {
    try {
      // Clear session timeout
      if (typeof window !== 'undefined' && window.sessionTimeout) {
        clearTimeout(window.sessionTimeout);
      }

      // Log logout before signing out
      await logSecurityEvent('LOGOUT', user?.id, {
        logout_type: 'manual',
        timestamp: new Date().toISOString()
      });

      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setIsAccountLocked(false);
        setSessionExpiresAt(null);
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        await logSecurityEvent('PASSWORD_RESET_FAILED', undefined, {
          email,
          error: error.message
        });
      } else {
        toast({
          title: "E-mail enviado!",
          description: "Instruções para redefinir sua senha foram enviadas.",
        });
        await logSecurityEvent('PASSWORD_RESET_REQUESTED', undefined, {
          email
        });
      }

      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: { message: 'An unexpected error occurred' } as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      // Validate password strength
      const { data: passwordValidation, error: validationError } = await supabase
        .rpc('validate_password_strength', { password });

      if (validationError || !passwordValidation?.valid) {
        const feedback = passwordValidation?.feedback || ['Password does not meet requirements'];
        toast({
          title: "Senha Inválida",
          description: Array.isArray(feedback) ? feedback.join(', ') : feedback,
          variant: "destructive",
        });
        return { error: { message: 'Password does not meet requirements' } as AuthError };
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
        await logSecurityEvent('PASSWORD_UPDATE_FAILED', user?.id, {
          error: error.message
        });
      } else {
        toast({
          title: "Senha atualizada!",
          description: "Sua senha foi alterada com sucesso.",
        });
        await logSecurityEvent('PASSWORD_UPDATED', user?.id, {
          updated_at: new Date().toISOString()
        });
      }

      return { error };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: { message: 'An unexpected error occurred' } as AuthError };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      isAccountLocked,
      sessionExpiresAt,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    sessionTimeout?: number;
  }
}
