-- Script RÁPIDO para verificar e corrigir números duplicados de processo
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se há duplicatas
SELECT '=== VERIFICANDO DUPLICATAS ===' as info;

SELECT 
    numero_processo,
    COUNT(*) as quantidade
FROM public.processos 
GROUP BY numero_processo 
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 2. Se houver duplicatas, corrigir automaticamente
DO $$
DECLARE
    rec RECORD;
    new_number TEXT;
    counter INTEGER;
    year_suffix TEXT;
BEGIN
    -- Obter o ano atual
    year_suffix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Para cada número duplicado
    FOR rec IN 
        SELECT numero_processo, array_agg(id ORDER BY created_at) as ids
        FROM public.processos 
        GROUP BY numero_processo 
        HAVING COUNT(*) > 1
    LOOP
        -- Manter o primeiro ID (mais antigo) e renomear os demais
        FOR i IN 2..array_length(rec.ids, 1) LOOP
            counter := 1;
            
            -- Gerar novo número único
            LOOP
                new_number := 'IP-' || year_suffix || '-' || LPAD(counter::TEXT, 3, '0');
                
                -- Verificar se já existe
                IF NOT EXISTS (SELECT 1 FROM public.processos WHERE numero_processo = new_number) THEN
                    -- Atualizar o processo
                    UPDATE public.processos 
                    SET numero_processo = new_number
                    WHERE id = rec.ids[i];
                    
                    RAISE NOTICE 'Processo % renomeado para %', rec.ids[i], new_number;
                    EXIT;
                END IF;
                
                counter := counter + 1;
                
                -- Evitar loop infinito
                IF counter > 9999 THEN
                    RAISE EXCEPTION 'Não foi possível gerar número único para processo %', rec.ids[i];
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Correção de duplicatas concluída';
END $$;

-- 3. Verificar novamente após correção
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

SELECT 
    numero_processo,
    COUNT(*) as quantidade
FROM public.processos 
GROUP BY numero_processo 
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 4. Mostrar estatísticas
SELECT '=== ESTATÍSTICAS ===' as info;

SELECT 
    COUNT(*) as total_processos,
    COUNT(DISTINCT numero_processo) as numeros_unicos,
    COUNT(*) - COUNT(DISTINCT numero_processo) as duplicatas_restantes
FROM public.processos;

-- 5. Garantir que a constraint UNIQUE existe
DO $$
BEGIN
    -- Adicionar constraint UNIQUE se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'processos' 
        AND constraint_name LIKE '%numero_processo%' 
        AND constraint_type = 'UNIQUE'
    ) THEN
        ALTER TABLE public.processos ADD CONSTRAINT uk_processos_numero UNIQUE (numero_processo);
        RAISE NOTICE 'Constraint UNIQUE adicionada';
    ELSE
        RAISE NOTICE 'Constraint UNIQUE já existe';
    END IF;
END $$; 