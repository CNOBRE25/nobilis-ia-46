import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

interface CrimeStats {
  tiposCrime: Array<{ name: string; count: number; color: string }>;
  transgressoes: Array<{ name: string; count: number; color: string }>;
  unidadesInvestigado: Array<{ name: string; count: number; color: string }>;
  crimesPorMes: Array<{ mes: string; count: number }>;
  loading: boolean;
  error: string | null;
  lastUpdateTime: Date | null;
  refreshStats: () => Promise<void>;
}

const colors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
  '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
  '#8dd1e1', '#d084d0', '#ffc0cb', '#dda0dd', '#98fb98'
];

export function useCrimeStats(): CrimeStats {
  const [tiposCrime, setTiposCrime] = useState<Array<{ name: string; count: number; color: string }>>([]);
  const [transgressoes, setTransgressoes] = useState<Array<{ name: string; count: number; color: string }>>([]);
  const [unidadesInvestigado, setUnidadesInvestigado] = useState<Array<{ name: string; count: number; color: string }>>([]);
  const [crimesPorMes, setCrimesPorMes] = useState<Array<{ mes: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const fetchCrimeStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todos os processos com dados de crime
      const { data: processos, error: processosError } = await supabase
        .from('processos')
        .select('*')
        .order('data_recebimento', { ascending: false });

      if (processosError) {
        console.error('Erro ao buscar processos:', processosError);
        setError('Erro ao carregar estatísticas de crimes');
        return;
      }

      const processosList = processos || [];

      // 1. Estatísticas por Tipo de Crime
      const tiposCrimeCount: { [key: string]: number } = {};
      processosList.forEach(p => {
        const tipoCrime = p.tipo_crime || 'Não especificado';
        tiposCrimeCount[tipoCrime] = (tiposCrimeCount[tipoCrime] || 0) + 1;
      });

      const tiposCrimeData = Object.entries(tiposCrimeCount)
        .map(([name, count], index) => ({
          name,
          count,
          color: colors[index % colors.length]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 tipos de crime

      setTiposCrime(tiposCrimeData);

      // 2. Estatísticas por Transgressão
      const transgressoesCount: { [key: string]: number } = {};
      processosList.forEach(p => {
        const transgressao = p.transgressao || 'Não especificada';
        transgressoesCount[transgressao] = (transgressoesCount[transgressao] || 0) + 1;
      });

      const transgressoesData = Object.entries(transgressoesCount)
        .map(([name, count], index) => ({
          name,
          count,
          color: colors[index % colors.length]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8); // Top 8 transgressões

      setTransgressoes(transgressoesData);

      // 4. Estatísticas por Unidade do Investigado
      const unidadesCount: { [key: string]: number } = {};
      processosList.forEach(p => {
        const unidade = p.unidade_investigado || 'Não especificada';
        unidadesCount[unidade] = (unidadesCount[unidade] || 0) + 1;
      });

      const unidadesData = Object.entries(unidadesCount)
        .map(([name, count], index) => ({
          name,
          count,
          color: colors[index % colors.length]
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12); // Top 12 unidades

      setUnidadesInvestigado(unidadesData);

      // 5. Crimes por Mês (últimos 12 meses)
      const crimesPorMesCount: { [key: string]: number } = {};
      const hoje = new Date();
      
      // Inicializar últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        crimesPorMesCount[mesAno] = 0;
      }

      // Contar crimes por mês
      processosList.forEach(p => {
        const dataProcesso = new Date(p.data_recebimento || p.created_at);
        const mesAno = dataProcesso.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        if (crimesPorMesCount[mesAno] !== undefined) {
          crimesPorMesCount[mesAno]++;
        }
      });

      const crimesPorMesData = Object.entries(crimesPorMesCount)
        .map(([mes, count]) => ({
          mes,
          count
        }));

      setCrimesPorMes(crimesPorMesData);

      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Erro ao buscar estatísticas de crimes:', error);
      setError('Erro ao carregar estatísticas de crimes');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchCrimeStats();
  }, [fetchCrimeStats]);

  useEffect(() => {
    fetchCrimeStats();
  }, [fetchCrimeStats]);

  return {
    tiposCrime,
    transgressoes,
    unidadesInvestigado,
    crimesPorMes,
    loading,
    error,
    lastUpdateTime,
    refreshStats
  };
} 