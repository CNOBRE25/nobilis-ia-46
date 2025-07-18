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
  Eye,
  Loader2
} from "lucide-react";
import NovoParecer from "@/components/NovoParecer";
import { useToast } from "@/hooks/use-toast";
import { usePareceres } from "@/hooks/usePareceres";

interface PareceresProps {
  user: any;
}

const PareceresSection = ({ user }: PareceresProps) => {
  const [showNovoParecer, setShowNovoParecer] = useState(false);
  const [processoParaParecer, setProcessoParaParecer] = useState<string>("");
  const { toast } = useToast();
  
  const {
    pareceres,
    filteredPareceres,
    pareceresPrescricao,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    saveParecer,
    updateParecer,
    deleteParecer,
    loadPareceres,
    isPrescricaoProxima
  } = usePareceres(user);

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

  // Função para verificar se o termo de busca é um número de processo
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Verificar se é um número de processo (formato: números e hífens)
    const processoPattern = /^[\d\-]+$/;
    if (processoPattern.test(value) && value.length >= 5) {
      setProcessoParaParecer(value);
    } else {
      setProcessoParaParecer("");
    }
  };

  // Função para abrir parecer com número de processo
  const abrirParecerComProcesso = () => {
    if (processoParaParecer) {
      setShowNovoParecer(true);
      toast({
        title: "Parecer para Processo",
        description: `Abrindo parecer para o processo ${processoParaParecer}`,
      });
    }
  };



  if (showNovoParecer) {
    return (
      <NovoParecer 
        user={user} 
        onClose={() => {
          setShowNovoParecer(false);
          setProcessoParaParecer("");
          setSearchTerm("");
        }}
        numeroProcesso={processoParaParecer}
        onSave={async (parecer) => {
          try {
            await saveParecer(parecer);
            toast({
              title: "Parecer salvo!",
              description: "Parecer salvo com sucesso no sistema.",
            });
            setShowNovoParecer(false);
            setProcessoParaParecer("");
            setSearchTerm("");
          } catch (error) {
            toast({
              title: "Erro ao salvar",
              description: "Não foi possível salvar o parecer. Tente novamente.",
              variant: "destructive",
            });
          }
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
                  placeholder="Buscar por título, servidor, protocolo ou número do processo..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && processoParaParecer) {
                      abrirParecerComProcesso();
                    }
                  }}
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="shrink-0"
              onClick={loadPareceres}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {loading ? "Carregando..." : "Atualizar"}
            </Button>
          </div>
          
          {/* Estatísticas de busca */}
          {searchTerm && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Buscando por: <span className="font-medium">"{searchTerm}"</span>
                <span className="ml-2">
                  • {filteredPareceres.length} resultado(s) encontrado(s)
                </span>
              </p>
            </div>
          )}

          {/* Botão para criar parecer com número de processo */}
          {processoParaParecer && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-800 mb-1">
                    Número de Processo Detectado
                  </h4>
                  <p className="text-sm text-green-700">
                    Processo: <span className="font-mono font-medium">{processoParaParecer}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Pressione Enter ou clique no botão para criar um parecer para este processo
                  </p>
                </div>
                <Button 
                  onClick={abrirParecerComProcesso}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Criar Parecer
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs de Status */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="todos">Todos ({pareceres.length})</TabsTrigger>
          <TabsTrigger value="rascunho">Rascunho ({pareceres.filter(p => p.status === "rascunho").length})</TabsTrigger>
          <TabsTrigger value="revisao">Revisão ({pareceres.filter(p => p.status === "revisao").length})</TabsTrigger>
          <TabsTrigger value="aprovado">Aprovado ({pareceres.filter(p => p.status === "aprovado").length})</TabsTrigger>
          <TabsTrigger value="entregue">Entregue ({pareceres.filter(p => p.status === "entregue").length})</TabsTrigger>
          <TabsTrigger value="prescricao">Prescrição ({pareceresPrescricao.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Carregando pareceres...</span>
            </div>
          ) : filteredPareceres.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum parecer encontrado' : 'Nenhum parecer cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? `Não foram encontrados pareceres para "${searchTerm}"`
                  : 'Comece criando seu primeiro parecer jurídico'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowNovoParecer(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Parecer
                </Button>
              )}
            </div>
          ) : (
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
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <p className="font-medium mb-1">Servidores:</p>
                        {parecer.servidores && parecer.servidores.length > 0 ? (
                          parecer.servidores.map((servidor, index) => (
                            <div key={index} className="text-xs bg-gray-50 p-2 rounded mb-1">
                              {servidor.nome} ({servidor.matricula}) - {servidor.categoria_funcional}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">Nenhum servidor cadastrado</p>
                        )}
                      </div>
                      
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
          )}
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
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <p className="font-medium mb-1">Servidores:</p>
                            {parecer.servidores && parecer.servidores.length > 0 ? (
                              parecer.servidores.map((servidor, index) => (
                                <div key={index} className="text-xs bg-gray-50 p-2 rounded mb-1">
                                  {servidor.nome} ({servidor.matricula}) - {servidor.categoria_funcional}
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 italic">Nenhum servidor cadastrado</p>
                            )}
                          </div>
                          
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
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <p className="font-medium mb-1">Servidores:</p>
                          {parecer.servidores && parecer.servidores.length > 0 ? (
                            parecer.servidores.map((servidor, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded mb-1">
                                {servidor.nome} ({servidor.matricula}) - {servidor.categoria_funcional}
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-500 italic">Nenhum servidor cadastrado</p>
                          )}
                        </div>
                        
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
