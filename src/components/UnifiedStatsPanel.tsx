import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { 
  Users, 
  FileText, 
  ClipboardList, 
  TrendingUp, 
  Clock, 
  Target,
  RefreshCw,
  Trophy,
  Building,
  BarChart3,
  Activity,
  Calendar,
  Mail,
  Shield
} from 'lucide-react';
import { useUnifiedStats } from '../hooks/useUnifiedStats';
import { useAuth } from '../hooks/useAuth';
import { useRoles } from '../hooks/useRoles';

export function UnifiedStatsPanel() {
  const { user } = useAuth();
  const { userRole } = useRoles();
  const { 
    userStats, 
    summary, 
    loading, 
    error, 
    lastUpdateTime, 
    refreshAllStats 
  } = useUnifiedStats();
  
  const [activeTab, setActiveTab] = useState('overview');

  // Verificar se o usuário é admin
  if (userRole !== 'admin') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            Acesso Restrito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Apenas administradores podem acessar as estatísticas unificadas do sistema.
          </p>
        </CardContent>
      </Card>
    );
  }
  // Painel limpo para admin
  return (
    <div className="w-full p-8">
      <div className="text-center text-muted-foreground py-12">
        Nenhuma estatística disponível no momento.
          </div>
    </div>
  );
} 