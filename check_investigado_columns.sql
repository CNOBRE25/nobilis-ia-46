-- Script para verificar colunas do investigado na tabela processos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura atual da tabela processos
SELECT '=== ESTRUTURA ATUAL ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
AND column_name LIKE '%investigado%'
ORDER BY column_name;

-- 2. Verificar se as colunas específicas existem
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

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
            AND column_name = 'matricula_investigado'
        ) THEN '✅ Coluna matricula_investigado EXISTE'
        ELSE '❌ Coluna matricula_investigado NÃO EXISTE'
    END as status_matricula_investigado;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'processos'
            AND column_name = 'data_admissao'
        ) THEN '✅ Coluna data_admissao EXISTE'
        ELSE '❌ Coluna data_admissao NÃO EXISTE'
    END as status_data_admissao;

-- 3. Verificar dados de exemplo
SELECT '=== DADOS DE EXEMPLO ===' as info;

SELECT 
    id,
    numero_processo,
    nome_investigado,
    cargo_investigado,
    unidade_investigado,
    matricula_investigado,
    data_admissao,
    created_at
FROM public.processos
WHERE nome_investigado IS NOT NULL
LIMIT 5;

-- 4. Testar inserção de dados de investigado
SELECT '=== TESTE DE INSERÇÃO ===' as info;

-- Primeiro, vamos pegar um processo existente para testar
WITH processo_teste AS (
    SELECT id, numero_processo 
    FROM public.processos 
    WHERE nome_investigado IS NULL 
    LIMIT 1
)
UPDATE public.processos 
SET 
    nome_investigado = 'João Silva Teste',
    cargo_investigado = 'Cabo',
    unidade_investigado = '1º BPM',
    matricula_investigado = '12345',
    data_admissao = '2020-01-15'
WHERE id IN (SELECT id FROM processo_teste)
RETURNING id, numero_processo, nome_investigado, cargo_investigado, unidade_investigado, matricula_investigado, data_admissao;

-- 5. Verificar se a atualização funcionou
SELECT '=== VERIFICAÇÃO PÓS-TESTE ===' as info;

SELECT 
    id,
    numero_processo,
    nome_investigado,
    cargo_investigado,
    unidade_investigado,
    matricula_investigado,
    data_admissao
FROM public.processos
WHERE nome_investigado = 'João Silva Teste'; 