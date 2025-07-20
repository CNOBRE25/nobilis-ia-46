-- Migration: Criação da tabela 'cases' para processos jurídicos
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL,
  process_type text NOT NULL,
  priority text,
  dispatch_number text,
  received_date timestamp,
  fact_date timestamp,
  fact_description text,
  modus_operandi text,
  status text,
  user_id uuid,
  created_at timestamp DEFAULT now(),
  crime_typing text,
  initiation_date timestamp
);

-- Índices úteis
CREATE INDEX idx_cases_case_number ON public.cases(case_number);
CREATE INDEX idx_cases_user_id ON public.cases(user_id);

-- Permissões básicas (ajuste conforme sua política de segurança)
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Política: Usuário pode ver seus próprios processos
CREATE POLICY "Users can view their own cases" ON public.cases
  FOR SELECT USING (user_id = auth.uid());

-- Política: Usuário pode inserir processos
CREATE POLICY "Users can insert cases" ON public.cases
  FOR INSERT WITH CHECK (user_id = auth.uid()); 