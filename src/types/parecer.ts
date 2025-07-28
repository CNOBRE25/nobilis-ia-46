export type ParecerStatus = 'rascunho' | 'revisao' | 'aprovado' | 'entregue' | 'arquivado';
export type ParecerUrgencia = 'baixa' | 'media' | 'alta';

export interface Parecer {
  id: string;
  numero_protocolo: string;
  titulo: string;
  servidores: Array<{
    nome: string;
    matricula: string;
    categoria_funcional: string;
    situacao_servico: string;
  }>;
  status: ParecerStatus;
  urgencia: ParecerUrgencia;
  data_criacao: string;
  data_fato: string;
  data_prescricao: string;
  orgao: string;
  usuario_id: string;
  conteudo_parecer?: string;
  questao_principal?: string;
  caso_descricao?: string;
  area_direito?: string;
  complexidade?: string;
  tipo_crime?: string;
  legislacao_aplicavel?: string;
} 