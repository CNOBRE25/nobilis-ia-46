-- Script para verificar a estrutura atual da tabela processos
-- Execute este script no SQL Editor do Supabase

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('transgressao', 'modus_operandi', 'crimes_selecionados', 'status_funcional', 'sexo_vitima') 
        THEN 'NOVO CAMPO'
        ELSE 'CAMPO EXISTENTE'
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
ORDER BY column_name; 