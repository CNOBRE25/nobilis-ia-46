import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';

interface ProcessStats {
  totalProcessos: number;
  processosAtivos: number;
  processosConcluidos: number;
  processosUrgentes: number;
  tempoMedioResolucao: number;
  taxaEficiencia: number;
}

interface DetailedStats {
  stats: ProcessStats;
  desfechosData: Array<{ name: string; count: number; color: string }>;
  eficienciaData: Array<{ periodo: string; ativos: number; concluidos: number }>;
  processosDetalhados: Array<{
    numero: string;
    prioridade: string;
    dataRecebimento: string;
    diasTramitacao: number;
    status: string;
  }>;
  relatoriosRealizados: Array<{
    numero: string;
    desfecho: string;
    dataConclusao: string;
  }>;
  prioridadesData: Array<{ name: string; count: number; color: string }>;
  tiposProcessoData: Array<{ name: string; count: number; color: string }>;
}

// Função para gerar hash dos dados
const generateDataHash = <T>(data: T): string => {
  return JSON.stringify(data);
};

export function useDetailedStats() {
  const [stats, setStats] = useState<ProcessStats>({
    totalProcessos: 0,
    processosAtivos: 0,
    processosConcluidos: 0,
    processosUrgentes: 0,
    tempoMedioResolucao: 0,
    taxaEficiencia: 0
  });
  const [desfechosData, setDesfechosData] = useState<Array<{ name: string; count: number; color: string }>>([]);
  const [eficienciaData, setEficienciaData] = useState<Array<{ periodo: string; ativos: number; concluidos: number }>>([]);
  const [processosDetalhados, setProcessosDetalhados] = useState<Array<{
    numero: string;
    prioridade: string;
    dataRecebimento: string;
    diasTramitacao: number;
    status: string;
  }>>([]);
  const [relatoriosRealizados, setRelatoriosRealizados] = useState<Array<{
    numero: string;
    desfecho: string;
    dataConclusao: string;
  }>>([]);
  const [prioridadesData, setPrioridadesData] = useState<Array<{ name: string; count: number; color: string }>>([]);
  const [tiposProcessoData, setTiposProcessoData] = useState<Array<{ name: string; count: number; color: string }>>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Refs para controle de cache e debounce
  const dataHashRef = useRef<string>('');
  const isUpdatingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
    '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
  ];

  const fetchDetailedStats = useCallback(async (forceUpdate = false) => {
    // Evitar múltiplas chamadas simultâneas
    if (isUpdatingRef.current && !forceUpdate) {
      console.log('Atualização já em andamento, ignorando...');
      return;
    }

    // Debounce para evitar muitas chamadas em sequência
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000 && !forceUpdate) { // 2 segundos de debounce
      console.log('Debounce: muito rápido, ignorando...');
      return;
    }

    isUpdatingRef.current = true;
    lastFetchTimeRef.current = now;

    try {
      setLoading(true);
      setError(null);

      // Buscar todos os processos
      const { data: processos, error: processosError } = await supabase
        .from('processos')
        .select('*')
        .order('data_recebimento', { ascending: false });

      if (processosError) {
        console.error('Erro ao buscar processos:', processosError);
        setError('Erro ao carregar estatísticas');
        return;
      }

      const processosList = processos || [];

      // Gerar hash dos dados para verificar se mudaram
      const newDataHash = generateDataHash(processosList);
      if (newDataHash === dataHashRef.current && !forceUpdate) {
        console.log('Dados não mudaram, ignorando atualização...');
        setLoading(false);
        isUpdatingRef.current = false;
        return;
      }

      dataHashRef.current = newDataHash;

      // Calcular estatísticas básicas
      const totalProcessos = processosList.length;
      const processosAtivos = processosList.filter(p => p.status === 'tramitacao').length;
      const processosConcluidos = processosList.filter(p => p.status === 'concluido').length;
      const processosUrgentes = processosList.filter(p => 
        p.prioridade === 'urgente' || 
        p.prioridade === 'alta' || 
        p.prioridade === 'urgente_maria_penha'
      ).length;

      // Calcular tempo médio de resolução
      let tempoMedioResolucao = 0;
      const processosConcluidosComData = processosList.filter(p => 
        p.status === 'concluido' && p.data_recebimento && p.updated_at
      );

      if (processosConcluidosComData.length > 0) {
        const temposResolucao = processosConcluidosComData.map(p => {
          const dataRecebimento = new Date(p.data_recebimento);
          const updated = new Date(p.updated_at);
          return Math.ceil((updated.getTime() - dataRecebimento.getTime()) / (1000 * 60 * 60 * 24));
        });
        tempoMedioResolucao = Math.round(
          temposResolucao.reduce((sum, tempo) => sum + tempo, 0) / temposResolucao.length
        );
      }

      // Calcular taxa de eficiência
      const taxaEficiencia = totalProcessos > 0 ? Math.round((processosConcluidos / totalProcessos) * 100) : 0;

      const newStats = {
        totalProcessos,
        processosAtivos,
        processosConcluidos,
        processosUrgentes,
        tempoMedioResolucao,
        taxaEficiencia
      };

      setStats(newStats);

      // Calcular dados de desfechos
      const desfechosCount: { [key: string]: number } = {};
      processosList.forEach(p => {
        const desfecho = p.desfecho_final || 'Em Tramitação';
        desfechosCount[desfecho] = (desfechosCount[desfecho] || 0) + 1;
      });

      const desfechosDataArray = Object.entries(desfechosCount).map(([name, count], index) => ({
        name,
        count,
        color: colors[index % colors.length]
      }));

      setDesfechosData(desfechosDataArray);

      // Calcular dados de eficiência por período (últimos 6 meses)
      const eficienciaPorMes: { [key: string]: { ativos: number; concluidos: number } } = {};
      const hoje = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        eficienciaPorMes[mesAno] = { ativos: 0, concluidos: 0 };
      }

      processosList.forEach(p => {
        const dataProcesso = new Date(p.data_recebimento || p.created_at);
        const mesAno = dataProcesso.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        
        if (eficienciaPorMes[mesAno]) {
          if (p.status === 'tramitacao') {
            eficienciaPorMes[mesAno].ativos++;
          } else if (p.status === 'concluido') {
            eficienciaPorMes[mesAno].concluidos++;
          }
        }
      });

      const eficienciaDataArray = Object.entries(eficienciaPorMes).map(([periodo, dados]) => ({
        periodo,
        ativos: dados.ativos,
        concluidos: dados.concluidos
      }));

      setEficienciaData(eficienciaDataArray);

      // Calcular processos detalhados (ativos ordenados por antiguidade)
      const processosAtivosDetalhados = processosList
        .filter(p => p.status === 'tramitacao')
        .map(p => {
          const dataRecebimento = new Date(p.data_recebimento || p.created_at);
          const hoje = new Date();
          const diasTramitacao = Math.ceil((hoje.getTime() - dataRecebimento.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            numero: p.numero_processo,
            prioridade: p.prioridade || 'media',
            dataRecebimento: p.data_recebimento || p.created_at,
            diasTramitacao,
            status: p.status
          };
        })
        .sort((a, b) => b.diasTramitacao - a.diasTramitacao)
        .slice(0, 10); // Top 10 mais antigos

      setProcessosDetalhados(processosAtivosDetalhados);

      // Calcular relatórios realizados (processos concluídos)
      const relatoriosArray = processosList
        .filter(p => p.status === 'concluido')
        .map(p => ({
          numero: p.numero_processo,
          desfecho: p.desfecho_final || 'Concluído',
          dataConclusao: p.updated_at
        }))
        .slice(0, 10); // Últimos 10 concluídos

      setRelatoriosRealizados(relatoriosArray);

      // Calcular dados de prioridades
      const prioridadesCount: { [key: string]: number } = {};
      processosList.forEach(p => {
        const prioridade = p.prioridade || 'media';
        prioridadesCount[prioridade] = (prioridadesCount[prioridade] || 0) + 1;
      });

      const prioridadesDataArray = Object.entries(prioridadesCount).map(([name, count], index) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        color: colors[index % colors.length]
      }));

      setPrioridadesData(prioridadesDataArray);

      // Calcular dados de tipos de processo
      const tiposCount: { [key: string]: number } = {};
      processosList.forEach(p => {
        const tipo = p.tipo_processo || 'investigacao_preliminar';
        tiposCount[tipo] = (tiposCount[tipo] || 0) + 1;
      });

      const tiposDataArray = Object.entries(tiposCount).map(([name, count], index) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        color: colors[index % colors.length]
      }));

      setTiposProcessoData(tiposDataArray);

      // Atualizar timestamp apenas quando os dados realmente mudaram
      setLastUpdateTime(new Date());

    } catch (err) {
      console.error('Erro ao buscar estatísticas detalhadas:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
      isUpdatingRef.current = false;
    }
  }, []);

  // Buscar estatísticas na montagem do componente
  useEffect(() => {
    fetchDetailedStats(true); // Força primeira carga
  }, []); // Removido fetchDetailedStats das dependências

  // Função para atualizar estatísticas com debounce
  const refreshStats = useCallback(() => {
    // Limpar timer anterior se existir
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

<<<<<<< HEAD
=======
    // Debounce de 500ms
    debounceTimerRef.current = setTimeout(() => {
      fetchDetailedStats(true); // Força atualização
    }, 500);
  }, [fetchDetailedStats]);

  // Cleanup do timer no unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    stats,
    desfechosData,
    eficienciaData,
    processosDetalhados,
    relatoriosRealizados,
    prioridadesData,
    tiposProcessoData,
    loading,
    error,
    refreshStats,
    lastUpdateTime
  };
} 