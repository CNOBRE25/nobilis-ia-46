export type ProcessStatus = 'tramitacao' | 'concluido' | 'arquivado' | 'suspenso';
export type ProcessPriority = 'alta' | 'media' | 'baixa' | 'urgente';

export interface Process {
  id: string;
  numero_processo: string;
  tipo_processo: string;
  prioridade: ProcessPriority;
  status: ProcessStatus;
  nome_investigado?: string;
  cargo_investigado?: string;
  unidade_investigado?: string;
  matricula_investigado?: string;
  data_admissao?: string;
  vitima?: string;
  created_at: string;
  updated_at: string;
  // ... outros campos relevantes
}

export interface Investigado {
  id: number;
  nome: string;
  cargo: string;
  unidade: string;
  matricula: string;
  dataAdmissao: Date | null;
  // Adicione outros campos relevantes se necessário
} 