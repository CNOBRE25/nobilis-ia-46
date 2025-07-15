-- Reset complete para criar o esquema correto
-- Primeiro, remover as tabelas antigas se existirem
DROP TABLE IF EXISTS public.cases CASCADE;
DROP TABLE IF EXISTS public.ai_analyses CASCADE;

-- Agora recriar com o esquema correto das outras migrações
-- As tabelas já foram criadas nas migrações anteriores, então vamos apenas garantir que estão corretas

-- Criar um usuário administrador padrão
-- Primeiro inserir na tabela auth.users (simulado)
DO $$
DECLARE
    admin_auth_id UUID;
BEGIN
    -- Para desenvolvimento, vamos criar um UUID fixo para o admin
    admin_auth_id := '00000000-0000-0000-0000-000000000001';
    
    -- Inserir admin na tabela users se não existir
    INSERT INTO public.users (auth_id, username, email, role, nome_completo, ativo)
    VALUES (
        admin_auth_id,
        'admin',
        'admin@nobilis-ia.com',
        'admin',
        'Administrador do Sistema',
        true
    )
    ON CONFLICT (email) DO UPDATE SET 
        role = 'admin',
        ativo = true,
        updated_at = now();
END $$;

-- Inserir alguns usuários de teste
INSERT INTO public.users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo)
VALUES 
    ('00000000-0000-0000-0000-000000000002', 'advogado1', 'advogado@nobilis-ia.com', 'lawyer', 'Dr. João Silva', 'ADV001', 'Advogado Sênior', true),
    ('00000000-0000-0000-0000-000000000003', 'cliente1', 'cliente@nobilis-ia.com', 'client', 'Maria Santos', 'CLI001', 'Cliente', true)
ON CONFLICT (email) DO NOTHING;

-- Inserir alguns clientes de exemplo
INSERT INTO public.clients (name, contact_email, phone_number, address)
VALUES 
    ('Empresa ABC Ltda', 'contato@empresaabc.com', '(11) 99999-9999', 'Rua das Flores, 123, São Paulo, SP'),
    ('João da Silva', 'joao@email.com', '(11) 88888-8888', 'Av. Paulista, 456, São Paulo, SP'),
    ('Maria Oliveira', 'maria@email.com', '(11) 77777-7777', 'Rua do Comércio, 789, São Paulo, SP')
ON CONFLICT DO NOTHING;

-- Atualizar a função de trigger para corrigir referência de tabela de usuários
CREATE OR REPLACE FUNCTION auth.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, username, email, role, nome_completo, ativo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'lawyer')::public.user_role,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', ''),
    COALESCE(NEW.raw_user_meta_data->>'ativo', 'false')::boolean
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.handle_new_user();

-- Política adicional para permitir que admins vejam todos os usuários
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Política para admins gerenciarem usuários
CREATE POLICY "Admins can manage users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Log de criação da configuração inicial
INSERT INTO public.audit_logs (event_type, metadata)
VALUES ('SYSTEM_INITIALIZED', jsonb_build_object(
  'message', 'Sistema inicializado com usuário administrador',
  'admin_email', 'admin@nobilis-ia.com'
));