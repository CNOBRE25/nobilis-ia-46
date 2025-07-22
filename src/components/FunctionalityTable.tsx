import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Database,
  Shield,
  Code,
  Brain,
  BarChart3,
  Globe,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Functionality {
  id: number;
  name: string;
  category: string;
  status: 'active' | 'development' | 'planned' | 'deprecated';
  priority: 'high' | 'medium' | 'low';
  technologies: string[];
  dependencies: string;
  responsible: string;
  lastUpdate: string;
  description: string;
  tableName?: string;
  componentName?: string;
  filePath?: string;
}

const functionalityData: Functionality[] = [
  {
    id: 1,
    name: "Sistema de Autenticação",
    category: "Security",
    status: "active",
    priority: "high",
    technologies: ["JWT", "Supabase Auth", "React"],
    dependencies: "supabase, react-hook-form, zod",
    responsible: "Equipe Backend",
    lastUpdate: "2024-01-15",
    description: "Sistema completo de autenticação e autorização com Supabase",
    tableName: "users",
    componentName: "LoginForm",
    filePath: "src/components/LoginForm.tsx"
  },
  {
    id: 2,
    name: "Gestão de Processos",
    category: "Database",
    status: "active",
    priority: "high",
    technologies: ["Supabase", "PostgreSQL", "React"],
    dependencies: "supabase, react-hook-form, date-fns",
    responsible: "Equipe Backend",
    lastUpdate: "2024-01-10",
    description: "Sistema completo de criação, edição e gestão de processos jurídicos",
    tableName: "processos",
    componentName: "ProcessForm",
    filePath: "src/components/ProcessForm.tsx"
  },
  {
    id: 3,
    name: "Listagem de Processos",
    category: "Frontend",
    status: "active",
    priority: "high",
    technologies: ["React", "TypeScript", "Supabase"],
    dependencies: "supabase, lucide-react, date-fns",
    responsible: "Equipe Frontend",
    lastUpdate: "2024-01-12",
    description: "Interface para visualização e gestão de processos",
    tableName: "processos",
    componentName: "ProcessList",
    filePath: "src/components/ProcessList.tsx"
  },
  {
    id: 4,
    name: "Dashboard Principal",
    category: "Frontend",
    status: "active",
    priority: "high",
    technologies: ["React", "TypeScript", "Tailwind"],
    dependencies: "react, typescript, tailwindcss",
    responsible: "Equipe Frontend",
    lastUpdate: "2024-01-14",
    description: "Dashboard principal com estatísticas e navegação",
    componentName: "Dashboard",
    filePath: "src/components/Dashboard.tsx"
  },
  {
    id: 5,
    name: "Sistema de Relatórios IA",
    category: "AI/ML",
    status: "active",
    priority: "medium",
    technologies: ["OpenAI API", "React", "TypeScript"],
    dependencies: "openai, react, typescript",
    responsible: "Equipe AI",
    lastUpdate: "2024-01-08",
    description: "Geração de relatórios jurídicos usando inteligência artificial",
    componentName: "AIReportGenerator",
    filePath: "src/components/AIReportGenerator.tsx"
  },
  {
    id: 6,
    name: "Legislação e Crimes",
    category: "Frontend",
    status: "active",
    priority: "medium",
    technologies: ["React", "TypeScript", "JSON"],
    dependencies: "react, typescript, lucide-react",
    responsible: "Equipe Frontend",
    lastUpdate: "2024-01-11",
    description: "Consulta de legislação e busca de crimes",
    componentName: "LegislacaoSection",
    filePath: "src/components/LegislacaoSection.tsx"
  },
  {
    id: 7,
    name: "Painel Administrativo",
    category: "Frontend",
    status: "active",
    priority: "medium",
    technologies: ["React", "TypeScript", "Supabase"],
    dependencies: "supabase, react, typescript",
    responsible: "Equipe Frontend",
    lastUpdate: "2024-01-09",
    description: "Painel administrativo para gestão de usuários e sistema",
    componentName: "AdminPanel",
    filePath: "src/components/AdminPanel.tsx"
  },
  {
    id: 8,
    name: "Banco de Dados Supabase",
    category: "Database",
    status: "active",
    priority: "high",
    technologies: ["PostgreSQL", "Supabase", "RLS"],
    dependencies: "supabase, postgresql",
    responsible: "Equipe Backend",
    lastUpdate: "2024-01-13",
    description: "Banco de dados principal com Row Level Security",
    tableName: "processos, users, ai_analyses"
  },
  {
    id: 9,
    name: "Sistema de Logs e Auditoria",
    category: "Backend",
    status: "active",
    priority: "medium",
    technologies: ["Supabase", "PostgreSQL", "Triggers"],
    dependencies: "supabase, postgresql",
    responsible: "Equipe DevOps",
    lastUpdate: "2024-01-07",
    description: "Sistema centralizado de logs e auditoria",
    tableName: "audit_logs"
  },
  {
    id: 10,
    name: "Análise Jurídica IA",
    category: "AI/ML",
    status: "active",
    priority: "medium",
    technologies: ["OpenAI API", "React", "TypeScript"],
    dependencies: "openai, react, typescript",
    responsible: "Equipe AI",
    lastUpdate: "2024-01-06",
    description: "Análise jurídica automatizada usando IA",
    componentName: "RelatorioIA",
    filePath: "src/components/RelatorioIA.tsx"
  },
  {
    id: 11,
    name: "Sistema de Notificações",
    category: "Backend",
    status: "development",
    priority: "low",
    technologies: ["Supabase", "WebSockets", "React"],
    dependencies: "supabase, socket.io",
    responsible: "Equipe Backend",
    lastUpdate: "2024-01-05",
    description: "Sistema de notificações em tempo real"
  },
  {
    id: 12,
    name: "Integração com APIs Externas",
    category: "API",
    status: "active",
    priority: "medium",
    technologies: ["Node.js", "Axios", "React"],
    dependencies: "axios, react",
    responsible: "Equipe Backend",
    lastUpdate: "2024-01-04",
    description: "Integração com APIs de legislação e consulta"
  },
  {
    id: 13,
    name: "Sistema de Backup",
    category: "Database",
    status: "active",
    priority: "high",
    technologies: ["Supabase", "PostgreSQL", "Automation"],
    dependencies: "supabase, postgresql",
    responsible: "Equipe DevOps",
    lastUpdate: "2024-01-03",
    description: "Sistema automatizado de backup de dados"
  },
  {
    id: 14,
    name: "Teste de Conexão",
    category: "Backend",
    status: "active",
    priority: "medium",
    technologies: ["Supabase", "React", "TypeScript"],
    dependencies: "supabase, react, typescript",
    responsible: "Equipe QA",
    lastUpdate: "2024-01-02",
    description: "Suite de testes de conexão e funcionalidades",
    componentName: "SupabaseTest",
    filePath: "src/components/SupabaseTest.tsx"
  },
  {
    id: 15,
    name: "Sistema de Versionamento",
    category: "AI/ML",
    status: "planned",
    priority: "low",
    technologies: ["Git", "DVC", "MLflow"],
    dependencies: "git, dvc, mlflow",
    responsible: "Equipe AI",
    lastUpdate: "2024-01-01",
    description: "Sistema para versionamento de modelos ML"
  }
];

