-- Script direto para criar usuário de teste no Supabase
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se o usuário já existe
SELECT 
  u.email,
  p.nome,
  ur.role as user_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'teste@teste.com';

-- Se não existir, criar o usuário manualmente
-- NOTA: Este script assume que você já criou o usuário via interface do Supabase Auth
-- ou que o usuário será criado via registro normal na aplicação

-- Após criar o usuário via interface ou registro, execute estas queries:

-- 1. Atualizar o perfil do usuário (substitua USER_ID pelo ID real do usuário)
UPDATE profiles 
SET 
  nome = 'Usuário Teste',
  orgao = 'Órgão de Teste',
  cargo = 'Analista',
  matricula = 'TEST001',
  telefone = '(11) 99999-9999',
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'teste@teste.com'
);

-- 2. Inserir/atualizar role de usuário comum
INSERT INTO user_roles (
  user_id,
  role,
  created_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'teste@teste.com'),
  'user',
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  role = EXCLUDED.role,
  created_at = NOW();

-- 3. Verificar se tudo foi configurado corretamente
SELECT 
  u.email,
  p.nome,
  p.orgao,
  p.cargo,
  p.matricula,
  ur.role as user_role,
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'teste@teste.com'; 