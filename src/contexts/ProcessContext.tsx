import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Process, ProcessStatus, ProcessPriority } from '@/types/process';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Tipos para filtros
export interface ProcessFilters {
  status: 'todos' | ProcessStatus;
  priority: 'todas' | ProcessPriority;
  search: string;
  dateRange?: { start: Date; end: Date } | null;
}

// Interface do contexto
interface ProcessContextType {
  // Estado dos processos
  processes: Process[];
  currentProcess: Process | null;
  editingProcess: Process | null;
  
  // Ações
  setCurrentProcess: (process: Process | null) => void;
  setEditingProcess: (process: Process | null) => void;
  updateProcess: (id: string, updates: Partial<Process>) => Promise<void>;
  deleteProcess: (id: string) => Promise<void>;
  createProcess: (process: Omit<Process, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  
  // Loading e error
  loading: boolean;
  error: string | null;
  
  // Filtros
  filters: ProcessFilters;
  setFilters: (filters: ProcessFilters) => void;
  
  // Utilitários
  refreshProcesses: () => Promise<void>;
  getProcessById: (id: string) => Process | undefined;
}

// Contexto
const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

// Provider
export const ProcessProvider = ({ children }: { children: ReactNode }) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProcessFilters>({
    status: 'todos',
    priority: 'todas',
    search: ''
  });

  const { toast } = useToast();

  // Carregar processos
  const loadProcesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('processos')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.status !== 'todos') {
        query = query.eq('status', filters.status);
      }
      if (filters.priority !== 'todas') {
        query = query.eq('prioridade', filters.priority);
      }
      if (filters.search) {
        query = query.ilike('numero_processo', `%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setProcesses(data || []);
    } catch (err) {
      console.error('Erro ao carregar processos:', err);
      setError('Erro ao carregar processos');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os processos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  // Configurar sincronização em tempo real
  useEffect(() => {
    const channel = supabase
      .channel('processos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'processos'
        },
        (payload) => {
          console.log('Mudança detectada em tempo real:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newProcess = payload.new as Process;
            setProcesses(prev => [newProcess, ...prev]);
            toast({
              title: "Novo Processo",
              description: `Processo ${newProcess.numero_processo} foi adicionado.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedProcess = payload.new as Process;
            const oldProcess = payload.old as Process;
            
            setProcesses(prev => {
              // Se o status mudou, remover da lista atual se necessário
              if (oldProcess.status !== updatedProcess.status) {
                const filtered = prev.filter(p => p.id !== updatedProcess.id);
                // Se o novo status corresponde aos filtros atuais, adicionar
                const shouldInclude = filters.status === 'todos' || updatedProcess.status === filters.status;
                return shouldInclude ? [updatedProcess, ...filtered] : filtered;
              }
              // Se apenas dados foram atualizados, atualizar o processo
              return prev.map(p => p.id === updatedProcess.id ? updatedProcess : p);
            });
            
            toast({
              title: "Processo Atualizado",
              description: `Processo ${updatedProcess.numero_processo} foi atualizado.`,
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedProcess = payload.old as Process;
            setProcesses(prev => prev.filter(p => p.id !== deletedProcess.id));
            toast({
              title: "Processo Excluído",
              description: `Processo ${deletedProcess.numero_processo} foi excluído.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters, toast]);

  // Carregar processos quando filtros mudarem
  useEffect(() => {
    loadProcesses();
  }, [loadProcesses]);

  // Atualizar processo
  const updateProcess = useCallback(async (id: string, updates: Partial<Process>) => {
    try {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('processos')
        .update(updates)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setProcesses(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      
      toast({
        title: "Sucesso",
        description: "Processo atualizado com sucesso.",
      });
    } catch (err) {
      console.error('Erro ao atualizar processo:', err);
      setError('Erro ao atualizar processo');
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o processo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Excluir processo
  const deleteProcess = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('processos')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Remover do estado local
      setProcesses(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Processo excluído com sucesso.",
      });
    } catch (err) {
      console.error('Erro ao excluir processo:', err);
      setError('Erro ao excluir processo');
      toast({
        title: "Erro",
        description: "Não foi possível excluir o processo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Criar processo
  const createProcess = useCallback(async (process: Omit<Process, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('processos')
        .insert([process])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Adicionar ao estado local
      setProcesses(prev => [data, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Processo criado com sucesso.",
      });
    } catch (err) {
      console.error('Erro ao criar processo:', err);
      setError('Erro ao criar processo');
      toast({
        title: "Erro",
        description: "Não foi possível criar o processo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Buscar processo por ID
  const getProcessById = useCallback((id: string) => {
    return processes.find(p => p.id === id);
  }, [processes]);

  // Refresh processos
  const refreshProcesses = useCallback(async () => {
    await loadProcesses();
  }, [loadProcesses]);

  const value: ProcessContextType = {
    processes,
    currentProcess,
    editingProcess,
    loading,
    error,
    filters,
    setCurrentProcess,
    setEditingProcess,
    updateProcess,
    deleteProcess,
    createProcess,
    setFilters,
    refreshProcesses,
    getProcessById
  };

  return (
    <ProcessContext.Provider value={value}>
      {children}
    </ProcessContext.Provider>
  );
};

// Hook para usar o contexto
export const useProcess = () => {
  const context = useContext(ProcessContext);
  if (!context) {
    throw new Error('useProcess must be used within ProcessProvider');
  }
  return context;
}; 