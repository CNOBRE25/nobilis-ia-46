-- Atualizar usuário administrador com o email correto
UPDATE public.users 
SET email = 'crn.nobre@gmail.com',
    username = 'admin_crn',
    nome_completo = 'CRN Nobre - Administrador'
WHERE role = 'admin' AND email = 'admin@nobilis-ia.com';

-- Se não existir, inserir o novo admin
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
) 
SELECT 
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'admin_crn',
  'crn.nobre@gmail.com',
  'admin',
  'CRN Nobre - Administrador',
  'ADM001',
  'Administrador',
  true,
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'crn.nobre@gmail.com'
);

-- Atualizar função de verificação de credenciais para incluir o novo admin
CREATE OR REPLACE FUNCTION public.verify_user_credentials(user_email TEXT, user_password TEXT)
RETURNS TABLE(user_id UUID, user_role TEXT, user_name TEXT) AS $$
BEGIN
  -- Para admin: email crn.nobre@gmail.com, senha admin123
  IF user_email = 'crn.nobre@gmail.com' AND user_password = 'admin123' THEN
    RETURN QUERY
    SELECT u.auth_id, u.role::TEXT, u.nome_completo
    FROM public.users u
    WHERE u.email = user_email;
  END IF;
  
  -- Para admin antigo (compatibilidade)
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