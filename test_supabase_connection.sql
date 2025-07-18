-- Script para testar conexão e verificar tabelas
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se estamos conectados
SELECT 'Conexão OK' as status;

-- 2. Listar todas as tabelas do schema public
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Verificar se a tabela processos existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
        ) THEN 'Tabela processos EXISTE'
        ELSE 'Tabela processos NÃO EXISTE'
    END as status_processos;

-- 4. Verificar se a tabela users existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
        ) THEN 'Tabela users EXISTE'
        ELSE 'Tabela users NÃO EXISTE'
    END as status_users;

-- 5. Tentar criar a tabela processos se não existir
CREATE TABLE IF NOT EXISTS public.processos (
    id BIGSERIAL PRIMARY KEY,
    numero_processo VARCHAR(50) UNIQUE NOT NULL,
    tipo_processo VARCHAR(50) NOT NULL DEFAULT 'investigacao_preliminar',
    prioridade VARCHAR(20) NOT NULL DEFAULT 'media',
    descricao_fatos TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'tramitacao',
    user_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Verificar novamente se foi criada
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
        ) THEN 'Tabela processos CRIADA COM SUCESSO'
        ELSE 'ERRO: Tabela processos não foi criada'
    END as resultado_final;

-- 7. Testar inserção simples
INSERT INTO public.processos (
    numero_processo,
    tipo_processo,
    prioridade,
    descricao_fatos,
    status
) VALUES (
    'TEST-SIMPLE',
    'investigacao_preliminar',
    'media',
    'Teste de inserção simples',
    'tramitacao'
)
ON CONFLICT (numero_processo) DO NOTHING;

-- 8. Verificar se inseriu
SELECT COUNT(*) as total_processos FROM public.processos;

-- 9. Limpar teste
DELETE FROM public.processos WHERE numero_processo = 'TEST-SIMPLE'; 