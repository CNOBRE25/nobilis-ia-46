-- Script para aplicar a migração da tabela de usuários pendentes
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela para usuários pendentes de aprovação
CREATE TABLE IF NOT EXISTS public.pending_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome_completo VARCHAR(200) NOT NULL,
    matricula VARCHAR(50),
    cargo_funcao VARCHAR(100),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pending_users_email ON public.pending_users(email);
CREATE INDEX IF NOT EXISTS idx_pending_users_status ON public.pending_users(status);
CREATE INDEX IF NOT EXISTS idx_pending_users_requested_at ON public.pending_users(requested_at);

-- 3. Habilitar RLS
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para pending_users
CREATE POLICY "Admins can view all pending users" ON public.pending_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage pending users" ON public.pending_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 5. Política para usuários verem suas próprias solicitações
CREATE POLICY "Users can view own pending requests" ON public.pending_users
    FOR SELECT USING (
        auth_user_id = auth.uid()
    );

-- 6. Trigger para atualizar updated_at
CREATE TRIGGER update_pending_users_updated_at
    BEFORE UPDATE ON public.pending_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Verificar se a função update_updated_at_column existe, se não, criar
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Log da criação da tabela
INSERT INTO public.audit_logs (event_type, metadata)
VALUES ('PENDING_USERS_TABLE_CREATED', jsonb_build_object(
    'timestamp', NOW(),
    'description', 'Tabela de usuários pendentes criada para fluxo de aprovação'
));

-- 9. Verificar se tudo foi criado corretamente
SELECT '=== VERIFICAÇÃO DA TABELA PENDING_USERS ===' as info;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pending_users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT '=== POLÍTICAS CRIADAS ===' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'pending_users'; 