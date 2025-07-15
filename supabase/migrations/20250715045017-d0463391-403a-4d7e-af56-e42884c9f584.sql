-- Atualizar usuário administrador com o email correto
UPDATE public.users 
SET email = 'crn.nobre@gmail.com',
    username = 'admin_crn'
WHERE role = 'admin' AND email = 'admin@nobilis-ia.com';

-- Se não existir, inserir o novo admin
INSERT INTO public.users (
  username,
  email,
  password,
  role
) 
SELECT 
  'admin_crn',
  'crn.nobre@gmail.com',
  'admin123',
  'admin'
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
    SELECT u.id::UUID, u.role::TEXT, u.username::TEXT
    FROM public.users u
    WHERE u.email = user_email;
  END IF;
  
  -- Para admin antigo (compatibilidade)
  IF user_email = 'admin@nobilis-ia.com' AND user_password = 'admin123' THEN
    RETURN QUERY
    SELECT u.id::UUID, u.role::TEXT, u.username::TEXT
    FROM public.users u
    WHERE u.email = user_email;
  END IF;
  
  -- Para outros usuários teste
  IF user_email = 'advogado@nobilis-ia.com' AND user_password = 'advogado123' THEN
    RETURN QUERY
    SELECT u.id::UUID, u.role::TEXT, u.username::TEXT
    FROM public.users u
    WHERE u.email = user_email;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;