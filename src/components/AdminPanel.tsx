
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Users, RotateCcw, Trash2, UserPlus, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UnifiedStatsPanel } from "./UnifiedStatsPanel";
import { supabase } from "../integrations/supabase/client";

interface AdminPanelProps {
  onClose: () => void;
}

interface PendingUser {
  id: string;
  email: string;
  nome_completo: string;
  matricula: string;
  cargo_funcao: string;
  auth_user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
}

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const { toast } = useToast();

  // Lista de cadastros pendentes
  const [cadastrosPendentes, setCadastrosPendentes] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [solicitacoesReversao, setSolicitacoesReversao] = useState([]);

  const [usuariosAtivos] = useState([]);



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

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Por enquanto, usar dados vazios até a migração ser aplicada
      // Quando a tabela pending_users estiver disponível, esta função será atualizada
      console.log('Buscando usuários pendentes...');
      
      // Simular busca (será substituída pela busca real após migração)
      setTimeout(() => {
        setCadastrosPendentes([]);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao buscar usuários pendentes:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários pendentes",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleAprovarCadastro = async (id: string) => {
    try {
      // Por enquanto, apenas remover da lista local
      // Quando a migração for aplicada, esta função será atualizada para usar o banco
      setCadastrosPendentes(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Cadastro Aprovado",
        description: "Usuário aprovado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar usuário",
        variant: "destructive",
      });
    }
  };

  const handleRejeitarCadastro = async (id: string) => {
    try {
      // Por enquanto, apenas remover da lista local
      // Quando a migração for aplicada, esta função será atualizada para usar o banco
      setCadastrosPendentes(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Cadastro Rejeitado",
        description: "Solicitação de cadastro rejeitada."
      });
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao rejeitar usuário",
        variant: "destructive",
      });
    }
  };

  const handleDesativarUsuario = (id: string) => {
    toast({
      title: "Usuário Desativado",
      description: "Usuário foi desativado do sistema."
    });
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

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
          <TabsList className="grid w-full grid-cols-5 mb-6">
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
            <TabsTrigger value="estatisticas" className="text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estatísticas Unificadas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cadastros" className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Solicitações de Cadastro</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-white text-center py-8">Carregando solicitações...</p>
                ) : cadastrosPendentes.length === 0 ? (
                  <p className="text-white text-center py-8">Nenhuma solicitação pendente.</p>
                ) : (
                  <div className="space-y-4">
                    {cadastrosPendentes.map((cadastro) => (
                      <div key={cadastro.id} className="bg-white/5 p-4 rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h3 className="text-white font-semibold">{cadastro.nome_completo}</h3>
                            <div className="text-blue-200 text-sm space-y-1">
                              <p><strong>Email:</strong> {cadastro.email}</p>
                              <p><strong>Matrícula:</strong> {cadastro.matricula}</p>
                              <p><strong>Cargo:</strong> {cadastro.cargo_funcao}</p>
                              <p><strong>Solicitado em:</strong> {new Date(cadastro.requested_at).toLocaleDateString('pt-BR')}</p>
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

          <TabsContent value="estatisticas" className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-6">
              <UnifiedStatsPanel />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
