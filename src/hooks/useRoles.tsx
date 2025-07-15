
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'lawyer' | 'client';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  nome_completo: string | null;
  matricula: string | null;
  cargo_funcao: string | null;
  ativo: boolean | null;
}

export const useRoles = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For custom auth, use user metadata or email lookup
      if (user?.user_metadata) {
        // User data is already in the metadata from custom auth
        const userData = user.user_metadata;
        setProfile({
          id: user.id,
          username: userData.username || user.email?.split('@')[0] || '',
          email: user.email || '',
          role: (userData.role || user.app_metadata?.role) as UserRole,
          created_at: userData.created_at || user.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || user.updated_at || new Date().toISOString(),
          nome_completo: userData.nome_completo,
          matricula: userData.matricula,
          cargo_funcao: userData.cargo_funcao,
          ativo: userData.ativo !== false
        });
      } else {
        // Fallback: lookup by email
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', user?.email)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setError('Failed to fetch user profile');
          
          // Create temporary profile for development
          if (user?.email) {
            const tempProfile: UserProfile = {
              id: user.id,
              username: user.email.split('@')[0],
              email: user.email,
              role: user.email.includes('admin') ? 'admin' : 'lawyer',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              nome_completo: null,
              matricula: null,
              cargo_funcao: null,
              ativo: true
            };
            setProfile(tempProfile);
          }
        } else if (data) {
          setProfile({
            id: data.id?.toString() || user?.id || '',
            username: data.username,
            email: data.email,
            role: data.role as UserRole,
            created_at: data.created_at,
            updated_at: data.updated_at,
            nome_completo: data.nome_completo,
            matricula: data.matricula,
            cargo_funcao: data.cargo_funcao,
            ativo: data.ativo
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!profile || !profile.ativo) return false;
    
    const roleHierarchy = {
      admin: 3,
      lawyer: 2,
      client: 1
    };

    return roleHierarchy[profile.role] >= roleHierarchy[requiredRole];
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isLawyer = (): boolean => hasRole('lawyer');
  const isClient = (): boolean => hasRole('client');

  return {
    profile,
    loading,
    error,
    hasRole,
    isAdmin,
    isLawyer,
    isClient,
    refreshProfile: fetchUserProfile
  };
};
