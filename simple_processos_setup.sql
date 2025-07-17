-- Script simples para criar apenas a tabela de processos
-- Execute este script no SQL Editor do Supabase

-- Create enums if they don't exist
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

-- Create processos table if it doesn't exist
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_processos_numero_processo ON public.processos(numero_processo);
CREATE INDEX IF NOT EXISTS idx_processos_status ON public.processos(status);
CREATE INDEX IF NOT EXISTS idx_processos_user_id ON public.processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_tipo_processo ON public.processos(tipo_processo);
CREATE INDEX IF NOT EXISTS idx_processos_prioridade ON public.processos(prioridade);
CREATE INDEX IF NOT EXISTS idx_processos_data_fato ON public.processos(data_fato);
CREATE INDEX IF NOT EXISTS idx_processos_created_at ON public.processos(created_at);

-- Enable Row Level Security
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own processes" ON public.processos;
DROP POLICY IF EXISTS "Users can create processes" ON public.processos;
DROP POLICY IF EXISTS "Users can update their own processes" ON public.processos;
DROP POLICY IF EXISTS "Users can delete their own processes" ON public.processos;

-- Create simple RLS policies
CREATE POLICY "Enable read access for all users" ON public.processos
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.processos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.processos
  FOR UPDATE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Enable delete for users based on user_id" ON public.processos
  FOR DELETE USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_processos_updated_at ON public.processos;
CREATE TRIGGER update_processos_updated_at
  BEFORE UPDATE ON public.processos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Success message
SELECT 'Tabela de processos criada com sucesso!' as message; 