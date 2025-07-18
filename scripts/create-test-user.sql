-- Script para criar usuário de teste
-- Execute este script no SQL Editor do Supabase

-- Inserir usuário de teste na tabela auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(), -- id
  '00000000-0000-0000-0000-000000000000', -- instance_id
  'authenticated', -- aud
  'authenticated', -- role
  'teste@teste.com', -- email
  crypt('123', gen_salt('bf')), -- encrypted_password (senha: 123)
  NOW(), -- email_confirmed_at
  NULL, -- recovery_sent_at
  NOW(), -- last_sign_in_at
  '{"provider": "email", "providers": ["email"]}', -- raw_app_meta_data
  '{"nome": "Usuário Teste", "orgao": "Órgão de Teste"}', -- raw_user_meta_data
  NOW(), -- created_at
  NOW(), -- updated_at
  '', -- confirmation_token
  '', -- email_change
  '', -- email_change_token_new
  '' -- recovery_token
) ON CONFLICT (email) DO NOTHING;

-- Obter o ID do usuário criado
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Buscar o ID do usuário de teste
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'teste@teste.com';
  
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
  
  -- Verificar se o usuário foi criado
  RAISE NOTICE 'Usuário de teste criado com sucesso!';
  RAISE NOTICE 'Email: teste@teste.com';
  RAISE NOTICE 'Senha: 123';
  RAISE NOTICE 'Role: user (usuário comum)';
  RAISE NOTICE 'ID: %', test_user_id;
END $$;

-- Verificar se o usuário foi criado corretamente
SELECT 
  u.email,
  u.role as auth_role,
  p.nome,
  p.orgao,
  p.cargo,
  ur.role as user_role,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'teste@teste.com'; 