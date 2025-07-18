-- Criar tabela para usuários pendentes de aprovação
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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pending_users_email ON public.pending_users(email);
CREATE INDEX IF NOT EXISTS idx_pending_users_status ON public.pending_users(status);
CREATE INDEX IF NOT EXISTS idx_pending_users_requested_at ON public.pending_users(requested_at);

-- Habilitar RLS
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;

-- Políticas para pending_users
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

-- Política para usuários verem suas próprias solicitações
CREATE POLICY "Users can view own pending requests" ON public.pending_users
    FOR SELECT USING (
        auth_user_id = auth.uid()
    );

-- Função para aprovar usuário pendente
CREATE OR REPLACE FUNCTION public.approve_pending_user(pending_user_id UUID, admin_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    pending_user RECORD;
    admin_user_id UUID;
BEGIN
    -- Obter dados do usuário pendente
    SELECT * INTO pending_user FROM public.pending_users WHERE id = pending_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending user not found';
    END IF;
    
    -- Obter ID do admin que está aprovando
    SELECT id INTO admin_user_id FROM public.users WHERE auth_id = auth.uid() AND role = 'admin';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Only admins can approve users';
    END IF;
    
    -- Atualizar status para aprovado
    UPDATE public.pending_users 
    SET status = 'approved',
        reviewed_at = NOW(),
        reviewed_by = admin_user_id,
        review_notes = admin_notes,
        updated_at = NOW()
    WHERE id = pending_user_id;
    
    -- Ativar o usuário na tabela users
    UPDATE public.users 
    SET ativo = true,
        updated_at = NOW()
    WHERE auth_id = pending_user.auth_user_id;
    
    -- Log da aprovação
    INSERT INTO public.audit_logs (event_type, user_id, target_id, metadata)
    VALUES ('USER_APPROVED', admin_user_id, pending_user.auth_user_id, 
            jsonb_build_object(
                'pending_user_id', pending_user_id,
                'email', pending_user.email,
                'admin_notes', admin_notes
            ));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para rejeitar usuário pendente
CREATE OR REPLACE FUNCTION public.reject_pending_user(pending_user_id UUID, admin_notes TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    pending_user RECORD;
    admin_user_id UUID;
BEGIN
    -- Obter dados do usuário pendente
    SELECT * INTO pending_user FROM public.pending_users WHERE id = pending_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pending user not found';
    END IF;
    
    -- Obter ID do admin que está rejeitando
    SELECT id INTO admin_user_id FROM public.users WHERE auth_id = auth.uid() AND role = 'admin';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Only admins can reject users';
    END IF;
    
    -- Atualizar status para rejeitado
    UPDATE public.pending_users 
    SET status = 'rejected',
        reviewed_at = NOW(),
        reviewed_by = admin_user_id,
        review_notes = admin_notes,
        updated_at = NOW()
    WHERE id = pending_user_id;
    
    -- Desativar o usuário na tabela users
    UPDATE public.users 
    SET ativo = false,
        updated_at = NOW()
    WHERE auth_id = pending_user.auth_user_id;
    
    -- Log da rejeição
    INSERT INTO public.audit_logs (event_type, user_id, target_id, metadata)
    VALUES ('USER_REJECTED', admin_user_id, pending_user.auth_user_id, 
            jsonb_build_object(
                'pending_user_id', pending_user_id,
                'email', pending_user.email,
                'admin_notes', admin_notes
            ));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pending_users_updated_at
    BEFORE UPDATE ON public.pending_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para buscar usuários pendentes
CREATE OR REPLACE FUNCTION public.get_pending_users()
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    nome_completo VARCHAR,
    matricula VARCHAR,
    cargo_funcao VARCHAR,
    auth_user_id UUID,
    status VARCHAR,
    requested_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID,
    review_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pu.id,
        pu.email,
        pu.nome_completo,
        pu.matricula,
        pu.cargo_funcao,
        pu.auth_user_id,
        pu.status,
        pu.requested_at,
        pu.reviewed_at,
        pu.reviewed_by,
        pu.review_notes
    FROM public.pending_users pu
    WHERE pu.status = 'pending'
    ORDER BY pu.requested_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log da criação da tabela
INSERT INTO public.audit_logs (event_type, metadata)
VALUES ('PENDING_USERS_TABLE_CREATED', jsonb_build_object(
    'timestamp', NOW(),
    'description', 'Tabela de usuários pendentes criada para fluxo de aprovação'
)); 