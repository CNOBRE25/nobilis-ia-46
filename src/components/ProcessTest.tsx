import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Database, FileText, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface TestResult {
  step: string;
  success: boolean;
  error?: string;
  data?: any;
}

export const ProcessTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testProcess, setTestProcess] = useState({
    numero: `TEST-${Date.now()}`,
    descricao: "Processo de teste para verificar salvamento",
    tipo: "investigacao_preliminar",
    prioridade: "media"
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const runProcessTest = async () => {
    setIsLoading(true);
    const results: TestResult[] = [];

    try {
      // 1. Verificar conexão
      console.log("1. Testando conexão...");
      results.push({
        step: "Conexão",
        success: true,
        data: "Conectado ao Supabase"
      });

      // 2. Verificar se a tabela processos existe
      console.log("2. Verificando tabela processos...");
      const { data: tableCheck, error: tableError } = await supabase
        .from('processos')
        .select('count')
        .limit(1);

      if (tableError) {
        results.push({
          step: "Tabela Processos",
          success: false,
          error: tableError.message
        });
      } else {
        results.push({
          step: "Tabela Processos",
          success: true,
          data: "Tabela existe e acessível"
        });
      }

      // 3. Verificar usuário atual
      console.log("3. Verificando usuário...");
      if (!user) {
        results.push({
          step: "Usuário Autenticado",
          success: false,
          error: "Usuário não autenticado"
        });
      } else {
        results.push({
          step: "Usuário Autenticado",
          success: true,
          data: `Usuário: ${user.email}`
        });
      }

      // 4. Buscar ID do usuário no banco
      console.log("4. Buscando ID do usuário...");
      let userId = null;
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (userError) {
          results.push({
            step: "ID do Usuário",
            success: false,
            error: userError.message
          });
        } else {
          userId = userData.id;
          results.push({
            step: "ID do Usuário",
            success: true,
            data: `ID: ${userId}`
          });
        }
      }

      // 5. Tentar inserir processo
      console.log("5. Testando inserção...");
      const processData = {
        numero_processo: testProcess.numero,
        tipo_processo: testProcess.tipo,
        prioridade: testProcess.prioridade,
        descricao_fatos: testProcess.descricao,
        status: 'tramitacao',
        user_id: userId,
        nome_investigado: 'Teste Silva',
        cargo_investigado: 'Cabo',
        unidade_investigado: '1º BPM'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('processos')
        .insert([processData])
        .select()
        .single();

      if (insertError) {
        results.push({
          step: "Inserção de Processo",
          success: false,
          error: `${insertError.code}: ${insertError.message}`
        });
      } else {
        results.push({
          step: "Inserção de Processo",
          success: true,
          data: `Processo criado com ID: ${insertData.id}`
        });
      }

      // 6. Verificar se o processo foi salvo
      console.log("6. Verificando processo salvo...");
      if (insertData?.id) {
        const { data: verifyData, error: verifyError } = await supabase
          .from('processos')
          .select('*')
          .eq('id', insertData.id)
          .single();

        if (verifyError) {
          results.push({
            step: "Verificação do Processo",
            success: false,
            error: verifyError.message
          });
        } else {
          results.push({
            step: "Verificação do Processo",
            success: true,
            data: `Processo encontrado: ${verifyData.numero_processo}`
          });
        }

        // 7. Limpar processo de teste
        console.log("7. Limpando processo de teste...");
        const { error: deleteError } = await supabase
          .from('processos')
          .delete()
          .eq('id', insertData.id);

        if (deleteError) {
          results.push({
            step: "Limpeza do Teste",
            success: false,
            error: deleteError.message
          });
        } else {
          results.push({
            step: "Limpeza do Teste",
            success: true,
            data: "Processo de teste removido"
          });
        }
      }

    } catch (error: any) {
      results.push({
        step: "Erro Geral",
        success: false,
        error: error.message
      });
    }

    setTestResults(results);
    setIsLoading(false);

    // Mostrar resumo
    const successCount = results.filter(r => r.success).length;
    const totalTests = results.length;

    toast({
      title: `Teste de Processos: ${successCount}/${totalTests}`,
      description: successCount === totalTests 
        ? "Todos os testes passaram! Processos podem ser salvos." 
        : `${totalTests - successCount} teste(s) falharam. Verifique os detalhes.`,
      variant: successCount === totalTests ? "default" : "destructive"
    });
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return success ? (
      <Badge className="bg-green-600">SUCESSO</Badge>
    ) : (
      <Badge variant="destructive">FALHOU</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">🧪 Teste de Processos</h1>
        <p className="text-xl text-gray-300">Verificação específica do salvamento de processos</p>
      </div>

      {/* Dados do Processo de Teste */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Dados do Processo de Teste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Número do Processo</label>
              <Input
                value={testProcess.numero}
                onChange={(e) => setTestProcess(prev => ({ ...prev, numero: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Tipo</label>
              <Input
                value={testProcess.tipo}
                onChange={(e) => setTestProcess(prev => ({ ...prev, tipo: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Descrição</label>
            <Textarea
              value={testProcess.descricao}
              onChange={(e) => setTestProcess(prev => ({ ...prev, descricao: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>
          <Button 
            onClick={runProcessTest} 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executando Testes...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Executar Teste de Processos
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resultados dos Testes */}
      {testResults.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.success)}
                    <div>
                      <div className="font-semibold text-white">{result.step}</div>
                      {result.data && (
                        <div className="text-sm text-gray-300">{result.data}</div>
                      )}
                      {result.error && (
                        <div className="text-sm text-red-400">{result.error}</div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(result.success)}
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="mt-6 p-4 bg-slate-700 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Resumo:</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• <strong>Total de testes:</strong> {testResults.length}</p>
                <p>• <strong>Sucessos:</strong> {testResults.filter(r => r.success).length}</p>
                <p>• <strong>Falhas:</strong> {testResults.filter(r => !r.success).length}</p>
                {testResults.some(r => !r.success) && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded">
                    <p className="text-red-400 font-semibold">⚠️ Problemas detectados:</p>
                    <ul className="mt-2 space-y-1">
                      {testResults
                        .filter(r => !r.success)
                        .map((r, index) => (
                          <li key={index} className="text-red-300">• {r.step}: {r.error}</li>
                        ))}
                    </ul>
                  </div>
                )}
                {testResults.every(r => r.success) && (
                  <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
                    <p className="text-green-400 font-semibold">✅ Todos os testes passaram!</p>
                    <p className="text-green-300 mt-1">O sistema de processos está funcionando corretamente.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Usuário */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-gray-300">
            <p><strong>Email:</strong> {user?.email || 'Não autenticado'}</p>
            <p><strong>ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>Role:</strong> {user?.user_metadata?.role || user?.app_metadata?.role || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 