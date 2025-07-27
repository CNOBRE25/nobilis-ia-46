
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Clock, TrendingUp, FileText, CheckCircle, AlertTriangle, Loader2, RefreshCw, Shield, Users, MapPin } from "lucide-react";
import { useDetailedStats } from "../hooks/useDetailedStats";
import { useCrimeStats } from "../hooks/useCrimeStats";
import { useToast } from "../hooks/use-toast";
import ProcessList from './ProcessList';

interface StatisticsPageProps {
  onClose: () => void;
  onProcessSaved?: () => void;
}

const StatisticsPage = ({ onClose, onProcessSaved }: StatisticsPageProps) => {
  const [selectedTab, setSelectedTab] = useState("em-tramitacao");
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const {
    tiposCrime,
    transgressoes,
    unidadesInvestigado,
    crimesPorMes,
    loading: crimeLoading,
    error: crimeError,
    lastUpdateTime: crimeLastUpdate,
    refreshStats: refreshCrimeStats
  } = useCrimeStats();

  // Função de atualização controlada
  const handleRefresh = async () => {
    if (isRefreshing) return; // Evitar múltiplos cliques
    
    setIsRefreshing(true);
    try {
      await Promise.all([refreshStats(), refreshCrimeStats()]);
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
    } finally {
      setIsRefreshing(false);
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
  }, [onProcessSaved]); // Removido refreshStats e toast das dependências

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
          <h1 className="text-3xl font-bold text-white">Estatísticas Detalhadas</h1>
          <Button onClick={onClose} variant="outline" className="text-white border-white">
            Voltar para Dashboard
          </Button>
        </div>
        
        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-6">
            <TabsTrigger value="todos" className="text-white">Todos os Processos</TabsTrigger>
          </TabsList>
          <TabsContent value="todos">
            <ProcessList type="todos" orderBy="data_recebimento" orderAscending={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StatisticsPage;
