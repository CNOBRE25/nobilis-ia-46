
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  BarChart3,
  Settings,
  Brain,
  Zap,
  Activity,
  Cpu,
  Target,
  Shield,
  Loader2,
  RefreshCw
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import ProcessForm from "./ProcessForm";
import ProcessList from "./ProcessList";
import StatisticsPage from "./StatisticsPage";
import AdminPanel from "./AdminPanel";

import DatabaseDiffChecker from "./DatabaseDiffChecker";
import { useProcessStats } from "../hooks/useProcessStats";
import { useToast } from "../hooks/use-toast";

interface DashboardProps {
  user: any;
}

// Componente de Estatísticas em Modal
const StatisticsModal = ({ onClose }: { onClose: () => void }) => {
  const { stats, loading, error, refreshStats, lastUpdateTime } = useProcessStats();
  const { toast } = useToast();

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

  // Dados para o gráfico
  const chartData = [
    {
      name: 'Total',
      quantidade: stats.totalProcessos,
      fill: '#3b82f6',
      color: '#1e40af'
    },
    {
      name: 'Em Tramitação',
      quantidade: stats.processosAtivos,
      fill: '#f59e0b',
      color: '#d97706'
    },
    {
      name: 'Finalizados',
      quantidade: stats.processosFinalizados,
      fill: '#10b981',
      color: '#059669'
    },
    {
      name: 'Urgentes',
      quantidade: stats.processosUrgentes,
      fill: '#ef4444',
      color: '#dc2626'
    }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-50 overflow-auto">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Estatísticas dos Processos</h1>
          <Button onClick={onClose} variant="outline" className="text-white border-white">
            Voltar para Dashboard
          </Button>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white text-2xl">Visão Geral em Tempo Real</CardTitle>
                <CardDescription className="text-blue-200">
                  Análise completa dos processos do sistema
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Sincronizado em tempo real</span>
                </div>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  size="sm"
                  className="text-white border-white hover:bg-white/10"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
                  <p className="text-white">Carregando estatísticas...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-4" />
                  <p className="text-red-200">{error}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cards de resumo */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-500/20 border-blue-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-200 text-sm">Total</p>
                          <p className="text-white text-2xl font-bold">{stats.totalProcessos}</p>
                        </div>
                        <FileText className="h-8 w-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-yellow-500/20 border-yellow-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-200 text-sm">Em Tramitação</p>
                          <p className="text-white text-2xl font-bold">{stats.processosAtivos}</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-500/20 border-green-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-200 text-sm">Finalizados</p>
                          <p className="text-white text-2xl font-bold">{stats.processosFinalizados}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-red-500/20 border-red-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-200 text-sm">Urgentes</p>
                          <p className="text-white text-2xl font-bold">{stats.processosUrgentes}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráfico de barras */}
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#ffffff80"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#ffffff80"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        labelStyle={{ color: '#ffffff' }}
                      />
                      <Bar 
                        dataKey="quantidade" 
                        radius={[4, 4, 0, 0]}
                        fill="#3b82f6"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Informações adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Activity className="h-5 w-5 text-blue-400" />
                        <h4 className="text-white font-semibold">Taxa de Eficiência</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={stats.taxaEficiencia} 
                          className="flex-1"
                        />
                        <span className="text-white text-sm font-medium">
                          {stats.taxaEficiencia.toFixed(1)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="h-5 w-5 text-green-400" />
                        <h4 className="text-white font-semibold">Tempo Médio de Resolução</h4>
                      </div>
                      <p className="text-white text-lg font-bold">
                        {stats.tempoMedioResolucao.toFixed(1)} dias
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {lastUpdateTime && (
                  <div className="text-center text-blue-200 text-sm">
                    Última atualização: {lastUpdateTime.toLocaleTimeString('pt-BR')}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Dashboard = ({ user }: DashboardProps) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { toast } = useToast();

  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');

  const closeModal = () => {
    setActiveModal(null);
  };

  const renderModal = () => {
    switch (activeModal) {
      case 'cadastrar-processo':
        return <NovoProcessoForm onProcessCreated={() => { closeModal(); }} />;
      case 'processos-tramitacao':
        return <ProcessList type="tramitacao" onClose={closeModal} />;
      case 'processos-concluidos':
        return <ProcessList type="concluidos" onClose={closeModal} />;
      case 'estatisticas':
        return <StatisticsModal onClose={closeModal} />;
      case 'admin-panel':
        return <AdminPanel onClose={closeModal} />;

      case 'database-diff':
        return <DatabaseDiffChecker />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen ai-gradient">
      <div className="space-y-6 p-6">
        {/* Cards de Estatísticas - Design Suave */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-card-foreground">Estatísticas do Sistema</h2>
            {lastUpdateTime && !loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Última atualização: {lastUpdateTime.toLocaleTimeString('pt-BR')}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <div className="text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Erro ao carregar
              </div>
            )}
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="ai-card group hover:ai-glow-soft transition-all duration-500 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total de Processos</CardTitle>
              <div className="relative">
                <FileText className="h-5 w-5 text-primary group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-sm group-hover:bg-primary/20 transition-all"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground mb-1">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : (
                  stats.totalProcessos
                )}
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-primary" />
                <p className="text-xs text-muted-foreground">Sistema operacional</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="ai-card group hover:ai-glow-soft transition-all duration-500 rounded-xl cursor-pointer"
            onClick={() => setActiveModal('processos-tramitacao')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Em Tramitação</CardTitle>
              <div className="relative">
                <Clock className="h-5 w-5 text-[hsl(var(--ai-yellow))] group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-[hsl(var(--ai-yellow))]/10 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-yellow))]/20 transition-all"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground mb-1">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : (
                  stats.processosAtivos
                )}
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-[hsl(var(--ai-yellow))]" />
                <p className="text-xs text-muted-foreground">Clique para ver processos ativos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="ai-card group hover:ai-glow-soft transition-all duration-500 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Concluídos</CardTitle>
              <div className="relative">
                <CheckCircle className="h-5 w-5 text-[hsl(var(--ai-green))] group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-[hsl(var(--ai-green))]/10 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-green))]/20 transition-all"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground mb-1">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : (
                  stats.processosConcluidos
                )}
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-[hsl(var(--ai-green))]" />
                <p className="text-xs text-muted-foreground">Processos finalizados</p>
              </div>
            </CardContent>
          </Card>

          <Card className="ai-card group hover:ai-glow-soft transition-all duration-500 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Urgentes</CardTitle>
              <div className="relative">
                <AlertTriangle className="h-5 w-5 text-[hsl(var(--ai-red))] group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-[hsl(var(--ai-red))]/10 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-red))]/20 transition-all"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground mb-1">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : (
                  stats.processosUrgentes
                )}
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-[hsl(var(--ai-red))]" />
                <p className="text-xs text-muted-foreground">Prioridade máxima</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="ai-card group hover:ai-glow-soft transition-all duration-500 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Tempo Médio de Resolução</CardTitle>
              <div className="relative">
                <Clock className="h-5 w-5 text-[hsl(var(--ai-purple))] group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-[hsl(var(--ai-purple))]/10 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-purple))]/20 transition-all"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground mb-1">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : (
                  `${stats.tempoMedioResolucao} dias`
                )}
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="h-3 w-3 text-[hsl(var(--ai-purple))]" />
                <p className="text-xs text-muted-foreground">Média dos processos concluídos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="ai-card group hover:ai-glow-soft transition-all duration-500 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Taxa de Eficiência</CardTitle>
              <div className="relative">
                <TrendingUp className="h-5 w-5 text-[hsl(var(--ai-green))] group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-[hsl(var(--ai-green))]/10 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-green))]/20 transition-all"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground mb-1">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : (
                  `${stats.taxaEficiencia}%`
                )}
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-[hsl(var(--ai-green))]" />
                <p className="text-xs text-muted-foreground">Processos concluídos / total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            onClick={() => setActiveModal('cadastrar-processo')}
            className="ai-button group h-auto p-6 flex flex-col items-center gap-3 transition-all duration-500"
          >
            <div className="relative">
              <Plus className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-[hsl(var(--ai-green))]/20 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-green))]/30 transition-all"></div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Cadastrar Processo</div>
            </div>
          </Button>
          <Button
            onClick={() => setActiveModal('processos-tramitacao')}
            className="ai-button group h-auto p-6 flex flex-col items-center gap-3 transition-all duration-500"
          >
            <div className="relative">
              <Clock className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-[hsl(var(--ai-blue))]/20 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-blue))]/30 transition-all"></div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Em Tramitação</div>
              <div className="text-xs opacity-80">Processos ativos</div>
            </div>
          </Button>
          <Button
            onClick={() => setActiveModal('processos-concluidos')}
            className="ai-button group h-auto p-6 flex flex-col items-center gap-3 transition-all duration-500"
          >
            <div className="relative">
              <CheckCircle className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-[hsl(var(--ai-orange))]/20 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-orange))]/30 transition-all"></div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Concluídos</div>
              <div className="text-xs opacity-80">Processos finalizados</div>
            </div>
          </Button>
          <Button
            onClick={() => setActiveModal('estatisticas')}
            className="ai-button group h-auto p-6 flex flex-col items-center gap-3 transition-all duration-500"
          >
            <div className="relative">
              <BarChart3 className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-[hsl(var(--ai-cyan))]/20 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-cyan))]/30 transition-all"></div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Estatísticas</div>
              <div className="text-xs opacity-80">Análise completa</div>
            </div>
          </Button>

          {isAdmin && (
            <Button
              onClick={() => setActiveModal('admin-panel')}
              className="ai-button group h-auto p-6 flex flex-col items-center gap-3 transition-all duration-500"
            >
              <div className="relative">
                <Settings className="h-8 w-8 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[hsl(var(--ai-red))]/20 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-red))]/30 transition-all"></div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Painel Admin</div>
                <div className="text-xs opacity-80">Configurações</div>
              </div>
            </Button>
          )}
          {isAdmin && (
            <Button
              onClick={() => setActiveModal('database-diff')}
              className="ai-button group h-auto p-6 flex flex-col items-center gap-3 transition-all duration-500"
            >
              <div className="relative">
                <Shield className="h-8 w-8 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-[hsl(var(--ai-orange))]/20 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-orange))]/30 transition-all"></div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Verificar DB</div>
                <div className="text-xs opacity-80">Integridade do sistema</div>
              </div>
            </Button>
          )}
        </div>
        {/* Modal */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
            <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto">
              {renderModal()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
