-- NOBILIS-IA Security Fixes Migration
-- This migration removes all hardcoded passwords and implements proper security

-- 1. Remove the insecure password verification function
DROP FUNCTION IF EXISTS public.verify_user_credentials(TEXT, TEXT);

-- 2. Remove test users with fixed UUIDs
DELETE FROM public.users WHERE auth_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
);

-- 3. Add failed login attempts tracking
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_failed_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE;

-- 4. Create secure login attempt tracking function
CREATE OR REPLACE FUNCTION public.track_login_attempt(user_email TEXT, success BOOLEAN)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
  max_attempts INTEGER := 5;
  lockout_duration INTERVAL := '15 minutes';
BEGIN
  -- Get user record
  SELECT * INTO user_record FROM public.users WHERE email = user_email;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if account is currently locked
  IF user_record.account_locked_until IS NOT NULL AND user_record.account_locked_until > NOW() THEN
    RETURN FALSE;
  END IF;
  
  IF success THEN
    -- Reset failed attempts on successful login
    UPDATE public.users 
    SET failed_login_attempts = 0, 
        last_failed_login = NULL,
        account_locked_until = NULL
    WHERE email = user_email;
    
    -- Log successful login
    INSERT INTO public.audit_logs (event_type, user_id, metadata, created_at)
    VALUES ('LOGIN_SUCCESS', user_record.id, jsonb_build_object(
      'email', user_email,
      'timestamp', NOW()
    ), NOW());
    
    RETURN TRUE;
  ELSE
    -- Increment failed attempts
    UPDATE public.users 
    SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
        last_failed_login = NOW(),
        account_locked_until = CASE 
          WHEN COALESCE(failed_login_attempts, 0) + 1 >= max_attempts 
          THEN NOW() + lockout_duration
          ELSE NULL
        END
    WHERE email = user_email;
    
    -- Log failed login attempt
    INSERT INTO public.audit_logs (event_type, user_id, metadata, created_at)
    VALUES ('LOGIN_FAILED', user_record.id, jsonb_build_object(
      'email', user_email,
      'attempts', COALESCE(user_record.failed_login_attempts, 0) + 1,
      'locked', COALESCE(user_record.failed_login_attempts, 0) + 1 >= max_attempts,
      'timestamp', NOW()
    ), NOW());
    
    RETURN COALESCE(user_record.failed_login_attempts, 0) + 1 < max_attempts;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create session management table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index for session lookup
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- 6. Session cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  -- Remove expired sessions
  DELETE FROM public.user_sessions 
  WHERE expires_at < NOW() OR is_active = FALSE;
  
  -- Log cleanup
  INSERT INTO public.audit_logs (event_type, metadata, created_at)
  VALUES ('SESSION_CLEANUP', jsonb_build_object(
    'cleaned_at', NOW(),
    'type', 'expired_sessions'
  ), NOW());
END;
$$ LANGUAGE plpgsql;

-- 7. Function to validate session and update activity
CREATE OR REPLACE FUNCTION public.validate_session(token TEXT)
RETURNS TABLE(user_id UUID, email TEXT, role TEXT, valid BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.role::TEXT,
    (s.expires_at > NOW() AND s.is_active = TRUE) as valid
  FROM public.user_sessions s
  JOIN public.users u ON s.user_id = u.id
  WHERE s.session_token = token;
  
  -- Update last activity if session is valid
  UPDATE public.user_sessions 
  SET last_activity = NOW()
  WHERE session_token = token 
    AND expires_at > NOW() 
    AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Enhanced audit logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT NULL,
  ip_address INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    event_type, 
    user_id, 
    metadata, 
    ip_address, 
    user_agent,
    created_at
  ) VALUES (
    event_type,
    user_id,
    metadata,
    ip_address,
    user_agent,
    NOW()
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create proper admin user (will be configured via environment)
-- This will be handled by the application, not hardcoded

-- 10. Enable RLS on new tables
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- 11. Create policies for session table
CREATE POLICY "Users can only see their own sessions" ON public.user_sessions
  FOR SELECT USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can only delete their own sessions" ON public.user_sessions
  FOR DELETE USING (user_id = (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- 12. Create policy for admins to manage sessions
CREATE POLICY "Admins can manage all sessions" ON public.user_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- 13. Log the security fixes
INSERT INTO public.audit_logs (event_type, metadata, created_at)
VALUES ('SECURITY_FIXES_APPLIED', jsonb_build_object(
  'timestamp', NOW(),
  'fixes', jsonb_build_array(
    'Removed hardcoded passwords',
    'Implemented login attempt tracking',
    'Added session management',
    'Enhanced audit logging',
    'Removed test users'
  )
), NOW());

-- 14. Create function to check password strength (enhanced)
CREATE OR REPLACE FUNCTION public.validate_password_strength(password TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  score INTEGER := 0;
  feedback TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Initialize result
  result := jsonb_build_object('valid', false, 'score', 0, 'feedback', '[]'::jsonb);
  
  -- Check minimum length
  IF LENGTH(password) < 8 THEN
    feedback := array_append(feedback, 'Password must be at least 8 characters long');
  ELSE
    score := score + 1;
  END IF;
  
  -- Check for uppercase
  IF password !~ '[A-Z]' THEN
    feedback := array_append(feedback, 'Password must contain at least one uppercase letter');
  ELSE
    score := score + 1;
  END IF;
  
  -- Check for lowercase
  IF password !~ '[a-z]' THEN
    feedback := array_append(feedback, 'Password must contain at least one lowercase letter');
  ELSE
    score := score + 1;
  END IF;
  
  -- Check for numbers
  IF password !~ '[0-9]' THEN
    feedback := array_append(feedback, 'Password must contain at least one number');
  ELSE
    score := score + 1;
  END IF;
  
  -- Check for special characters
  IF password !~ '[^A-Za-z0-9]' THEN
    feedback := array_append(feedback, 'Password must contain at least one special character');
  ELSE
    score := score + 1;
  END IF;
  
  -- Check for common patterns
  IF password ~* '(password|123456|qwerty|admin)' THEN
    feedback := array_append(feedback, 'Password contains common patterns');
    score := score - 1;
  END IF;
  
  -- Build result
  result := jsonb_build_object(
    'valid', score >= 5,
    'score', score,
    'feedback', array_to_json(feedback)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql; 