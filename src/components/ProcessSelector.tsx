import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Brain,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Process {
  id: string;
  numero_processo: string;
  tipo_processo: string;
  prioridade: string;
  data_recebimento: string;
  data_fato?: string;
  status: 'tramitacao' | 'concluido' | 'arquivado' | 'suspenso';
  nome_investigado?: string;
  cargo_investigado?: string;
  unidade_investigado?: string;
  created_at: string;
  updated_at: string;
  // Campos adicionais
  descricao_fatos?: string;
  modus_operandi?: string;
  diligencias_realizadas?: any;
  redistribuicao?: string;
  sugestoes?: string;
  matricula_investigado?: string;
  data_admissao?: string;
  numero_sigpad?: string;
  vitima?: string;
  // Campos do relatório final
  relatorio_final?: any;
  data_relatorio_final?: string;
  relatorio_gerado_por?: string;
  // Campos adicionais para IA
  numero_despacho?: string;
  data_despacho?: string;
  origem_processo?: string;
  status_funcional?: string;
  tipo_crime?: string;
  crimes_selecionados?: any[];
  transgressao?: string;
  // Campos para múltiplos investigados e vítimas
  investigados?: any[];
  vitimas?: any[];
}

interface ProcessSelectorProps {
  onProcessSelect: (process: Process) => void;
}

const ProcessSelector = ({ onProcessSelect }: ProcessSelectorProps) => {
  const { toast } = useToast();
  
  const [processos, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);

  // Carregar processos do banco de dados
  const loadProcesses = async () => {
    console.log('Carregando processos para seleção...');
    setLoading(true);
    setError(null);

    try {
      // Buscar todos os processos (não apenas em tramitação)
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar processos:', error);
        setError('Erro ao carregar processos do banco de dados');
        
        // Fallback para localStorage
        const processosLocais = JSON.parse(localStorage.getItem('processos') || '[]');
        setProcesses(processosLocais);
        
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
      setLoading(false);
    }
  };

  // Carregar processos na montagem do componente
  useEffect(() => {
    loadProcesses();
  }, []);

  // Filtrar processos baseado na busca e status
  useEffect(() => {
    let filtered = processos;

    // Filtrar por status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(process => process.status === statusFilter);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(process => 
        process.numero_processo.toLowerCase().includes(term) ||
        (process.nome_investigado && process.nome_investigado.toLowerCase().includes(term)) ||
        (process.descricao_fatos && process.descricao_fatos.toLowerCase().includes(term)) ||
        (process.tipo_processo && process.tipo_processo.toLowerCase().includes(term))
      );
    }

    setFilteredProcesses(filtered);
  }, [processos, searchTerm, statusFilter]);

  // Funções auxiliares
  const getPriorityBadge = (prioridade: string) => {
    const priorityMap: { [key: string]: { color: string, label: string } } = {
      'urgente': { color: 'bg-red-500', label: 'Urgente' },
      'alta': { color: 'bg-orange-500', label: 'Alta' },
      'media': { color: 'bg-yellow-500', label: 'Média' },
      'baixa': { color: 'bg-green-500', label: 'Baixa' }
    };
    
    const priority = priorityMap[prioridade.toLowerCase()] || { color: 'bg-gray-500', label: 'Não definida' };
    
    return (
      <Badge className={`${priority.color} text-white text-xs`}>
        {priority.label}
      </Badge>
    );
  };

  const getTipoProcessoLabel = (tipo: string) => {
    const tipoMap: { [key: string]: string } = {
      'investigacao_preliminar': 'Investigação Preliminar',
      'sindicancia': 'Sindicância',
      'processo_administrativo': 'Processo Administrativo',
      'inquerito': 'Inquérito',
      'outros': 'Outros'
    };
    
    return tipoMap[tipo] || tipo;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string, label: string, icon: any } } = {
      'tramitacao': { color: 'bg-blue-500', label: 'Em Tramitação', icon: Clock },
      'concluido': { color: 'bg-green-500', label: 'Concluído', icon: CheckCircle },
      'arquivado': { color: 'bg-gray-500', label: 'Arquivado', icon: FileText },
      'suspenso': { color: 'bg-yellow-500', label: 'Suspenso', icon: AlertTriangle }
    };
    
    const statusInfo = statusMap[status] || { color: 'bg-gray-500', label: 'Desconhecido', icon: FileText };
    const Icon = statusInfo.icon;
    
    return (
      <Badge className={`${statusInfo.color} text-white text-xs flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <span className="ml-2 text-blue-200">Carregando processos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
        <div className="flex items-center gap-2 text-red-200">
          <AlertTriangle className="h-4 w-4" />
          <span>Erro: {error}</span>
        </div>
        <Button 
          onClick={loadProcesses} 
          className="mt-2 bg-red-600 hover:bg-red-700 text-white"
        >
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por número, investigado, descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/20 text-white placeholder:text-blue-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-white/20 text-white w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="tramitacao">Em Tramitação</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Processos */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredProcesses.length === 0 ? (
          <div className="text-center py-8 text-blue-200">
            <FileText className="h-12 w-12 mx-auto mb-4 text-blue-400" />
            <p>Nenhum processo encontrado</p>
            <p className="text-sm opacity-80">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          filteredProcesses.map((process) => (
            <Card key={process.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">{process.numero_processo}</h4>
                      {getPriorityBadge(process.prioridade)}
                      {getStatusBadge(process.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-200">
                      <div>
                        <span className="font-medium">Tipo:</span> {getTipoProcessoLabel(process.tipo_processo)}
                      </div>
                      <div>
                        <span className="font-medium">Investigado:</span> {process.nome_investigado || 'Não informado'}
                      </div>
                      <div>
                        <span className="font-medium">Data Recebimento:</span> {formatDate(process.data_recebimento)}
                      </div>
                      <div>
                        <span className="font-medium">Data Fato:</span> {formatDate(process.data_fato || '')}
                      </div>
                    </div>
                    
                    {process.descricao_fatos && (
                      <div className="mt-2">
                        <span className="font-medium text-blue-200">Descrição:</span>
                        <p className="text-sm text-blue-300 mt-1 line-clamp-2">
                          {process.descricao_fatos}
                        </p>
                      </div>
                    )}
                    
                    {process.relatorio_final && (
                      <div className="mt-2 flex items-center gap-2 text-green-400">
                        <Brain className="h-4 w-4" />
                        <span className="text-sm">Relatório já gerado</span>
                        {process.data_relatorio_final && (
                          <span className="text-xs opacity-80">
                            ({formatDate(process.data_relatorio_final)})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => onProcessSelect(process)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Selecionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <div className="bg-white/10 rounded-lg p-4 border border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{processos.length}</div>
            <div className="text-sm text-blue-200">Total</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {processos.filter(p => p.status === 'tramitacao').length}
            </div>
            <div className="text-sm text-blue-200">Em Tramitação</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {processos.filter(p => p.relatorio_final).length}
            </div>
            <div className="text-sm text-blue-200">Com Relatório</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {processos.filter(p => !p.relatorio_final).length}
            </div>
            <div className="text-sm text-blue-200">Sem Relatório</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessSelector; 