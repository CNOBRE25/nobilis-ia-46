import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

interface UnifiedUserStats {
  id: string;
  user_id: string;
  user_email: string;
  user_orgao: string;
  user_role: string;
  total_processos: number;
  processos_ativos: number;
  processos_concluidos: number;
  processos_urgentes: number;
  tempo_medio_resolucao: number;
  taxa_eficiencia: number;
  total_pareceres: number;
  pareceres_rascunho: number;
  pareceres_revisao: number;
  pareceres_aprovados: number;
  pareceres_entregues: number;
  total_crimes: number;
  tipos_crime_diferentes: number;
<<<<<<< HEAD
  vitimas_femininas: number;
  vitimas_masculinas: number;
=======
  unidades_ativas: number;
  data_coleta: string;
  periodo_referencia: string;
}

interface UnifiedStatsSummary {
  total_users: number;
  total_processos: number;
  total_pareceres: number;
  total_crimes: number;
  media_eficiencia: number;
  media_tempo_resolucao: number;
  // Estatísticas de crimes
  tipos_crime_mais_comuns: Array<{
    tipo: string;
    quantidade: number;
    percentual: number;
  }>;
<<<<<<< HEAD
  distribuicao_vitimas: {
    femininas: number;
    masculinas: number;
    total: number;
  };
=======
  unidades_mais_ativas: Array<{
    unidade: string;
    quantidade: number;
    percentual: number;
  }>;
  top_performers: Array<{
    user_email: string;
    user_orgao: string;
    total_processos: number;
    taxa_eficiencia: number;
  }>;
  stats_por_orgao: Array<{
    orgao: string;
    total_processos: number;
    total_pareceres: number;
    media_eficiencia: number;
  }>;
}

