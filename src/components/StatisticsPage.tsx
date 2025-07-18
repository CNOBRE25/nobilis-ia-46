
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, TrendingUp, FileText, CheckCircle, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useDetailedStats } from "../hooks/useDetailedStats";
import { useToast } from "../hooks/use-toast";

interface StatisticsPageProps {
  onClose: () => void;
  onProcessSaved?: () => void;
}

const StatisticsPage = ({ onClose, onProcessSaved }: StatisticsPageProps) => {
  const [selectedTab, setSelectedTab] = useState("geral");
  const { toast } = useToast();
  const { 
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
  } = useDetailedStats();

  // Função de atualização controlada
  const handleRefresh = async () => {
    try {
      await refreshStats();
      toast({
        title: "Estatísticas atualizadas",
        description: "Os dados foram atualizados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as estatísticas.",
        variant: "destructive",
      });
    }
  };

  // Atualizar estatísticas quando um processo for salvo
  useEffect(() => {
    if (onProcessSaved) {
      // Aguardar um pouco para garantir que o processo foi salvo
      const timer = setTimeout(() => {
        refreshStats();
        toast({
          title: "Estatísticas atualizadas",
          description: "Os dados foram atualizados automaticamente com o novo processo.",
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [onProcessSaved, refreshStats, toast]);

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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-50 overflow-auto">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Estatísticas</h1>
            {loading && (
              <div className="flex items-center gap-2 text-blue-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Carregando dados...</span>
              </div>
            )}
            {lastUpdateTime && !loading && (
              <div className="flex items-center gap-2 text-sm text-blue-200">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Última atualização: {lastUpdateTime.toLocaleTimeString('pt-BR')}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {error && (
              <div className="text-sm text-red-300 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Erro ao carregar
              </div>
            )}
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="text-white border-white flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={onClose} variant="outline" className="text-white border-white">
              Fechar
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="geral" className="text-white">Estatística Geral</TabsTrigger>
            <TabsTrigger value="relatorios" className="text-white">Relatórios Realizados</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            {/* Cards de Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Total de Processos</CardTitle>
                  <FileText className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      stats.totalProcessos
                    )}
                  </div>
                  <p className="text-xs text-blue-200">Todos os processos registrados</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Processos em Tramitação</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      stats.processosAtivos
                    )}
                  </div>
                  <p className="text-xs text-blue-200">Em andamento</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Processos Concluídos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      stats.processosConcluidos
                    )}
                  </div>
                  <p className="text-xs text-blue-200">Finalizados</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Processos Urgentes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      stats.processosUrgentes
                    )}
                  </div>
                  <p className="text-xs text-blue-200">Prioridade alta/urgente</p>
                </CardContent>
              </Card>
            </div>

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Tempo Médio de Resolução</CardTitle>
                  <Calendar className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      `${stats.tempoMedioResolucao} dias`
                    )}
                  </div>
                  <p className="text-xs text-blue-200">Média dos processos concluídos</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Taxa de Eficiência</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Carregando...</span>
                      </div>
                    ) : (
                      `${stats.taxaEficiencia}%`
                    )}
                  </div>
                  <p className="text-xs text-blue-200">Processos concluídos / total</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Desfechos */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Distribuição por Desfecho</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                    </div>
                  ) : desfechosData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={desfechosData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {desfechosData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-blue-200">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de Eficiência */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Eficiência por Período</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                    </div>
                  ) : eficienciaData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={eficienciaData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="periodo" stroke="#ffffff80" />
                        <YAxis stroke="#ffffff80" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid #ffffff20',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }}
                        />
                        <Bar dataKey="ativos" fill="#fbbf24" name="Ativos" />
                        <Bar dataKey="concluidos" fill="#10b981" name="Concluídos" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-blue-200">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Gráficos Adicionais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Prioridades */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Distribuição por Prioridade</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                    </div>
                  ) : prioridadesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={prioridadesData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {prioridadesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-blue-200">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de Tipos de Processo */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Distribuição por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                    </div>
                  ) : tiposProcessoData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={tiposProcessoData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                        <XAxis dataKey="name" stroke="#ffffff80" angle={-45} textAnchor="end" height={80} />
                        <YAxis stroke="#ffffff80" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid #ffffff20',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-blue-200">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Lista de Processos em Tramitação */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Processos em Tramitação (Mais Antigos)</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  </div>
                ) : processosDetalhados.length > 0 ? (
                  <div className="space-y-3">
                    {processosDetalhados.map((processo, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-white">#{processo.numero}</span>
                          {getPriorityBadge(processo.prioridade)}
                        </div>
                        <div className="text-sm text-blue-200">
                          Recebido: {new Date(processo.dataRecebimento).toLocaleDateString('pt-BR')} ({processo.diasTramitacao} dias)
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-blue-200 py-8">
                    Nenhum processo em tramitação
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            {/* Lista de Relatórios Realizados */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Relatórios Realizados (Últimos 10)</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  </div>
                ) : relatoriosRealizados.length > 0 ? (
                  <div className="space-y-3">
                    {relatoriosRealizados.map((relatorio, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-white">#{relatorio.numero}</span>
                          <Badge className="bg-green-600 text-white">{relatorio.desfecho}</Badge>
                        </div>
                        <div className="text-sm text-blue-200">
                          {new Date(relatorio.dataConclusao).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-blue-200 py-8">
                    Nenhum relatório realizado ainda
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StatisticsPage;
