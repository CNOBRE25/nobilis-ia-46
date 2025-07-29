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

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Carregando estatísticas unificadas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-red-600">Erro ao carregar estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshAllStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com informações gerais */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6" />
                Estatísticas Unificadas do Sistema
              </CardTitle>
              <CardDescription>
                Visão consolidada de todos os usuários e suas atividades
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdateTime && (
                <div className="text-sm text-muted-foreground">
                  Última atualização: {lastUpdateTime.toLocaleString('pt-BR')}
                </div>
              )}
              <Button onClick={refreshAllStats} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Cards de resumo */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-blue-900">{summary.total_users}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Total de Processos</p>
                  <p className="text-2xl font-bold text-green-900">{summary.total_processos}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total de Pareceres</p>
                  <p className="text-2xl font-bold text-purple-900">{summary.total_pareceres}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Eficiência Média</p>
                  <p className="text-2xl font-bold text-orange-900">{summary.media_eficiencia}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs com detalhes */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="crimes">Estatísticas de Crimes</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="orgaos">Órgãos</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estatísticas de Crimes - Destaque */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Target className="h-5 w-5" />
                  Estatísticas de Crimes
                </CardTitle>
                <CardDescription className="text-red-700">
                  Dados criminais consolidados do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{summary?.total_crimes || 0}</p>
                      <p className="text-sm text-red-700">Total de Crimes</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{summary?.tipos_crime_mais_comuns?.length || 0}</p>
                      <p className="text-sm text-red-700">Tipos Diferentes</p>
                    </div>
                  </div>
                  
                  {summary?.tipos_crime_mais_comuns && summary.tipos_crime_mais_comuns.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-800">Top 3 Crimes:</p>
                      {summary.tipos_crime_mais_comuns.slice(0, 3).map((crime, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-red-700">{crime.tipo}</span>
                          <span className="font-bold text-red-800">{crime.quantidade}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

<<<<<<< HEAD
            {/* Distribuição de Vítimas */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Users className="h-5 w-5" />
                  Distribuição de Vítimas
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Análise por sexo das vítimas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.distribuicao_vitimas && summary.distribuicao_vitimas.total > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">{summary.distribuicao_vitimas.total}</p>
                      <p className="text-sm text-blue-700">Total de Vítimas</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800">Femininas</span>
                          <span className="text-sm font-bold text-pink-600">{summary.distribuicao_vitimas.femininas}</span>
                        </div>
                        <Progress 
                          value={(summary.distribuicao_vitimas.femininas / summary.distribuicao_vitimas.total) * 100} 
                          className="h-2 bg-pink-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-blue-800">Masculinas</span>
                          <span className="text-sm font-bold text-blue-600">{summary.distribuicao_vitimas.masculinas}</span>
                        </div>
                        <Progress 
                          value={(summary.distribuicao_vitimas.masculinas / summary.distribuicao_vitimas.total) * 100} 
                          className="h-2 bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-blue-700">Nenhum dado de vítimas disponível</p>
                )}
              </CardContent>
            </Card>

=======
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Usuários com melhor desempenho
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.top_performers && summary.top_performers.length > 0 ? (
                  <div className="space-y-3">
                    {summary.top_performers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{performer.user_email}</p>
                            <p className="text-sm text-muted-foreground">{performer.user_orgao}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{performer.total_processos} processos</p>
                          <p className="text-sm text-muted-foreground">{performer.taxa_eficiencia}% eficiência</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum usuário com dados suficientes</p>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas por Órgão */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Por Órgão
                </CardTitle>
                <CardDescription>
                  Distribuição de atividades por órgão
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.stats_por_orgao && summary.stats_por_orgao.length > 0 ? (
                  <div className="space-y-3">
                    {summary.stats_por_orgao.slice(0, 5).map((orgao, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{orgao.orgao}</span>
                          <span className="text-sm text-muted-foreground">{orgao.total_processos} processos</span>
                        </div>
                        <Progress value={(orgao.total_processos / (summary.stats_por_orgao[0]?.total_processos || 1)) * 100} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado de órgão disponível</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crimes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tipos de Crime Mais Comuns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-600" />
                  Tipos de Crime Mais Comuns
                </CardTitle>
                <CardDescription>
                  Top 10 tipos de crime registrados no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.tipos_crime_mais_comuns && summary.tipos_crime_mais_comuns.length > 0 ? (
                  <div className="space-y-3">
                    {summary.tipos_crime_mais_comuns.map((crime, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <span className="text-sm font-medium">{crime.tipo}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold">{crime.quantidade}</span>
                            <span className="text-xs text-muted-foreground ml-1">({crime.percentual}%)</span>
                          </div>
                        </div>
                        <Progress value={crime.percentual} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado de crime disponível</p>
                )}
              </CardContent>
            </Card>

<<<<<<< HEAD
            {/* Distribuição de Vítimas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Distribuição de Vítimas
                </CardTitle>
                <CardDescription>
                  Análise por sexo das vítimas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.distribuicao_vitimas && summary.distribuicao_vitimas.total > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{summary.distribuicao_vitimas.total}</p>
                      <p className="text-sm text-muted-foreground">Total de Vítimas</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Vítimas Femininas</span>
                          <span className="text-sm font-bold text-pink-600">{summary.distribuicao_vitimas.femininas}</span>
                        </div>
                        <Progress 
                          value={(summary.distribuicao_vitimas.femininas / summary.distribuicao_vitimas.total) * 100} 
                          className="h-2 bg-pink-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Vítimas Masculinas</span>
                          <span className="text-sm font-bold text-blue-600">{summary.distribuicao_vitimas.masculinas}</span>
                        </div>
                        <Progress 
                          value={(summary.distribuicao_vitimas.masculinas / summary.distribuicao_vitimas.total) * 100} 
                          className="h-2 bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado de vítimas disponível</p>
                )}
              </CardContent>
            </Card>

=======
            {/* Unidades Mais Ativas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-green-600" />
                  Unidades Mais Ativas
                </CardTitle>
                <CardDescription>
                  Top 10 unidades investigativas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary?.unidades_mais_ativas && summary.unidades_mais_ativas.length > 0 ? (
                  <div className="space-y-3">
                    {summary.unidades_mais_ativas.map((unidade, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <span className="text-sm font-medium">{unidade.unidade}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold">{unidade.quantidade}</span>
                            <span className="text-xs text-muted-foreground ml-1">({unidade.percentual}%)</span>
                          </div>
                        </div>
                        <Progress value={unidade.percentual} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado de unidades disponível</p>
                )}
              </CardContent>
            </Card>

            {/* Resumo de Crimes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Resumo de Crimes
                </CardTitle>
                <CardDescription>
                  Visão geral das estatísticas criminais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{summary?.total_crimes || 0}</p>
                      <p className="text-sm text-muted-foreground">Total de Crimes</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{summary?.tipos_crime_mais_comuns?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Tipos Diferentes</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Crime mais comum:</span>
                      <span className="font-medium">
                        {summary?.tipos_crime_mais_comuns?.[0]?.tipo || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Unidade mais ativa:</span>
                      <span className="font-medium">
                        {summary?.unidades_mais_ativas?.[0]?.unidade || 'N/A'}
                      </span>
                    </div>
<<<<<<< HEAD
                    <div className="flex items-center justify-between text-sm">
                      <span>Maioria das vítimas:</span>
                      <span className="font-medium">
                        {summary?.distribuicao_vitimas ? 
                          (summary.distribuicao_vitimas.femininas > summary.distribuicao_vitimas.masculinas ? 'Femininas' : 'Masculinas') 
                          : 'N/A'}
                      </span>
                    </div>
=======
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes por Usuário</CardTitle>
              <CardDescription>
                Estatísticas detalhadas de cada usuário do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Órgão</TableHead>
                    <TableHead>Processos</TableHead>
                    <TableHead>Pareceres</TableHead>
                    <TableHead>Eficiência</TableHead>
                    <TableHead>Tempo Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStats.map((stat) => (
                    <TableRow key={stat.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{stat.user_email}</p>
                          <p className="text-sm text-muted-foreground">{stat.user_role}</p>
                        </div>
                      </TableCell>
                      <TableCell>{stat.user_orgao || 'Não especificado'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{stat.total_processos}</span>
                            <Badge variant="outline" className="text-xs">
                              {stat.processos_ativos} ativos
                            </Badge>
                          </div>
                          <Progress 
                            value={stat.total_processos > 0 ? (stat.processos_concluidos / stat.total_processos) * 100 : 0} 
                            className="h-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="font-medium">{stat.total_pareceres}</span>
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {stat.pareceres_aprovados} aprovados
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{stat.taxa_eficiencia}%</span>
                          <div className="w-16">
                            <Progress value={stat.taxa_eficiencia} className="h-2" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{stat.tempo_medio_resolucao} dias</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orgaos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise por Órgão</CardTitle>
              <CardDescription>
                Comparativo detalhado entre órgãos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Órgão</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Processos</TableHead>
                    <TableHead>Pareceres</TableHead>
                    <TableHead>Eficiência Média</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary?.stats_por_orgao.map((orgao, index) => {
                    const usersInOrgao = userStats.filter(stat => stat.user_orgao === orgao.orgao).length;
                    const avgEfficiency = userStats
                      .filter(stat => stat.user_orgao === orgao.orgao)
                      .reduce((sum, stat) => sum + stat.taxa_eficiencia, 0) / usersInOrgao || 0;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{orgao.orgao}</TableCell>
                        <TableCell>{usersInOrgao}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{orgao.total_processos}</span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(orgao.total_processos / usersInOrgao)} por usuário
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{orgao.total_pareceres}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{Math.round(avgEfficiency)}%</span>
                            <Progress value={avgEfficiency} className="w-16 h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={avgEfficiency >= 80 ? "default" : avgEfficiency >= 60 ? "secondary" : "destructive"}
                          >
                            {avgEfficiency >= 80 ? "Excelente" : avgEfficiency >= 60 ? "Bom" : "Precisa melhorar"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tempo Médio de Resolução</span>
                    <span className="text-sm font-bold">{summary?.media_tempo_resolucao || 0} dias</span>
                  </div>
                  <Progress 
                    value={summary ? Math.min((summary.media_tempo_resolucao / 30) * 100, 100) : 0} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taxa de Eficiência Geral</span>
                    <span className="text-sm font-bold">{summary?.media_eficiencia || 0}%</span>
                  </div>
                  <Progress value={summary?.media_eficiencia || 0} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processos por Usuário</span>
                    <span className="text-sm font-bold">
                      {summary ? Math.round(summary.total_processos / summary.total_users) : 0}
                    </span>
                  </div>
                  <Progress 
                    value={summary ? Math.min((summary.total_processos / summary.total_users / 10) * 100, 100) : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Crimes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Distribuição de Crimes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total de Crimes Registrados</span>
                    <span className="font-bold">{summary?.total_crimes || 0}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
<<<<<<< HEAD
                      <span>Vítimas Femininas</span>
                      <span>{userStats.reduce((sum, stat) => sum + stat.vitimas_femininas, 0)}</span>
                    </div>
                    <Progress 
                      value={summary?.total_crimes ? (userStats.reduce((sum, stat) => sum + stat.vitimas_femininas, 0) / summary.total_crimes) * 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Vítimas Masculinas</span>
                      <span>{userStats.reduce((sum, stat) => sum + stat.vitimas_masculinas, 0)}</span>
                    </div>
                    <Progress 
                      value={summary?.total_crimes ? (userStats.reduce((sum, stat) => sum + stat.vitimas_masculinas, 0) / summary.total_crimes) * 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
=======
                      <span>Tipos de Crime Diferentes</span>
                      <span>{userStats.reduce((sum, stat) => sum + stat.tipos_crime_diferentes, 0)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 