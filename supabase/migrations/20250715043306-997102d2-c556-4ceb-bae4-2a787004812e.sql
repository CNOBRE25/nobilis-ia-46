-- Implementação de políticas de segurança conforme legislação brasileira
-- LGPD (Lei Geral de Proteção de Dados), Código Penal e legislação de ferramentas de IA

-- 1. Tabela de auditoria para logs de segurança (LGPD Art. 46)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  compliance_reason TEXT
);

-- 2. Tabela de consentimento LGPD
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'data_processing', 'cookies', 'marketing', etc.
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMPTZ DEFAULT now(),
  withdrawal_date TIMESTAMPTZ,
  ip_address INET,
  legal_basis TEXT, -- Base legal LGPD (Art. 7)
  purpose TEXT NOT NULL, -- Finalidade específica
  UNIQUE(user_id, consent_type)
);

-- 3. Tabela de políticas de retenção de dados
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  retention_period_months INTEGER NOT NULL,
  deletion_criteria TEXT,
  legal_basis TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Função para anonimizar dados sensíveis
CREATE OR REPLACE FUNCTION public.anonymize_sensitive_data(data_text TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Substituir CPF por asteriscos mantendo formato
  data_text := regexp_replace(data_text, '\d{3}\.\d{3}\.\d{3}-\d{2}', '***.***.***-**', 'g');
  -- Substituir emails mantendo domínio
  data_text := regexp_replace(data_text, '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', '***@\2', 'g');
  -- Substituir telefones
  data_text := regexp_replace(data_text, '\(\d{2}\)\s*\d{4,5}-\d{4}', '(**) ****-****', 'g');
  RETURN data_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função de auditoria automática
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    compliance_reason
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'Criação de registro - LGPD Art. 9'
      WHEN TG_OP = 'UPDATE' THEN 'Atualização de dados - LGPD Art. 16'
      WHEN TG_OP = 'DELETE' THEN 'Exclusão de dados - LGPD Art. 18'
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Aplicar triggers de auditoria nas tabelas sensíveis
DROP TRIGGER IF EXISTS audit_cases_trigger ON public.cases;
CREATE TRIGGER audit_cases_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_users_trigger ON public.users;
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- 7. Políticas RLS para auditoria (somente admins podem ver logs)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 8. Políticas para consentimentos (usuários só veem os próprios)
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own consents" ON public.user_consents
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own consents" ON public.user_consents
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own consents" ON public.user_consents
  FOR UPDATE USING (user_id = auth.uid());

-- 9. Inserir políticas de retenção padrão
INSERT INTO public.data_retention_policies (table_name, retention_period_months, deletion_criteria, legal_basis) VALUES
  ('cases', 60, 'Após encerramento do processo', 'LGPD Art. 16 - Código de Processo Penal Art. 792'),
  ('audit_logs', 60, 'Para fins de controle e fiscalização', 'LGPD Art. 37 - Marco Civil da Internet'),
  ('user_consents', 60, 'Registro de consentimento', 'LGPD Art. 8§5')
ON CONFLICT DO NOTHING;

-- 10. Inserir consentimentos obrigatórios para conformidade
INSERT INTO public.user_consents (user_id, consent_type, consent_given, legal_basis, purpose)
SELECT 
  au.id,
  'data_processing',
  true,
  'LGPD Art. 7, VI - exercício regular de direitos',
  'Processamento de dados para investigação criminal'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_consents uc 
  WHERE uc.user_id = au.id AND uc.consent_type = 'data_processing'
);

-- 11. Função para verificar conformidade LGPD
CREATE OR REPLACE FUNCTION public.check_lgpd_compliance()
RETURNS TABLE (
  table_name TEXT,
  compliance_status TEXT,
  recommendations TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH retention_check AS (
    SELECT 
      drp.table_name,
      drp.retention_period_months,
      CASE 
        WHEN drp.retention_period_months <= 60 THEN 'CONFORME'
        ELSE 'REVISAR'
      END as status
    FROM public.data_retention_policies drp
  )
  SELECT 
    rc.table_name,
    rc.status,
    CASE 
      WHEN rc.status = 'REVISAR' THEN 'Período de retenção pode exceder limites LGPD'
      ELSE 'Política de retenção adequada'
    END
  FROM retention_check rc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;