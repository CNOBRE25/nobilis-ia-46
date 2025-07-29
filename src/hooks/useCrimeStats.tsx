import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../integrations/supabase/client';

interface CrimeStats {
  tiposCrime: Array<{ name: string; count: number; color: string }>;
  transgressoes: Array<{ name: string; count: number; color: string }>;
<<<<<<< HEAD
  sexoVitima: Array<{ name: string; count: number; color: string }>;
=======
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd
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

// Função para gerar hash dos dados
const generateDataHash = <T>(data: T): string => {
  return JSON.stringify(data);
};

export function useCrimeStats(): CrimeStats {
  const [tiposCrime, setTiposCrime] = useState<Array<{ name: string; count: number; color: string }>>([]);
  const [transgressoes, setTransgressoes] = useState<Array<{ name: string; count: number; color: string }>>([]);
<<<<<<< HEAD
  const [sexoVitima, setSexoVitima] = useState<Array<{ name: string; count: number; color: string }>>([]);
=======
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd
  const [unidadesInvestigado, setUnidadesInvestigado] = useState<Array<{ name: string; count: number; color: string }>>([]);
  const [crimesPorMes, setCrimesPorMes] = useState<Array<{ mes: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Refs para controle de cache e debounce
  const dataHashRef = useRef<string>('');
  const isUpdatingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);

  const fetchCrimeStats = useCallback(async (forceUpdate = false) => {
    // Evitar múltiplas chamadas simultâneas
    if (isUpdatingRef.current && !forceUpdate) {
      console.log('Atualização de crimes já em andamento, ignorando...');
      return;
    }

    // Debounce para evitar muitas chamadas em sequência
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000 && !forceUpdate) { // 2 segundos de debounce
      console.log('Debounce crimes: muito rápido, ignorando...');
      return;
    }

    isUpdatingRef.current = true;
    lastFetchTimeRef.current = now;

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

      // Gerar hash dos dados para verificar se mudaram
      const newDataHash = generateDataHash(processosList);
      if (newDataHash === dataHashRef.current && !forceUpdate) {
        console.log('Dados de crimes não mudaram, ignorando atualização...');
        setLoading(false);
        isUpdatingRef.current = false;
        return;
      }

      dataHashRef.current = newDataHash;

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

<<<<<<< HEAD
      // 3. Estatísticas por Sexo da Vítima
      const sexoVitimaCount: { [key: string]: number } = {};
      processosList.forEach(p => {
        const sexo = p.sexo_vitima || 'Não especificado';
        sexoVitimaCount[sexo] = (sexoVitimaCount[sexo] || 0) + 1;
      });

      const sexoVitimaData = Object.entries(sexoVitimaCount)
        .map(([name, count], index) => ({
          name: name === 'M' ? 'Masculino' : name === 'F' ? 'Feminino' : name,
          count,
          color: name === 'M' ? '#3b82f6' : name === 'F' ? '#ec4899' : '#6b7280'
        }))
        .sort((a, b) => b.count - a.count);

      setSexoVitima(sexoVitimaData);

=======
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd
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
      isUpdatingRef.current = false;
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchCrimeStats(true); // Passa true para forçar a atualização
  }, [fetchCrimeStats]);

  useEffect(() => {
    fetchCrimeStats();
  }, []); // Removido fetchCrimeStats das dependências

  return {
    tiposCrime,
    transgressoes,
<<<<<<< HEAD
    sexoVitima,
=======
>>>>>>> db1e165157d7892501eb3b9d27658cd6a6100efd
    unidadesInvestigado,
    crimesPorMes,
    loading,
    error,
    lastUpdateTime,
    refreshStats
  };
} 