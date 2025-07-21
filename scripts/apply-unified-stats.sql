-- Script para aplicar estatísticas unificadas
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de estatísticas unificadas
CREATE TABLE IF NOT EXISTS unified_statistics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_orgao TEXT,
  user_role TEXT,
  
  -- Estatísticas de processos
  total_processos INTEGER DEFAULT 0,
  processos_ativos INTEGER DEFAULT 0,
  processos_concluidos INTEGER DEFAULT 0,
  processos_urgentes INTEGER DEFAULT 0,
  tempo_medio_resolucao INTEGER DEFAULT 0,
  taxa_eficiencia DECIMAL(5,2) DEFAULT 0,
  
  -- Estatísticas de pareceres
  total_pareceres INTEGER DEFAULT 0,
  pareceres_rascunho INTEGER DEFAULT 0,
  pareceres_revisao INTEGER DEFAULT 0,
  pareceres_aprovados INTEGER DEFAULT 0,
  pareceres_entregues INTEGER DEFAULT 0,
  
  -- Estatísticas de crimes
  total_crimes INTEGER DEFAULT 0,
  tipos_crime_diferentes INTEGER DEFAULT 0,
  vitimas_femininas INTEGER DEFAULT 0,
  vitimas_masculinas INTEGER DEFAULT 0,
  unidades_ativas INTEGER DEFAULT 0,
  
  -- Metadados
  data_coleta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  periodo_referencia DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_unified_stats_user_id ON unified_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_stats_orgao ON unified_statistics(user_orgao);
CREATE INDEX IF NOT EXISTS idx_unified_stats_role ON unified_statistics(user_role);
CREATE INDEX IF NOT EXISTS idx_unified_stats_data_coleta ON unified_statistics(data_coleta);
CREATE INDEX IF NOT EXISTS idx_unified_stats_periodo ON unified_statistics(periodo_referencia);

-- Habilitar RLS
ALTER TABLE unified_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas admins podem ver todas as estatísticas
CREATE POLICY "Admins can view all unified statistics" ON unified_statistics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert unified statistics" ON unified_statistics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update unified statistics" ON unified_statistics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Função para atualizar estatísticas unificadas
CREATE OR REPLACE FUNCTION update_unified_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar updated_at
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
CREATE TRIGGER update_unified_statistics_updated_at 
  BEFORE UPDATE ON unified_statistics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_unified_statistics();

