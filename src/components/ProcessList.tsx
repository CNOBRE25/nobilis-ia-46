
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, RotateCcw, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
}

interface ProcessListProps {
  type: 'tramitacao' | 'concluidos';
  onClose: () => void;
}

const ProcessList = ({ type, onClose }: ProcessListProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar processos do banco de dados
  useEffect(() => {
    loadProcesses();
  }, [type]);

  const loadProcesses = async () => {
    setLoading(true);
    setError(null);

    try {
      // Determinar o status baseado no tipo
      const statusFilter = type === 'tramitacao' ? 'tramitacao' : 'concluido';

      // Carregar processos do Supabase
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .eq('status', statusFilter)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar processos:', error);
        setError('Erro ao carregar processos do banco de dados');
        
        // Fallback para localStorage
        const processosLocais = JSON.parse(localStorage.getItem('processos') || '[]');
        const processosFiltrados = processosLocais.filter((p: any) => 
          p.status === statusFilter
        );
        setProcesses(processosFiltrados);
        
        toast({
          title: "Modo Offline",
          description: "Carregando processos do navegador (modo offline).",
        });
      } else {
        console.log('Processos carregados:', data);
        setProcesses(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar processos:', err);
      setError('Erro inesperado ao carregar processos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProcesses = processes.filter(p => p.status === type);

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

  const handleEditProcess = (processId: string) => {
    console.log("Editando processo:", processId);
    toast({
      title: "Editando Processo",
      description: "Processo aberto para edição."
    });
  };

  const handleViewProcess = (processId: string) => {
    console.log("Visualizando processo:", processId);
    toast({
      title: "Visualizando Processo",
      description: "Processo aberto para visualização."
    });
  };

  const handleReopenProcess = async (processId: string) => {
    try {
      const { error } = await supabase
        .from('processos')
        .update({ status: 'tramitacao' })
        .eq('id', processId);

      if (error) {
        console.error('Erro ao reabrir processo:', error);
        toast({
          title: "Erro",
          description: "Erro ao reabrir processo.",
          variant: "destructive"
        });
      } else {
        console.log("Processo reaberto:", processId);
        toast({
          title: "Processo Reaberto",
          description: "Processo foi reaberto para nova análise."
        });
        // Recarregar processos
        loadProcesses();
      }
    } catch (err) {
      console.error('Erro inesperado ao reabrir processo:', err);
      toast({
        title: "Erro",
        description: "Erro inesperado ao reabrir processo.",
        variant: "destructive"
      });
    }
  };

  const calculateDaysInProcess = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-50 overflow-auto">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            {type === 'tramitacao' ? 'Processos em Tramitação' : 'Processos Concluídos'}
          </h1>
          <div className="flex items-center gap-4">
            <Button 
              onClick={loadProcesses} 
              variant="outline" 
              className="text-white border-white"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
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
            <Card key={process.id} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white">{process.numero_processo}</h3>
                      {getPriorityBadge(process.prioridade)}
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
                        <Calendar className="h-4 w-4" />
                        <span>Criado: {new Date(process.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {type === 'tramitacao' && (
                        <span className="text-yellow-300">
                          {calculateDaysInProcess(process.created_at)} dias em tramitação
                        </span>
                      )}
                      {type === 'concluidos' && process.updated_at && (
                        <span>
                          Concluído: {new Date(process.updated_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    {type === 'concluidos' && process.desfecho_final && (
                      <p className="text-green-300">
                        <strong>Desfecho:</strong> {process.desfecho_final}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {type === 'tramitacao' ? (
                      <Button
                        onClick={() => handleEditProcess(process.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleViewProcess(process.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                        <Button
                          onClick={() => handleReopenProcess(process.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Solicitar Reabertura
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredProcesses.length === 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8 text-center">
                <p className="text-white text-lg">
                  Nenhum processo {type === 'tramitacao' ? 'em tramitação' : 'concluído'} encontrado.
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
  );
};

export default ProcessList;
