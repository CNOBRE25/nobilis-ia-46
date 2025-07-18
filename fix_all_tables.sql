-- Script completo para corrigir todas as tabelas e funcionalidades do NOBILIS-IA
-- Execute este script no SQL Editor do Supabase

-- 1. Limpar tabelas existentes que podem estar causando conflitos
DROP TABLE IF EXISTS public.processos CASCADE;
DROP TABLE IF EXISTS public.cases CASCADE;
DROP TABLE IF EXISTS public.ai_analyses CASCADE;
DROP TABLE IF EXISTS public.user_consents CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- 2. Criar enums necessários
DO $$ BEGIN
    CREATE TYPE public.process_status AS ENUM ('tramitacao', 'concluido', 'arquivado', 'suspenso');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.process_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.process_type AS ENUM ('investigacao_preliminar', 'sindicancia', 'processo_administrativo', 'inquerito_policial_militar');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'lawyer', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Criar tabela users
CREATE TABLE public.users (
    id BIGSERIAL PRIMARY KEY,
    auth_id UUID UNIQUE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    nome_completo VARCHAR(200),
    matricula VARCHAR(50),
    cargo_funcao VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela processos (principal)
CREATE TABLE public.processos (
    id BIGSERIAL PRIMARY KEY,
    numero_processo VARCHAR(50) UNIQUE NOT NULL,
    tipo_processo VARCHAR(50) NOT NULL DEFAULT 'investigacao_preliminar',
    prioridade VARCHAR(20) NOT NULL DEFAULT 'media',
    numero_despacho VARCHAR(50),
    data_despacho TIMESTAMP WITH TIME ZONE,
    data_recebimento TIMESTAMP WITH TIME ZONE,
    data_fato TIMESTAMP WITH TIME ZONE,
    origem_processo VARCHAR(100),
    descricao_fatos TEXT NOT NULL,
    modus_operandi TEXT,
    diligencias_realizadas JSONB DEFAULT '{}',
    desfecho_final TEXT,
    redistribuicao TEXT,
    sugestoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'tramitacao',
    user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    nome_investigado VARCHAR(200),
    cargo_investigado VARCHAR(100),
    unidade_investigado VARCHAR(100),
    matricula_investigado VARCHAR(50),
    data_admissao DATE,
    vitima TEXT,
    numero_sigpad VARCHAR(50),
    crime_typing VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela ai_analyses
CREATE TABLE public.ai_analyses (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES public.processos(id) ON DELETE CASCADE,
    justificativa TEXT,
    prescricao TEXT,
    tipificacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela audit_logs
CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id VARCHAR(100),
    user_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    compliance_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Criar tabela user_consents
CREATE TABLE public.user_consents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(100),
    consent_type VARCHAR(100) NOT NULL,
    consent_given BOOLEAN NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis TEXT,
    consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    withdrawal_date TIMESTAMP WITH TIME ZONE,
    ip_address INET
);

-- 8. Criar tabela user_roles
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(100),
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Criar índices para performance
CREATE INDEX idx_processos_numero ON public.processos(numero_processo);
CREATE INDEX idx_processos_user_id ON public.processos(user_id);
CREATE INDEX idx_processos_status ON public.processos(status);
CREATE INDEX idx_processos_created_at ON public.processos(created_at);
CREATE INDEX idx_processos_tipo_processo ON public.processos(tipo_processo);
CREATE INDEX idx_processos_prioridade ON public.processos(prioridade);

CREATE INDEX idx_users_auth_id ON public.users(auth_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_ai_analyses_case_id ON public.ai_analyses(case_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- 10. Inserir usuários padrão
INSERT INTO public.users (
    auth_id, 
    username, 
    email, 
    password, 
    role, 
    nome_completo, 
    matricula, 
    cargo_funcao, 
    ativo
) VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'admin_crn',
        'crn.nobre@gmail.com',
        'admin123',
        'admin',
        'CRN Nobre - Administrador',
        'ADM001',
        'Administrador',
        true
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'advogado',
        'advogado@nobilis-ia.com',
        'advogado123',
        'lawyer',
        'Advogado do Sistema',
        'ADV001',
        'Advogado',
        true
    )
ON CONFLICT (auth_id) DO NOTHING;

-- 11. Inserir processos de teste
INSERT INTO public.processos (
    numero_processo,
    tipo_processo,
    prioridade,
    descricao_fatos,
    status,
    user_id,
    nome_investigado,
    cargo_investigado,
    unidade_investigado
) VALUES 
    (
        'IP-2025-001',
        'investigacao_preliminar',
        'alta',
        'Investigação preliminar sobre conduta inadequada de policial militar em serviço.',
        'tramitacao',
        (SELECT id FROM public.users WHERE email = 'crn.nobre@gmail.com'),
        'João Silva',
        'Cabo',
        '1º BPM'
    ),
    (
        'IP-2025-002',
        'investigacao_preliminar',
        'media',
        'Apuração de fatos relacionados a procedimento administrativo.',
        'tramitacao',
        (SELECT id FROM public.users WHERE email = 'advogado@nobilis-ia.com'),
        'Maria Santos',
        'Sargento',
        '2º BPM'
    ),
    (
        'IP-2025-003',
        'sindicancia',
        'baixa',
        'Sindicância para apurar denúncia de irregularidade.',
        'concluido',
        (SELECT id FROM public.users WHERE email = 'crn.nobre@gmail.com'),
        'Pedro Costa',
        'Tenente',
        '3º BPM'
    )
ON CONFLICT (numero_processo) DO NOTHING;

-- 12. Habilitar Row Level Security
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 13. Criar políticas RLS permissivas para desenvolvimento
-- Políticas para processos
CREATE POLICY "processos_select_policy" ON public.processos
    FOR SELECT USING (true);

CREATE POLICY "processos_insert_policy" ON public.processos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "processos_update_policy" ON public.processos
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "processos_delete_policy" ON public.processos
    FOR DELETE USING (true);

-- Políticas para users
CREATE POLICY "users_select_policy" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "users_insert_policy" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_policy" ON public.users
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "users_delete_policy" ON public.users
    FOR DELETE USING (true);

-- Políticas para ai_analyses
CREATE POLICY "ai_analyses_select_policy" ON public.ai_analyses
    FOR SELECT USING (true);

CREATE POLICY "ai_analyses_insert_policy" ON public.ai_analyses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "ai_analyses_update_policy" ON public.ai_analyses
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "ai_analyses_delete_policy" ON public.ai_analyses
    FOR DELETE USING (true);

-- Políticas para audit_logs
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
    FOR SELECT USING (true);

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- Políticas para user_consents
CREATE POLICY "user_consents_select_policy" ON public.user_consents
    FOR SELECT USING (true);

CREATE POLICY "user_consents_insert_policy" ON public.user_consents
    FOR INSERT WITH CHECK (true);

-- Políticas para user_roles
CREATE POLICY "user_roles_select_policy" ON public.user_roles
    FOR SELECT USING (true);

CREATE POLICY "user_roles_insert_policy" ON public.user_roles
    FOR INSERT WITH CHECK (true);

-- 14. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 15. Criar triggers para updated_at
CREATE TRIGGER update_processos_updated_at
    BEFORE UPDATE ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 16. Criar função para verificar credenciais do usuário
CREATE OR REPLACE FUNCTION public.verify_user_credentials(
    user_email TEXT,
    user_password TEXT
)
RETURNS TABLE (
    user_id BIGINT,
    user_role TEXT,
    user_email TEXT,
    user_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.role,
        u.email,
        u.nome_completo
    FROM public.users u
    WHERE u.email = user_email 
    AND u.password = user_password
    AND u.ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Criar função para verificar roles
CREATE OR REPLACE FUNCTION public.has_role(
    _user_id TEXT,
    _role app_role
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Verificar se tudo foi criado corretamente
SELECT '=== VERIFICAÇÃO DAS TABELAS ===' as info;

SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT '=== CONTAGEM DE REGISTROS ===' as info;

SELECT 'users' as tabela, COUNT(*) as total FROM public.users
UNION ALL
SELECT 'processos' as tabela, COUNT(*) as total FROM public.processos
UNION ALL
SELECT 'ai_analyses' as tabela, COUNT(*) as total FROM public.ai_analyses
UNION ALL
SELECT 'audit_logs' as tabela, COUNT(*) as total FROM public.audit_logs
UNION ALL
SELECT 'user_consents' as tabela, COUNT(*) as total FROM public.user_consents
UNION ALL
SELECT 'user_roles' as tabela, COUNT(*) as total FROM public.user_roles;

SELECT '=== ESTRUTURA DA TABELA PROCESSOS ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
ORDER BY ordinal_position;

SELECT '=== PROCESSOS DE TESTE ===' as info;

SELECT 
    id,
    numero_processo,
    tipo_processo,
    prioridade,
    status,
    nome_investigado,
    created_at
FROM public.processos
ORDER BY created_at DESC;

SELECT '=== CONFIGURAÇÃO CONCLUÍDA COM SUCESSO! ===' as status; 