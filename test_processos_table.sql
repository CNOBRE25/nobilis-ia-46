-- Script para testar especificamente a tabela de processos
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

-- 2. Verificar estrutura da tabela processos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT 
    COUNT(*) as total_processos,
    COUNT(CASE WHEN status = 'tramitacao' THEN 1 END) as em_tramitacao,
    COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos
FROM public.processos;

-- 4. Verificar políticas RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'processos'
ORDER BY policyname;

-- 5. Testar inserção de processo
INSERT INTO public.processos (
    numero_processo,
    tipo_processo,
    prioridade,
    descricao_fatos,
    status,
    nome_investigado,
    cargo_investigado,
    unidade_investigado
) VALUES (
    'TEST-' || EXTRACT(EPOCH FROM NOW())::INTEGER,
    'investigacao_preliminar',
    'media',
    'Processo de teste para verificar funcionamento da tabela',
    'tramitacao',
    'Teste Silva',
    'Cabo',
    '1º BPM'
)
ON CONFLICT (numero_processo) DO NOTHING
RETURNING id, numero_processo, created_at;

-- 6. Verificar se o processo foi inserido
SELECT 
    id,
    numero_processo,
    tipo_processo,
    prioridade,
    status,
    nome_investigado,
    created_at
FROM public.processos
WHERE numero_processo LIKE 'TEST-%'
ORDER BY created_at DESC
LIMIT 5;

-- 7. Limpar processos de teste
DELETE FROM public.processos 
WHERE numero_processo LIKE 'TEST-%';

-- 8. Verificar usuários disponíveis
SELECT 
    id,
    email,
    role,
    nome_completo,
    ativo
FROM public.users
ORDER BY id;

-- 9. Testar função de verificação de credenciais
SELECT * FROM public.verify_user_credentials('crn.nobre@gmail.com', 'admin123');

-- 10. Resumo final
SELECT 
    '=== RESUMO DO TESTE ===' as info,
    (SELECT COUNT(*) FROM public.processos) as total_processos,
    (SELECT COUNT(*) FROM public.users) as total_usuarios,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'processos') as total_politicas_rls; 