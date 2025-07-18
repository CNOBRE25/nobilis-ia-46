-- Script simplificado para criar usuário de teste
-- Execute este script no SQL Editor do Supabase

-- Função para criar usuário de teste
CREATE OR REPLACE FUNCTION create_test_user()
RETURNS TEXT AS $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Gerar ID único para o usuário
  test_user_id := gen_random_uuid();
  
  -- Inserir usuário na tabela auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'teste@teste.com',
    crypt('123', gen_salt('bf')),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"nome": "Usuário Teste", "orgao": "Órgão de Teste"}',
    NOW(),
    NOW()
  ) ON CONFLICT (email) DO NOTHING;
  
  -- Se o usuário já existe, obter o ID
  IF NOT FOUND THEN
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'teste@teste.com';
  END IF;
  
  -- Inserir perfil do usuário
  INSERT INTO profiles (
    id,
    nome,
    orgao,
    cargo,
    matricula,
    telefone,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    'Usuário Teste',
    'Órgão de Teste',
    'Analista',
    'TEST001',
    '(11) 99999-9999',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    orgao = EXCLUDED.orgao,
    cargo = EXCLUDED.cargo,
    matricula = EXCLUDED.matricula,
    telefone = EXCLUDED.telefone,
    updated_at = NOW();
  
  -- Inserir role de usuário comum
  INSERT INTO user_roles (
    user_id,
    role,
    created_at
  ) VALUES (
    test_user_id,
    'user',
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    role = EXCLUDED.role,
    created_at = NOW();
  
  RETURN 'Usuário de teste criado/atualizado com sucesso! ID: ' || test_user_id;
END;
$$ LANGUAGE plpgsql;

-- Executar a função
SELECT create_test_user();

-- Verificar se o usuário foi criado
SELECT 
  u.email,
  p.nome,
  p.orgao,
  p.cargo,
  ur.role as user_role,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'teste@teste.com';

-- Limpar a função após o uso
DROP FUNCTION create_test_user(); 