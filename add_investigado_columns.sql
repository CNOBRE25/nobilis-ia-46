-- Script para adicionar colunas do investigado na tabela processos
-- Execute este script no SQL Editor do Supabase

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
ORDER BY ordinal_position;

-- 2. Adicionar colunas do investigado se não existirem
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS nome_investigado VARCHAR(255),
ADD COLUMN IF NOT EXISTS cargo_investigado VARCHAR(255),
ADD COLUMN IF NOT EXISTS unidade_investigado VARCHAR(255),
ADD COLUMN IF NOT EXISTS matricula_investigado VARCHAR(100),
ADD COLUMN IF NOT EXISTS data_admissao DATE;

-- 3. Adicionar colunas de vítima se não existirem
ALTER TABLE public.processos 
ADD COLUMN IF NOT EXISTS vitima VARCHAR(255),
ADD COLUMN IF NOT EXISTS sexo_vitima VARCHAR(50) CHECK (sexo_vitima IN ('M', 'F', 'Não especificado')),
ADD COLUMN IF NOT EXISTS tipo_vitima VARCHAR(100),
ADD COLUMN IF NOT EXISTS idade_vitima INTEGER;

-- 4. Verificar se as colunas foram adicionadas
SELECT '=== ESTRUTURA APÓS ADIÇÃO ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'processos'
AND (
    column_name LIKE '%investigado%' 
    OR column_name LIKE '%vitima%'
    OR column_name IN ('data_admissao', 'sexo_vitima')
)
ORDER BY column_name;

-- 5. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_processos_nome_investigado ON public.processos(nome_investigado);
CREATE INDEX IF NOT EXISTS idx_processos_unidade_investigado ON public.processos(unidade_investigado);
CREATE INDEX IF NOT EXISTS idx_processos_matricula_investigado ON public.processos(matricula_investigado);
CREATE INDEX IF NOT EXISTS idx_processos_vitima ON public.processos(vitima);
CREATE INDEX IF NOT EXISTS idx_processos_sexo_vitima ON public.processos(sexo_vitima);

-- 6. Comentários para documentação
COMMENT ON COLUMN public.processos.nome_investigado IS 'Nome completo do investigado';
COMMENT ON COLUMN public.processos.cargo_investigado IS 'Cargo ou função do investigado';
COMMENT ON COLUMN public.processos.unidade_investigado IS 'Unidade do investigado';
COMMENT ON COLUMN public.processos.matricula_investigado IS 'Matrícula do investigado';
COMMENT ON COLUMN public.processos.data_admissao IS 'Data de admissão do investigado';
COMMENT ON COLUMN public.processos.vitima IS 'Nome da vítima';
COMMENT ON COLUMN public.processos.sexo_vitima IS 'Sexo da vítima (M=Masculino, F=Feminino)';
COMMENT ON COLUMN public.processos.tipo_vitima IS 'Tipo da vítima (civil, militar, policial, outro)';
COMMENT ON COLUMN public.processos.idade_vitima IS 'Idade da vítima em anos';

-- 7. Testar inserção de dados
SELECT '=== TESTE DE INSERÇÃO ===' as info;

-- Primeiro, vamos pegar um processo existente para testar
WITH processo_teste AS (
    SELECT id, numero_processo 
    FROM public.processos 
    WHERE nome_investigado IS NULL 
    LIMIT 1
)
UPDATE public.processos 
SET 
    nome_investigado = 'João Silva Teste',
    cargo_investigado = 'Cabo',
    unidade_investigado = '1º BPM',
    matricula_investigado = '12345',
    data_admissao = '2020-01-15',
    vitima = 'Maria Santos Teste',
    sexo_vitima = 'F',
    tipo_vitima = 'civil',
    idade_vitima = 35
WHERE id IN (SELECT id FROM processo_teste)
RETURNING id, numero_processo, nome_investigado, cargo_investigado, unidade_investigado, matricula_investigado, data_admissao, vitima, sexo_vitima, tipo_vitima, idade_vitima;

-- 8. Verificar se a atualização funcionou
SELECT '=== VERIFICAÇÃO PÓS-TESTE ===' as info;

SELECT 
    id,
    numero_processo,
    nome_investigado,
    cargo_investigado,
    unidade_investigado,
    matricula_investigado,
    data_admissao,
    vitima,
    sexo_vitima,
    tipo_vitima,
    idade_vitima
FROM public.processos
WHERE nome_investigado = 'João Silva Teste';

-- 9. Verificar se tudo foi criado corretamente
SELECT '=== COLUNAS DO INVESTIGADO E VÍTIMA ADICIONADAS COM SUCESSO! ===' as status; 