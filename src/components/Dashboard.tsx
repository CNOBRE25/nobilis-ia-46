
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
  RefreshCw,
  Archive
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import ProcessList from "./ProcessList";
import StatisticsPage from "./StatisticsPage";
import AdminPanel from "./AdminPanel";
import AIReportGenerator from "./AIReportGenerator";
import DatabaseDiffChecker from "./DatabaseDiffChecker";
import { useProcessStats } from "../hooks/useProcessStats";
import { useToast } from "../hooks/use-toast";
import NovoProcessoForm from "./NovoProcessoForm";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'advogado';
  nome_completo?: string;
  matricula?: string;
  cargo_funcao?: string;
  // ... outros campos relevantes
}

interface DashboardProps {
  user: User;
}

const Dashboard = ({ user }: DashboardProps) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { stats, loading, error, refreshStats, lastUpdateTime } = useProcessStats();
  const { toast } = useToast();

  const monthlyData = [];
  const priorityData = [];

  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin');

  const closeModal = () => {
    setActiveModal(null);
  };

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

  const renderModal = () => {
    switch (activeModal) {
      case 'cadastrar-processo':
        return <NovoProcessoForm onProcessCreated={() => { closeModal(); refreshStats(); }} />;
      case 'processos-tramitacao':
        return <ProcessList type="tramitacao" onClose={closeModal} />;
      case 'processos-arquivados':
        return <ProcessList type="arquivados" onClose={closeModal} />;
      case 'estatisticas':
        return <StatisticsPage onClose={closeModal} onProcessSaved={refreshStats} />;
      case 'admin-panel':
        return <AdminPanel onClose={closeModal} />;
      case 'relatorio-ia':
        return <AIReportGenerator onClose={closeModal} />;
      case 'database-diff':
        return <DatabaseDiffChecker />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen ai-gradient">
      <div className="space-y-6 p-6">
        {/* Remover cards de estatísticas e análises detalhadas */}
        {/* Remover botões de Pareceres, Legislação, Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            onClick={() => setActiveModal('processos-arquivados')}
            className="ai-button group h-auto p-6 flex flex-col items-center gap-3 transition-all duration-500"
          >
            <div className="relative">
              <Archive className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-[hsl(var(--ai-gray))]/20 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-gray))]/30 transition-all"></div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Processos Finalizados</div>
              <div className="text-xs opacity-80">Concluídos e arquivados</div>
            </div>
          </Button>
          <Button
            onClick={() => setActiveModal('relatorio-ia')}
            className="ai-button group h-auto p-6 flex flex-col items-center gap-3 transition-all duration-500"
          >
            <div className="relative">
              <Brain className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-[hsl(var(--ai-purple))]/20 rounded-full blur-sm group-hover:bg-[hsl(var(--ai-purple))]/30 transition-all"></div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Relatório IA</div>
              <div className="text-xs opacity-80">Análise inteligente</div>
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
