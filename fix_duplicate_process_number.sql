-- Script para verificar e corrigir problemas de chave duplicada na tabela processos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há números de processo duplicados
SELECT '=== VERIFICANDO DUPLICATAS ===' as info;

SELECT 
    numero_processo,
    COUNT(*) as quantidade,
    array_agg(id) as ids,
    array_agg(created_at) as datas_criacao
FROM public.processos 
GROUP BY numero_processo 
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 2. Verificar todos os números de processo existentes
SELECT '=== TODOS OS NÚMEROS DE PROCESSO ===' as info;

SELECT 
    numero_processo,
    id,
    created_at,
    status
FROM public.processos 
ORDER BY numero_processo, created_at;

-- 3. Verificar se há números de processo vazios ou nulos
SELECT '=== VERIFICANDO NÚMEROS VAZIOS ===' as info;

SELECT 
    id,
    numero_processo,
    created_at
FROM public.processos 
WHERE numero_processo IS NULL 
   OR numero_processo = '' 
   OR TRIM(numero_processo) = '';

-- 4. Criar função para gerar número único de processo
CREATE OR REPLACE FUNCTION generate_unique_process_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 1;
    year_suffix TEXT;
BEGIN
    -- Obter o ano atual
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Tentar gerar um número único
    LOOP
        new_number := 'IP-' || year_suffix || '-' || LPAD(counter::TEXT, 3, '0');
        
        -- Verificar se já existe
        IF NOT EXISTS (SELECT 1 FROM public.processos WHERE numero_processo = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        
        -- Evitar loop infinito
        IF counter > 9999 THEN
            RAISE EXCEPTION 'Não foi possível gerar um número único de processo';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Função para corrigir números duplicados
CREATE OR REPLACE FUNCTION fix_duplicate_process_numbers()
RETURNS TEXT AS $$
DECLARE
    rec RECORD;
    new_number TEXT;
    fixed_count INTEGER := 0;
BEGIN
    -- Para cada número duplicado, manter o primeiro e renomear os demais
    FOR rec IN 
        SELECT numero_processo, array_agg(id ORDER BY created_at) as ids
        FROM public.processos 
        GROUP BY numero_processo 
        HAVING COUNT(*) > 1
    LOOP
        -- Manter o primeiro ID (mais antigo) e renomear os demais
        FOR i IN 2..array_length(rec.ids, 1) LOOP
            new_number := generate_unique_process_number();
            
            UPDATE public.processos 
            SET numero_processo = new_number
            WHERE id = rec.ids[i];
            
            fixed_count := fixed_count + 1;
        END LOOP;
    END LOOP;
    
    RETURN 'Processos corrigidos: ' || fixed_count;
END;
$$ LANGUAGE plpgsql;

-- 6. Executar correção (descomente se necessário)
-- SELECT fix_duplicate_process_numbers();

-- 7. Verificar novamente após correção
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    numero_processo,
    COUNT(*) as quantidade
FROM public.processos 
GROUP BY numero_processo 
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 8. Mostrar estatísticas da tabela
SELECT '=== ESTATÍSTICAS ===' as info;

SELECT 
    COUNT(*) as total_processos,
    COUNT(DISTINCT numero_processo) as numeros_unicos,
    COUNT(*) - COUNT(DISTINCT numero_processo) as duplicatas,
    MIN(created_at) as processo_mais_antigo,
    MAX(created_at) as processo_mais_recente
FROM public.processos;

-- 9. Verificar estrutura da constraint UNIQUE
SELECT '=== VERIFICANDO CONSTRAINT UNIQUE ===' as info;

SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'processos' 
    AND tc.constraint_type = 'UNIQUE'
    AND kcu.column_name = 'numero_processo';

-- 10. Instruções para resolver o problema
SELECT '=== INSTRUÇÕES PARA RESOLVER ===' as info;

SELECT 
    '1. Se houver duplicatas, execute: SELECT fix_duplicate_process_numbers();' as instrucao_1,
    '2. Para adicionar constraint UNIQUE se não existir:' as instrucao_2,
    '   ALTER TABLE public.processos ADD CONSTRAINT uk_processos_numero UNIQUE (numero_processo);' as comando_2,
    '3. Para verificar se a constraint está funcionando:' as instrucao_3,
    '   INSERT INTO public.processos (numero_processo, descricao_fatos) VALUES (''TESTE-DUPLICATA'', ''teste'');' as comando_3; 