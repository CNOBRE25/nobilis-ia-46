-- Create pareceres table
CREATE TABLE IF NOT EXISTS pareceres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_protocolo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  servidores JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de servidores
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'revisao', 'aprovado', 'entregue', 'arquivado')),
  urgencia TEXT NOT NULL DEFAULT 'media' CHECK (urgencia IN ('baixa', 'media', 'alta')),
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fato DATE,
  data_prescricao DATE,
  orgao TEXT,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conteudo_parecer TEXT,
  questao_principal TEXT,
  caso_descricao TEXT,
  area_direito TEXT,
  complexidade TEXT CHECK (complexidade IN ('simples', 'media', 'complexa')),
  tipo_crime TEXT,
  legislacao_aplicavel TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pareceres_usuario_id ON pareceres(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pareceres_status ON pareceres(status);
CREATE INDEX IF NOT EXISTS idx_pareceres_data_criacao ON pareceres(data_criacao);
CREATE INDEX IF NOT EXISTS idx_pareceres_data_prescricao ON pareceres(data_prescricao);
CREATE INDEX IF NOT EXISTS idx_pareceres_orgao ON pareceres(orgao);

-- Create GIN index for JSONB search
CREATE INDEX IF NOT EXISTS idx_pareceres_servidores_gin ON pareceres USING GIN (servidores);

-- Create full text search index
CREATE INDEX IF NOT EXISTS idx_pareceres_search ON pareceres USING GIN (
  to_tsvector('portuguese', 
    COALESCE(titulo, '') || ' ' || 
    COALESCE(numero_protocolo, '') || ' ' || 
    COALESCE(questao_principal, '') || ' ' || 
    COALESCE(caso_descricao, '')
  )
);

-- Enable RLS
ALTER TABLE pareceres ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own pareceres" ON pareceres
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert their own pareceres" ON pareceres
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update their own pareceres" ON pareceres
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own pareceres" ON pareceres
  FOR DELETE USING (auth.uid() = usuario_id);

-- Admin can view all pareceres
CREATE POLICY "Admins can view all pareceres" ON pareceres
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_pareceres_updated_at 
  BEFORE UPDATE ON pareceres 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to validate servidores JSONB structure
CREATE OR REPLACE FUNCTION validate_servidores_structure()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if servidores is an array
  IF jsonb_typeof(NEW.servidores) != 'array' THEN
    RAISE EXCEPTION 'servidores must be an array';
  END IF;
  
  -- Validate each servidor object structure
  FOR i IN 0..jsonb_array_length(NEW.servidores) - 1 LOOP
    DECLARE
      servidor jsonb;
    BEGIN
      servidor := NEW.servidores->i;
      
      -- Check required fields
      IF servidor->>'nome' IS NULL OR servidor->>'nome' = '' THEN
        RAISE EXCEPTION 'servidor[%].nome is required', i;
      END IF;
      
      IF servidor->>'matricula' IS NULL OR servidor->>'matricula' = '' THEN
        RAISE EXCEPTION 'servidor[%].matricula is required', i;
      END IF;
      
      IF servidor->>'categoria_funcional' IS NULL OR servidor->>'categoria_funcional' = '' THEN
        RAISE EXCEPTION 'servidor[%].categoria_funcional is required', i;
      END IF;
      
      IF servidor->>'situacao_servico' IS NULL OR servidor->>'situacao_servico' = '' THEN
        RAISE EXCEPTION 'servidor[%].situacao_servico is required', i;
      END IF;
    END;
  END LOOP;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for servidores validation
CREATE TRIGGER validate_pareceres_servidores 
  BEFORE INSERT OR UPDATE ON pareceres 
  FOR EACH ROW 
  EXECUTE FUNCTION validate_servidores_structure(); 