export interface RelatorioDados {
  [key: string]: any; // Permitir todos os campos dinamicamente
}

export interface RelatorioIA {
  cabecalho: string;
  das_preliminares: string;
  dos_fatos: string;
  das_diligencias: string;
  da_fundamentacao: string;
  da_conclusao: string;
  raw_response: string;
}

// Configuração do Backend
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (
  import.meta.env.PROD 
    ? 'https://nobilis-ia-46.vercel.app' 
    : 'http://localhost:3002'
);

// Debug: Verificar se o backend está disponível
console.log('🔍 Debug - Backend URL:', BACKEND_URL);

const RELATORIO_FINAL_PROMPT = ({
  numeroProcesso = '',
  numeroDespacho = '',
  dataDespacho = '',
  origemProcesso = '',
  dataFato = '',
  vitimas = [],
  investigados = [],
  descricaoFatos = '',
  statusFuncional = '',
  diligenciasRealizadas = {},
  numeroSigpad = '',
  documentos = [],
}) => `
Você é um ANALISTA JURÍDICO MILITAR ESPECIALIZADO. Gere um RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR fundamentado, estruturado conforme o modelo abaixo, usando todos os dados fornecidos do processo:

RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR
PROCESSO nº: ${numeroProcesso}
Despacho de Instauração nº: ${numeroDespacho}
Data do Despacho: ${dataDespacho}
Origem: ${origemProcesso}
Data do Fato: ${dataFato}
Vítima(s): ${(Array.isArray(vitimas) && vitimas.length > 0) ? vitimas.map(v => v.nome).join(', ') : 'Não informado'}
Investigado(s): ${(Array.isArray(investigados) && investigados.length > 0) ? investigados.map(i => i.nome).join(', ') : 'Não informado'}
Matrícula(s): ${(Array.isArray(investigados) && investigados.length > 0) ? investigados.map(i => i.matricula).join(', ') : 'Não informado'}
Admissão(ões): ${(Array.isArray(investigados) && investigados.length > 0) ? investigados.map(i => i.dataAdmissao || 'Não informado').join(', ') : 'Não informado'}
Lotação(ões) Atual(is): ${(Array.isArray(investigados) && investigados.length > 0) ? investigados.map(i => i.unidade).join(', ') : 'Não informado'}

I – DAS PRELIMINARES
[Análise pela IA]:
Elabore um resumo objetivo dos fatos noticiados, identifique possíveis crimes ou transgressões disciplinares atribuídos aos investigados, com tipificação legal, considerando o status funcional do(s) agente(s) no momento do fato. aplique a legislação adequada (CPM, CP, Estatuto, Código Disciplinar, etc.), analise a natureza da infração e, com base na data do fato, realize o cálculo da prescrição penal ou administrativa, indicando se o fato se encontra prescrito ou se a apuração deve prosseguir.

II – DOS FATOS
A presente investigação preliminar foi instaurada para apurar os fatos noticiados por meio de ${origemProcesso || '[NFND / comunicação inicial]'}, que relata que, no dia ${dataFato || '[DATA DO FATO]'}, o(s) policial(is) militar(es) ${investigados && investigados.length > 0 ? investigados.map(i => i.nome).join(', ') : '[NOME / IDENTIFICAÇÃO]'}, lotado(s) no(a) ${investigados && investigados.length > 0 ? investigados.map(i => i.unidade).join(', ') : '[UNIDADE]'}, teria(m) ${descricaoFatos || '[DESCRIÇÃO RESUMIDA DOS FATOS]'}.

III – DAS DILIGÊNCIAS
Foram iniciadas diligências para esclarecimento dos fatos, conforme segue:
${Object.keys(diligenciasRealizadas || {}).length > 0 ? Object.entries(diligenciasRealizadas).filter(([_, v]) => (v as any)?.realizada).map(([k, v]) => `- ${k}${(v as any).observacao ? ': ' + (v as any).observacao : ''}`).join('\n') : '[Lista automatizada pela IA com base nas diligências realizadas]'}

Documentos providenciados:
- Ficha Funcional do(s) investigado(s)
- Extrato do SIGPAD
${documentos && documentos.length > 0 ? documentos.map(d => `- ${d}`).join('\n') : ''}

[Resumo analítico pela IA]:
Com base nas diligências realizadas, exponha sinteticamente os elementos apurados em cada documento ou etapa da investigação.

IV – DA FUNDAMENTAÇÃO
[Elaboração pela IA com base nos dados e desfecho sugerido]:
Consolide os elementos fáticos e jurídicos da investigação, oferecendo uma análise técnica fundamentada, com respaldo na legislação vigente, doutrina e jurisprudência nacional, destacando o nexo de causalidade, a existência (ou não) de autoria e materialidade, e a adequação típica, conforme o enquadramento legal aplicável (CP, CPM, CPP, Código Disciplinar, Estatuto da Corporação, etc.).

V – DA CONCLUSÃO
[Decisão orientada pela IA com justificativa]:
Considerando os elementos colhidos na presente investigação, conclua, justificadamente, por uma das seguintes providências:
- Instauração de SAD (Sindicato Administrativo Disciplinar)
- Instauração de IPM (Inquérito Policial Militar)
- Instauração de PADS (Processo Administrativo Disciplinar Sumaríssimo)
- Redistribuição para outra unidade
- Arquivamento, por ausência de elementos suficientes ou prescrição
A conclusão deve vir acompanhada da justificativa legal e técnica, considerando o grau de relevância dos fatos, a existência de indícios mínimos de autoria e materialidade, e os critérios de oportunidade e conveniência da administração pública.

RECIFE, [DATA DA ASSINATURA ELETRÔNICA]
`;

