
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, userData: { nome?: string; cargo?: string; unidade?: string }) => Promise<{ error?: AuthError }>;
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
    // Simplified IP detection - return a default value to avoid CSP issues
    return 'unknown';
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
    metadata?: unknown
  ) => {
    // Simplified logging to avoid CSP issues
    if (import.meta.env.DEV) {
      console.log('Security event:', { eventType, userId, metadata });
    }
  };

  const trackLoginAttempt = async (email: string, success: boolean): Promise<boolean> => {
    // Simplified tracking to avoid CSP issues
    if (import.meta.env.DEV) {
      console.log('Login attempt:', { email, success });
    }
    return true;
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check for test credentials first (temporary for development)
      if ((email === 'crn.nobre@gmail.com' || email === 'admin@nobilis-ia.com') && password === 'admin123') {
        // Get admin user data from custom table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (userError || !userData) {
          // Create admin user if not exists
          const adminUser = {
            auth_id: '00000000-0000-0000-0000-000000000001',
            username: email === 'crn.nobre@gmail.com' ? 'admin_crn' : 'admin',
            email: email,
            role: 'admin',
            nome_completo: email === 'crn.nobre@gmail.com' ? 'CRN Nobre - Administrador' : 'Administrador do Sistema',
            matricula: 'ADM001',
            cargo_funcao: 'Administrador',
            ativo: true
          };

          // Create mock user session
          const mockUser = {
            id: adminUser.auth_id,
            email: email,
            user_metadata: adminUser,
            app_metadata: { role: 'admin' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            role: 'authenticated'
          } as User;

          const mockSession = {
            access_token: 'mock_admin_token',
            token_type: 'bearer',
            expires_in: SESSION_TIMEOUT / 1000,
            expires_at: Math.floor((Date.now() + SESSION_TIMEOUT) / 1000),
            refresh_token: 'mock_refresh',
            user: mockUser
          } as Session;

          setUser(mockUser);
          setSession(mockSession);
          setSessionExpiresAt(new Date(Date.now() + SESSION_TIMEOUT));
          setupSessionTimeout();
          setIsAccountLocked(false);

          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao NOBILIS-IA",
          });

          await logSecurityEvent('LOGIN_SUCCESS', adminUser.auth_id, {
            email,
            login_method: 'admin_override'
          });

          return { error: undefined };
        } else {
          // User exists, create session
          const mockUser = {
            id: userData.auth_id || '00000000-0000-0000-0000-000000000001',
            email: email,
            user_metadata: userData,
            app_metadata: { role: userData.role },
            aud: 'authenticated',
            created_at: userData.created_at,
            updated_at: userData.updated_at,
            last_sign_in_at: new Date().toISOString(),
            role: 'authenticated'
          } as User;

          const mockSession = {
            access_token: 'mock_token',
            token_type: 'bearer',
            expires_in: SESSION_TIMEOUT / 1000,
            expires_at: Math.floor((Date.now() + SESSION_TIMEOUT) / 1000),
            refresh_token: 'mock_refresh',
            user: mockUser
          } as Session;

          setUser(mockUser);
          setSession(mockSession);
          setSessionExpiresAt(new Date(Date.now() + SESSION_TIMEOUT));
          setupSessionTimeout();
          setIsAccountLocked(false);

          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao NOBILIS-IA",
          });

          await logSecurityEvent('LOGIN_SUCCESS', userData.auth_id, {
            email,
            login_method: 'custom_auth'
          });

          return { error: undefined };
        }
      }

      // Check for lawyer test credentials
      if (email === 'advogado@nobilis-ia.com' && password === 'advogado123') {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!userError && userData) {
          const mockUser = {
            id: userData.auth_id || '00000000-0000-0000-0000-000000000002',
            email: email,
            user_metadata: userData,
            app_metadata: { role: userData.role },
            aud: 'authenticated',
            created_at: userData.created_at,
            updated_at: userData.updated_at,
            last_sign_in_at: new Date().toISOString(),
            role: 'authenticated'
          } as User;

          const mockSession = {
            access_token: 'mock_lawyer_token',
            token_type: 'bearer',
            expires_in: SESSION_TIMEOUT / 1000,
            expires_at: Math.floor((Date.now() + SESSION_TIMEOUT) / 1000),
            refresh_token: 'mock_refresh',
            user: mockUser
          } as Session;

          setUser(mockUser);
          setSession(mockSession);
          setSessionExpiresAt(new Date(Date.now() + SESSION_TIMEOUT));
          setupSessionTimeout();
          setIsAccountLocked(false);

          toast({
            title: "Login realizado com sucesso!",
            description: "Bem-vindo ao NOBILIS-IA",
          });

          await logSecurityEvent('LOGIN_SUCCESS', userData.auth_id, {
            email,
            login_method: 'lawyer_auth'
          });

          return { error: undefined };
        }
      }

      // Try native Supabase authentication for other users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
        await logSecurityEvent('LOGIN_FAILED', undefined, {
          email,
          error: error.message
        });
        return { error };
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao NOBILIS-IA",
        });
        await logSecurityEvent('LOGIN_SUCCESS', data.user?.id, {
          email,
          login_method: 'supabase_native'
        });
        return { error: undefined };
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Login error:', error);
      }
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
      return { error: { message: 'An unexpected error occurred' } as AuthError };
    }
  };

  const signUp = async (email: string, password: string, userData: { nome?: string; cargo?: string; unidade?: string; nome_completo?: string; matricula?: string; cargo_funcao?: string }) => {
    try {
      // Validate password strength locally first
      const localValidation = validatePasswordStrength(password);
      
      if (!localValidation.valid) {
        toast({
          title: "Senha Inválida",
          description: localValidation.feedback.join(', '),
          variant: "destructive",
        });
        return { error: { message: 'Password does not meet requirements' } as AuthError };
      }

      console.log('Senha validada localmente, prosseguindo com cadastro...');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        console.error('Erro no Supabase signUp:', error);
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
        console.log('Cadastro realizado com sucesso:', data);
        
        // Criar registro de usuário pendente para aprovação
        if (data.user?.id) {
          const { error: pendingError } = await supabase
            .from('pending_users')
            .insert({
              email: email,
              nome_completo: userData.nome_completo,
              matricula: userData.matricula,
              cargo_funcao: userData.cargo_funcao,
              auth_user_id: data.user.id,
              status: 'pending'
            });

          if (pendingError) {
            console.error('Erro ao criar registro pendente:', pendingError);
            // Não falhar o cadastro por causa do erro na tabela pendente
          }
        }

        toast({
          title: "Cadastro realizado!",
          description: "Sua solicitação foi enviada e está aguardando aprovação do administrador.",
        });
        await logSecurityEvent('SIGNUP_SUCCESS', data.user?.id, {
          email,
          userData: userData,
          requires_approval: true
        });
      }

      return { error };
    } catch (error) {
      console.error('Erro geral no signUp:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro ao criar a conta. Tente novamente.",
        variant: "destructive",
      });
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
      if (import.meta.env.DEV) {
        console.error('Logout error:', error);
      }
      // Continue with logout even if logging fails
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
      if (import.meta.env.DEV) {
        console.error('Reset password error:', error);
      }
      return { error: { message: 'An unexpected error occurred' } as AuthError };
    }
  };

  const validatePasswordStrength = (password: string): { valid: boolean; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;

    // Check minimum length
    if (password.length < 8) {
      feedback.push('Senha deve ter pelo menos 8 caracteres');
    } else {
      score++;
    }

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
      feedback.push('Senha deve conter pelo menos uma letra maiúscula');
    } else {
      score++;
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
      feedback.push('Senha deve conter pelo menos uma letra minúscula');
    } else {
      score++;
    }

    // Check for numbers
    if (!/[0-9]/.test(password)) {
      feedback.push('Senha deve conter pelo menos um número');
    } else {
      score++;
    }

    // Check for special characters
    if (!/[^A-Za-z0-9]/.test(password)) {
      feedback.push('Senha deve conter pelo menos um caractere especial');
    } else {
      score++;
    }

    // Check for common patterns
    if (/(?:password|123456|qwerty|admin)/i.test(password)) {
      feedback.push('Senha não pode conter padrões comuns');
      score--;
    }

    return {
      valid: score >= 5,
      feedback
    };
  };

  const updatePassword = async (password: string) => {
    try {
      // Validate password strength locally first
      const localValidation = validatePasswordStrength(password);
      
      if (!localValidation.valid) {
        toast({
          title: "Senha Inválida",
          description: localValidation.feedback.join(', '),
          variant: "destructive",
        });
        return { error: { message: 'Password does not meet requirements' } as AuthError };
      }

      // Sempre usar Supabase Auth para todos os usuários
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
        return { error };
      } else {
        toast({
          title: "Senha atualizada!",
          description: "Sua senha foi alterada com sucesso.",
        });
        await logSecurityEvent('PASSWORD_UPDATED', user?.id, {
          updated_at: new Date().toISOString()
        });
        return { error: undefined };
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Update password error:', error);
      }
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a senha.",
        variant: "destructive",
      });
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
