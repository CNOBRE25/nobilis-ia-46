import { connect } from '@planetscale/database';

// Configuração do PlanetScale
const config = {
  host: import.meta.env.VITE_PLANETSCALE_HOST || 'aws.connect.psdb.cloud',
  username: import.meta.env.VITE_PLANETSCALE_USERNAME || '',
  password: import.meta.env.VITE_PLANETSCALE_PASSWORD || '',
};

// Cliente PlanetScale
export const planetscale = connect(config);

// Funções auxiliares para facilitar o uso
export const db = {
  // Buscar todos os processos
  async getProcessos() {
    const { rows } = await planetscale.execute('SELECT * FROM processos ORDER BY created_at DESC');
    return rows;
  },

  // Buscar processo por ID
  async getProcessoById(id: number) {
    const { rows } = await planetscale.execute('SELECT * FROM processos WHERE id = ?', [id]);
    return rows[0];
  },

  // Criar novo processo
  async createProcesso(data: any) {
    const { insertId } = await planetscale.execute(`
      INSERT INTO processos (
        numero_processo, tipo_processo, prioridade, numero_despacho,
        data_despacho, data_recebimento, data_fato, origem_processo,
        descricao_fatos, modus_operandi, diligencias_realizadas,
        desfecho_final, redistribuicao, sugestoes, status, user_id,
        nome_investigado, cargo_investigado, unidade_investigado,
        matricula_investigado, data_admissao, vitima, numero_sigpad,
        crime_typing
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.numero_processo, data.tipo_processo, data.prioridade, data.numero_despacho,
      data.data_despacho, data.data_recebimento, data.data_fato, data.origem_processo,
      data.descricao_fatos, data.modus_operandi, JSON.stringify(data.diligencias_realizadas),
      data.desfecho_final, data.redistribuicao, data.sugestoes, data.status, data.user_id,
      data.nome_investigado, data.cargo_investigado, data.unidade_investigado,
      data.matricula_investigado, data.data_admissao, data.vitima, data.numero_sigpad,
      data.crime_typing
    ]);
    return insertId;
  },

  // Atualizar processo
  async updateProcesso(id: number, data: any) {
    await planetscale.execute(`
      UPDATE processos SET
        numero_processo = ?, tipo_processo = ?, prioridade = ?, numero_despacho = ?,
        data_despacho = ?, data_recebimento = ?, data_fato = ?, origem_processo = ?,
        descricao_fatos = ?, modus_operandi = ?, diligencias_realizadas = ?,
        desfecho_final = ?, redistribuicao = ?, sugestoes = ?, status = ?,
        nome_investigado = ?, cargo_investigado = ?, unidade_investigado = ?,
        matricula_investigado = ?, data_admissao = ?, vitima = ?, numero_sigpad = ?,
        crime_typing = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      data.numero_processo, data.tipo_processo, data.prioridade, data.numero_despacho,
      data.data_despacho, data.data_recebimento, data.data_fato, data.origem_processo,
      data.descricao_fatos, data.modus_operandi, JSON.stringify(data.diligencias_realizadas),
      data.desfecho_final, data.redistribuicao, data.sugestoes, data.status,
      data.nome_investigado, data.cargo_investigado, data.unidade_investigado,
      data.matricula_investigado, data.data_admissao, data.vitima, data.numero_sigpad,
      data.crime_typing, id
    ]);
  },

  // Deletar processo
  async deleteProcesso(id: number) {
    await planetscale.execute('DELETE FROM processos WHERE id = ?', [id]);
  },

  // Buscar usuário por email
  async getUserByEmail(email: string) {
    const { rows } = await planetscale.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  // Buscar usuário por auth_id
  async getUserByAuthId(authId: string) {
    const { rows } = await planetscale.execute('SELECT * FROM users WHERE auth_id = ?', [authId]);
    return rows[0];
  },

  // Criar usuário
  async createUser(data: any) {
    const { insertId } = await planetscale.execute(`
      INSERT INTO users (auth_id, username, email, role, nome_completo, matricula, cargo_funcao, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.auth_id, data.username, data.email, data.role,
      data.nome_completo, data.matricula, data.cargo_funcao, data.ativo
    ]);
    return insertId;
  }
}; 