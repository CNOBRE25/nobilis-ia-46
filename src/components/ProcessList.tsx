
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit, Eye, Calendar as CalendarIcon, Loader2, Save, X, FileText, Users, Brain, EyeOff, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCrimeStats } from "../hooks/useCrimeStats";
import NovoProcessoForm from "./NovoProcessoForm";

// Importar DILIGENCIAS do NovoProcessoForm
const DILIGENCIAS = [
  { id: "diligencia_1", label: "Oitiva da vítima" },
  { id: "diligencia_2", label: "Oitiva de testemunhas" },
  { id: "diligencia_3", label: "Oitiva do investigado" },
  { id: "diligencia_4", label: "Coleta de provas materiais" },
  { id: "diligencia_5", label: "Análise de documentos" },
  { id: "diligencia_6", label: "Inspeção local" },
  { id: "diligencia_7", label: "Reconhecimento fotográfico" },
  { id: "diligencia_8", label: "Perícia técnica" },
  { id: "diligencia_9", label: "Interceptação telefônica" },
  { id: "diligencia_10", label: "Busca e apreensão" },
  { id: "diligencia_11", label: "Quebra de sigilo bancário" },
  { id: "diligencia_12", label: "Quebra de sigilo telefônico" },
  { id: "diligencia_13", label: "Quebra de sigilo fiscal" },
  { id: "diligencia_14", label: "Colaboração premiada" },
  { id: "diligencia_15", label: "Ação controlada" },
  { id: "diligencia_16", label: "Infiltração de agentes" },
  { id: "diligencia_17", label: "Monitoramento eletrônico" },
  { id: "diligencia_18", label: "Análise de dados digitais" },
  { id: "diligencia_19", label: "Cooperação internacional" },
  { id: "diligencia_20", label: "Outras diligências" }
];

interface Process {
  id: string;
  numero_processo: string;
  tipo_processo: string;
  prioridade: string;
  data_recebimento: string;
  data_fato?: string;
  desfecho_final?: string;
  status: 'tramitacao' | 'concluido' | 'arquivado' | 'suspenso';
  nome_investigado?: string;
  cargo_investigado?: string;
  unidade_investigado?: string;
  created_at: string;
  updated_at: string;
  // Campos adicionais para edição
  descricao_fatos?: string;
  modus_operandi?: string;
  diligencias_realizadas?: any;
  redistribuicao?: string;
  sugestoes?: string;
  matricula_investigado?: string;
  data_admissao?: string;
  numero_sigpad?: string;
  vitima?: string; // Adicionado para a visualização
  // Campos do relatório final
  relatorio_final?: any;
  data_relatorio_final?: string;
  relatorio_gerado_por?: string;
}

interface ProcessListProps {
  type: 'tramitacao' | 'arquivados';
  onClose: () => void;
}

