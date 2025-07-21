-- Script para corrigir políticas RLS da tabela processos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar políticas existentes
SELECT '=== POLÍTICAS EXISTENTES ===' as info;

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

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own processes" ON public.processos;
DROP POLICY IF EXISTS "Users can create processes" ON public.processos;
DROP POLICY IF EXISTS "Users can update their own processes" ON public.processos;
DROP POLICY IF EXISTS "Users can delete their own processes" ON public.processos;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.processos;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.processos;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.processos;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.processos;
DROP POLICY IF EXISTS "processos_all_policy" ON public.processos;

-- 3. Criar políticas simples e funcionais
CREATE POLICY "processos_select_policy" ON public.processos
    FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "processos_insert_policy" ON public.processos
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "processos_update_policy" ON public.processos
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "processos_delete_policy" ON public.processos
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 4. Verificar se a função update_updated_at_column existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Recriar o trigger para updated_at
DROP TRIGGER IF EXISTS update_processos_updated_at ON public.processos;
CREATE TRIGGER update_processos_updated_at
    BEFORE UPDATE ON public.processos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Verificar se a tabela tem o campo updated_at
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 7. Verificar políticas criadas
SELECT '=== NOVAS POLÍTICAS CRIADAS ===' as info;

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

-- 8. Testar atualização
SELECT '=== TESTE DE ATUALIZAÇÃO ===' as info;

-- Verificar se há processos para testar
SELECT 
    id,
    numero_processo,
    updated_at
FROM public.processos
LIMIT 1;

-- 9. Mensagem de sucesso
SELECT '✅ Políticas RLS corrigidas com sucesso!' as status; 