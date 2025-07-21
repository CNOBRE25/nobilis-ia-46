-- Script para adicionar colunas que podem estar faltando na tabela processos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura atual
SELECT '=== ESTRUTURA ATUAL ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
ORDER BY ordinal_position;

-- 2. Adicionar colunas que podem estar faltando
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS data_despacho TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS modus_operandi TEXT,
ADD COLUMN IF NOT EXISTS numero_sigpad VARCHAR(255),
ADD COLUMN IF NOT EXISTS status_funcional VARCHAR(100);

-- 3. Verificar se as colunas foram adicionadas
SELECT '=== ESTRUTURA APÓS ADIÇÃO ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
ORDER BY ordinal_position;

-- 4. Verificar se há dados na tabela
SELECT '=== CONTAGEM DE REGISTROS ===' as info;

SELECT COUNT(*) as total_processos FROM public.processos;

-- 5. Testar inserção de processo de exemplo
SELECT '=== TESTE DE INSERÇÃO ===' as info;

INSERT INTO public.processos (
    numero_processo,
    tipo_processo,
    prioridade,
    descricao_fatos,
    status,
    nome_investigado,
    cargo_investigado,
    unidade_investigado,
    vitima
) VALUES (
    'TEST-' || EXTRACT(EPOCH FROM NOW())::INTEGER,
    'investigacao_preliminar',
    'media',
    'Processo de teste para verificar funcionamento das colunas',
    'tramitacao',
    'João Silva',
    'Cabo',
    '1º BPM',
    'Maria Santos'
)
ON CONFLICT (numero_processo) DO NOTHING
RETURNING id, numero_processo, nome_investigado, vitima;

-- 6. Verificar se o processo foi inserido
SELECT '=== PROCESSO INSERIDO ===' as info;

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
WHERE numero_processo LIKE 'TEST-%'
ORDER BY created_at DESC
LIMIT 1;

-- 7. Mensagem de sucesso
SELECT '✅ Colunas da tabela processos verificadas e corrigidas com sucesso!' as status; 