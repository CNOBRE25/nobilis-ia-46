
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
// import { Database } from '@/integrations/supabase/types';

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
      // Simplificar para evitar problemas de tipos
      setProfile({
        id: user?.id || '',
        username: user?.email?.split('@')[0] || '',
        email: user?.email || '',
        role: 'lawyer', // Temporário
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        nome_completo: null,
        matricula: null,
        cargo_funcao: null,
        ativo: true
      });
      
      /*const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        setProfile({
          id: data.id.toString(),
          username: data.username,
          email: data.email,
          role: data.role as UserRole,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          nome_completo: null,
          matricula: null,
          cargo_funcao: null,
          ativo: true
        });
      }*/
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!profile) return false;
    
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
    hasRole,
    isAdmin,
    isLawyer,
    isClient,
    refreshProfile: fetchUserProfile
  };
};
