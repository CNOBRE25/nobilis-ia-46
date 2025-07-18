import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const TestPasswordValidation = () => {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPassword = async () => {
    setLoading(true);
    try {
      console.log('Testando senha:', password);
      
      // Teste da função RPC
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('validate_password_strength', { password });

      console.log('RPC Result:', rpcResult);
      console.log('RPC Error:', rpcError);

      setResult({
        password,
        rpcResult,
        rpcError,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro no teste:', error);
      setResult({
        password,
        error: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Teste de Validação de Senha</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="password"
            placeholder="Digite uma senha para testar"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={testPassword} 
          disabled={loading || !password}
          className="w-full"
        >
          {loading ? 'Testando...' : 'Testar Senha'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold mb-2">Resultado:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestPasswordValidation; 