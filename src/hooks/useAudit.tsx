
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AuditEventType = 
  | 'SIGN_IN' 
  | 'SIGN_OUT' 
  | 'SIGN_UP' 
  | 'SIGN_IN_FAILED'
  | 'SIGN_UP_SUCCESS'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_UPDATED'
  | 'OPINION_CREATED'
  | 'OPINION_UPDATED'
  | 'OPINION_DELETED'
  | 'USER_ROLE_CHANGED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_DELETED';

interface AuditLog {
  id: string;
  event_type: AuditEventType;
  user_id?: string;
  target_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useAudit = () => {
  const { user } = useAuth();

  const logEvent = async (
    eventType: AuditEventType,
    targetId?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const auditData = {
        event_type: eventType,
        user_id: user?.id,
        target_id: targetId,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_email: user?.email,
        },
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert(auditData);

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  const getAuditLogs = async (
    limit: number = 100,
    eventType?: AuditEventType,
    userId?: string
  ): Promise<AuditLog[]> => {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  return {
    logEvent,
    getAuditLogs,
  };
};
