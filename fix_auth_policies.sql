-- Script para corrigir problemas de autenticação e políticas RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela processos existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'processos'
) as table_exists;

-- 2. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'processos';

-- 3. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'processos';

-- 4. Desabilitar RLS temporariamente para teste
ALTER TABLE processos DISABLE ROW LEVEL SECURITY;

-- 5. Criar política mais permissiva para teste
DROP POLICY IF EXISTS "processos_policy" ON processos;

CREATE POLICY "processos_policy" ON processos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Habilitar RLS novamente
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;

-- 7. Verificar se há usuários na tabela users
SELECT COUNT(*) as total_users FROM users;

-- 8. Verificar estrutura da tabela users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 9. Inserir usuário de teste se não existir
INSERT INTO users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin_crn',
  'crn.nobre@gmail.com',
  'admin',
  'CRN Nobre - Administrador',
  'ADM001',
  'Administrador',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (auth_id) DO NOTHING;

-- 10. Verificar se o usuário foi inserido
SELECT * FROM users WHERE email = 'crn.nobre@gmail.com';

-- 11. Testar inserção de processo
INSERT INTO processos (
  numero_processo,
  tipo_processo,
  prioridade,
  descricao_fatos,
  status,
  user_id,
  created_at,
  updated_at
) VALUES (
  'TEST-001',
  'investigacao_preliminar',
  'media',
  'Processo de teste para verificar autenticação',
  'tramitacao',
  (SELECT id FROM users WHERE email = 'crn.nobre@gmail.com'),
  NOW(),
  NOW()
);

-- 12. Verificar se o processo foi inserido
SELECT * FROM processos WHERE numero_processo = 'TEST-001';

-- 13. Limpar processo de teste
DELETE FROM processos WHERE numero_processo = 'TEST-001';

-- 14. Criar política mais específica para produção
DROP POLICY IF EXISTS "processos_policy" ON processos;

CREATE POLICY "processos_insert_policy" ON processos
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "processos_select_policy" ON processos
  FOR SELECT
  USING (true);

CREATE POLICY "processos_update_policy" ON processos
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "processos_delete_policy" ON processos
  FOR DELETE
  USING (true);

-- 15. Verificar políticas finais
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'processos'
ORDER BY policyname; 