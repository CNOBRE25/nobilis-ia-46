-- Script SIMPLES para criar a tabela processos
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela processos
CREATE TABLE IF NOT EXISTS public.processos (
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
    user_id BIGINT,
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

-- 2. Criar tabela users se não existir
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    auth_id UUID UNIQUE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    nome_completo VARCHAR(200),
    matricula VARCHAR(50),
    cargo_funcao VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Inserir usuário admin
INSERT INTO public.users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin_crn',
    'crn.nobre@gmail.com',
    'admin',
    'CRN Nobre - Administrador',
    'ADM001',
    'Administrador',
    true
)
ON CONFLICT (auth_id) DO NOTHING;

-- 4. Desabilitar RLS temporariamente
ALTER TABLE public.processos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 5. Testar inserção
INSERT INTO public.processos (
    numero_processo,
    tipo_processo,
    prioridade,
    descricao_fatos,
    status,
    user_id
) VALUES (
    'TEST-001',
    'investigacao_preliminar',
    'media',
    'Processo de teste',
    'tramitacao',
    1
)
ON CONFLICT (numero_processo) DO NOTHING;

-- 6. Verificar se funcionou
SELECT 'SUCESSO: Tabela processos criada!' as resultado;
SELECT COUNT(*) as total_processos FROM public.processos;
SELECT COUNT(*) as total_users FROM public.users;

-- 7. Limpar teste
DELETE FROM public.processos WHERE numero_processo = 'TEST-001'; 