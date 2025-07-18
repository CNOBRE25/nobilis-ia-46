-- Script completo para criar a tabela processos e estruturas necessárias
-- Execute este script no SQL Editor do Supabase

-- 1. Criar a tabela processos se não existir
CREATE TABLE IF NOT EXISTS processos (
    id BIGSERIAL PRIMARY KEY,
    numero_processo VARCHAR(50) UNIQUE NOT NULL,
    tipo_processo VARCHAR(50) NOT NULL DEFAULT 'investigacao_preliminar',
    prioridade VARCHAR(20) NOT NULL DEFAULT 'media',
    numero_despacho VARCHAR(50),
    data_despacho TIMESTAMP WITH TIME ZONE,
    data_recebimento TIMESTAMP WITH TIME ZONE,
    data_fato TIMESTAMP WITH TIME ZONE,
    origem_processo VARCHAR(100),
    descricao_fatos TEXT NOT NULL,
    modus_operandi TEXT,
    diligencias_realizadas JSONB DEFAULT '{}',
    desfecho_final TEXT,
    redistribuicao TEXT,
    sugestoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'tramitacao',
    user_id BIGINT,
    nome_investigado VARCHAR(200),
    cargo_investigado VARCHAR(100),
    unidade_investigado VARCHAR(100),
    matricula_investigado VARCHAR(50),
    data_admissao DATE,
    vitima TEXT,
    numero_sigpad VARCHAR(50),
    crime_typing VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_processos_numero ON processos(numero_processo);
CREATE INDEX IF NOT EXISTS idx_processos_user_id ON processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
CREATE INDEX IF NOT EXISTS idx_processos_created_at ON processos(created_at);

-- 3. Criar a tabela users se não existir
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    auth_id UUID UNIQUE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    nome_completo VARCHAR(200),
    matricula VARCHAR(50),
    cargo_funcao VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para a tabela users
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 5. Inserir usuário admin se não existir
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

-- 6. Inserir usuário advogado se não existir
INSERT INTO users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'advogado',
    'advogado@nobilis-ia.com',
    'advogado',
    'Advogado do Sistema',
    'ADV001',
    'Advogado',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (auth_id) DO NOTHING;

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 8. Remover políticas existentes se houver
DROP POLICY IF EXISTS "processos_policy" ON processos;
DROP POLICY IF EXISTS "processos_insert_policy" ON processos;
DROP POLICY IF EXISTS "processos_select_policy" ON processos;
DROP POLICY IF EXISTS "processos_update_policy" ON processos;
DROP POLICY IF EXISTS "processos_delete_policy" ON processos;

DROP POLICY IF EXISTS "users_policy" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

-- 9. Criar políticas permissivas para desenvolvimento
CREATE POLICY "processos_all_policy" ON processos
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "users_all_policy" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 10. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Criar triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_processos_updated_at ON processos;
CREATE TRIGGER update_processos_updated_at
    BEFORE UPDATE ON processos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Testar inserção de processo
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
    'Processo de teste para verificar funcionamento da tabela',
    'tramitacao',
    (SELECT id FROM users WHERE email = 'crn.nobre@gmail.com'),
    NOW(),
    NOW()
)
ON CONFLICT (numero_processo) DO NOTHING;

-- 13. Verificar se tudo foi criado corretamente
SELECT 'Tabela processos criada com sucesso!' as status;

-- 14. Verificar estrutura da tabela processos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'processos' 
ORDER BY ordinal_position;

-- 15. Verificar se há dados na tabela
SELECT COUNT(*) as total_processos FROM processos;
SELECT COUNT(*) as total_users FROM users;

-- 16. Verificar políticas RLS
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
WHERE tablename IN ('processos', 'users')
ORDER BY tablename, policyname;

-- 17. Limpar processo de teste
DELETE FROM processos WHERE numero_processo = 'TEST-001'; 