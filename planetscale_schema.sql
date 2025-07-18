-- Schema para PlanetScale - NOBILIS-IA
-- Execute este script no SQL Editor do PlanetScale

-- 1. Criar tabela users
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auth_id VARCHAR(36) UNIQUE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    nome_completo VARCHAR(200),
    matricula VARCHAR(50),
    cargo_funcao VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Criar tabela processos
CREATE TABLE processos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_processo VARCHAR(50) UNIQUE NOT NULL,
    tipo_processo VARCHAR(50) NOT NULL DEFAULT 'investigacao_preliminar',
    prioridade VARCHAR(20) NOT NULL DEFAULT 'media',
    numero_despacho VARCHAR(50),
    data_despacho DATETIME,
    data_recebimento DATETIME,
    data_fato DATETIME,
    origem_processo VARCHAR(100),
    descricao_fatos TEXT NOT NULL,
    modus_operandi TEXT,
    diligencias_realizadas JSON,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Inserir usuário admin
INSERT INTO users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin_crn',
    'crn.nobre@gmail.com',
    'admin',
    'CRN Nobre - Administrador',
    'ADM001',
    'Administrador',
    true
);

-- 4. Inserir usuário advogado
INSERT INTO users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'advogado',
    'advogado@nobilis-ia.com',
    'advogado',
    'Advogado do Sistema',
    'ADV001',
    'Advogado',
    true
);

-- 5. Criar índices para performance
CREATE INDEX idx_processos_numero ON processos(numero_processo);
CREATE INDEX idx_processos_user_id ON processos(user_id);
CREATE INDEX idx_processos_status ON processos(status);
CREATE INDEX idx_processos_created_at ON processos(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- 6. Testar inserção de processo
INSERT INTO processos (
    numero_processo,
    tipo_processo,
    prioridade,
    descricao_fatos,
    status,
    user_id
) VALUES (
    'TEST-001',
    'investigacao_preliminar',
    'media',
    'Processo de teste para verificar funcionamento',
    'tramitacao',
    1
);

-- 7. Verificar se tudo funcionou
SELECT 'PlanetScale configurado com sucesso!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_processos FROM processos;

-- 8. Limpar processo de teste
DELETE FROM processos WHERE numero_processo = 'TEST-001'; 