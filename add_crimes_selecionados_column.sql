-- Script para adicionar campo crimes_selecionados na tabela processos
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna crimes_selecionados se não existir
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS crimes_selecionados JSONB DEFAULT '[]';

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_processos_crimes_selecionados ON public.processos USING GIN (crimes_selecionados);

-- Atualizar registros existentes com array vazio se necessário
UPDATE public.processos 
SET crimes_selecionados = '[]'::jsonb
WHERE crimes_selecionados IS NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.processos.crimes_selecionados IS 'Array JSON com múltiplos crimes selecionados para o processo'; 