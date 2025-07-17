
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Scale, 
  Shield, 
  Building, 
  Users, 
  Gavel,
  Download,
  ExternalLink,
  Calendar,
  Tag,
  AlertTriangle,
  Award
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeiItem {
  id: string;
  numero: string;
  ano: string;
  titulo: string;
  ementa: string;
  categoria: string;
  dataPublicacao: string;
  status: "vigente" | "revogada" | "suspensa";
  link?: string;
  artigos?: string[];
}

interface CrimeMapping {
  crime: string;
  artigo: string;
  descricao: string;
  pena: string;
}

interface CrimeMilitar {
  crime: string;
  artigo: string;
  descricao: string;
  pena: string;
  categoria: string;
  observacoes: string;
}

interface LeiMilitar {
  id: string;
  numero: string;
  ano: string;
  titulo: string;
  ementa: string;
  categoria: string;
  dataPublicacao: string;
  status: string;
  orgao: string;
  artigos?: string[];
}

interface LegislacaoMilitarData {
  leis: LeiMilitar[];
  crimes_militares: CrimeMilitar[];
  regulamentos_pe: any[];
  jurisprudencia: any[];
}

const crimesMapping: CrimeMapping[] = [
  {
    crime: "homicídio",
    artigo: "121",
    descricao: "Matar alguém",
    pena: "reclusão, de seis a vinte anos"
  },
  {
    crime: "furto",
    artigo: "155",
    descricao: "Subtrair, para si ou para outrem, coisa alheia móvel",
    pena: "reclusão de um a quatro anos, e multa"
  },
  {
    crime: "roubo",
    artigo: "157",
    descricao: "Subtrair coisa móvel alheia, para si ou para outrem, mediante grave ameaça ou violência",
    pena: "reclusão de quatro a dez anos, e multa"
  },
  {
    crime: "estelionato",
    artigo: "171",
    descricao: "Obter, para si ou para outrem, vantagem ilícita, em prejuízo alheio, induzindo ou mantendo alguém em erro",
    pena: "reclusão de um a cinco anos, e multa"
  },
  {
    crime: "lesão corporal",
    artigo: "129",
    descricao: "Ofender a integridade corporal ou a saúde de outrem",
    pena: "detenção de três meses a um ano"
  },
  {
    crime: "injúria",
    artigo: "140",
    descricao: "Injuriar alguém, ofendendo-lhe a dignidade ou o decoro",
    pena: "detenção de um a seis meses, ou multa"
  },
  {
    crime: "calúnia",
    artigo: "138",
    descricao: "Caluniar alguém, imputando-lhe falsamente fato definido como crime",
    pena: "detenção de seis meses a dois anos, e multa"
  },
  {
    crime: "difamação",
    artigo: "139",
    descricao: "Difamar alguém, imputando-lhe fato ofensivo à sua reputação",
    pena: "detenção de três meses a um ano, e multa"
  },
  {
    crime: "tráfico de drogas",
    artigo: "33",
    descricao: "Importar, exportar, remeter, preparar, produzir, fabricar, adquirir, vender, expor à venda, oferecer, ter em depósito, transportar, trazer consigo, guardar, prescrever, ministrar, entregar a consumo ou fornecer drogas",
    pena: "reclusão de 5 (cinco) a 15 (quinze) anos e pagamento de 500 (quinhentos) a 1.500 (mil e quinhentos) dias-multa"
  },
  {
    crime: "estupro",
    artigo: "213",
    descricao: "Constranger alguém, mediante violência ou grave ameaça, a ter conjunção carnal ou a praticar ou permitir que com ele se pratique outro ato libidinoso",
    pena: "reclusão de 6 (seis) a 10 (dez) anos"
  }
];

const mockLeis: LeiItem[] = [
  {
    id: "1",
    numero: "13.709",
    ano: "2018",
    titulo: "Lei Geral de Proteção de Dados Pessoais (LGPD)",
    ementa: "Dispõe sobre a proteção de dados pessoais e altera a Lei nº 12.965, de 23 de abril de 2014 (Marco Civil da Internet).",
    categoria: "Proteção de Dados",
    dataPublicacao: "2018-08-14",
    status: "vigente"
  },
  {
    id: "2",
    numero: "8.666",
    ano: "1993",
    titulo: "Lei de Licitações e Contratos Administrativos",
    ementa: "Regulamenta o art. 37, inciso XXI, da Constituição Federal, institui normas para licitações e contratos da Administração Pública.",
    categoria: "Administrativo",
    dataPublicacao: "1993-06-21",
    status: "vigente"
  },
  {
    id: "3",
    numero: "12.527",
    ano: "2011",
    titulo: "Lei de Acesso à Informação",
    ementa: "Regula o acesso a informações previsto no inciso XXXIII do art. 5º, no inciso II do § 3º do art. 37 e no § 2º do art. 216 da Constituição Federal.",
    categoria: "Transparência",
    dataPublicacao: "2011-11-18",
    status: "vigente"
  },
  {
    id: "4",
    numero: "2.848",
    ano: "1940",
    titulo: "Código Penal",
    ementa: "Decreto-Lei que institui o Código Penal Brasileiro.",
    categoria: "Penal",
    dataPublicacao: "1940-12-07",
    status: "vigente",
    artigos: ["121", "129", "138", "139", "140", "155", "157", "171", "213"]
  },
  {
    id: "5",
    numero: "10.406",
    ano: "2002",
    titulo: "Código Civil",
    ementa: "Institui o Código Civil Brasileiro.",
    categoria: "Civil",
    dataPublicacao: "2002-01-10",
    status: "vigente"
  },
  {
    id: "6",
    numero: "11.343",
    ano: "2006",
    titulo: "Lei de Drogas",
    ementa: "Institui o Sistema Nacional de Políticas Públicas sobre Drogas - Sisnad; prescreve medidas para prevenção do uso indevido, atenção e reinserção social de usuários e dependentes de drogas.",
    categoria: "Penal",
    dataPublicacao: "2006-08-23",
    status: "vigente",
    artigos: ["33"]
  }
];

