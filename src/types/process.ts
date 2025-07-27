export type ProcessStatus = 'tramitacao' | 'concluido' | 'arquivado' | 'suspenso';
export type ProcessPriority = 'alta' | 'media' | 'baixa' | 'urgente' | 'urgente_maria_penha';

// Interface para diligências realizadas
export interface DiligenciasRealizadas {
  [key: string]: {
    realizada: boolean;
    observacao?: string;
  };
}

// Interface para dados do formulário de processo
export interface ProcessFormData {
  numeroProcesso: string;
  tipoProcesso: string;
  prioridade: ProcessPriority;
  numeroDespacho: string;
  dataDespacho: Date | null;
  dataRecebimento: Date | null;
  dataFato: Date | null;
  origemProcesso: string;
  statusFuncional: string;
  descricaoFatos: string;
  tipoCrime: string;
  crimesSelecionados: string[];
  transgressao: string;
  modusOperandi: string;
  nomeInvestigado: string;
  cargoInvestigado: string;
  unidadeInvestigado: string;
  matriculaInvestigado: string;
  dataAdmissao: Date | null;
  vitima: string;
  numeroSigpad: string;
  diligenciasRealizadas: DiligenciasRealizadas;
  desfechoFinal: string;
  sugestoes: string;
  relatorioFinal: string;
}

// Interface para investigado
export interface Investigado {
  id: number;
  nome: string;
  cargo: string;
  unidade: string;
  matricula: string;
  dataAdmissao: Date | null;
  // Adicione outros campos relevantes se necessário
}

// Interface para vítima
export interface Vitima {
  id: number;
  nome: string;
  // Adicione outros campos relevantes se necessário
}

// Interface principal do Processo (atualizada e completa)
export interface Process {
  id: string;
  numero_processo: string;
  tipo_processo: string;
  prioridade: ProcessPriority;
  status: ProcessStatus;
  numero_despacho?: string;
  data_despacho?: string;
  data_recebimento?: string;
  data_fato?: string;
  origem_processo?: string;
  status_funcional?: string;
  descricao_fatos?: string;
  tipo_crime?: string;
  crimes_selecionados?: string[];
  transgressao?: string;
  modus_operandi?: string;
  nome_investigado?: string;
  cargo_investigado?: string;
  unidade_investigado?: string;
  matricula_investigado?: string;
  data_admissao?: string;
  vitima?: string;
  numero_sigpad?: string;
  diligencias_realizadas?: DiligenciasRealizadas;
  desfecho_final?: string;
  sugestoes?: string;
  relatorio_final?: string;
  investigados?: Investigado[];
  vitimas?: Vitima[];
  created_at: string;
  updated_at: string;
}

// Tipos utilitários para funções
export type SetFieldFunction = <K extends keyof ProcessFormData>(
  field: K, 
  value: ProcessFormData[K]
) => void;

export type UpdateInvestigadoFunction = (
  id: number, 
  field: keyof Investigado, 
  value: Investigado[keyof Investigado]
) => void;

export type UpdateVitimaFunction = (
  id: number, 
  value: string
) => void; 