-- Função para calcular estatísticas de um usuário
CREATE OR REPLACE FUNCTION calculate_user_statistics(target_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  user_orgao TEXT,
  user_role TEXT,
  total_processos BIGINT,
  processos_ativos BIGINT,
  processos_concluidos BIGINT,
  processos_urgentes BIGINT,
  tempo_medio_resolucao INTEGER,
  taxa_eficiencia DECIMAL(5,2),
  total_pareceres BIGINT,
  pareceres_rascunho BIGINT,
  pareceres_revisao BIGINT,
  pareceres_aprovados BIGINT,
  pareceres_entregues BIGINT,
  total_crimes BIGINT,
  tipos_crime_diferentes BIGINT,
  vitimas_femininas BIGINT,
  vitimas_masculinas BIGINT,
  unidades_ativas BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_info AS (
    SELECT 
      u.id,
      u.email,
      p.orgao,
      ur.role
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.id
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    WHERE u.id = target_user_id
  ),
  process_stats AS (
    SELECT 
      COUNT(*) as total_processos,
      COUNT(*) FILTER (WHERE status = 'tramitacao') as processos_ativos,
      COUNT(*) FILTER (WHERE status = 'concluido') as processos_concluidos,
      COUNT(*) FILTER (WHERE prioridade IN ('urgente', 'alta', 'urgente_maria_penha')) as processos_urgentes,
      AVG(
        CASE 
          WHEN status = 'concluido' AND data_recebimento IS NOT NULL AND updated_at IS NOT NULL
          THEN EXTRACT(DAY FROM (updated_at - data_recebimento))
          ELSE NULL
        END
      )::INTEGER as tempo_medio_resolucao,
      CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'concluido')::DECIMAL / COUNT(*)::DECIMAL) * 100, 2)
        ELSE 0
      END as taxa_eficiencia
    FROM processos 
    WHERE usuario_id = target_user_id
  ),
  parecer_stats AS (
    SELECT 
      COUNT(*) as total_pareceres,
      COUNT(*) FILTER (WHERE status = 'rascunho') as pareceres_rascunho,
      COUNT(*) FILTER (WHERE status = 'revisao') as pareceres_revisao,
      COUNT(*) FILTER (WHERE status = 'aprovado') as pareceres_aprovados,
      COUNT(*) FILTER (WHERE status = 'entregue') as pareceres_entregues
    FROM pareceres 
    WHERE usuario_id = target_user_id
  ),
  crime_stats AS (
    SELECT 
      COUNT(*) as total_crimes,
      COUNT(DISTINCT tipo_crime) FILTER (WHERE tipo_crime IS NOT NULL AND tipo_crime != 'Não especificado') as tipos_crime_diferentes,
      COUNT(*) FILTER (WHERE sexo_vitima = 'F') as vitimas_femininas,
      COUNT(*) FILTER (WHERE sexo_vitima = 'M') as vitimas_masculinas,
      COUNT(DISTINCT unidade_investigado) FILTER (WHERE unidade_investigado IS NOT NULL AND unidade_investigado != 'Não especificada') as unidades_ativas
    FROM processos 
    WHERE usuario_id = target_user_id
  )
  SELECT 
    ui.id,
    ui.email,
    ui.orgao,
    ui.role,
    COALESCE(ps.total_processos, 0),
    COALESCE(ps.processos_ativos, 0),
    COALESCE(ps.processos_concluidos, 0),
    COALESCE(ps.processos_urgentes, 0),
    COALESCE(ps.tempo_medio_resolucao, 0),
    COALESCE(ps.taxa_eficiencia, 0),
    COALESCE(pars.total_pareceres, 0),
    COALESCE(pars.pareceres_rascunho, 0),
    COALESCE(pars.pareceres_revisao, 0),
    COALESCE(pars.pareceres_aprovados, 0),
    COALESCE(pars.pareceres_entregues, 0),
    COALESCE(cs.total_crimes, 0),
    COALESCE(cs.tipos_crime_diferentes, 0),
    COALESCE(cs.vitimas_femininas, 0),
    COALESCE(cs.vitimas_masculinas, 0),
    COALESCE(cs.unidades_ativas, 0)
  FROM user_info ui
  CROSS JOIN process_stats ps
  CROSS JOIN parecer_stats pars
  CROSS JOIN crime_stats cs;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar estatísticas de todos os usuários
CREATE OR REPLACE FUNCTION refresh_all_user_statistics()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Limpar estatísticas antigas (manter apenas as últimas 30 coletas)
  DELETE FROM unified_statistics 
  WHERE data_coleta < NOW() - INTERVAL '30 days';
  
  -- Inserir estatísticas atualizadas para todos os usuários
  FOR user_record IN 
    SELECT DISTINCT u.id 
    FROM auth.users u
    WHERE u.id IN (
      SELECT DISTINCT usuario_id FROM processos
      UNION
      SELECT DISTINCT usuario_id FROM pareceres
    )
  LOOP
    INSERT INTO unified_statistics (
      user_id, user_email, user_orgao, user_role,
      total_processos, processos_ativos, processos_concluidos, processos_urgentes,
      tempo_medio_resolucao, taxa_eficiencia,
      total_pareceres, pareceres_rascunho, pareceres_revisao, pareceres_aprovados, pareceres_entregues,
      total_crimes, tipos_crime_diferentes, vitimas_femininas, vitimas_masculinas, unidades_ativas
    )
    SELECT * FROM calculate_user_statistics(user_record.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar primeira coleta de estatísticas
SELECT refresh_all_user_statistics();

-- Verificar se a tabela foi criada corretamente
SELECT 
  'Tabela unified_statistics criada com sucesso!' as status,
  COUNT(*) as total_registros
FROM unified_statistics; 