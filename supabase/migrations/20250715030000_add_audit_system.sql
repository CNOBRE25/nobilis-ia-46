
-- Adicionar tabela de logs de auditoria
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES public.users(id),
  target_id UUID,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem todos os logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política para usuários visualizarem seus próprios logs
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  );

-- Política para inserir logs de auditoria
CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Atualizar tabela de usuários para incluir dados do perfil
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nome_completo VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS matricula VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS cargo_funcao VARCHAR(100);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT false;

-- Criar índices adicionais
CREATE INDEX IF NOT EXISTS idx_users_matricula ON public.users(matricula);
CREATE INDEX IF NOT EXISTS idx_users_ativo ON public.users(ativo);

-- Função para configurar políticas de senha
CREATE OR REPLACE FUNCTION public.check_password_strength(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Mínimo 8 caracteres
  IF LENGTH(password) < 8 THEN
    RETURN FALSE;
  END IF;
  
  -- Pelo menos uma letra maiúscula
  IF password !~ '[A-Z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Pelo menos uma letra minúscula
  IF password !~ '[a-z]' THEN
    RETURN FALSE;
  END IF;
  
  -- Pelo menos um número
  IF password !~ '[0-9]' THEN
    RETURN FALSE;
  END IF;
  
  -- Pelo menos um caractere especial
  IF password !~ '[^A-Za-z0-9]' THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Trigger para log automático de alterações em usuários
CREATE OR REPLACE FUNCTION public.log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Log mudanças de role
    IF OLD.role != NEW.role THEN
      INSERT INTO public.audit_logs (event_type, user_id, target_id, metadata)
      VALUES ('USER_ROLE_CHANGED', NEW.id, NEW.id, 
              jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role));
    END IF;
    
    -- Log ativação/desativação
    IF OLD.ativo != NEW.ativo THEN
      INSERT INTO public.audit_logs (event_type, user_id, target_id, metadata)
      VALUES (CASE WHEN NEW.ativo THEN 'USER_ACTIVATED' ELSE 'USER_DEACTIVATED' END, 
              NEW.id, NEW.id, jsonb_build_object('status', NEW.ativo));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
CREATE TRIGGER trigger_log_user_changes
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_changes();

-- Política de retenção de logs (opcional - manter logs por 2 anos)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Agendar limpeza automática (exemplo - executar mensalmente)
-- Nota: Isso requer extensão pg_cron que pode não estar disponível em todos os ambientes
-- SELECT cron.schedule('cleanup-audit-logs', '0 0 1 * *', 'SELECT public.cleanup_old_audit_logs();');
