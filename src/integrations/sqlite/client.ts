import Database from 'better-sqlite3';
import path from 'path';

// Cliente SQLite local
let db: Database.Database;

// Inicializar banco de dados
const initDatabase = () => {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'nobilis-ia.db');
    db = new Database(dbPath);
    
    // Criar tabelas se não existirem
    createTables();
    
    // Inserir dados iniciais
    insertInitialData();
  }
  return db;
};

// Criar tabelas
const createTables = () => {
  // Tabela users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auth_id TEXT UNIQUE,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      nome_completo TEXT,
      matricula TEXT,
      cargo_funcao TEXT,
      ativo BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela processos
  db.exec(`
    CREATE TABLE IF NOT EXISTS processos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_processo TEXT UNIQUE NOT NULL,
      tipo_processo TEXT NOT NULL DEFAULT 'investigacao_preliminar',
      prioridade TEXT NOT NULL DEFAULT 'media',
      numero_despacho TEXT,
      data_despacho DATETIME,
      data_recebimento DATETIME,
      data_fato DATETIME,
      origem_processo TEXT,
      descricao_fatos TEXT NOT NULL,
      modus_operandi TEXT,
      diligencias_realizadas TEXT,
      desfecho_final TEXT,
      redistribuicao TEXT,
      sugestoes TEXT,
      status TEXT NOT NULL DEFAULT 'tramitacao',
      user_id INTEGER,
      nome_investigado TEXT,
      cargo_investigado TEXT,
      unidade_investigado TEXT,
      matricula_investigado TEXT,
      data_admissao DATE,
      vitima TEXT,
      numero_sigpad TEXT,
      crime_typing TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
};

// Inserir dados iniciais
const insertInitialData = () => {
  // Inserir usuário admin se não existir
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?').get('crn.nobre@gmail.com');
  
  if (adminExists.count === 0) {
    db.prepare(`
      INSERT INTO users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      '00000000-0000-0000-0000-000000000001',
      'admin_crn',
      'crn.nobre@gmail.com',
      'admin',
      'CRN Nobre - Administrador',
      'ADM001',
      'Administrador',
      1
    );
  }

  // Inserir usuário advogado se não existir
  const lawyerExists = db.prepare('SELECT COUNT(*) as count FROM users WHERE email = ?').get('advogado@nobilis-ia.com');
  
  if (lawyerExists.count === 0) {
    db.prepare(`
      INSERT INTO users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      '00000000-0000-0000-0000-000000000002',
      'advogado',
      'advogado@nobilis-ia.com',
      'advogado',
      'Advogado do Sistema',
      'ADV001',
      'Advogado',
      1
    );
  }
};

// Funções auxiliares
export const sqliteDb = {
  // Buscar todos os processos
  getProcessos() {
    const db = initDatabase();
    const stmt = db.prepare('SELECT * FROM processos ORDER BY created_at DESC');
    return stmt.all();
  },

  // Buscar processo por ID
  getProcessoById(id: number) {
    const db = initDatabase();
    const stmt = db.prepare('SELECT * FROM processos WHERE id = ?');
    return stmt.get(id);
  },

  // Criar novo processo
  createProcesso(data: any) {
    const db = initDatabase();
    const stmt = db.prepare(`
      INSERT INTO processos (
        numero_processo, tipo_processo, prioridade, numero_despacho,
        data_despacho, data_recebimento, data_fato, origem_processo,
        descricao_fatos, modus_operandi, diligencias_realizadas,
        desfecho_final, redistribuicao, sugestoes, status, user_id,
        nome_investigado, cargo_investigado, unidade_investigado,
        matricula_investigado, data_admissao, vitima, numero_sigpad,
        crime_typing
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.numero_processo, data.tipo_processo, data.prioridade, data.numero_despacho,
      data.data_despacho, data.data_recebimento, data.data_fato, data.origem_processo,
      data.descricao_fatos, data.modus_operandi, JSON.stringify(data.diligencias_realizadas),
      data.desfecho_final, data.redistribuicao, data.sugestoes, data.status, data.user_id,
      data.nome_investigado, data.cargo_investigado, data.unidade_investigado,
      data.matricula_investigado, data.data_admissao, data.vitima, data.numero_sigpad,
      data.crime_typing
    );
    
    return result.lastInsertRowid;
  },

  // Atualizar processo
  updateProcesso(id: number, data: any) {
    const db = initDatabase();
    const stmt = db.prepare(`
      UPDATE processos SET
        numero_processo = ?, tipo_processo = ?, prioridade = ?, numero_despacho = ?,
        data_despacho = ?, data_recebimento = ?, data_fato = ?, origem_processo = ?,
        descricao_fatos = ?, modus_operandi = ?, diligencias_realizadas = ?,
        desfecho_final = ?, redistribuicao = ?, sugestoes = ?, status = ?,
        nome_investigado = ?, cargo_investigado = ?, unidade_investigado = ?,
        matricula_investigado = ?, data_admissao = ?, vitima = ?, numero_sigpad = ?,
        crime_typing = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      data.numero_processo, data.tipo_processo, data.prioridade, data.numero_despacho,
      data.data_despacho, data.data_recebimento, data.data_fato, data.origem_processo,
      data.descricao_fatos, data.modus_operandi, JSON.stringify(data.diligencias_realizadas),
      data.desfecho_final, data.redistribuicao, data.sugestoes, data.status,
      data.nome_investigado, data.cargo_investigado, data.unidade_investigado,
      data.matricula_investigado, data.data_admissao, data.vitima, data.numero_sigpad,
      data.crime_typing, id
    );
  },

  // Deletar processo
  deleteProcesso(id: number) {
    const db = initDatabase();
    const stmt = db.prepare('DELETE FROM processos WHERE id = ?');
    stmt.run(id);
  },

  // Buscar usuário por email
  getUserByEmail(email: string) {
    const db = initDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // Buscar usuário por auth_id
  getUserByAuthId(authId: string) {
    const db = initDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE auth_id = ?');
    return stmt.get(authId);
  },

  // Criar usuário
  createUser(data: any) {
    const db = initDatabase();
    const stmt = db.prepare(`
      INSERT INTO users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.auth_id, data.username, data.email, data.role,
      data.nome_completo, data.matricula, data.cargo_funcao, data.ativo
    );
    
    return result.lastInsertRowid;
  }
};

// Exportar como 'db' para manter compatibilidade
export const db = sqliteDb; 