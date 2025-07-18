-- Script para configurar NOVO projeto Supabase - NOBILIS-IA
-- Execute este script no SQL Editor do novo projeto Supabase

-- 1. Criar tabela users
CREATE TABLE public.users (
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

-- 2. Criar tabela processos
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Criar índices para performance
CREATE INDEX idx_processos_numero ON public.processos(numero_processo);
CREATE INDEX idx_processos_user_id ON public.processos(user_id);
CREATE INDEX idx_processos_status ON public.processos(status);
CREATE INDEX idx_processos_created_at ON public.processos(created_at);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_auth_id ON public.users(auth_id);

-- 4. Inserir usuário admin
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
);

-- 5. Inserir usuário advogado
INSERT INTO public.users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'advogado',
    'advogado@nobilis-ia.com',
    'advogado',
    'Advogado do Sistema',
    'ADV001',
    'Advogado',
    true
);

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas permissivas para desenvolvimento
CREATE POLICY "processos_all_policy" ON public.processos
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "users_all_policy" ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 8. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Criar triggers para atualizar updated_at
CREATE TRIGGER update_processos_updated_at
    BEFORE UPDATE ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Testar inserção de processo
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
    'Processo de teste para verificar funcionamento',
    'tramitacao',
    1
);

-- 11. Verificar se tudo funcionou
SELECT 'Novo Supabase configurado com sucesso!' as status;
SELECT COUNT(*) as total_users FROM public.users;
SELECT COUNT(*) as total_processos FROM public.processos;

-- 12. Limpar processo de teste
DELETE FROM public.processos WHERE numero_processo = 'TEST-001'; 