
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Brain, CheckCircle, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIReportGeneratorProps {
  onClose: () => void;
}

const AIReportGenerator = ({ onClose }: AIReportGeneratorProps) => {
  const { toast } = useToast();

  // Lista de processos concluídos (vazia inicialmente)
  const [processosConcluidos] = useState([]);

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

  const handleAbrirProcesso = (id: string) => {
    if (import.meta.env.DEV) {
      console.log("Abrindo processo:", id);
    }
    toast({
      title: "Abrindo Processo",
      description: "Carregando dados do processo..."
    });
  };

  const handleEditarProcesso = (id: string) => {
    if (import.meta.env.DEV) {
      console.log("Editando processo:", id);
    }
    toast({
      title: "Editando Processo",
      description: "Processo aberto para edição."
    });
  };

  const handleGerarRelatorioIA = (id: string) => {
    if (import.meta.env.DEV) {
      console.log("Gerando relatório IA para processo:", id);
    }
    toast({
      title: "Gerando Relatório IA",
      description: "Processando dados com Inteligência Artificial... Isso pode levar alguns minutos."
    });
    
    // Simular processo de geração
    setTimeout(() => {
      toast({
        title: "Relatório Gerado!",
        description: "Relatório com análise de IA foi gerado com sucesso."
      });
    }, 3000);
  };

  const handleFinalizarProcesso = (id: string) => {
    if (import.meta.env.DEV) {
      console.log("Finalizando processo:", id);
    }
    toast({
      title: "Processo Finalizado",
      description: "Processo foi finalizado na unidade."
    });
  };

  const handleReabrirProcesso = (id: string) => {
    if (import.meta.env.DEV) {
      console.log("Solicitando reabertura do processo:", id);
    }
    toast({
      title: "Processo Reaberto",
      description: "Processo foi reaberto para nova análise."
    });
  };

  const processosNaoFinalizados = processosConcluidos.filter(p => !p.relatorioFinalizado);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-50 overflow-auto">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerar Relatório Inteligente</h1>
            <p className="text-blue-200 mt-2">Processos concluídos aguardando relatório final</p>
          </div>
          <Button onClick={onClose} variant="outline" className="text-white border-white">
            Fechar
          </Button>
        </div>

        <div className="space-y-4">
          {processosNaoFinalizados.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Todos os relatórios estão em dia!</h3>
                <p className="text-blue-200">Não há processos concluídos aguardando relatório final.</p>
              </CardContent>
            </Card>
          ) : (
            processosNaoFinalizados.map((processo) => (
              <Card key={processo.id} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white">{processo.numero}</h3>
                        {getPriorityBadge(processo.prioridade)}
                      </div>
                      <div className="text-blue-200 space-y-1">
                        <p><strong>Tipo:</strong> {processo.tipo}</p>
                        <p><strong>Data de Conclusão:</strong> {new Date(processo.dataConclusao).toLocaleDateString('pt-BR')}</p>
                        <p><strong>Desfecho:</strong> <span className="text-green-300">{processo.desfecho}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleAbrirProcesso(processo.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Abrir
                      </Button>
                      <Button
                        onClick={() => handleEditarProcesso(processo.id)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleGerarRelatorioIA(processo.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Gerar Relatório IA
                      </Button>
                      <Button
                        onClick={() => handleFinalizarProcesso(processo.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Finalizar na Unidade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Seção de Processos Já Finalizados */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Processos Já Finalizados</h2>
          <div className="space-y-4">
            {processosConcluidos.filter(p => p.relatorioFinalizado).map((processo) => (
              <Card key={processo.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-white">{processo.numero}</h4>
                        <Badge className="bg-green-600 text-white">Finalizado</Badge>
                      </div>
                      <p className="text-blue-200 text-sm">
                        <strong>Desfecho:</strong> {processo.desfecho}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleReabrirProcesso(processo.id)}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Solicitar Reabertura
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReportGenerator;
