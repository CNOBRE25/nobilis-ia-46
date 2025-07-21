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

// Função para gerar hash dos dados
const generateDataHash = (data: any): string => {
  return JSON.stringify(data);
};

export function useProcessStats() {
  const [stats, setStats] = useState<ProcessStats>({
    totalProcessos: 0,
    processosAtivos: 0,
    processosConcluidos: 0,
    processosUrgentes: 0,
    tempoMedioResolucao: 0,
    taxaEficiencia: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Refs para controle de cache e debounce
  const dataHashRef = useRef<string>('');
  const isUpdatingRef = useRef(false);
  const lastFetchTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async (forceUpdate = false) => {
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
        .from('processos' as any)
        .select('*');

      if (processosError) {
        console.error('Erro ao buscar processos:', processosError);
        setError('Erro ao carregar estatísticas');
        return;
      }

      const processosList = (processos as any[]) || [];

      // Gerar hash dos dados atuais
      const currentDataHash = generateDataHash(processosList);
      
      // Verificar se os dados realmente mudaram
      if (dataHashRef.current === currentDataHash && !forceUpdate) {
        console.log('Dados inalterados, mantendo cache...');
        setLoading(false);
        return;
      }

      // Atualizar hash apenas se os dados mudaram
      dataHashRef.current = currentDataHash;

      // Calcular estatísticas
      const totalProcessos = processosList.length;
      const processosAtivos = processosList.filter(p => p.status === 'tramitacao').length;
      const processosConcluidos = processosList.filter(p => p.status === 'concluido').length;
      const processosUrgentes = processosList.filter(p => 
        p.prioridade === 'urgente' || 
        p.prioridade === 'alta' || 
        p.prioridade === 'urgente_maria_penha'
      ).length;

      // Calcular tempo médio de resolução (processos concluídos)
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

      // Calcular taxa de eficiência (processos concluídos / total)
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

      // Atualizar timestamp apenas quando os dados realmente mudaram
      setLastUpdateTime(new Date());

    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
      isUpdatingRef.current = false;
    }
  }, []);

  // Buscar estatísticas na montagem do componente
  useEffect(() => {
    fetchStats(true); // Força primeira carga
  }, [fetchStats]);

  // Função para atualizar estatísticas com debounce
  const refreshStats = useCallback(() => {
    // Limpar timer anterior se existir
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce de 500ms
    debounceTimerRef.current = setTimeout(() => {
      fetchStats(true); // Força atualização
    }, 500);
  }, [fetchStats]);

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
    loading,
    error,
    refreshStats,
    lastUpdateTime
  };
} 