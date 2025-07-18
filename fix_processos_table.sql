-- Script para verificar e corrigir a tabela de processos no Supabase
-- Execute este script no SQL Editor do painel do Supabase

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'processos'
) as table_exists;

-- 2. Verificar se os enums existem
SELECT EXISTS (
  SELECT FROM pg_type 
  WHERE typname = 'process_status'
) as process_status_exists;

SELECT EXISTS (
  SELECT FROM pg_type 
  WHERE typname = 'process_priority'
) as process_priority_exists;

SELECT EXISTS (
  SELECT FROM pg_type 
  WHERE typname = 'process_type'
) as process_type_exists;

-- 3. Criar enums se não existirem
DO $$ BEGIN
    CREATE TYPE public.process_status AS ENUM ('tramitacao', 'concluido', 'arquivado', 'suspenso');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.process_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.process_type AS ENUM ('investigacao_preliminar', 'sindicancia', 'processo_administrativo', 'inquerito_policial_militar');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.processos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_processo VARCHAR(255) NOT NULL UNIQUE,
  tipo_processo process_type NOT NULL DEFAULT 'investigacao_preliminar',
  prioridade process_priority NOT NULL DEFAULT 'media',
  numero_despacho VARCHAR(255),
  data_despacho TIMESTAMP WITH TIME ZONE,
  data_recebimento TIMESTAMP WITH TIME ZONE,
  data_fato TIMESTAMP WITH TIME ZONE,
  origem_processo VARCHAR(255),
  descricao_fatos TEXT NOT NULL,
  modus_operandi TEXT,
  diligencias_realizadas JSONB DEFAULT '{}',
  desfecho_final TEXT,
  redistribuicao VARCHAR(255),
  sugestoes TEXT,
  status process_status NOT NULL DEFAULT 'tramitacao',
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Additional fields for military processes
  nome_investigado VARCHAR(255),
  cargo_investigado VARCHAR(255),
  unidade_investigado VARCHAR(255),
  matricula_investigado VARCHAR(100),
  data_admissao DATE,
  vitima VARCHAR(255),
  numero_sigpad VARCHAR(255),
  crime_typing VARCHAR(255)
);

-- 5. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_processos_numero_processo ON public.processos(numero_processo);
CREATE INDEX IF NOT EXISTS idx_processos_status ON public.processos(status);
CREATE INDEX IF NOT EXISTS idx_processos_user_id ON public.processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_tipo_processo ON public.processos(tipo_processo);
CREATE INDEX IF NOT EXISTS idx_processos_prioridade ON public.processos(prioridade);
CREATE INDEX IF NOT EXISTS idx_processos_data_fato ON public.processos(data_fato);
CREATE INDEX IF NOT EXISTS idx_processos_created_at ON public.processos(created_at);

-- 6. Habilitar RLS
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

-- 7. Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own processes" ON public.processos;
DROP POLICY IF EXISTS "Users can create processes" ON public.processos;
DROP POLICY IF EXISTS "Users can update their own processes" ON public.processos;
DROP POLICY IF EXISTS "Users can delete their own processes" ON public.processos;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.processos;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.processos;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.processos;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.processos;

-- 8. Criar políticas simples e funcionais
CREATE POLICY "Enable read access for authenticated users" ON public.processos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.processos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.processos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.processos
  FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Criar função de trigger se não existir
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Criar trigger se não existir
DROP TRIGGER IF EXISTS update_processos_updated_at ON public.processos;
CREATE TRIGGER update_processos_updated_at
  BEFORE UPDATE ON public.processos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Verificar se a tabela foi criada corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
ORDER BY ordinal_position;

-- 12. Inserir dados de teste
INSERT INTO public.processos (
  numero_processo,
  tipo_processo,
  prioridade,
  descricao_fatos,
  status,
  nome_investigado,
  cargo_investigado,
  unidade_investigado
) VALUES 
  (
    'IP-2025-001',
    'investigacao_preliminar',
    'alta',
    'Investigação preliminar sobre conduta inadequada de policial militar em serviço.',
    'tramitacao',
    'João Silva',
    'Cabo',
    '1º BPM'
  ),
  (
    'IP-2025-002',
    'investigacao_preliminar',
    'media',
    'Apuração de fatos relacionados a procedimento administrativo.',
    'tramitacao',
    'Maria Santos',
    'Sargento',
    '2º BPM'
  )
ON CONFLICT (numero_processo) DO NOTHING;

-- 13. Verificar dados inseridos
SELECT 
  id,
  numero_processo,
  tipo_processo,
  prioridade,
  status,
  created_at
FROM public.processos
ORDER BY created_at DESC
LIMIT 5;

-- 14. Mensagem de sucesso
SELECT 'Tabela de processos verificada e corrigida com sucesso!' as message; 