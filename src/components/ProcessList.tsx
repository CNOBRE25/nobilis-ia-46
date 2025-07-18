
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Edit, Eye, RotateCcw, Calendar as CalendarIcon, Loader2, Save, X, FileText, Users, Brain } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
  // Campos adicionais para edição
  descricao_fatos?: string;
  modus_operandi?: string;
  diligencias_realizadas?: any;
  redistribuicao?: string;
  sugestoes?: string;
  matricula_investigado?: string;
  data_admissao?: string;
  vitima?: string;
  numero_sigpad?: string;
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
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Process>>({});

  // Carregar processos do banco de dados
  useEffect(() => {
    console.log('useEffect triggered - type:', type);
    loadProcesses();
  }, [type]);

  const loadProcesses = async () => {
    console.log('Iniciando carregamento de processos...');
    setLoading(true);
    setError(null);

    try {
      // Determinar o status baseado no tipo
      const statusFilter = type === 'tramitacao' ? 'tramitacao' : 'concluido';
      console.log('Filtro de status:', statusFilter);

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
        console.log('Processos carregados com sucesso:', data?.length || 0, 'processos');
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

  const filteredProcesses = processes.filter(p => p.status === type);
  console.log('Processos filtrados:', filteredProcesses.length, 'de', processes.length, 'total');

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
    console.log('Abrindo processo para edição:', process.id);
    setEditingProcess(process);
    setEditFormData({
      ...process,
      data_recebimento: process.data_recebimento ? new Date(process.data_recebimento).toISOString().split('T')[0] : '',
      data_fato: process.data_fato ? new Date(process.data_fato).toISOString().split('T')[0] : '',
      data_admissao: process.data_admissao ? new Date(process.data_admissao).toISOString().split('T')[0] : ''
    });
    setIsEditing(false);
  };

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
        
        // Atualizar a lista local
        setProcesses(prev => prev.map(p => 
          p.id === editingProcess.id ? { ...p, ...editFormData } : p
        ));
        
        // Fechar modal de edição
        setEditingProcess(null);
        setEditFormData({});
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
    <>
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
                          <CalendarIcon className="h-4 w-4" />
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
                          onClick={() => handleEditProcess(process)}
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

      {/* Modal de Edição */}
      {editingProcess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="ai-gradient rounded-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-auto border border-border/60 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-card-foreground">Editar Processo</h2>
                  <p className="text-muted-foreground text-lg">{editingProcess.numero_processo}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveEdit}
                  disabled={isEditing}
                  className="ai-button-primary px-6 py-2 rounded-lg font-medium"
                >
                  {isEditing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  disabled={isEditing}
                  className="ai-button-secondary px-6 py-2 rounded-lg font-medium"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informações Básicas */}
              <Card className="ai-card border-primary/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                    <div className="p-1 bg-primary/20 rounded">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="numero_processo" className="text-sm font-medium text-card-foreground">Número do Processo</Label>
                    <Input
                      id="numero_processo"
                      value={editFormData.numero_processo || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, numero_processo: e.target.value }))}
                      disabled={isEditing}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo_processo" className="text-sm font-medium text-card-foreground">Tipo de Processo</Label>
                    <Select
                      value={editFormData.tipo_processo || ''}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, tipo_processo: value }))}
                      disabled={isEditing}
                    >
                      <SelectTrigger className="mt-1 bg-background/50 border-border/60 focus:border-primary/60">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investigacao_preliminar">INVESTIGAÇÃO PRELIMINAR</SelectItem>
                        <SelectItem value="sindicancia">SINDICÂNCIA</SelectItem>
                        <SelectItem value="processo_administrativo">PROCESSO ADMINISTRATIVO</SelectItem>
                        <SelectItem value="inquerito_policial_militar">INQUÉRITO POLICIAL MILITAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prioridade" className="text-sm font-medium text-card-foreground">Prioridade</Label>
                    <Select
                      value={editFormData.prioridade || ''}
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, prioridade: value }))}
                      disabled={isEditing}
                    >
                      <SelectTrigger className="mt-1 bg-background/50 border-border/60 focus:border-primary/60">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgente">URGENTE</SelectItem>
                        <SelectItem value="alta">ALTA</SelectItem>
                        <SelectItem value="media">MÉDIA</SelectItem>
                        <SelectItem value="baixa">BAIXA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="data_recebimento" className="text-sm font-medium text-card-foreground">Data de Recebimento</Label>
                    <Input
                      id="data_recebimento"
                      type="date"
                      value={editFormData.data_recebimento || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, data_recebimento: e.target.value }))}
                      disabled={isEditing}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_fato" className="text-sm font-medium text-card-foreground">Data do Fato</Label>
                    <Input
                      id="data_fato"
                      type="date"
                      value={editFormData.data_fato || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, data_fato: e.target.value }))}
                      disabled={isEditing}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informações do Investigado */}
              <Card className="ai-card border-[hsl(var(--ai-blue))]/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                    <div className="p-1 bg-[hsl(var(--ai-blue))]/20 rounded">
                      <Users className="h-4 w-4 text-[hsl(var(--ai-blue))]" />
                    </div>
                    Informações do Investigado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nome_investigado" className="text-sm font-medium text-card-foreground">Nome do Investigado</Label>
                    <Input
                      id="nome_investigado"
                      value={editFormData.nome_investigado || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, nome_investigado: e.target.value }))}
                      disabled={isEditing}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cargo_investigado" className="text-sm font-medium text-card-foreground">Cargo do Investigado</Label>
                    <Input
                      id="cargo_investigado"
                      value={editFormData.cargo_investigado || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, cargo_investigado: e.target.value }))}
                      disabled={isEditing}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unidade_investigado" className="text-sm font-medium text-card-foreground">Unidade do Investigado</Label>
                    <Input
                      id="unidade_investigado"
                      value={editFormData.unidade_investigado || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, unidade_investigado: e.target.value }))}
                      disabled={isEditing}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="matricula_investigado" className="text-sm font-medium text-card-foreground">Matrícula do Investigado</Label>
                    <Input
                      id="matricula_investigado"
                      value={editFormData.matricula_investigado || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, matricula_investigado: e.target.value }))}
                      disabled={isEditing}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60"
                    />
                  </div>

                  <div>
                    <Label htmlFor="data_admissao" className="text-sm font-medium text-card-foreground">Data de Admissão</Label>
                    <Input
                      id="data_admissao"
                      type="date"
                      value={editFormData.data_admissao || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, data_admissao: e.target.value }))}
                      disabled={isEditing}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campos de Texto Longo */}
            <div className="mt-8">
              <Card className="ai-card border-[hsl(var(--ai-purple))]/20">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
                    <div className="p-1 bg-[hsl(var(--ai-purple))]/20 rounded">
                      <Brain className="h-4 w-4 text-[hsl(var(--ai-purple))]" />
                    </div>
                    Detalhes e Observações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="descricao_fatos" className="text-sm font-medium text-card-foreground">Descrição dos Fatos</Label>
                    <Textarea
                      id="descricao_fatos"
                      value={editFormData.descricao_fatos || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, descricao_fatos: e.target.value }))}
                      disabled={isEditing}
                      rows={4}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60 resize-none"
                      placeholder="Descreva detalhadamente os fatos do processo..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="modus_operandi" className="text-sm font-medium text-card-foreground">Modus Operandi</Label>
                    <Textarea
                      id="modus_operandi"
                      value={editFormData.modus_operandi || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, modus_operandi: e.target.value }))}
                      disabled={isEditing}
                      rows={3}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60 resize-none"
                      placeholder="Descreva o modus operandi..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vitima" className="text-sm font-medium text-card-foreground">Vítima</Label>
                      <Input
                        id="vitima"
                        value={editFormData.vitima || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, vitima: e.target.value }))}
                        disabled={isEditing}
                        className="mt-1 bg-background/50 border-border/60 focus:border-primary/60"
                        placeholder="Nome da vítima..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="numero_sigpad" className="text-sm font-medium text-card-foreground">Número SIGPAD</Label>
                      <Input
                        id="numero_sigpad"
                        value={editFormData.numero_sigpad || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, numero_sigpad: e.target.value }))}
                        disabled={isEditing}
                        className="mt-1 bg-background/50 border-border/60 focus:border-primary/60"
                        placeholder="Número do SIGPAD..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="redistribuicao" className="text-sm font-medium text-card-foreground">Redistribuição</Label>
                    <Textarea
                      id="redistribuicao"
                      value={editFormData.redistribuicao || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, redistribuicao: e.target.value }))}
                      disabled={isEditing}
                      rows={3}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60 resize-none"
                      placeholder="Informações sobre redistribuição..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="sugestoes" className="text-sm font-medium text-card-foreground">Sugestões</Label>
                    <Textarea
                      id="sugestoes"
                      value={editFormData.sugestoes || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, sugestoes: e.target.value }))}
                      disabled={isEditing}
                      rows={3}
                      className="mt-1 bg-background/50 border-border/60 focus:border-primary/60 resize-none"
                      placeholder="Sugestões e recomendações..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProcessList;
