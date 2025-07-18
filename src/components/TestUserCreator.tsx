import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

export function TestUserCreator() {
  const [email, setEmail] = useState('teste@teste.com');
  const [password, setPassword] = useState('123');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const createTestUser = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Criar usuário via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: 'Usuário Teste',
            orgao: 'Órgão de Teste'
          }
        }
      });

      if (authError) {
        // Se o usuário já existe, tentar fazer login para verificar
        if (authError.message.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (signInError) {
            throw new Error('Usuário já existe mas a senha está incorreta. Use a senha original.');
          }

          // Fazer logout após verificar
          await supabase.auth.signOut();
        } else {
          throw authError;
        }
      }

      // Se chegou aqui, o usuário foi criado ou já existe
      // Agora vamos configurar o perfil e role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Atualizar perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            nome: 'Usuário Teste',
            orgao: 'Órgão de Teste',
            cargo: 'Analista',
            matricula: 'TEST001',
            telefone: '(11) 99999-9999',
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Erro ao atualizar perfil:', profileError);
        }

        // Inserir role de usuário comum
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: user.id,
            role: 'user',
            created_at: new Date().toISOString()
          });

        if (roleError) {
          console.error('Erro ao inserir role:', roleError);
        }

        setSuccess(true);
        toast({
          title: "Usuário de teste criado com sucesso!",
          description: `Email: ${email} | Senha: ${password}`,
        });
      }
    } catch (error) {
      console.error('Erro ao criar usuário de teste:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      toast({
        title: "Erro ao criar usuário de teste",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Criar Usuário de Teste
        </CardTitle>
        <CardDescription>
          Crie um usuário de teste para validar a plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teste@teste.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123"
          />
        </div>

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Usuário de teste criado com sucesso!<br />
              <strong>Email:</strong> {email}<br />
              <strong>Senha:</strong> {password}<br />
              <strong>Role:</strong> user (usuário comum)
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={createTestUser} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Criando usuário...' : 'Criar Usuário de Teste'}
        </Button>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Dados padrão:</strong></p>
          <p>• Nome: Usuário Teste</p>
          <p>• Órgão: Órgão de Teste</p>
          <p>• Cargo: Analista</p>
          <p>• Matrícula: TEST001</p>
          <p>• Role: user (usuário comum)</p>
        </div>
      </CardContent>
    </Card>
  );
} 