const categorias = [
  { value: "todas", label: "Todas as Categorias", icon: BookOpen },
  { value: "penal", label: "Direito Penal", icon: Gavel },
  { value: "civil", label: "Direito Civil", icon: Scale },
  { value: "administrativo", label: "Direito Administrativo", icon: Building },
  { value: "proteção-dados", label: "Proteção de Dados", icon: Shield },
  { value: "transparencia", label: "Transparência", icon: Users }
];

const LegislacaoSection = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedStatus, setSelectedStatus] = useState("todas");
  const [filteredLeis, setFilteredLeis] = useState(mockLeis);
  const [crimeResults, setCrimeResults] = useState<CrimeMapping[]>([]);
  const [legislacaoMilitar, setLegislacaoMilitar] = useState<LegislacaoMilitarData | null>(null);
  const [filteredLeisMilitares, setFilteredLeisMilitares] = useState<LeiMilitar[]>([]);
  const [filteredCrimesMilitares, setFilteredCrimesMilitares] = useState<CrimeMilitar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLegislacaoMilitar = async () => {
      try {
        setLoading(true);
        const response = await fetch('/leis_crimes_militares_pe.json');
        const data: LegislacaoMilitarData = await response.json();
        setLegislacaoMilitar(data);
        setFilteredLeisMilitares(data.leis);
        setFilteredCrimesMilitares(data.crimes_militares);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Erro ao carregar legislação militar:', error);
        }
        setError('Erro ao carregar legislação militar');
      } finally {
        setLoading(false);
      }
    };

    loadLegislacaoMilitar();
  }, []);

  const handleSearch = () => {
    let filtered = mockLeis;
    let crimes: CrimeMapping[] = [];

    // Busca por crimes
    if (searchTerm) {
      crimes = crimesMapping.filter(crime => 
        crime.crime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crime.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro normal de leis
    if (searchTerm) {
      filtered = filtered.filter(lei => 
        lei.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lei.ementa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lei.numero.includes(searchTerm)
      );
    }

    if (selectedCategory !== "todas") {
      filtered = filtered.filter(lei => 
        lei.categoria.toLowerCase().includes(selectedCategory.replace("-", " "))
      );
    }

    if (selectedStatus !== "todas") {
      filtered = filtered.filter(lei => lei.status === selectedStatus);
    }

    setFilteredLeis(filtered);
    setCrimeResults(crimes);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vigente": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "revogada": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "suspensa": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="ai-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl text-card-foreground">
                Consulta de Legislação Brasileira
              </CardTitle>
              <CardDescription>
                Sistema seguro para consulta e pesquisa de leis, decretos e normas vigentes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="geral" className="flex items-center">
            <Scale className="h-4 w-4 mr-2" />
            Legislação Geral
          </TabsTrigger>
          <TabsTrigger value="militar" className="flex items-center">
            <Award className="h-4 w-4 mr-2" />
            Legislação Militar PE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          {/* Filtros de Busca */}
          <Card className="ai-card">
            <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por crime, número, título ou conteúdo da lei..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <Button onClick={handleSearch} className="ai-button-primary">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categorias.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="todas">Todos os Status</SelectItem>
                    <SelectItem value="vigente">Vigente</SelectItem>
                    <SelectItem value="revogada">Revogada</SelectItem>
                    <SelectItem value="suspensa">Suspensa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de Crimes */}
      {crimeResults.length > 0 && (
        <Card className="ai-card border-orange-500/30 bg-orange-500/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <CardTitle className="text-lg text-orange-400">
                Crimes Encontrados
              </CardTitle>
              <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                {crimeResults.length} crime(s) encontrado(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crimeResults.map((crime, index) => (
                <Card key={index} className="ai-card border-orange-500/20">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-orange-400">
                              {crime.crime.toUpperCase()}
                            </h3>
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              Art. {crime.artigo} - CP
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-card-foreground">
                            {crime.descricao}
                          </p>
                        </div>
                      </div>

                      <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="h-4 w-4 text-red-400" />
                          <span className="text-sm font-semibold text-red-400">PENA:</span>
                        </div>
                        <p className="text-sm text-red-300">
                          {crime.pena}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      <Card className="ai-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-card-foreground">
              Resultados da Busca
            </CardTitle>
            <Badge variant="outline" className="bg-card text-card-foreground border-border">
              {filteredLeis.length} lei(s) encontrada(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full">
            <div className="space-y-4">
              {filteredLeis.map((lei) => (
                <Card key={lei.id} className="ai-card border border-border/60">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-card-foreground">
                              Lei nº {lei.numero}/{lei.ano}
                            </h3>
                            <Badge className={getStatusColor(lei.status)}>
                              {lei.status.charAt(0).toUpperCase() + lei.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-primary">
                            {lei.titulo}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="ai-button-secondary">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="ai-button-secondary">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {lei.ementa}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Publicação: {new Date(lei.dataPublicacao).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {lei.categoria}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredLeis.length === 0 && crimeResults.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Search className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma lei encontrada</h3>
                    <p className="text-sm">Tente ajustar os filtros de busca ou usar outros termos.</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Categorias Rápidas */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Acesso Rápido por Categoria</CardTitle>
          <CardDescription>Navegue pelas principais áreas do direito brasileiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categorias.slice(1).map((categoria) => (
              <Button
                key={categoria.value}
                variant="outline"
                className="ai-button-secondary h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => {
                  setSelectedCategory(categoria.value);
                  handleSearch();
                }}
              >
                <categoria.icon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-center">{categoria.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Avisos de Segurança */}
      <Card className="ai-card border-yellow-500/30 bg-yellow-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-400 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-400">Aviso Importante</h4>
              <p className="text-sm text-yellow-200/80">
                Este sistema é destinado exclusivamente para consulta oficial. O uso inadequado ou para fins ilícitos 
                pode resultar em sanções penais conforme previsto no Código Penal Brasileiro (artigos 297 a 337) e 
                demais legislações aplicáveis. Todos os acessos são registrados e monitorados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    <TabsContent value="militar">
      {/* Seção de Legislação Militar */}
      <Card className="ai-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Award className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-card-foreground">
                Legislação Militar - Pernambuco
              </CardTitle>
              <CardDescription>
                Código Penal Militar, Regulamentos e Normas aplicáveis às corporações militares de PE
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Crimes Militares */}
      <Card className="ai-card border-red-500/30 bg-red-500/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-red-400" />
            <CardTitle className="text-lg text-red-400">
              Crimes Militares - Código Penal Militar
            </CardTitle>
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
              {filteredCrimesMilitares.length} crimes catalogados
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-3">
              {filteredCrimesMilitares.map((crime, index) => (
                <Card key={index} className="ai-card border-red-500/20">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-red-400">
                              {crime.crime}
                            </h3>
                            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                              {crime.artigo}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {crime.categoria}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-card-foreground">Descrição:</p>
                          <p className="text-sm text-muted-foreground">{crime.descricao}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">Pena:</p>
                          <p className="text-sm text-orange-400">{crime.pena}</p>
                        </div>
                        {crime.observacoes && (
                          <div>
                            <p className="text-sm font-medium text-card-foreground">Observações:</p>
                            <p className="text-sm text-muted-foreground italic">{crime.observacoes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Leis Militares */}
      <Card className="ai-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-card-foreground">
              Legislação Militar Específica - PE
            </CardTitle>
            <Badge variant="outline" className="bg-card text-card-foreground border-border">
              {filteredLeisMilitares.length} lei(s) militar(es)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4">
              {filteredLeisMilitares.map((lei) => (
                <Card key={lei.id} className="ai-card border border-border/60">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-card-foreground">
                              {lei.numero}
                            </h3>
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              {lei.status.charAt(0).toUpperCase() + lei.status.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                              {lei.orgao}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-primary">
                            {lei.titulo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {lei.categoria} • Publicado em {new Date(lei.dataPublicacao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {lei.ementa}
                      </p>
                      {lei.artigos && (
                        <div>
                          <p className="text-sm font-medium text-card-foreground mb-2">Principais Artigos:</p>
                          <div className="flex flex-wrap gap-1">
                            {lei.artigos.map((artigo, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {artigo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Aviso Específico para Legislação Militar */}
      <Card className="ai-card border-red-500/30 bg-red-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-red-400 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-red-400">Legislação Militar - PE</h4>
              <p className="text-sm text-red-200/80">
                Esta seção contém informações sobre crimes militares e legislação específica aplicável às 
                corporações militares de Pernambuco (PMPE e CBMPE). Sempre consulte o Regulamento Disciplinar 
                e a Justiça Militar para casos específicos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

  </Tabs>
</div>
);
};

export default LegislacaoSection;
