-- Script para adicionar a coluna status_funcional na tabela processos
-- Execute este script no SQL Editor do Supabase

ALTER TABLE public.processos
ADD COLUMN IF NOT EXISTS status_funcional VARCHAR(100);

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'processos' AND column_name = 'status_funcional'; 