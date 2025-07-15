import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye
} from "lucide-react";
import NovoParecer from "@/components/NovoParecer";
import { useToast } from "@/hooks/use-toast";

interface PareceresProps {
  user: any;
}

const PareceresSection = ({ user }: PareceresProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNovoParecer, setShowNovoParecer] = useState(false);
  const { toast } = useToast();

  const pareceres = [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      rascunho: { color: "bg-gray-100 text-gray-800", label: "Rascunho" },
      revisao: { color: "bg-yellow-100 text-yellow-800", label: "Em Revisão" },
      aprovado: { color: "bg-green-100 text-green-800", label: "Aprovado" },
      entregue: { color: "bg-blue-100 text-blue-800", label: "Entregue" },
      arquivado: { color: "bg-gray-100 text-gray-600", label: "Arquivado" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.rascunho;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getOrgaoBadge = (orgao: string) => {
    const orgaoConfig = {
      "Segurança Pública": { color: "bg-blue-100 text-blue-800", label: "Segurança Pública" },
      "Investigação": { color: "bg-green-100 text-green-800", label: "Investigação" },
      "Ressocialização": { color: "bg-purple-100 text-purple-800", label: "Ressocialização" },
      "Emergências": { color: "bg-red-100 text-red-800", label: "Emergências" }
    };
    
    const config = orgaoConfig[orgao as keyof typeof orgaoConfig] || { color: "bg-blue-100 text-blue-800", label: orgao };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getUrgenciaBadge = (urgencia: string) => {
    const urgenciaConfig = {
      baixa: { color: "bg-green-100 text-green-800", label: "Baixa" },
      media: { color: "bg-yellow-100 text-yellow-800", label: "Média" },
      alta: { color: "bg-red-100 text-red-800", label: "Alta" }
    };
    
    const config = urgenciaConfig[urgencia as keyof typeof urgenciaConfig] || urgenciaConfig.media;
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const isPrescricaoProxima = (dataPrescricao: string) => {
    const hoje = new Date();
    const prescricao = new Date(dataPrescricao);
    const diffTime = prescricao.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 365; // Considera próxima se faltar menos de 1 ano
  };

  const filteredPareceres = pareceres.filter(parecer =>
    parecer.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parecer.servidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parecer.numero_protocolo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showNovoParecer) {
    return (
      <NovoParecer 
        user={user} 
        onClose={() => setShowNovoParecer(false)}
        onSave={(parecer) => {
          console.log("Novo parecer salvo:", parecer);
          toast({
            title: "Parecer criado com sucesso!",
            description: `Parecer ${parecer.numero_protocolo} foi criado.`,
          });
          setShowNovoParecer(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pareceres Jurídicos</h2>
          <p className="text-gray-600">Gerencie e acompanhe todos os pareceres do sistema</p>
        </div>
        <Button onClick={() => setShowNovoParecer(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Novo Parecer
        </Button>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, servidor ou protocolo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Status */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="todos">Todos ({pareceres.length})</TabsTrigger>
          <TabsTrigger value="rascunho">Rascunho ({pareceres.filter(p => p.status === "rascunho").length})</TabsTrigger>
          <TabsTrigger value="revisao">Revisão ({pareceres.filter(p => p.status === "revisao").length})</TabsTrigger>
          <TabsTrigger value="aprovado">Aprovado ({pareceres.filter(p => p.status === "aprovado").length})</TabsTrigger>
          <TabsTrigger value="entregue">Entregue ({pareceres.filter(p => p.status === "entregue").length})</TabsTrigger>
          <TabsTrigger value="prescricao">Prescrição ({pareceres.filter(p => isPrescricaoProxima(p.data_prescricao)).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <div className="grid gap-4">
            {filteredPareceres.map((parecer) => (
              <Card key={parecer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm text-blue-600">
                          #{parecer.numero_protocolo}
                        </span>
                        {getOrgaoBadge(parecer.orgao)}
                        {getStatusBadge(parecer.status)}
                        {getUrgenciaBadge(parecer.urgencia)}
                        {isPrescricaoProxima(parecer.data_prescricao) && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Prescrição Próxima
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {parecer.titulo}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Servidor: {parecer.servidor}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Criado: {new Date(parecer.data_criacao).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Fato: {new Date(parecer.data_fato).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Prescrição: {new Date(parecer.data_prescricao).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Outras tabs seguem o mesmo padrão, filtrando por status */}
        {["rascunho", "revisao", "aprovado", "entregue"].map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            <div className="grid gap-4">
              {filteredPareceres
                .filter(p => p.status === status)
                .map((parecer) => (
                  <Card key={parecer.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm text-blue-600">
                              #{parecer.numero_protocolo}
                            </span>
                            {getOrgaoBadge(parecer.orgao)}
                            {getStatusBadge(parecer.status)}
                            {getUrgenciaBadge(parecer.urgencia)}
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {parecer.titulo}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            Servidor: {parecer.servidor}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(parecer.data_criacao).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(parecer.data_fato).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="prescricao" className="mt-6">
          <div className="grid gap-4">
            {filteredPareceres
              .filter(p => isPrescricaoProxima(p.data_prescricao))
              .map((parecer) => (
                <Card key={parecer.id} className="hover:shadow-md transition-shadow border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-blue-600">
                            #{parecer.numero_protocolo}
                          </span>
                          {getOrgaoBadge(parecer.orgao)}
                          {getStatusBadge(parecer.status)}
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Atenção: Prescrição Próxima
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {parecer.titulo}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          Servidor: {parecer.servidor}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Fato: {new Date(parecer.data_fato).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center text-red-600 font-medium">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Prescrição: {new Date(parecer.data_prescricao).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Analisar
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Urgente
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PareceresSection;
