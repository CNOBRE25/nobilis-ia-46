
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, RotateCcw, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Process {
  id: string;
  numero: string;
  tipo: string;
  prioridade: string;
  dataRecebimento: string;
  dataInicioTramitacao?: string;
  dataConclusao?: string;
  desfecho?: string;
  status: 'tramitacao' | 'concluido';
  diasTramitacao?: number;
}

interface ProcessListProps {
  type: 'tramitacao' | 'concluidos';
  onClose: () => void;
}

const ProcessList = ({ type, onClose }: ProcessListProps) => {
  const { toast } = useToast();
  
  // Lista de processos (vazia inicialmente)
  const [processes] = useState<Process[]>([]);

  const filteredProcesses = processes.filter(p => p.status === type);

  const getPriorityBadge = (prioridade: string) => {
    switch (prioridade) {
      case "URGENTE-MARIA DA PENHA":
        return <Badge className="bg-red-600 text-white">URGENTE - MARIA DA PENHA</Badge>;
      case "URGENTE":
        return <Badge className="bg-orange-600 text-white">URGENTE</Badge>;
      case "MODERADO":
        return <Badge className="bg-blue-600 text-white">MODERADO</Badge>;
      default:
        return <Badge variant="outline">{prioridade}</Badge>;
    }
  };

  const handleEditProcess = (processId: string) => {
    if (import.meta.env.DEV) {
      console.log("Editando processo:", processId);
    }
    toast({
      title: "Editando Processo",
      description: "Processo aberto para edição."
    });
  };

  const handleViewProcess = (processId: string) => {
    if (import.meta.env.DEV) {
      console.log("Visualizando processo:", processId);
    }
    toast({
      title: "Visualizando Processo",
      description: "Processo aberto para visualização."
    });
  };

  const handleReopenProcess = (processId: string) => {
    if (import.meta.env.DEV) {
      console.log("Solicitando reabertura do processo:", processId);
    }
    toast({
      title: "Processo Reaberto",
      description: "Processo foi reaberto para nova análise."
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-50 overflow-auto">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">
            {type === 'tramitacao' ? 'Processos em Tramitação' : 'Processos Concluídos'}
          </h1>
          <Button onClick={onClose} variant="outline" className="text-white border-white">
            Fechar
          </Button>
        </div>

        <div className="space-y-4">
          {filteredProcesses.map((process) => (
            <Card key={process.id} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white">{process.numero}</h3>
                      {getPriorityBadge(process.prioridade)}
                    </div>
                    <p className="text-blue-200">{process.tipo}</p>
                    <div className="flex items-center gap-4 text-sm text-blue-200">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Recebido: {new Date(process.dataRecebimento).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {type === 'tramitacao' && process.diasTramitacao && (
                        <span className="text-yellow-300">
                          {process.diasTramitacao} dias em tramitação
                        </span>
                      )}
                      {type === 'concluidos' && process.dataConclusao && (
                        <span>
                          Concluído: {new Date(process.dataConclusao).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                    {type === 'concluidos' && process.desfecho && (
                      <p className="text-green-300">
                        <strong>Desfecho:</strong> {process.desfecho}
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessList;