export const FunctionalityTable = () => {
  const [filteredData, setFilteredData] = useState<Functionality[]>(functionalityData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const applyFilters = () => {
    const filtered = functionalityData.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      const matchesPriority = !priorityFilter || item.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });

    setFilteredData(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: "bg-green-600", text: "Ativo" },
      development: { bg: "bg-yellow-600", text: "Desenvolvimento" },
      planned: { bg: "bg-gray-600", text: "Planejado" },
      deprecated: { bg: "bg-red-600", text: "Descontinuado" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { bg: "bg-gray-600", text: status };
    
    return (
      <Badge className={`${config.bg} text-white`}>
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { bg: "bg-red-600", text: "Alta" },
      medium: { bg: "bg-yellow-600", text: "Média" },
      low: { bg: "bg-green-600", text: "Baixa" }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || { bg: "bg-gray-600", text: priority };
    
    return (
      <Badge className={`${config.bg} text-white`}>
        {config.text}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      "Security": Shield,
      "Database": Database,
      "Frontend": Code,
      "AI/ML": Brain,
      "Analytics": BarChart3,
      "API": Globe,
      "Backend": Settings
    };

    const Icon = iconMap[category] || Code;
    return <Icon className="h-4 w-4" />;
  };

  const getStats = () => {
    const total = filteredData.length;
    const active = filteredData.filter(item => item.status === 'active').length;
    const development = filteredData.filter(item => item.status === 'development').length;
    const planned = filteredData.filter(item => item.status === 'planned').length;

    return { total, active, development, planned };
  };

  const stats = getStats();

  const handleViewDetails = (item: Functionality) => {
    toast({
      title: `Detalhes: ${item.name}`,
      description: (
        <div className="space-y-2">
          <p><strong>Descrição:</strong> {item.description}</p>
          <p><strong>Tecnologias:</strong> {item.technologies.join(', ')}</p>
          <p><strong>Dependências:</strong> {item.dependencies}</p>
          {item.tableName && <p><strong>Tabela:</strong> {item.tableName}</p>}
          {item.componentName && <p><strong>Componente:</strong> {item.componentName}</p>}
          {item.filePath && <p><strong>Arquivo:</strong> {item.filePath}</p>}
        </div>
      ),
      duration: 5000
    });
  };

  const handleEdit = (item: Functionality) => {
    toast({
      title: "Editar Funcionalidade",
      description: `Editando: ${item.name}`,
    });
  };

  const handleDelete = (item: Functionality) => {
    toast({
      title: "Excluir Funcionalidade",
      description: `Excluindo: ${item.name}`,
      variant: "destructive"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">🤖 NOBILIS IA-46</h1>
        <p className="text-xl text-gray-300">Mapeamento Completo de Funcionalidades do Sistema</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Total de Funcionalidades</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.active}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Funcionalidades Ativas</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400">{stats.development}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Em Desenvolvimento</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-400">{stats.planned}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">Planejadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Pesquisar funcionalidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white"
              />
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="development">Desenvolvimento</SelectItem>
                  <SelectItem value="planned">Planejado</SelectItem>
                  <SelectItem value="deprecated">Descontinuado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                  <SelectItem value="Frontend">Frontend</SelectItem>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="API">API</SelectItem>
                  <SelectItem value="Backend">Backend</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Funcionalidades do Sistema</span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Funcionalidade
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-white">Funcionalidade</TableHead>
                  <TableHead className="text-white">Categoria</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Prioridade</TableHead>
                  <TableHead className="text-white">Tecnologias</TableHead>
                  <TableHead className="text-white">Responsável</TableHead>
                  <TableHead className="text-white">Última Atualização</TableHead>
                  <TableHead className="text-white">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id} className="border-slate-700 hover:bg-slate-700">
                    <TableCell>
                      <div>
                        <div className="font-semibold text-white">{item.name}</div>
                        <div className="text-sm text-gray-400 mt-1">{item.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <Badge variant="outline" className="text-white border-slate-600">
                          {item.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.technologies.map((tech, index) => (
                          <Badge key={index} className="bg-blue-600 text-white text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{item.responsible}</TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(item.lastUpdate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(item)}
                          className="border-slate-600 text-white hover:bg-slate-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                          className="border-slate-600 text-white hover:bg-slate-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item)}
                          className="border-slate-600 text-red-400 hover:bg-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 