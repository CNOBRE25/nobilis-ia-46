
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Clock, TrendingUp, FileText, CheckCircle, AlertTriangle } from "lucide-react";

interface StatisticsPageProps {
  onClose: () => void;
}

const StatisticsPage = ({ onClose }: StatisticsPageProps) => {
  const [selectedTab, setSelectedTab] = useState("geral");

  // Estatísticas iniciais vazias
  const estatisticasGerais = {
    totalProcessos: 0,
    processosAtivos: 0,
    processosConcluidos: 0,
    processosUrgentes: 0,
    tempoMedioResolucao: 0
  };

  const desfechosData = [];

  const eficienciaData = [];

  const processosDetalhados = [];

  const relatoriosRealizados = [];

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
          <h1 className="text-3xl font-bold text-white">Estatísticas</h1>
          <Button onClick={onClose} variant="outline" className="text-white border-white">
            Fechar
          </Button>
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
                  <div className="text-2xl font-bold text-white">{estatisticasGerais.totalProcessos}</div>
                  <p className="text-xs text-blue-200">Todos os processos registrados</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Processos em Tramitação</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{estatisticasGerais.processosAtivos}</div>
                  <p className="text-xs text-blue-200">Em andamento</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Processos Concluídos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{estatisticasGerais.processosConcluidos}</div>
                  <p className="text-xs text-blue-200">Finalizados</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Processos Urgentes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{estatisticasGerais.processosUrgentes}</div>
                  <p className="text-xs text-blue-200">Requer atenção imediata</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Distribuição por Desfecho</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={desfechosData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Eficiência por Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={eficienciaData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="ativos" fill="#8884d8" name="Ativos" />
                      <Bar dataKey="concluidos" fill="#82ca9d" name="Concluídos" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Processos por Eficiência */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Processos Ativos - Ordenados por Antiguidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processosDetalhados.map((processo) => (
                    <div key={processo.numero} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                      <div className="space-y-1">
                        <h4 className="text-white font-medium">{processo.numero}</h4>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(processo.prioridade)}
                          <span className="text-blue-200 text-sm">
                            Recebido: {new Date(processo.dataRecebimento).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{processo.diasTramitacao} dias</div>
                        <div className="text-blue-200 text-sm">em tramitação</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Relatórios Realizados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatoriosRealizados.map((relatorio) => (
                    <div key={relatorio.numero} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                      <div className="space-y-1">
                        <h4 className="text-white font-medium">{relatorio.numero}</h4>
                        <p className="text-green-300">{relatorio.desfecho}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-200 text-sm">
                          Concluído: {new Date(relatorio.dataConclusao).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Desfechos por Categoria */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Resumo por Desfecho Final</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={desfechosData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={200} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StatisticsPage;