const parsearRelatorio = (response: string): RelatorioIA => {
  // Extrair seções do relatório oficial
  const extrairSecao = (texto: string, titulo: string): string => {
    const regex = new RegExp(`##\\s*${titulo}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
    const match = texto.match(regex);
    return match ? match[1].trim() : 'Não especificado';
  };

  const extrairCabecalho = (texto: string): string => {
    const regex = new RegExp(`##\\s*CABECALHO[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n##\\s*I\\s*–|$)`, 'i');
    const match = texto.match(regex);
    return match ? match[1].trim() : 'RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR';
  };

  return {
    cabecalho: extrairCabecalho(response),
    das_preliminares: extrairSecao(response, 'I – DAS PRELIMINARES'),
    dos_fatos: extrairSecao(response, 'II – DOS FATOS'),
    das_diligencias: extrairSecao(response, 'III – DAS DILIGÊNCIAS'),
    da_fundamentacao: extrairSecao(response, 'IV – DA FUNDAMENTAÇÃO'),
    da_conclusao: extrairSecao(response, 'V – DA CONCLUSÃO'),
    raw_response: response
  };
};

// Fallback: Gera um relatório simulado para ambiente de desenvolvimento ou erro na API
function gerarRelatorioSimulado(dados: RelatorioDados) {
  return Promise.resolve({
    cabecalho: 'RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR (SIMULADO)',
    das_preliminares: 'Simulação: Preliminares do caso para ' + (dados.nome || 'NOME NÃO INFORMADO'),
    dos_fatos: 'Simulação: Fatos do processo.',
    das_diligencias: 'Simulação: Diligências realizadas.',
    da_fundamentacao: 'Simulação: Fundamentação jurídica.',
    da_conclusao: 'Simulação: Conclusão e encaminhamentos.',
    raw_response: 'Este é um relatório simulado para ambiente de desenvolvimento.'
  });
}

export const openaiService = {
  async gerarRelatorioJuridico(dados: RelatorioDados): Promise<RelatorioIA> {
    try {
      console.log('🔍 Iniciando geração de relatório via backend...');
      // Montar prompt detalhado com todos os dados do processo
      const prompt = RELATORIO_FINAL_PROMPT({
        numeroProcesso: dados.numeroProcesso || dados.numero_processo || '',
        numeroDespacho: dados.numeroDespacho || dados.numero_despacho || '',
        dataDespacho: dados.dataDespacho || dados.data_despacho || '',
        origemProcesso: dados.origemProcesso || dados.origem_processo || '',
        dataFato: dados.dataFato || dados.data_fato || '',
        vitimas: dados.vitimas || [],
        investigados: dados.investigados || [],
        descricaoFatos: dados.descricaoFatos || dados.descricao_fatos || dados.descricao || '',
        statusFuncional: dados.statusFuncional || dados.status_funcional || '',
        diligenciasRealizadas: dados.diligenciasRealizadas || dados.diligencias_realizadas || {},
        numeroSigpad: dados.numeroSigpad || dados.numero_sigpad || '',
        documentos: dados.documentos || [],
      });
      const response = await fetch(`${BACKEND_URL}/api/openai/gerar-relatorio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dadosProcesso: dados }), // <-- CORRETO!
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro no backend:', errorData);
        throw new Error(`Erro no backend: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      console.log('✅ Relatório recebido do backend');
      return parsearRelatorio(
        typeof data === 'string' ? data : (data.relatorio || data.analise || JSON.stringify(data))
      );
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      throw error;
    }
  },

  // Novo método: interpretarTipificacao
  /**
   * Recebe um texto livre e a data do fato, retorna a tipificação penal sugerida e a data da prescrição.
   */
  async interpretarTipificacao({ texto, dataFato }: { texto: string, dataFato: Date }) {
    try {
      console.log('🔍 Iniciando análise de tipificação via backend...');
      
      const response = await fetch(`${BACKEND_URL}/api/openai/interpretar-tipificacao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          descricaoCrime: texto,
          contexto: `Data do fato: ${dataFato instanceof Date ? dataFato.toLocaleDateString('pt-BR') : dataFato}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro no backend:', errorData);
        throw new Error(`Erro no backend: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Resposta recebida do backend');
      
      // Converter formato do backend para o formato esperado pelo frontend
      return {
        tipificacao_principal: data.tipificacao_principal || 'Não identificado',
        fundamentacao: data.fundamentacao || '',
        tipificacoes_alternativas: Array.isArray(data.tipificacoes_alternativas) 
          ? data.tipificacoes_alternativas 
          : (data.tipificacoes_alternativas ? [data.tipificacoes_alternativas] : []),
        tipificacoes_disciplinares: Array.isArray(data.tipificacoes_disciplinares) 
          ? data.tipificacoes_disciplinares 
          : (data.tipificacoes_disciplinares ? [data.tipificacoes_disciplinares] : []),
        prescricao_penal: data.prescricao_penal || '',
        prescricao_administrativa: data.prescricao_administrativa || '',
        competencia: data.competencia || '',
        observacoes: data.observacoes || ''
      };
    } catch (error) {
      console.error('❌ Erro ao interpretar tipificação:', error);
      throw error;
    }
  }
}; 