import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Database, Users, FileText, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TestResults {
  connection: { success: boolean; error?: string };
  tables: { success: boolean; error?: string; data?: unknown };
  users: { success: boolean; error?: string; data?: unknown };
  processos: { success: boolean; error?: string; data?: unknown };
  insert: { success: boolean; error?: string; data?: unknown };
  select: { success: boolean; error?: string; data?: unknown };
  update: { success: boolean; error?: string; data?: unknown };
  delete: { success: boolean; error?: string };
  auth: { success: boolean; error?: string; data?: unknown };
}

export const SupabaseTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const { toast } = useToast();

  const runTests = async () => {
    setIsLoading(true);
    const results: TestResults = {
      connection: { success: false },
      tables: { success: false },
      users: { success: false },
      processos: { success: false },
      insert: { success: false },
      select: { success: false },
      update: { success: false },
      delete: { success: false },
      auth: { success: false }
    };

    try {
      // 1. Testar conexão básica
      console.log("1. Testando conexão...");
      const { data: connectionData, error: connectionError } = await supabase
        .from('processos')
        .select('count')
        .limit(1);

      results.connection = {
        success: !connectionError,
        error: connectionError?.message
      };

      // 2. Verificar tabelas existentes
      console.log("2. Verificando tabelas...");
      const { data: tablesData, error: tablesError } = await supabase
        .rpc('get_tables_info');

      if (tablesError) {
        // Fallback: verificar tabelas individualmente
        const tables = ['users', 'processos', 'ai_analyses', 'audit_logs', 'user_consents', 'user_roles'];
        const tableChecks = await Promise.all(
          tables.map(async (table) => {
            const { error } = await supabase.from(table).select('count').limit(1);
            return { table, exists: !error };
          })
        );

        results.tables = {
          success: tableChecks.every(check => check.exists),
          data: tableChecks,
          error: tablesError.message
        };
      } else {
        results.tables = {
          success: true,
          data: tablesData
        };
      }

      // 3. Verificar usuários
      console.log("3. Verificando usuários...");
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      results.users = {
        success: !usersError,
        error: usersError?.message,
        data: usersData
      };

      // 4. Verificar processos
      console.log("4. Verificando processos...");
      const { data: processosData, error: processosError } = await supabase
        .from('processos')
        .select('*')
        .limit(5);

      results.processos = {
        success: !processosError,
        error: processosError?.message,
        data: processosData
      };

      // 5. Testar inserção
      console.log("5. Testando inserção...");
      const testProcesso = {
        numero_processo: 'TEST-' + Date.now(),
        tipo_processo: 'investigacao_preliminar',
        prioridade: 'media',
        descricao_fatos: 'Processo de teste para verificar conexão',
        status: 'tramitacao'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('processos')
        .insert([testProcesso])
        .select()
        .single();

      results.insert = {
        success: !insertError,
        error: insertError?.message,
        data: insertData
      };

      // 6. Testar seleção
      console.log("6. Testando seleção...");
      if (insertData?.id) {
        const { data: selectData, error: selectError } = await supabase
          .from('processos')
          .select('*')
          .eq('id', insertData.id)
          .single();

        results.select = {
          success: !selectError,
          error: selectError?.message,
          data: selectData
        };

        // 7. Testar atualização
        console.log("7. Testando atualização...");
        const { data: updateData, error: updateError } = await supabase
          .from('processos')
          .update({ 
            descricao_fatos: 'Processo de teste ATUALIZADO',
            status: 'concluido'
          })
          .eq('id', insertData.id)
          .select()
          .single();

        results.update = {
          success: !updateError,
          error: updateError?.message,
          data: updateData
        };

        // 8. Testar exclusão
        console.log("8. Testando exclusão...");
        const { error: deleteError } = await supabase
          .from('processos')
          .delete()
          .eq('id', insertData.id);

        results.delete = {
          success: !deleteError,
          error: deleteError?.message
        };
      }

      // 9. Testar autenticação
      console.log("9. Testando autenticação...");
      const { data: authData, error: authError } = await supabase
        .rpc('verify_user_credentials', {
          user_email: 'crn.nobre@gmail.com',
          user_password: 'admin123'
        });

      results.auth = {
        success: !authError && authData && authData.length > 0,
        error: authError?.message,
        data: authData
      };

    } catch (error: unknown) {
      results.connection = {
        success: false,
        error: error.message
      };
    }

    setTestResults(results);
    setIsLoading(false);

    // Mostrar resumo
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalTests = Object.keys(results).length;

    toast({
      title: `Testes Concluídos: ${successCount}/${totalTests}`,
      description: successCount === totalTests 
        ? "Todos os testes passaram com sucesso!" 
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Teste de Conexão Supabase</h1>
        <Button 
          onClick={runTests} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Executando Testes...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Executar Testes
            </>
          )}
        </Button>
      </div>

      {testResults && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Conexão */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                Conexão
                {getStatusIcon(testResults.connection.success)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(testResults.connection.success)}
              {testResults.connection.error && (
                <p className="text-red-400 text-sm mt-2">{testResults.connection.error}</p>
              )}
            </CardContent>
          </Card>

          {/* Tabelas */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                Tabelas
                {getStatusIcon(testResults.tables.success)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(testResults.tables.success)}
              {testResults.tables.data && (
                <div className="text-sm text-gray-300 mt-2">
                  {Array.isArray(testResults.tables.data) ? (
                    <div>
                      {testResults.tables.data.map((check: { table: string; exists: boolean }, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{check.table}:</span>
                          <span className={check.exists ? "text-green-400" : "text-red-400"}>
                            {check.exists ? "✓" : "✗"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Dados: {JSON.stringify(testResults.tables.data).substring(0, 100)}...</p>
                  )}
                </div>
              )}
              {testResults.tables.error && (
                <p className="text-red-400 text-sm mt-2">{testResults.tables.error}</p>
              )}
            </CardContent>
          </Card>

          {/* Usuários */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5" />
                Usuários
                {getStatusIcon(testResults.users.success)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(testResults.users.success)}
              {testResults.users.data && (
                <p className="text-sm text-gray-300 mt-2">
                  {testResults.users.data.length} usuário(s) encontrado(s)
                </p>
              )}
              {testResults.users.error && (
                <p className="text-red-400 text-sm mt-2">{testResults.users.error}</p>
              )}
            </CardContent>
          </Card>

          {/* Processos */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5" />
                Processos
                {getStatusIcon(testResults.processos.success)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(testResults.processos.success)}
              {testResults.processos.data && (
                <p className="text-sm text-gray-300 mt-2">
                  {testResults.processos.data.length} processo(s) encontrado(s)
                </p>
              )}
              {testResults.processos.error && (
                <p className="text-red-400 text-sm mt-2">{testResults.processos.error}</p>
              )}
            </CardContent>
          </Card>

          {/* Inserção */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                Inserção
                {getStatusIcon(testResults.insert.success)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(testResults.insert.success)}
              {testResults.insert.data && (
                <p className="text-sm text-gray-300 mt-2">
                  ID: {testResults.insert.data.id}
                </p>
              )}
              {testResults.insert.error && (
                <p className="text-red-400 text-sm mt-2">{testResults.insert.error}</p>
              )}
            </CardContent>
          </Card>

          {/* Seleção */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                Seleção
                {getStatusIcon(testResults.select.success)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(testResults.select.success)}
              {testResults.select.data && (
                <p className="text-sm text-gray-300 mt-2">
                  Dados recuperados com sucesso
                </p>
              )}
              {testResults.select.error && (
                <p className="text-red-400 text-sm mt-2">{testResults.select.error}</p>
              )}
            </CardContent>
          </Card>

          {/* Atualização */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                Atualização
                {getStatusIcon(testResults.update.success)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(testResults.update.success)}
              {testResults.update.data && (
                <p className="text-sm text-gray-300 mt-2">
                  Status: {testResults.update.data.status}
                </p>
              )}
              {testResults.update.error && (
                <p className="text-red-400 text-sm mt-2">{testResults.update.error}</p>
              )}
            </CardContent>
          </Card>

          {/* Exclusão */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Database className="h-5 w-5" />
                Exclusão
                {getStatusIcon(testResults.delete.success)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(testResults.delete.success)}
              {testResults.delete.error && (
                <p className="text-red-400 text-sm mt-2">{testResults.delete.error}</p>
              )}
            </CardContent>
          </Card>

          {/* Autenticação */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-5 w-5" />
                Autenticação
                {getStatusIcon(testResults.auth.success)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(testResults.auth.success)}
              {testResults.auth.data && testResults.auth.data.length > 0 && (
                <p className="text-sm text-gray-300 mt-2">
                  Usuário: {testResults.auth.data[0].user_name}
                </p>
              )}
              {testResults.auth.error && (
                <p className="text-red-400 text-sm mt-2">{testResults.auth.error}</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {testResults && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Resumo dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">{testName}:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.success)}
                    <span className={result.success ? "text-green-400" : "text-red-400"}>
                      {result.success ? "PASSOU" : "FALHOU"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-slate-700 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Próximos Passos:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Se todos os testes passaram: O sistema está funcionando corretamente</li>
                <li>• Se alguns testes falharam: Execute o script SQL de correção</li>
                <li>• Se a conexão falhou: Verifique as credenciais do Supabase</li>
                <li>• Se as tabelas não existem: Execute o script fix_all_tables.sql</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 