const ProcessCard = React.memo(({ process, type, getPriorityBadge, getTipoProcessoLabel, handleEditProcess, handleDeleteProcess, handleViewProcess, calculateDaysInProcess }: any) => (
  <Card key={process.id} className="bg-white/10 backdrop-blur-sm border-white/20">
    <CardContent className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">{process.numero_processo}</h3>
            {getPriorityBadge(process.prioridade)}
            {process.status === 'arquivado' && (
              <Badge className="bg-gray-600 text-white">Arquivado</Badge>
            )}
            {process.status === 'concluido' && (
              <Badge className="bg-green-600 text-white">Concluído</Badge>
            )}
          </div>
          <p className="text-blue-200">{getTipoProcessoLabel(process.tipo_processo)}</p>
          {process.nome_investigado && (
            <p className="text-blue-200">
              <strong>Investigado:</strong> {process.nome_investigado}
              {process.cargo_investigado && ` - ${process.cargo_investigado}`}
              {process.unidade_investigado && ` (${process.unidade_investigado})`}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-blue-200">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>Criado: {new Date(process.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            {type === 'tramitacao' && process.data_recebimento && (
              <span className="text-yellow-300">
                {calculateDaysInProcess(process.data_recebimento)} dias em tramitação
              </span>
            )}
            {type === 'arquivados' && process.updated_at && (
              <span>
                {process.status === 'concluido' ? 'Concluído' : 'Arquivado'}: {new Date(process.updated_at).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          {type === 'arquivados' && process.desfecho_final && (
            <p className="text-green-300">
              <strong>Desfecho:</strong> {process.desfecho_final}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {type === 'tramitacao' ? (
            <>
              <Button onClick={() => handleEditProcess(process)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button onClick={() => handleDeleteProcess(process)} className="bg-red-600 hover:bg-red-700 text-white">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </>
          ) : type === 'arquivados' ? (
            <>
              <Button onClick={() => {
                console.log('Clicou em Consultar para processo:', process.id, process.numero_processo);
                handleViewProcess(process.id);
              }} className="bg-green-600 hover:bg-green-700 text-white">
                <Eye className="h-4 w-4 mr-2" />
                Consultar
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </CardContent>
  </Card>
));

const ProcessList = React.memo(({ type, onClose }: ProcessListProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Process>>({});
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [processoParaEditar, setProcessoParaEditar] = useState<Process | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<Process | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingProcess, setViewingProcess] = useState<Process | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const { refreshStats: refreshCrimeStats } = useCrimeStats();

  // Carregar processos do banco de dados e configurar sincronização em tempo real
  useEffect(() => {
    console.log('useEffect triggered - type:', type);
    loadProcesses();
    
    // Configurar sincronização em tempo real
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
          
          // Atualizar a lista baseado no tipo de mudança
          if (payload.eventType === 'INSERT') {
            // Novo processo adicionado
            const newProcess = payload.new as Process;
            const shouldInclude = type === 'tramitacao' 
              ? newProcess.status === 'tramitacao'
              : newProcess.status === 'concluido' || newProcess.status === 'arquivado';
            
            if (shouldInclude) {
              setProcesses(prev => [newProcess, ...prev]);
              toast({
                title: "Novo Processo",
                description: `Processo ${newProcess.numero_processo} foi adicionado.`,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            // Processo atualizado
            const updatedProcess = payload.new as Process;
            const oldProcess = payload.old as Process;
            
            console.log('UPDATE detectado:', {
              oldStatus: oldProcess.status,
              newStatus: updatedProcess.status,
              processId: updatedProcess.id,
              currentType: type
            });
            
            setProcesses(prev => {
              // Se o status mudou, remover da lista atual se necessário
              if (oldProcess.status !== updatedProcess.status) {
                console.log('Status mudou, removendo processo da lista atual');
                const filtered = prev.filter(p => p.id !== updatedProcess.id);
                // Se o novo status corresponde ao tipo atual, adicionar
                const shouldInclude = type === 'tramitacao' 
                  ? updatedProcess.status === 'tramitacao'
                  : updatedProcess.status === 'concluido' || updatedProcess.status === 'arquivado';
                
                console.log('Deve incluir na lista atual?', shouldInclude);
                
                if (shouldInclude) {
                  console.log('Adicionando processo atualizado à lista');
                  return [updatedProcess, ...filtered];
                }
                console.log('Processo não deve estar na lista atual');
                return filtered;
              }
              // Se apenas dados foram atualizados, atualizar o processo
              console.log('Apenas dados atualizados, mantendo processo na lista');
              return prev.map(p => p.id === updatedProcess.id ? updatedProcess : p);
            });
            
            toast({
              title: "Processo Atualizado",
              description: `Processo ${updatedProcess.numero_processo} foi atualizado.`,
            });
          } else if (payload.eventType === 'DELETE') {
            // Processo excluído
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

    // Cleanup da subscription
    return () => {
      console.log('Desconectando do canal de tempo real');
      supabase.removeChannel(channel);
    };
  }, [type, toast]);

  const loadProcesses = async () => {
    console.log('Iniciando carregamento de processos...');
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('processos').select('*');
      
      if (type === 'tramitacao') {
        query = query.eq('status', 'tramitacao');
      } else if (type === 'arquivados') {
        // Incluir tanto processos concluídos quanto arquivados
        query = query.in('status', ['concluido', 'arquivado']);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar processos:', error);
        setError('Erro ao carregar processos do banco de dados');
        
        // Fallback para localStorage
        const processosLocais = JSON.parse(localStorage.getItem('processos') || '[]');
        let processosFiltrados;
        if (type === 'tramitacao') {
          processosFiltrados = processosLocais.filter((p: any) => p.status === 'tramitacao');
        } else {
          processosFiltrados = processosLocais.filter((p: any) => 
            p.status === 'concluido' || p.status === 'arquivado'
          );
        }
        setProcesses(processosFiltrados);
        
        toast({
          title: "Modo Offline",
          description: "Carregando processos do navegador (modo offline).",
        });
      } else {
        console.log('Processos carregados com sucesso:', data?.length || 0, 'processos');
        console.log('Status dos processos carregados:', data?.map(p => ({ id: p.id, numero: p.numero_processo, status: p.status })));
        setProcesses(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar processos:', err);
      setError('Erro inesperado ao carregar processos');
    } finally {
      console.log('Finalizando carregamento de processos');
      setLoading(false);
    }
  };

  const filteredProcesses = type === 'tramitacao' 
    ? processes.filter(p => p.status === 'tramitacao')
    : processes.filter(p => p.status === 'concluido' || p.status === 'arquivado');
  console.log('Processos filtrados:', filteredProcesses.length, 'de', processes.length, 'total');
  console.log('Tipo atual:', type);
  console.log('Status dos processos filtrados:', filteredProcesses.map(p => ({ id: p.id, numero: p.numero_processo, status: p.status })));
  console.log('Todos os processos:', processes.map(p => ({ id: p.id, numero: p.numero_processo, status: p.status })));

  const getPriorityBadge = (prioridade: string) => {
    switch (prioridade) {
      case "urgente":
        return <Badge className="bg-red-600 text-white">URGENTE</Badge>;
      case "alta":
        return <Badge className="bg-orange-600 text-white">ALTA</Badge>;
      case "media":
        return <Badge className="bg-blue-600 text-white">MÉDIA</Badge>;
      case "baixa":
        return <Badge className="bg-green-600 text-white">BAIXA</Badge>;
      default:
        return <Badge variant="outline">{prioridade}</Badge>;
    }
  };

  const getTipoProcessoLabel = (tipo: string) => {
    switch (tipo) {
      case "investigacao_preliminar":
        return "INVESTIGAÇÃO PRELIMINAR";
      case "sindicancia":
        return "SINDICÂNCIA";
      case "processo_administrativo":
        return "PROCESSO ADMINISTRATIVO";
      case "inquerito_policial_militar":
        return "INQUÉRITO POLICIAL MILITAR";
      default:
        return tipo.toUpperCase();
    }
  };

  const handleEditProcess = (process: Process) => {
    const mapped = {
      numeroProcesso: process.numero_processo || "",
      tipoProcesso: process.tipo_processo || "",
      prioridade: process.prioridade || "",
      numeroDespacho: process.numero_despacho || "",
      dataDespacho: process.data_despacho || "",
      dataRecebimento: process.data_recebimento || "",
      dataFato: process.data_fato || "",
      origemProcesso: process.origem_processo || "",
      statusFuncional: process.status_funcional || "",
      descricaoFatos: process.descricao_fatos || "",
      tipificacaoCriminal: process.tipo_crime || "",
      diligenciasRealizadas: process.diligencias_realizadas || {},
      nomeInvestigado: process.nome_investigado || "",
      cargoInvestigado: process.cargo_investigado || "",
      unidadeInvestigado: process.unidade_investigado || "",
      matriculaInvestigado: process.matricula_investigado || "",
      dataAdmissao: process.data_admissao || "",
      vitima: process.vitima || "",
      numeroSigpad: process.numero_sigpad || "",
      id: process.id
    };
    console.log("[DEBUG] Editando processo:", mapped);
    setProcessoParaEditar(mapped);
  };

  // Garantir que o modal de edição sempre abre quando processoParaEditar for definido
  useEffect(() => {
    if (processoParaEditar) {
      console.log("[DEBUG] Modal de edição aberto para processo:", processoParaEditar);
    }
  }, [processoParaEditar]);

  const handleSaveEdit = async () => {
    if (!editingProcess) {
      console.log('Nenhum processo selecionado para edição');
      return;
    }

    console.log('Iniciando salvamento do processo:', editingProcess.id);
    setIsEditing(true);
    
    try {
      const { error } = await supabase
        .from('processos')
        .update(editFormData)
        .eq('id', editingProcess.id);

      if (error) {
        console.error('Erro ao atualizar processo:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar alterações.",
          variant: "destructive"
        });
      } else {
        console.log("Processo atualizado com sucesso:", editingProcess.id);
        toast({
          title: "Processo Atualizado",
          description: "Alterações salvas com sucesso."
        });
        
        // Fechar modal de edição
        setEditingProcess(null);
        setEditFormData({});
        // Atualiza estatísticas de crimes automaticamente
        await refreshCrimeStats();
      }
    } catch (err) {
      console.error('Erro inesperado ao atualizar processo:', err);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar alterações.",
        variant: "destructive"
      });
    } finally {
      console.log('Finalizando salvamento do processo');
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    console.log('Cancelando edição do processo');
    setEditingProcess(null);
    setEditFormData({});
    setIsEditing(false);
  };

  const handleViewProcess = async (processId: string) => {
    console.log('Tentando visualizar processo:', processId);
    console.log('Processos disponíveis:', processes.map(p => ({ id: p.id, numero: p.numero_processo, status: p.status })));
    
    // Primeiro, tentar encontrar na lista local
    let process = processes.find(p => p.id === processId);
    
    if (!process) {
      console.log('Processo não encontrado na lista local, buscando no banco...');
      // Se não encontrou na lista local, buscar diretamente no banco
      try {
        const { data, error } = await supabase
          .from('processos')
          .select('*')
          .eq('id', processId)
          .single();
        
        if (error) {
          console.error('Erro ao buscar processo no banco:', error);
          toast({
            title: "Erro",
            description: "Erro ao buscar processo no banco de dados.",
            variant: "destructive"
          });
          return;
        }
        
        if (data) {
          process = data;
          console.log('Processo encontrado no banco:', data);
        }
      } catch (err) {
        console.error('Erro inesperado ao buscar processo:', err);
        toast({
          title: "Erro",
          description: "Erro inesperado ao buscar processo.",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Se encontrou na lista local, buscar dados completos no banco para garantir
      console.log('Processo encontrado na lista local, buscando dados completos no banco...');
      try {
        const { data, error } = await supabase
          .from('processos')
          .select('*')
          .eq('id', processId)
          .single();
        
        if (!error && data) {
          process = data;
          console.log('Dados completos carregados do banco:', data);
        }
      } catch (err) {
        console.error('Erro ao buscar dados completos:', err);
        // Continuar com os dados da lista local
      }
    }
    
    if (process) {
      console.log('Dados do processo para visualização:', {
        id: process.id,
        numero: process.numero_processo,
        status: process.status,
        desfecho_final: process.desfecho_final,
        descricao_fatos: process.descricao_fatos,
        diligencias_realizadas: process.diligencias_realizadas,
        sugestoes: process.sugestoes
      });
      
      setViewingProcess(process);
      setShowViewDialog(true);
      console.log("Visualizando processo:", processId, process);
    } else {
      console.error('Processo não encontrado nem na lista local nem no banco:', processId);
      toast({
        title: "Erro",
        description: "Processo não encontrado.",
        variant: "destructive"
      });
    }
  };



  const handleDeleteProcess = async (processToDelete: Process) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('processos')
        .delete()
        .eq('id', processToDelete.id);
      if (error) {
        toast({
          title: "Erro ao excluir",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setProcesses(prev => prev.filter(p => p.id !== processToDelete.id));
        toast({
          title: "Processo Excluído",
          description: "O processo foi removido com sucesso."
        });
        // Atualiza estatísticas de crimes automaticamente
        await refreshCrimeStats();
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const confirmDeleteProcess = async () => {
    if (!processToDelete) return;

    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('processos' as any)
        .delete()
        .eq('id', processToDelete.id);

      if (error) {
        console.error('Erro ao excluir processo:', error);
        toast({
          title: "Erro ao Excluir",
          description: "Erro ao excluir processo. Tente novamente.",
          variant: "destructive"
        });
      } else {
        console.log("Processo excluído:", processToDelete.id);
        toast({
          title: "Processo Excluído",
          description: `Processo ${processToDelete.numero_processo} foi excluído com sucesso.`
        });
        
        // A atualização automática acontece via real-time subscription
        // O processo será removido automaticamente da lista
      }
    } catch (err) {
      console.error('Erro inesperado ao excluir processo:', err);
      toast({
        title: "Erro Inesperado",
        description: "Erro inesperado ao excluir processo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setProcessToDelete(null);
    }
  };

  const cancelDeleteProcess = () => {
    setShowDeleteDialog(false);
    setProcessToDelete(null);
  };

  const calculateDaysInProcess = (dataRecebimento: string) => {
    const recebimento = new Date(dataRecebimento);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - recebimento.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };



  const memoizedGetPriorityBadge = useCallback(getPriorityBadge, []);
  const memoizedGetTipoProcessoLabel = useCallback(getTipoProcessoLabel, []);
  const memoizedEditProcess = useCallback(handleEditProcess, []);
  const memoizedDeleteProcess = useCallback(handleDeleteProcess, []);
  const memoizedViewProcess = useCallback(handleViewProcess, []);
  const memoizedCalculateDaysInProcess = useCallback(calculateDaysInProcess, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Carregando processos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-50 overflow-auto">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">
              {type === 'tramitacao' ? 'Processos em Tramitação' : 'Processos Finalizados'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Sincronizado em tempo real</span>
              </div>
              <Button onClick={onClose} variant="outline" className="text-white border-white">
                Fechar
              </Button>
            </div>
          </div>

          {error && (
            <Card className="bg-red-500/20 border-red-500/30 mb-6">
              <CardContent className="p-4">
                <p className="text-red-200">{error}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {filteredProcesses.map((process) => (
              <ProcessCard
                key={process.id}
                process={process}
                type={type}
                getPriorityBadge={memoizedGetPriorityBadge}
                getTipoProcessoLabel={memoizedGetTipoProcessoLabel}
                handleEditProcess={memoizedEditProcess}
                handleDeleteProcess={memoizedDeleteProcess}
                handleViewProcess={memoizedViewProcess}
                calculateDaysInProcess={memoizedCalculateDaysInProcess}
              />
            ))}

            {filteredProcesses.length === 0 && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-8 text-center">
                  <p className="text-white text-lg">
                    Nenhum processo {type === 'tramitacao' ? 'em tramitação' : 'finalizado'} encontrado.
                  </p>
                  {error && (
                    <p className="text-red-300 text-sm mt-2">
                      Verifique sua conexão com a internet e tente novamente.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription className="text-gray-700">
              Tem certeza que deseja excluir o processo <strong>{processToDelete?.numero_processo}</strong>?
              <br />
              <span className="text-red-600 font-medium">Esta ação não pode ser desfeita.</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Detalhes do Processo:</h4>
            <div className="text-sm text-red-700 space-y-1">
              <p><strong>Número:</strong> {processToDelete?.numero_processo}</p>
              <p><strong>Tipo:</strong> {processToDelete?.tipo_processo}</p>
              <p><strong>Investigado:</strong> {processToDelete?.nome_investigado || 'Não informado'}</p>
              <p><strong>Status:</strong> {processToDelete?.status}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={cancelDeleteProcess}
              disabled={isDeleting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteProcess}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Processo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização Detalhada */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 border-white/20 max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-2xl">
              <Eye className="h-6 w-6" />
              Consulta de Processo Finalizado
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              Visualização completa do processo {viewingProcess?.numero_processo} - Apenas para consulta
            </DialogDescription>
          </DialogHeader>
          
          {viewingProcess && (
            <div className="space-y-6">


              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-lg border-b border-blue-500 pb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-blue-200">
                    <p><strong className="text-white">Número:</strong> {viewingProcess.numero_processo}</p>
                    <p><strong className="text-white">Tipo:</strong> {getTipoProcessoLabel(viewingProcess.tipo_processo)}</p>
                    <p><strong className="text-white">Prioridade:</strong> {getPriorityBadge(viewingProcess.prioridade)}</p>
                    <p><strong className="text-white">Status:</strong> 
                      {viewingProcess.status === 'arquivado' ? (
                        <Badge className="bg-gray-600 text-white ml-2">Arquivado</Badge>
                      ) : viewingProcess.status === 'concluido' ? (
                        <Badge className="bg-green-600 text-white ml-2">Concluído</Badge>
                      ) : (
                        <Badge className="bg-yellow-600 text-white ml-2">Em Tramitação</Badge>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-lg border-b border-blue-500 pb-2">Datas</h4>
                  <div className="space-y-2 text-blue-200">
                    <p><strong className="text-white">Criado:</strong> {new Date(viewingProcess.created_at).toLocaleDateString('pt-BR')}</p>
                    <p><strong className="text-white">Atualizado:</strong> {new Date(viewingProcess.updated_at).toLocaleDateString('pt-BR')}</p>
                    {viewingProcess.data_recebimento && (
                      <p><strong className="text-white">Recebimento:</strong> {new Date(viewingProcess.data_recebimento).toLocaleDateString('pt-BR')}</p>
                    )}
                    {viewingProcess.data_fato && (
                      <p><strong className="text-white">Data do Fato:</strong> {new Date(viewingProcess.data_fato).toLocaleDateString('pt-BR')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Investigado */}
              {viewingProcess.nome_investigado && (
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-lg border-b border-blue-500 pb-2">Investigado</h4>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                    <div className="space-y-2 text-blue-200">
                      <p><strong className="text-white">Nome:</strong> {viewingProcess.nome_investigado}</p>
                      {viewingProcess.cargo_investigado && (
                        <p><strong className="text-white">Cargo:</strong> {viewingProcess.cargo_investigado}</p>
                      )}
                      {viewingProcess.unidade_investigado && (
                        <p><strong className="text-white">Unidade:</strong> {viewingProcess.unidade_investigado}</p>
                      )}
                      {viewingProcess.matricula_investigado && (
                        <p><strong className="text-white">Matrícula:</strong> {viewingProcess.matricula_investigado}</p>
                      )}
                      {viewingProcess.data_admissao && (
                        <p><strong className="text-white">Data de Admissão:</strong> {new Date(viewingProcess.data_admissao).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Vítima */}
              {viewingProcess.vitima && (
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-lg border-b border-blue-500 pb-2">Vítima</h4>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                    <p className="text-blue-200">{viewingProcess.vitima}</p>
                  </div>
                </div>
              )}

              {/* Descrição dos Fatos */}
              {viewingProcess.descricao_fatos && (
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-lg border-b border-blue-500 pb-2">Descrição dos Fatos</h4>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                    <p className="text-blue-200 whitespace-pre-wrap">{viewingProcess.descricao_fatos}</p>
                  </div>
                </div>
              )}

              {/* Modus Operandi */}
              {viewingProcess.modus_operandi && (
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-lg border-b border-blue-500 pb-2">Modus Operandi</h4>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                    <p className="text-blue-200 whitespace-pre-wrap">{viewingProcess.modus_operandi}</p>
                  </div>
                </div>
              )}

              {/* Diligências Realizadas */}
              {viewingProcess.diligencias_realizadas && Object.keys(viewingProcess.diligencias_realizadas).length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-lg border-b border-blue-500 pb-2">Diligências Realizadas</h4>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                    <div className="space-y-4">
                      {Object.entries(viewingProcess.diligencias_realizadas).map(([id, diligencia]: [string, any]) => (
                        diligencia.realizada && (
                          <div key={id} className="border-l-4 border-blue-500 pl-4">
                            <p className="font-semibold text-white text-base">
                              {DILIGENCIAS.find(d => d.id === id)?.label || id}
                            </p>
                            {diligencia.observacao && (
                              <p className="text-blue-200 mt-2 whitespace-pre-wrap">
                                {diligencia.observacao}
                              </p>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Desfecho Final */}
              {viewingProcess.desfecho_final && (
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-lg border-b border-green-500 pb-2">Desfecho Final</h4>
                  <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-lg">
                    <p className="text-green-200 text-base">{viewingProcess.desfecho_final}</p>
                  </div>
                </div>
              )}

              {/* Relatório Final */}
              {viewingProcess.relatorio_final && (
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-lg border-b border-purple-500 pb-2 flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Relatório Final - Análise IA
                    {viewingProcess.data_relatorio_final && (
                      <Badge className="bg-purple-600 text-white text-xs">
                        {new Date(viewingProcess.data_relatorio_final).toLocaleDateString('pt-BR')}
                      </Badge>
                    )}
                  </h4>
                  <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
                    <div className="space-y-4">
                      {/* Cabeçalho */}
                      {viewingProcess.relatorio_final.cabecalho && (
                        <div className="border-b border-purple-500/30 pb-3">
                          <h5 className="font-semibold text-purple-200 text-base mb-2">Cabeçalho</h5>
                          <p className="text-purple-100 whitespace-pre-wrap text-sm">{viewingProcess.relatorio_final.cabecalho}</p>
                        </div>
                      )}

                      {/* Das Preliminares */}
                      {viewingProcess.relatorio_final.das_preliminares && (
                        <div className="border-b border-purple-500/30 pb-3">
                          <h5 className="font-semibold text-purple-200 text-base mb-2">I – Das Preliminares</h5>
                          <p className="text-purple-100 whitespace-pre-wrap text-sm">{viewingProcess.relatorio_final.das_preliminares}</p>
                        </div>
                      )}

                      {/* Dos Fatos */}
                      {viewingProcess.relatorio_final.dos_fatos && (
                        <div className="border-b border-purple-500/30 pb-3">
                          <h5 className="font-semibold text-purple-200 text-base mb-2">II – Dos Fatos</h5>
                          <p className="text-purple-100 whitespace-pre-wrap text-sm">{viewingProcess.relatorio_final.dos_fatos}</p>
                        </div>
                      )}

                      {/* Das Diligências */}
                      {viewingProcess.relatorio_final.das_diligencias && (
                        <div className="border-b border-purple-500/30 pb-3">
                          <h5 className="font-semibold text-purple-200 text-base mb-2">III – Das Diligências</h5>
                          <p className="text-purple-100 whitespace-pre-wrap text-sm">{viewingProcess.relatorio_final.das_diligencias}</p>
                        </div>
                      )}

                      {/* Da Fundamentação */}
                      {viewingProcess.relatorio_final.da_fundamentacao && (
                        <div className="border-b border-purple-500/30 pb-3">
                          <h5 className="font-semibold text-purple-200 text-base mb-2">IV – Da Fundamentação</h5>
                          <p className="text-purple-100 whitespace-pre-wrap text-sm">{viewingProcess.relatorio_final.da_fundamentacao}</p>
                        </div>
                      )}

                      {/* Da Conclusão */}
                      {viewingProcess.relatorio_final.da_conclusao && (
                        <div>
                          <h5 className="font-semibold text-purple-200 text-base mb-2">V – Da Conclusão</h5>
                          <p className="text-purple-100 whitespace-pre-wrap text-sm">{viewingProcess.relatorio_final.da_conclusao}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sugestões */}
              {viewingProcess.sugestoes && (
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-lg border-b border-blue-500 pb-2">Sugestões</h4>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                    <p className="text-blue-200 whitespace-pre-wrap">{viewingProcess.sugestoes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowViewDialog(false)}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição com NovoProcessoForm */}
      {processoParaEditar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="ai-gradient rounded-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-auto border border-border/60 shadow-2xl">
            <NovoProcessoForm
              processo={processoParaEditar}
              onProcessCreated={() => {
                setProcessoParaEditar(null);
                loadProcesses();
              }}
            />
            <div className="flex justify-end mt-4">
              <Button onClick={() => setProcessoParaEditar(null)} variant="outline" className="text-white border-white">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ProcessList;