export function useUnifiedStats() {
  const [userStats, setUserStats] = useState<UnifiedUserStats[]>([]);
  const [summary, setSummary] = useState<UnifiedStatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const fetchUnifiedStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar estatísticas unificadas
      const { data: stats, error: statsError } = await supabase
        .from('unified_statistics')
        .select('*')
        .order('data_coleta', { ascending: false });

      if (statsError) {
        console.error('Erro ao buscar estatísticas unificadas:', statsError);
        setError('Erro ao carregar estatísticas unificadas');
        return;
      }

      // Pegar apenas a coleta mais recente de cada usuário
      const latestStats = stats?.reduce((acc, stat) => {
        const existing = acc.find(s => s.user_id === stat.user_id);
        if (!existing || new Date(stat.data_coleta) > new Date(existing.data_coleta)) {
          return acc.filter(s => s.user_id !== stat.user_id).concat(stat);
        }
        return acc;
      }, [] as UnifiedUserStats[]) || [];

      setUserStats(latestStats);

      // Calcular resumo
      if (latestStats.length > 0) {
        const totalUsers = latestStats.length;
        const totalProcessos = latestStats.reduce((sum, stat) => sum + stat.total_processos, 0);
        const totalPareceres = latestStats.reduce((sum, stat) => sum + stat.total_pareceres, 0);
        const totalCrimes = latestStats.reduce((sum, stat) => sum + stat.total_crimes, 0);
        const mediaEficiencia = latestStats.reduce((sum, stat) => sum + stat.taxa_eficiencia, 0) / totalUsers;
        const mediaTempoResolucao = latestStats.reduce((sum, stat) => sum + stat.tempo_medio_resolucao, 0) / totalUsers;

        // Estatísticas de crimes - coletar dados de todos os usuários
        const crimeData = await fetchCrimeStatistics();
        
        // Top performers (usuários com mais processos e melhor eficiência)
        const topPerformers = latestStats
          .filter(stat => stat.total_processos > 0)
          .sort((a, b) => {
            const scoreA = (a.total_processos * 0.7) + (a.taxa_eficiencia * 0.3);
            const scoreB = (b.total_processos * 0.7) + (b.taxa_eficiencia * 0.3);
            return scoreB - scoreA;
          })
          .slice(0, 5)
          .map(stat => ({
            user_email: stat.user_email,
            user_orgao: stat.user_orgao,
            total_processos: stat.total_processos,
            taxa_eficiencia: stat.taxa_eficiencia
          }));

        // Estatísticas por órgão
        const statsPorOrgao = latestStats.reduce((acc, stat) => {
          const orgao = stat.user_orgao || 'Não especificado';
          const existing = acc.find(s => s.orgao === orgao);
          
          if (existing) {
            existing.total_processos += stat.total_processos;
            existing.total_pareceres += stat.total_pareceres;
            existing.media_eficiencia = (existing.media_eficiencia + stat.taxa_eficiencia) / 2;
          } else {
            acc.push({
              orgao,
              total_processos: stat.total_processos,
              total_pareceres: stat.total_pareceres,
              media_eficiencia: stat.taxa_eficiencia
            });
          }
          
          return acc;
        }, [] as Array<{ orgao: string; total_processos: number; total_pareceres: number; media_eficiencia: number }>);

        setSummary({
          total_users: totalUsers,
          total_processos,
          total_pareceres,
          total_crimes,
          media_eficiencia: Math.round(mediaEficiencia * 100) / 100,
          media_tempo_resolucao: Math.round(mediaTempoResolucao),
          tipos_crime_mais_comuns: crimeData.tipos_crime_mais_comuns,
<<<<<<< HEAD
          distribuicao_vitimas: crimeData.distribuicao_vitimas,
=======
          unidades_mais_ativas: crimeData.unidades_mais_ativas,
          top_performers: topPerformers,
          stats_por_orgao: statsPorOrgao.sort((a, b) => b.total_processos - a.total_processos)
        });
      }

      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Erro ao buscar estatísticas unificadas:', error);
      setError('Erro ao carregar estatísticas unificadas');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAllStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Chamar função SQL para atualizar todas as estatísticas
      const { error: refreshError } = await supabase.rpc('refresh_all_user_statistics');

      if (refreshError) {
        console.error('Erro ao atualizar estatísticas:', refreshError);
        setError('Erro ao atualizar estatísticas');
        return;
      }

      // Buscar estatísticas atualizadas
      await fetchUnifiedStats();
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      setError('Erro ao atualizar estatísticas');
    } finally {
      setLoading(false);
    }
  }, [fetchUnifiedStats]);

  const getUserStats = useCallback((userId: string) => {
    return userStats.find(stat => stat.user_id === userId);
  }, [userStats]);

  const getTopUsers = useCallback((metric: keyof UnifiedUserStats, limit: number = 10) => {
    return userStats
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, limit);
  }, [userStats]);

  const getStatsByOrgao = useCallback((orgao: string) => {
    return userStats.filter(stat => stat.user_orgao === orgao);
  }, [userStats]);

  // Função para buscar estatísticas de crimes
  const fetchCrimeStatistics = useCallback(async () => {
    try {
      // Buscar dados de crimes de todos os processos
      const { data: processos, error } = await supabase
        .from('processos')
        .select('tipo_crime, sexo_vitima, unidade_investigado')
        .not('tipo_crime', 'is', null);

      if (error) {
        console.error('Erro ao buscar dados de crimes:', error);
        return {
          tipos_crime_mais_comuns: [],
<<<<<<< HEAD
          distribuicao_vitimas: { femininas: 0, masculinas: 0, total: 0 },
=======
          unidades_mais_ativas: []
        };
      }

      // Calcular tipos de crime mais comuns
      const tiposCrime = processos?.reduce((acc, processo) => {
        const tipo = processo.tipo_crime || 'Não especificado';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const tiposCrimeArray = Object.entries(tiposCrime)
        .map(([tipo, quantidade]) => ({
          tipo,
          quantidade,
          percentual: Math.round((quantidade / processos!.length) * 100)
        }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

<<<<<<< HEAD
      // Calcular distribuição de vítimas
      const vitimasFemininas = processos?.filter(p => p.sexo_vitima === 'F').length || 0;
      const vitimasMasculinas = processos?.filter(p => p.sexo_vitima === 'M').length || 0;
      const totalVitimas = vitimasFemininas + vitimasMasculinas;

=======
      // Calcular unidades mais ativas
      const unidades = processos?.reduce((acc, processo) => {
        const unidade = processo.unidade_investigado || 'Não especificada';
        acc[unidade] = (acc[unidade] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const unidadesArray = Object.entries(unidades)
        .map(([unidade, quantidade]) => ({
          unidade,
          quantidade,
          percentual: Math.round((quantidade / processos!.length) * 100)
        }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      return {
        tipos_crime_mais_comuns: tiposCrimeArray,
<<<<<<< HEAD
        distribuicao_vitimas: {
          femininas: vitimasFemininas,
          masculinas: vitimasMasculinas,
          total: totalVitimas
        },
=======
        unidades_mais_ativas: unidadesArray
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de crimes:', error);
      return {
        tipos_crime_mais_comuns: [],
<<<<<<< HEAD
        distribuicao_vitimas: { femininas: 0, masculinas: 0, total: 0 },
=======
        unidades_mais_ativas: []
      };
    }
  }, []);

  useEffect(() => {
    fetchUnifiedStats();
  }, [fetchUnifiedStats]);

  return {
    userStats,
    summary,
    loading,
    error,
    lastUpdateTime,
    refreshAllStats,
    fetchUnifiedStats,
    getUserStats,
    getTopUsers,
    getStatsByOrgao
  };
} 