-- Script para adicionar colunas que estão faltando na tabela processos
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna transgressao se não existir
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS transgressao TEXT;

-- Adicionar coluna modus_operandi se não existir
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS modus_operandi TEXT;

-- Adicionar coluna crimes_selecionados se não existir
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS crimes_selecionados JSONB DEFAULT '[]';

-- Adicionar coluna status_funcional se não existir
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS status_funcional TEXT;

-- Adicionar coluna sexo_vitima se não existir
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS sexo_vitima TEXT CHECK (sexo_vitima IN ('M', 'F', 'Não especificado'));

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_processos_transgressao ON public.processos(transgressao);
CREATE INDEX IF NOT EXISTS idx_processos_modus_operandi ON public.processos(modus_operandi);
CREATE INDEX IF NOT EXISTS idx_processos_crimes_selecionados ON public.processos USING GIN (crimes_selecionados);
CREATE INDEX IF NOT EXISTS idx_processos_status_funcional ON public.processos(status_funcional);
CREATE INDEX IF NOT EXISTS idx_processos_sexo_vitima ON public.processos(sexo_vitima);

-- Atualizar registros existentes com valores padrão se necessário
UPDATE public.processos 
SET 
  transgressao = COALESCE(transgressao, ''),
  modus_operandi = COALESCE(modus_operandi, ''),
  crimes_selecionados = COALESCE(crimes_selecionados, '[]'::jsonb),
  status_funcional = COALESCE(status_funcional, ''),
  sexo_vitima = COALESCE(sexo_vitima, 'Não especificado')
WHERE 
  transgressao IS NULL 
  OR modus_operandi IS NULL 
  OR crimes_selecionados IS NULL
  OR status_funcional IS NULL
  OR sexo_vitima IS NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.processos.transgressao IS 'Transgressão específica (ex: Art. 121 CP, Art. 157 CP, etc.)';
COMMENT ON COLUMN public.processos.modus_operandi IS 'Modus operandi do crime';
COMMENT ON COLUMN public.processos.crimes_selecionados IS 'Array JSON com múltiplos crimes selecionados para o processo';
COMMENT ON COLUMN public.processos.status_funcional IS 'Status funcional do investigado';
COMMENT ON COLUMN public.processos.sexo_vitima IS 'Sexo da vítima (M=Masculino, F=Feminino)'; 