-- Corrigir estrutura e implementar políticas de segurança conforme legislação brasileira

-- 1. Criar tipo de role e tabela user_roles
CREATE TYPE IF NOT EXISTS public.app_role AS ENUM ('admin', 'lawyer', 'client');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- 2. Tabela de auditoria para logs de segurança (LGPD Art. 46)
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

-- 3. Tabela de consentimento LGPD
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMPTZ DEFAULT now(),
  withdrawal_date TIMESTAMPTZ,
  ip_address INET,
  legal_basis TEXT,
  purpose TEXT NOT NULL,
  UNIQUE(user_id, consent_type)
);

-- 4. Tabela de políticas de retenção de dados
CREATE TABLE IF NOT EXISTS public.data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  retention_period_months INTEGER NOT NULL,
  deletion_criteria TEXT,
  legal_basis TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Inserir usuário admin padrão
INSERT INTO public.user_roles (user_id, role, assigned_by)
SELECT 
  au.id,
  'admin'::app_role,
  au.id
FROM auth.users au
WHERE au.email = 'admin@nobilis-ia.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. Habilitar RLS nas tabelas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- 7. Criar função para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 8. Políticas RLS básicas
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own consents" ON public.user_consents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own consents" ON public.user_consents
  FOR ALL USING (user_id = auth.uid());