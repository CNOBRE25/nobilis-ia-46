-- Script para criar a tabela de processos no Supabase
-- Execute este script no SQL Editor do painel do Supabase

-- Create enum for process status
CREATE TYPE public.process_status AS ENUM ('tramitacao', 'concluido', 'arquivado', 'suspenso');

-- Create enum for process priority
CREATE TYPE public.process_priority AS ENUM ('baixa', 'media', 'alta', 'urgente');

-- Create enum for process type
CREATE TYPE public.process_type AS ENUM ('investigacao_preliminar', 'sindicancia', 'processo_administrativo', 'inquerito_policial_militar');

-- Create processos table
CREATE TABLE public.processos (
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
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
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

-- Create indexes for better performance
CREATE INDEX idx_processos_numero_processo ON public.processos(numero_processo);
CREATE INDEX idx_processos_status ON public.processos(status);
CREATE INDEX idx_processos_user_id ON public.processos(user_id);
CREATE INDEX idx_processos_tipo_processo ON public.processos(tipo_processo);
CREATE INDEX idx_processos_prioridade ON public.processos(prioridade);
CREATE INDEX idx_processos_data_fato ON public.processos(data_fato);
CREATE INDEX idx_processos_created_at ON public.processos(created_at);

-- Enable Row Level Security
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for processos table

-- Users can view their own processes
CREATE POLICY "Users can view their own processes" ON public.processos
  FOR SELECT USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Users can create processes
CREATE POLICY "Users can create processes" ON public.processos
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role IN ('lawyer', 'admin')
    )
  );

-- Users can update their own processes
CREATE POLICY "Users can update their own processes" ON public.processos
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Users can delete their own processes
CREATE POLICY "Users can delete their own processes" ON public.processos
  FOR DELETE USING (
    user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_processos_updated_at
  BEFORE UPDATE ON public.processos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Log the creation of the processos table
INSERT INTO public.audit_logs (event_type, metadata)
VALUES ('TABLE_CREATED', jsonb_build_object(
  'table_name', 'processos',
  'message', 'Tabela de processos criada com sucesso'
)); 