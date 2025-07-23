-- Script para aplicar a migração do relatório final
-- Execute este script no SQL Editor do Supabase

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

-- Verificar se as colunas foram adicionadas
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'processos' 
  AND table_schema = 'public'
  AND column_name IN ('relatorio_final', 'data_relatorio_final', 'relatorio_gerado_por')
ORDER BY column_name;

-- Log da migração (se a tabela audit_logs existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs' AND table_schema = 'public') THEN
    INSERT INTO public.audit_logs (event_type, metadata)
    VALUES ('MIGRATION_APPLIED', jsonb_build_object(
      'migration', 'add_relatorio_final_column',
      'message', 'Adicionadas colunas para relatório final: relatorio_final, data_relatorio_final, relatorio_gerado_por'
    ));
  END IF;
END $$; 