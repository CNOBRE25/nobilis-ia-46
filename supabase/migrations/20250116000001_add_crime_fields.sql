-- Adicionar campos de crime na tabela processos
ALTER TABLE processos 
ADD COLUMN IF NOT EXISTS tipo_crime TEXT,
ADD COLUMN IF NOT EXISTS transgressao TEXT,
ADD COLUMN IF NOT EXISTS sexo_vitima TEXT CHECK (sexo_vitima IN ('M', 'F', 'Não especificado')),
ADD COLUMN IF NOT EXISTS unidade_investigado TEXT;

-- Criar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_processos_tipo_crime ON processos(tipo_crime);
CREATE INDEX IF NOT EXISTS idx_processos_transgressao ON processos(transgressao);
CREATE INDEX IF NOT EXISTS idx_processos_sexo_vitima ON processos(sexo_vitima);
CREATE INDEX IF NOT EXISTS idx_processos_unidade_investigado ON processos(unidade_investigado);

-- Atualizar registros existentes com valores padrão se necessário
UPDATE processos 
SET 
  tipo_crime = COALESCE(tipo_crime, 'Não especificado'),
  transgressao = COALESCE(transgressao, 'Não especificada'),
  sexo_vitima = COALESCE(sexo_vitima, 'Não especificado'),
  unidade_investigado = COALESCE(unidade_investigado, 'Não especificada')
WHERE 
  tipo_crime IS NULL 
  OR transgressao IS NULL 
  OR sexo_vitima IS NULL 
  OR unidade_investigado IS NULL;

-- Comentários para documentação
COMMENT ON COLUMN processos.tipo_crime IS 'Tipo de crime cometido (ex: Homicídio, Roubo, Estupro, etc.)';
COMMENT ON COLUMN processos.transgressao IS 'Transgressão específica (ex: Art. 121 CP, Art. 157 CP, etc.)';
COMMENT ON COLUMN processos.sexo_vitima IS 'Sexo da vítima (M=Masculino, F=Feminino)';
COMMENT ON COLUMN processos.unidade_investigado IS 'Unidade responsável pela investigação'; 