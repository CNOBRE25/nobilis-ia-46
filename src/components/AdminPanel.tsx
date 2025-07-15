
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Users, RotateCcw, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const { toast } = useToast();

  // Lista de cadastros pendentes (vazia inicialmente)
  const [cadastrosPendentes, setCadastrosPendentes] = useState([]);

  const [solicitacoesReversao, setSolicitacoesReversao] = useState([]);

  const [usuariosAtivos] = useState([]);

  const handleAprovarCadastro = (id: string) => {
    setCadastrosPendentes(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Cadastro Aprovado",
      description: "Usuário aprovado com sucesso!"
    });
  };

  const handleRejeitarCadastro = (id: string) => {
    setCadastrosPendentes(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Cadastro Rejeitado",
      description: "Solicitação de cadastro rejeitada."
    });
  };

  const handleAprovarReversao = (id: string) => {
    setSolicitacoesReversao(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Reversão Aprovada",
      description: "Processo reaberto para edição."
    });
  };

  const handleRejeitarReversao = (id: string) => {
    setSolicitacoesReversao(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Reversão Rejeitada",
      description: "Solicitação de reversão rejeitada."
    });
  };

  const handleDesativarUsuario = (id: string) => {
    toast({
      title: "Usuário Desativado",
      description: "Usuário foi desativado do sistema."
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-50 overflow-auto">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
          <Button onClick={onClose} variant="outline" className="text-white border-white">
            Fechar
          </Button>
        </div>

        <Tabs defaultValue="cadastros" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="cadastros" className="text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastros Pendentes
            </TabsTrigger>
            <TabsTrigger value="reversoes" className="text-white">
              <RotateCcw className="h-4 w-4 mr-2" />
              Solicitações de Reversão
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="text-white">
              <Users className="h-4 w-4 mr-2" />
              Usuários Ativos
            </TabsTrigger>
            <TabsTrigger value="exclusoes" className="text-white">
              <Trash2 className="h-4 w-4 mr-2" />
              Exclusão de Processos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cadastros" className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Solicitações de Cadastro</CardTitle>
              </CardHeader>
              <CardContent>
                {cadastrosPendentes.length === 0 ? (
                  <p className="text-white text-center py-8">Nenhuma solicitação pendente.</p>
                ) : (
                  <div className="space-y-4">
                    {cadastrosPendentes.map((cadastro) => (
                      <div key={cadastro.id} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-white font-semibold">{cadastro.nome}</h3>
                            <div className="text-blue-200 text-sm space-y-1">
                              <p><strong>Email:</strong> {cadastro.email}</p>
                              <p><strong>Matrícula:</strong> {cadastro.matricula}</p>
                              <p><strong>Cargo:</strong> {cadastro.cargo}</p>
                              <p><strong>Solicitado em:</strong> {new Date(cadastro.dataSolicitacao).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAprovarCadastro(cadastro.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button
                              onClick={() => handleRejeitarCadastro(cadastro.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reversoes" className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Solicitações de Reversão de Processo</CardTitle>
              </CardHeader>
              <CardContent>
                {solicitacoesReversao.length === 0 ? (
                  <p className="text-white text-center py-8">Nenhuma solicitação de reversão pendente.</p>
                ) : (
                  <div className="space-y-4">
                    {solicitacoesReversao.map((solicitacao) => (
                      <div key={solicitacao.id} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-white font-semibold">Processo: {solicitacao.numeroProcesso}</h3>
                            <div className="text-blue-200 text-sm space-y-1">
                              <p><strong>Solicitante:</strong> {solicitacao.solicitante}</p>
                              <p><strong>Motivo:</strong> {solicitacao.motivo}</p>
                              <p><strong>Solicitado em:</strong> {new Date(solicitacao.dataSolicitacao).toLocaleDateString('pt-BR')}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAprovarReversao(solicitacao.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button
                              onClick={() => handleRejeitarReversao(solicitacao.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Usuários Ativos na Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usuariosAtivos.map((usuario) => (
                    <div key={usuario.id} className="bg-white/5 p-4 rounded-lg">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <h3 className="text-white font-semibold">{usuario.nome}</h3>
                          <div className="text-blue-200 text-sm space-y-1">
                            <p><strong>Email:</strong> {usuario.email}</p>
                            <p><strong>Cargo:</strong> {usuario.cargo}</p>
                            <p><strong>Último acesso:</strong> {new Date(usuario.ultimoAcesso).toLocaleDateString('pt-BR')}</p>
                            <p><strong>Processos ativos:</strong> {usuario.processosAtivos}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-600 text-white">Ativo</Badge>
                          <Button
                            onClick={() => handleDesativarUsuario(usuario.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Desativar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exclusoes" className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Exclusão de Processos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trash2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Exclusão de Processos</h3>
                  <p className="text-blue-200">
                    Funcionalidade para exclusão de processos será implementada com controles de segurança rigorosos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
