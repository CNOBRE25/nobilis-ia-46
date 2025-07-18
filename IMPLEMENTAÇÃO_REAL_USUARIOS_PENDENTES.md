# Implementação Real de Usuários Pendentes

## Status Atual

O sistema está configurado para funcionar com dados reais, mas precisa que a migração seja aplicada no Supabase primeiro.

## Passos para Implementação Completa

### 1. Aplicar a Migração no Supabase

Execute o script `apply_pending_users_migration.sql` no SQL Editor do Supabase:

```sql
-- Execute o script apply_pending_users_migration.sql no SQL Editor do Supabase
```

### 2. Atualizar o AdminPanel para Usar Dados Reais

Após aplicar a migração, substitua a função `fetchPendingUsers` no arquivo `src/components/AdminPanel.tsx`:

```typescript
const fetchPendingUsers = async () => {
  try {
    setLoading(true);
    setError(null);

    // Buscar usuários pendentes do banco de dados
    const { data, error } = await supabase
      .from('pending_users')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários pendentes:', error);
      setError(error.message);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários pendentes",
        variant: "destructive",
      });
    } else {
      setCadastrosPendentes(data || []);
    }
  } catch (err) {
    console.error('Erro ao buscar usuários pendentes:', err);
    setError(err instanceof Error ? err.message : 'Erro desconhecido');
    toast({
      title: "Erro",
      description: "Erro ao carregar usuários pendentes",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

### 3. Atualizar Funções de Aprovação e Rejeição

Substitua as funções `handleAprovarCadastro` e `handleRejeitarCadastro`:

```typescript
const handleAprovarCadastro = async (id: string) => {
  try {
    // Atualizar status para aprovado
    const { error: updateError } = await supabase
      .from('pending_users')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Ativar o usuário na tabela users
    const { data: pendingUser } = await supabase
      .from('pending_users')
      .select('auth_user_id')
      .eq('id', id)
      .single();

    if (pendingUser) {
      await supabase
        .from('users')
        .update({ ativo: true })
        .eq('auth_id', pendingUser.auth_user_id);
    }

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
    // Atualizar status para rejeitado
    const { error: updateError } = await supabase
      .from('pending_users')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Desativar o usuário na tabela users
    const { data: pendingUser } = await supabase
      .from('pending_users')
      .select('auth_user_id')
      .eq('id', id)
      .single();

    if (pendingUser) {
      await supabase
        .from('users')
        .update({ ativo: false })
        .eq('auth_id', pendingUser.auth_user_id);
    }

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
```

## Fluxo Completo Funcionando

### Para Novos Usuários:

1. **Cadastro**: Usuário preenche o formulário
2. **Criação**: Usuário é criado no Supabase Auth
3. **Registro Pendente**: Um registro é criado na tabela `pending_users` com status 'pending'
4. **Notificação**: Usuário recebe mensagem informando que aguarda aprovação
5. **Aprovação**: Administrador aprova ou rejeita no painel admin

### Para Administradores:

1. **Acesso**: Administrador acessa o painel administrativo
2. **Visualização**: Vê lista de usuários pendentes na aba "Cadastros Pendentes"
3. **Ação**: Pode aprovar ou rejeitar solicitações
4. **Logs**: Todas as ações são registradas nos logs de auditoria

## Verificação

Após implementar:

1. **Teste o cadastro**: Cadastre um novo usuário
2. **Verifique o painel**: Confirme se aparece na lista de pendentes
3. **Teste a aprovação**: Aprove ou rejeite um usuário
4. **Verifique os logs**: Confirme se as ações estão sendo registradas

## Estrutura da Tabela

A tabela `pending_users` terá a seguinte estrutura:

```sql
CREATE TABLE public.pending_users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nome_completo VARCHAR(200) NOT NULL,
    matricula VARCHAR(50),
    cargo_funcao VARCHAR(100),
    auth_user_id UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Políticas de Segurança

- Apenas administradores podem ver todos os usuários pendentes
- Apenas administradores podem aprovar/rejeitar usuários
- Usuários podem ver apenas suas próprias solicitações
- Todas as ações são registradas nos logs de auditoria 

## Como Aplicar a Migração no Supabase

### Passo 1: Acessar o Supabase Dashboard

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto NOBILIS-IA

### Passo 2: Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** para criar uma nova consulta

### Passo 3: Executar o Script de Migração

1. Copie todo o conteúdo do arquivo `apply_pending_users_migration.sql`
2. Cole no editor SQL do Supabase
3. Clique em **"Run"** para executar o script

### Passo 4: Verificar se a Migração foi Aplicada

Após executar o script, você deve ver:

1. **Mensagens de sucesso** indicando que as tabelas foram criadas
2. **Resultados da verificação** mostrando a estrutura da tabela `pending_users`
3. **Políticas de segurança** criadas

### Passo 5: Atualizar o AdminPanel

Após a migração ser aplicada com sucesso, você precisa atualizar o AdminPanel para usar dados reais. Siga as instruções no arquivo `IMPLEMENTAÇÃO_REAL_USUARIOS_PENDENTES.md`.

## Script Completo para Copiar

Aqui está o script completo que você deve executar no Supabase:

```sql
-- Script para aplicar a migração da tabela de usuários pendentes
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela para usuários pendentes de aprovação
CREATE TABLE IF NOT EXISTS public.pending_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome_completo VARCHAR(200) NOT NULL,
    matricula VARCHAR(50),
    cargo_funcao VARCHAR(100),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pending_users_email ON public.pending_users(email);
CREATE INDEX IF NOT EXISTS idx_pending_users_status ON public.pending_users(status);
CREATE INDEX IF NOT EXISTS idx_pending_users_requested_at ON public.pending_users(requested_at);

-- 3. Habilitar RLS
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para pending_users
CREATE POLICY "Admins can view all pending users" ON public.pending_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage pending users" ON public.pending_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 5. Política para usuários verem suas próprias solicitações
CREATE POLICY "Users can view own pending requests" ON public.pending_users
    FOR SELECT USING (
        auth_user_id = auth.uid()
    );

-- 6. Trigger para atualizar updated_at
CREATE TRIGGER update_pending_users_updated_at
    BEFORE UPDATE ON public.pending_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Verificar se a função update_updated_at_column existe, se não, criar
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Log da criação da tabela
INSERT INTO public.audit_logs (event_type, metadata)
VALUES ('PENDING_USERS_TABLE_CREATED', jsonb_build_object(
    'timestamp', NOW(),
    'description', 'Tabela de usuários pendentes criada para fluxo de aprovação'
));

-- 9. Verificar se tudo foi criado corretamente
SELECT '=== VERIFICAÇÃO DA TABELA PENDING_USERS ===' as info;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pending_users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== POLÍTICAS CRIADAS ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'pending_users';
```

## O que o Script Faz

1. **Cria a tabela `pending_users`** com todos os campos necessários
2. **Cria índices** para melhor performance
3. **Habilita Row Level Security (RLS)** para segurança
4. **Cria políticas de segurança** para controlar acesso
5. **Cria triggers** para atualização automática de timestamps
6. **Registra a criação** nos logs de auditoria
7. **Verifica se tudo foi criado** corretamente

## Após a Migração

1. **Teste o cadastro** de um novo usuário
2. **Verifique se aparece** no painel administrativo
3. **Teste a aprovação/rejeição** de usuários
4. **Confirme que os logs** estão sendo registrados

## Se Houver Erros

Se você encontrar algum erro durante a execução:

1. **Verifique se você tem permissões** de administrador no projeto
2. **Confirme que a tabela `audit_logs`** existe (criada em migrações anteriores)
3. **Verifique se a função `update_updated_at_column`** já existe
4. **Consulte os logs** do Supabase para mais detalhes

Precisa de ajuda com algum passo específico? 