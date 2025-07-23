-- Adicionar campo relatorio_final à tabela processos
-- Este campo armazenará o relatório final gerado pela IA

-- Adicionar coluna relatorio_final
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS relatorio_final JSONB DEFAULT NULL;

-- Adicionar coluna data_relatorio_final
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS data_relatorio_final TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Adicionar coluna relatorio_gerado_por
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS relatorio_gerado_por UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Criar índice para melhorar performance de consultas por relatório
CREATE INDEX IF NOT EXISTS idx_processos_relatorio_final ON public.processos(relatorio_final) WHERE relatorio_final IS NOT NULL;

-- Log da migração
INSERT INTO public.audit_logs (event_type, metadata)
VALUES ('MIGRATION_APPLIED', jsonb_build_object(
  'migration', 'add_relatorio_final_column',
  'message', 'Adicionadas colunas para relatório final: relatorio_final, data_relatorio_final, relatorio_gerado_por'
)); 