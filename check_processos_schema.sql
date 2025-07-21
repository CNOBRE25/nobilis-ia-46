-- Script para verificar a estrutura atual da tabela processos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela processos existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
        ) THEN '✅ Tabela processos EXISTE'
        ELSE '❌ Tabela processos NÃO EXISTE'
    END as status_tabela;

-- 2. Verificar estrutura completa da tabela processos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
ORDER BY ordinal_position;

-- 3. Verificar se as colunas investigados e vitimas existem
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
            AND column_name = 'investigados'
        ) THEN '✅ Coluna investigados EXISTE'
        ELSE '❌ Coluna investigados NÃO EXISTE'
    END as status_investigados;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
            AND column_name = 'vitimas'
        ) THEN '✅ Coluna vitimas EXISTE'
        ELSE '❌ Coluna vitimas NÃO EXISTE'
    END as status_vitimas;

-- 4. Verificar se as colunas individuais de investigado existem
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
            AND column_name = 'nome_investigado'
        ) THEN '✅ Coluna nome_investigado EXISTE'
        ELSE '❌ Coluna nome_investigado NÃO EXISTE'
    END as status_nome_investigado;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
            AND column_name = 'cargo_investigado'
        ) THEN '✅ Coluna cargo_investigado EXISTE'
        ELSE '❌ Coluna cargo_investigado NÃO EXISTE'
    END as status_cargo_investigado;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
            AND column_name = 'unidade_investigado'
        ) THEN '✅ Coluna unidade_investigado EXISTE'
        ELSE '❌ Coluna unidade_investigado NÃO EXISTE'
    END as status_unidade_investigado;

-- 5. Verificar se a coluna vitima (singular) existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
            AND column_name = 'vitima'
        ) THEN '✅ Coluna vitima EXISTE'
        ELSE '❌ Coluna vitima NÃO EXISTE'
    END as status_vitima;

-- 6. Mostrar dados de exemplo se existirem
SELECT '=== DADOS DE EXEMPLO ===' as info;

SELECT 
    id,
    numero_processo,
    tipo_processo,
    prioridade,
    status,
    nome_investigado,
    cargo_investigado,
    unidade_investigado,
    vitima,
    created_at
FROM public.processos
LIMIT 3; 