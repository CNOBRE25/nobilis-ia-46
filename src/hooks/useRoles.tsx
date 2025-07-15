
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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else {
        setProfile(data);
      }
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
