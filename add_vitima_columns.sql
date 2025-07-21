-- Script para adicionar colunas de vítima na tabela processos
-- Execute este script no SQL Editor do Supabase se quiser armazenar tipo e idade da vítima

-- 1. Verificar estrutura atual da tabela processos
SELECT '=== ESTRUTURA ATUAL ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
AND column_name IN ('vitima', 'sexo_vitima', 'tipo_vitima', 'idade_vitima')
ORDER BY column_name;

-- 2. Adicionar colunas de vítima se não existirem
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS tipo_vitima VARCHAR(100),
ADD COLUMN IF NOT EXISTS idade_vitima INTEGER;

-- 3. Verificar se as colunas foram adicionadas
SELECT '=== ESTRUTURA APÓS ADIÇÃO ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
AND column_name IN ('vitima', 'sexo_vitima', 'tipo_vitima', 'idade_vitima')
ORDER BY column_name;

-- 4. Criar índices para melhorar performance (opcional)
CREATE INDEX IF NOT EXISTS idx_processos_tipo_vitima ON public.processos(tipo_vitima);
CREATE INDEX IF NOT EXISTS idx_processos_idade_vitima ON public.processos(idade_vitima);

-- 5. Comentários para documentação
COMMENT ON COLUMN public.processos.tipo_vitima IS 'Tipo da vítima (civil, militar, policial, outro)';
COMMENT ON COLUMN public.processos.idade_vitima IS 'Idade da vítima em anos';

-- 6. Verificar se tudo foi criado corretamente
SELECT '=== COLUNAS DE VÍTIMA ADICIONADAS COM SUCESSO! ===' as status; 