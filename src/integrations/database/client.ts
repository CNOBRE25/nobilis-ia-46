import { config } from '@/config/environment';
import { supabase } from '../supabase/client';

// Interface para operações de banco de dados
export interface DatabaseClient {
  // Operações de usuário
  getUsers(): Promise<any[]>;
  getUserByEmail(email: string): Promise<any>;
  createUser(userData: any): Promise<any>;
  updateUser(id: string, userData: any): Promise<any>;
  
  // Operações de processo
  getProcessos(): Promise<any[]>;
  getProcessosByStatus(status: string): Promise<any[]>;
  createProcesso(processoData: any): Promise<any>;
  updateProcesso(id: string, processoData: any): Promise<any>;
  deleteProcesso(id: string): Promise<any>;
  
  // Operações de estatísticas
  getStats(): Promise<any>;
  
  // Verificar conectividade
  isConnected(): Promise<boolean>;
}

// Cliente Supabase
class SupabaseClient implements DatabaseClient {
  async isConnected(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  async getUsers(): Promise<any[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  }

  async getUserByEmail(email: string): Promise<any> {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) throw error;
    return data;
  }

  async createUser(userData: any): Promise<any> {
    const { data, error } = await supabase.from('users').insert(userData).select().single();
    if (error) throw error;
    return data;
  }

  async updateUser(id: string, userData: any): Promise<any> {
    const { data, error } = await supabase.from('users').update(userData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async getProcessos(): Promise<any[]> {
    const { data, error } = await supabase.from('processos').select('*');
    if (error) throw error;
    return data || [];
  }

  async getProcessosByStatus(status: string): Promise<any[]> {
    const { data, error } = await supabase.from('processos').select('*').eq('status', status);
    if (error) throw error;
    return data || [];
  }

  async createProcesso(processoData: any): Promise<any> {
    const { data, error } = await supabase.from('processos').insert(processoData).select().single();
    if (error) throw error;
    return data;
  }

  async updateProcesso(id: string, processoData: any): Promise<any> {
    const { data, error } = await supabase.from('processos').update(processoData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteProcesso(id: string): Promise<any> {
    const { error } = await supabase.from('processos').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async getStats(): Promise<any> {
    const { data: processos, error } = await supabase.from('processos').select('*');
    if (error) throw error;
    
    const totalProcessos = processos?.length || 0;
    const processosAtivos = processos?.filter(p => p.status === 'tramitacao').length || 0;
    const processosFinalizados = processos?.filter(p => p.status === 'concluido').length || 0;
    const processosUrgentes = processos?.filter(p => p.prioridade === 'alta').length || 0;
    
    return {
      totalProcessos,
      processosAtivos,
      processosFinalizados,
      processosUrgentes
    };
  }
}

// Cliente de backend local (mock para desenvolvimento)
class LocalBackendClient implements DatabaseClient {
  async isConnected(): Promise<boolean> {
    try {
      const response = await fetch(`${config.backend.url}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getUsers(): Promise<any[]> {
    const response = await fetch(`${config.backend.url}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  }

  async getUserByEmail(email: string): Promise<any> {
    const response = await fetch(`${config.backend.url}/users?email=${email}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    const users = await response.json();
    return users[0];
  }

  async createUser(userData: any): Promise<any> {
    const response = await fetch(`${config.backend.url}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  }

  async updateUser(id: string, userData: any): Promise<any> {
    const response = await fetch(`${config.backend.url}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  }

  async getProcessos(): Promise<any[]> {
    const response = await fetch(`${config.backend.url}/processos`);
    if (!response.ok) throw new Error('Failed to fetch processos');
    return response.json();
  }

  async getProcessosByStatus(status: string): Promise<any[]> {
    const response = await fetch(`${config.backend.url}/processos?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch processos');
    return response.json();
  }

  async createProcesso(processoData: any): Promise<any> {
    const response = await fetch(`${config.backend.url}/processos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processoData)
    });
    if (!response.ok) throw new Error('Failed to create processo');
    return response.json();
  }

  async updateProcesso(id: string, processoData: any): Promise<any> {
    const response = await fetch(`${config.backend.url}/processos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processoData)
    });
    if (!response.ok) throw new Error('Failed to update processo');
    return response.json();
  }

  async deleteProcesso(id: string): Promise<any> {
    const response = await fetch(`${config.backend.url}/processos/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete processo');
    return { success: true };
  }

  async getStats(): Promise<any> {
    const processos = await this.getProcessos();
    
    const totalProcessos = processos.length;
    const processosAtivos = processos.filter(p => p.status === 'tramitacao').length;
    const processosFinalizados = processos.filter(p => p.status === 'concluido').length;
    const processosUrgentes = processos.filter(p => p.prioridade === 'alta').length;
    
    return {
      totalProcessos,
      processosAtivos,
      processosFinalizados,
      processosUrgentes
    };
  }
}

// Cliente mock para desenvolvimento sem backend
class MockClient implements DatabaseClient {
  async isConnected(): Promise<boolean> {
    return true; // Sempre conectado em modo mock
  }

  async getUsers(): Promise<any[]> {
    return [
      { id: '1', email: 'admin@example.com', role: 'admin', name: 'Administrador' }
    ];
  }

  async getUserByEmail(email: string): Promise<any> {
    if (email === 'admin@example.com') {
      return { id: '1', email: 'admin@example.com', role: 'admin', name: 'Administrador' };
    }
    return null;
  }

  async createUser(userData: any): Promise<any> {
    return { id: '2', ...userData };
  }

  async updateUser(id: string, userData: any): Promise<any> {
    return { id, ...userData };
  }

  async getProcessos(): Promise<any[]> {
    return [
      { id: '1', numeroProcesso: '001/2024', status: 'tramitacao', prioridade: 'media' },
      { id: '2', numeroProcesso: '002/2024', status: 'concluido', prioridade: 'alta' }
    ];
  }

  async getProcessosByStatus(status: string): Promise<any[]> {
    const processos = await this.getProcessos();
    return processos.filter(p => p.status === status);
  }

  async createProcesso(processoData: any): Promise<any> {
    return { id: Date.now().toString(), ...processoData };
  }

  async updateProcesso(id: string, processoData: any): Promise<any> {
    return { id, ...processoData };
  }

  async deleteProcesso(id: string): Promise<any> {
    return { success: true };
  }

  async getStats(): Promise<any> {
    return {
      totalProcessos: 2,
      processosAtivos: 1,
      processosFinalizados: 1,
      processosUrgentes: 1
    };
  }
}

// Função para obter o cliente de banco de dados apropriado
export function getDatabaseClient(): DatabaseClient {
  const activeBackend = config.getActiveBackend();
  
  switch (activeBackend) {
    case 'supabase':
      return new SupabaseClient();
    case 'local':
      return new LocalBackendClient();
    case 'none':
    default:
      return new MockClient();
  }
}

// Cliente de banco de dados padrão
export const db = getDatabaseClient();
