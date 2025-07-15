-- Criar um usuário admin diretamente na tabela users para acesso imediato
-- Este é um workaround temporário até a integração auth estar completamente funcional

INSERT INTO public.users (
  id,
  auth_id,
  username,
  email,
  role,
  nome_completo,
  matricula,
  cargo_funcao,
  ativo,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'admin@nobilis-ia.com',
  'admin',
  'Administrador do Sistema',
  'ADM001',
  'Administrador',
  true,
  now(),
  now()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  ativo = true,
  updated_at = now();

-- Inserir alguns usuários de teste
INSERT INTO public.users (
  id,
  auth_id,
  username,
  email,
  role,
  nome_completo,
  matricula,
  cargo_funcao,
  ativo,
  created_at,
  updated_at
) VALUES 
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000002',
    'advogado1',
    'advogado@nobilis-ia.com',
    'lawyer',
    'Dr. João Silva',
    'ADV001',
    'Advogado Sênior',
    true,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000003',
    'cliente1',
    'cliente@nobilis-ia.com',
    'client',
    'Maria Santos',
    'CLI001',
    'Cliente',
    true,
    now(),
    now()
  )
ON CONFLICT (email) DO NOTHING;

-- Política temporária para permitir login por email/senha (bypass auth)
CREATE OR REPLACE FUNCTION public.verify_user_credentials(user_email TEXT, user_password TEXT)
RETURNS TABLE(user_id UUID, user_role TEXT, user_name TEXT) AS $$
BEGIN
  -- Para admin: email admin@nobilis-ia.com, senha admin123
  IF user_email = 'admin@nobilis-ia.com' AND user_password = 'admin123' THEN
    RETURN QUERY
    SELECT u.auth_id, u.role::TEXT, u.nome_completo
    FROM public.users u
    WHERE u.email = user_email;
  END IF;
  
  -- Para outros usuários teste
  IF user_email = 'advogado@nobilis-ia.com' AND user_password = 'advogado123' THEN
    RETURN QUERY
    SELECT u.auth_id, u.role::TEXT, u.nome_completo
    FROM public.users u
    WHERE u.email = user_email;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;