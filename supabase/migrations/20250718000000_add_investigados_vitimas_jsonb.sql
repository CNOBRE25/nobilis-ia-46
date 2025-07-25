-- Adiciona campos para múltiplos investigados e vítimas
ALTER TABLE public.processos
  ADD COLUMN IF NOT EXISTS investigados JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS vitimas JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS analise_fatos JSONB;

-- Comentários para documentação
COMMENT ON COLUMN public.processos.investigados IS 'Lista de investigados (array de objetos JSON)';
COMMENT ON COLUMN public.processos.vitimas IS 'Lista de vítimas (array de objetos JSON)'; 