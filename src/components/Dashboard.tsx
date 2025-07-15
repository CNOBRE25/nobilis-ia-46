
import { useState } from "react";
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
  Shield
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import ProcessForm from "./ProcessForm";
import ProcessList from "./ProcessList";
import StatisticsPage from "./StatisticsPage";
import AdminPanel from "./AdminPanel";
import AIReportGenerator from "./AIReportGenerator";

interface DashboardProps {
  user: any;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const stats = {
    totalProcessos: 0,
    processosAtivos: 0,
    processosConcluidos: 0,
    processosUrgentes: 0,
    tempoMedioResolucao: 0,
    taxaEficiencia: 0
  };

  const monthlyData = [];
  const priorityData = [];

  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');

  const closeModal = () => setActiveModal(null);

  const renderModal = () => {
    switch (activeModal) {
      case 'cadastrar-processo':
        return <ProcessForm onClose={closeModal} />;
      case 'processos-tramitacao':
        return <ProcessList type="tramitacao" onClose={closeModal} />;
      case 'processos-concluidos':
        return <ProcessList type="concluidos" onClose={closeModal} />;
      case 'estatisticas':
        return <StatisticsPage onClose={closeModal} />;
      case 'admin-panel':
        return <AdminPanel onClose={closeModal} />;
      case 'relatorio-ia':
        return <AIReportGenerator onClose={closeModal} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen ai-gradient">
      <div className="space-y-6 p-6">
        {/* Header Elegante */}
        <div className="relative overflow-hidden ai-card p-6 rounded-2xl ai-glow-soft">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <Brain className="h-10 w-10 text-primary ai-pulse-soft" />
                <div className="absolute inset-0 h-10 w-10 bg-primary/10 rounded-full blur-lg ai-pulse-soft"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  NOBILIS-IA
                </h1>
                <p className="text-lg text-muted-foreground font-light">PLATAFORMA INTELIGENTE</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Bem-vindo, {user?.nome || "Encarregado"}! Sistema Seguro de Processos</span>
              <div className="flex gap-1 ml-auto">
                <div className="w-2 h-2 bg-[hsl(var(--ai-green))] rounded-full ai-pulse-soft"></div>
                <span className="text-[hsl(var(--ai-green))] text-sm">ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas - Design Suave */}
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
              <div className="text-2xl font-bold text-card-foreground mb-1">{stats.totalProcessos}</div>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-primary" />
                <p className="text-xs text-muted-foreground">Sistema operacional</p>
              </div>
            </CardContent>
          </Card>

          <Card className="ai-card group hover:ai-glow-soft transition-all duration-500 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Em Tramitação</CardTitle>
              <div className="relative">
                <Clock className="h-5 w-5 text-[hsl(var(--ai-yellow))] group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-[hsl(var(--ai-yellow))]/10 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-yellow))]/20 transition-all"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground mb-1">{stats.processosAtivos}</div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-[hsl(var(--ai-yellow))]" />
                <p className="text-xs text-muted-foreground">Processamento ativo</p>
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
              <div className="text-2xl font-bold text-card-foreground mb-1">{stats.processosConcluidos}</div>
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
              <div className="text-2xl font-bold text-card-foreground mb-1">{stats.processosUrgentes}</div>
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-[hsl(var(--ai-red))]" />
                <p className="text-xs text-muted-foreground">Prioridade máxima</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação Rápida - Design Mais Elegante */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={() => setActiveModal('cadastrar-processo')}
            className="h-16 ai-button-primary rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                <div className="absolute inset-0 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all"></div>
              </div>
              <div className="text-left">
                <div className="font-semibold">Novo Processo</div>
                <div className="text-sm opacity-90">Iniciar registro</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => setActiveModal('processos-tramitacao')}
            className="h-16 bg-gradient-to-r from-[hsl(var(--ai-yellow))]/90 to-[hsl(var(--ai-orange))]/90 hover:from-[hsl(var(--ai-yellow))] hover:to-[hsl(var(--ai-orange))] text-primary-foreground rounded-xl shadow-lg hover:shadow-[hsl(var(--ai-yellow))]/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Clock className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all"></div>
              </div>
              <div className="text-left">
                <div className="font-semibold">Em Tramitação</div>
                <div className="text-sm opacity-90">{stats.processosAtivos} processos</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => setActiveModal('processos-concluidos')}
            className="h-16 bg-gradient-to-r from-[hsl(var(--ai-green))]/90 to-accent/90 hover:from-[hsl(var(--ai-green))] hover:to-accent text-primary-foreground rounded-xl shadow-lg hover:shadow-[hsl(var(--ai-green))]/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <CheckCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all"></div>
              </div>
              <div className="text-left">
                <div className="font-semibold">Concluídos</div>
                <div className="text-sm opacity-90">{stats.processosConcluidos} processos</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => setActiveModal('estatisticas')}
            className="h-16 bg-gradient-to-r from-[hsl(var(--ai-purple))]/90 to-primary/90 hover:from-[hsl(var(--ai-purple))] hover:to-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-[hsl(var(--ai-purple))]/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all"></div>
              </div>
              <div className="text-left">
                <div className="font-semibold">Estatísticas</div>
                <div className="text-sm opacity-90">Relatórios e métricas</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => setActiveModal('relatorio-ia')}
            className="h-16 bg-gradient-to-r from-primary/90 to-[hsl(var(--ai-purple))]/90 hover:from-primary hover:to-[hsl(var(--ai-purple))] text-primary-foreground rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="h-6 w-6 group-hover:pulse transition-all ai-pulse-soft" />
                <div className="absolute inset-0 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all"></div>
              </div>
              <div className="text-left">
                <div className="font-semibold">Relatório IA</div>
                <div className="text-sm opacity-90">Análise inteligente</div>
              </div>
            </div>
          </Button>

          {isAdmin && (
            <Button
              onClick={() => setActiveModal('admin-panel')}
              className="h-16 ai-button-secondary rounded-xl shadow-lg hover:shadow-secondary/20 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Settings className="h-6 w-6 group-hover:rotate-45 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-md group-hover:bg-white/20 transition-all"></div>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Painel Admin</div>
                  <div className="text-sm opacity-90">Gerenciar sistema</div>
                </div>
              </div>
            </Button>
          )}
        </div>

        {/* Visão Geral Melhorada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="ai-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance do Sistema
              </CardTitle>
              <CardDescription className="text-muted-foreground">Indicadores de eficiência</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Taxa de Eficiência</span>
                  <span className="text-xl font-bold text-primary">{stats.taxaEficiencia}%</span>
                </div>
                <Progress value={stats.taxaEficiencia} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-card-foreground">Tempo Médio</span>
                  <span className="text-xl font-bold text-primary">{stats.tempoMedioResolucao} dias</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="ai-card rounded-xl">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent ai-pulse-soft" />
                Status da IA
              </CardTitle>
              <CardDescription className="text-muted-foreground">Inteligência artificial operacional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--ai-green))]/10 border border-[hsl(var(--ai-green))]/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[hsl(var(--ai-green))] rounded-full ai-pulse-soft"></div>
                    <span className="text-card-foreground">Análise de Tipificação</span>
                  </div>
                  <Badge className="bg-[hsl(var(--ai-green))]/80 text-white border-0">ATIVO</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[hsl(var(--ai-green))]/10 border border-[hsl(var(--ai-green))]/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[hsl(var(--ai-green))] rounded-full ai-pulse-soft"></div>
                    <span className="text-card-foreground">Cálculo de Prescrição</span>
                  </div>
                  <Badge className="bg-[hsl(var(--ai-green))]/80 text-white border-0">ATIVO</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas Suaves */}
        <Card className="ai-card border-[hsl(var(--ai-red))]/30 rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-card-foreground">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--ai-red))] mr-2" />
              Sistema de Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-[hsl(var(--ai-red))]/5 border border-[hsl(var(--ai-red))]/20 rounded-lg">
                <div className="h-2 w-2 bg-[hsl(var(--ai-red))] rounded-full mr-3 ai-pulse-soft"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {stats.processosUrgentes} processos urgentes detectados
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Incluindo casos de Maria da Penha - Prioridade máxima
                  </p>
                </div>
                <Zap className="h-4 w-4 text-[hsl(var(--ai-red))]" />
              </div>

              <div className="flex items-center p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="h-2 w-2 bg-primary rounded-full mr-3 ai-pulse-soft"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">
                    Sistema IA operando com {stats.taxaEficiencia}% de precisão
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Análises automáticas de tipificação e prescrição ativas
                  </p>
                </div>
                <Brain className="h-4 w-4 text-primary ai-pulse-soft" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Render Modal */}
        {renderModal()}
      </div>
    </div>
  );
};

export default Dashboard;
