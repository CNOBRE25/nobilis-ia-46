export interface RelatorioDados {
  nome: string;
  tipo_investigado: string;
  cargo: string;
  unidade: string;
  data_fato: string;
  descricao: string;
  numero_sigpad?: string;
  numero_despacho?: string;
  data_despacho?: string;
  origem?: string;
  vitima?: string;
  matricula?: string;
  data_admissao?: string;
  diligencias_realizadas?: string[];
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
const BACKEND_URL = import.meta.env.PROD 
  ? 'https://nobilis-ia-46.vercel.app' 
  : 'http://localhost:3002';

// Debug: Verificar se o backend está disponível
console.log('🔍 Debug - Backend URL:', BACKEND_URL);

const PROMPT_TEMPLATE = `
Você é um ANALISTA JURÍDICO MILITAR ESPECIALIZADO na elaboração de RELATÓRIOS DE INVESTIGAÇÃO PRELIMINAR (IP) da Polícia Militar de Pernambuco, com expertise em:

• Código Penal Militar (Decreto-Lei nº 1.001/69)
• Regulamento Disciplinar da PM-PE (Decreto nº 11.817/86)
• Código Penal Comum (Lei nº 2.848/40) e legislação correlata
• Código de Processo Penal Militar (Decreto-Lei nº 1.002/69)
• Estatuto dos Militares Estaduais (Lei nº 6.880/80)
• Cálculos de prescrição penal e disciplinar
• Jurisprudência dos Tribunais Superiores (STF, STJ, STM)

DADOS FORNECIDOS:
Nome: {nome}
Cargo/Patente: {cargo}
Unidade: {unidade}
Data do Fato: {data_fato}
Tipo de Procedimento: {tipo_investigado}
Descrição dos Fatos: {descricao}
SIGPAD: {numero_sigpad}
Despacho: {numero_despacho}
Data Despacho: {data_despacho}
Origem: {origem}
Vítima: {vitima}
Matrícula: {matricula}
Admissão: {data_admissao}

ELABORE UM RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR COMPLETO, FUNDAMENTADO E ESTRUTURADO:

## CABECALHO
RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR
SIGPAD nº: {numero_sigpad}
Despacho de Instauração nº: {numero_despacho}
Data do Despacho: {data_despacho}
Origem: {origem}
Data do Fato: {data_fato}
Vítima: {vitima}
Investigado: {nome}
Matrícula: {matricula}
Admissão: {data_admissao}
Lotação Atual: {unidade}

## I – DAS PRELIMINARES

1.1. **Fatos Noticiados:**
[Resumo objetivo e técnico dos fatos, identificando os elementos essenciais: quem, o quê, quando, onde, como e por quê]

1.2. **Análise Jurídica Preliminar:**
[Identificação das possíveis tipificações penais e/ou disciplinares aplicáveis, com citação específica dos artigos e fundamentação técnica]

1.3. **Cálculo de Prescrição:**
[Análise da prescrição penal e administrativa com base na data do fato, citando os artigos aplicáveis e realizando o cálculo preciso]

1.4. **Competência Jurisdicional:**
[Definição da competência (Justiça Militar Estadual, Justiça Comum, ou ambas) com fundamentação legal]

## II – DOS FATOS

2.1. **Narrativa dos Fatos:**
A presente investigação preliminar foi instaurada com a finalidade de apurar os fatos noticiados por meio da {origem}, que relata que, no dia {data_fato}, o policial militar {nome}, lotado no(a) {unidade}, teria {descricao}.

[Desenvolver narrativa detalhada, cronológica e objetiva dos fatos, destacando elementos relevantes para a análise jurídica]

2.2. **Elementos de Prova Identificados:**
[Listar e analisar os elementos probatórios disponíveis ou que poderiam ser colhidos]

2.3. **Contexto Funcional:**
[Analisar se o fato ocorreu em serviço, de folga, ou em situação híbrida, e suas implicações jurídicas]

## III – DAS DILIGÊNCIAS

3.1. **Diligências Realizadas:**
• Colheita de depoimentos
• Requisição de documentos
• Análise de registros funcionais
• Verificação de antecedentes
• [Outras diligências específicas ao caso]

3.2. **Documentos Colhidos:**
• Ficha Funcional do investigado
• Extrato do SIGPAD
• Registros de ocorrência
• [Documentos específicos do caso]

3.3. **Resumo Analítico das Diligências:**
[Exposição sintética dos elementos apurados e sua relevância para a conclusão]

## IV – DA FUNDAMENTAÇÃO

4.1. **Análise Fática:**
[Consolidação dos elementos fáticos coletados, estabelecendo o nexo causal e a materialidade dos fatos]

4.2. **Análise Jurídica:**
[Fundamentação técnica com base na legislação vigente, doutrina e jurisprudência, analisando:
• Adequação típica
• Elementos subjetivos
• Causas de exclusão de ilicitude
• Causas de exclusão de culpabilidade]

4.3. **Aplicação da Legislação:**
[Citação e aplicação específica dos artigos do CPM, CP, Código Disciplinar, Estatuto, conforme o caso]

4.4. **Jurisprudência Aplicável:**
[Citação de precedentes relevantes dos Tribunais Superiores, quando aplicável]

## V – DA CONCLUSÃO

5.1. **Síntese dos Elementos:**
[Resumo dos principais elementos fáticos e jurídicos identificados]

5.2. **Recomendação Técnica:**
[Conclusão fundamentada, recomendando uma das seguintes providências:
• Instauração de SAD (Sindicato Administrativo Disciplinar)
• Instauração de IPM (Inquérito Policial Militar)
• Instauração de PADS (Processo Administrativo Disciplinar Sumaríssimo)
• Redistribuição para outra unidade
• Arquivamento por ausência de elementos suficientes
• Arquivamento por prescrição]

5.3. **Justificativa Legal:**
[Fundamentação técnica da recomendação, considerando:
• Grau de relevância dos fatos
• Existência de indícios mínimos de autoria e materialidade
• Critérios de oportunidade e conveniência da administração pública
• Interesse público na apuração]

RECIFE, [Data atual]

INSTRUÇÕES TÉCNICAS OBRIGATÓRIAS:
• Use APENAS legislação vigente e atualizada
• Calcule datas de prescrição com precisão matemática
• Cite artigos específicos com numeração correta
• Seja técnico, objetivo e fundamentado
• Considere jurisprudência relevante dos Tribunais Superiores
• Aplique corretamente as competências jurisdicionais
• Mantenha linguagem jurídica formal e técnica
• Estruture o relatório de forma lógica e coesa
• Evite redundâncias e seja conciso
• Priorize a clareza e objetividade na exposição
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
      
      const response = await fetch(`${BACKEND_URL}/api/openai/gerar-relatorio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dadosProcesso: dados
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erro no backend:', errorData);
        throw new Error(`Erro no backend: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Relatório recebido do backend');
      
      return parsearRelatorio(data.relatorio);
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
        tipificacao: data.tipificacao_principal || 'Não identificado',
        fundamentacao: data.fundamentacao || '',
        tipificacoesAlternativas: Array.isArray(data.tipificacoes_alternativas) 
          ? data.tipificacoes_alternativas.join(', ') 
          : data.tipificacoes_alternativas || '',
        tipificacoesDisciplinares: Array.isArray(data.tipificacoes_disciplinares) 
          ? data.tipificacoes_disciplinares.join(', ') 
          : data.tipificacoes_disciplinares || '',
        dataPrescricao: data.prescricao_penal || '',
        dataPrescricaoAdm: data.prescricao_administrativa || '',
        competencia: data.competencia || '',
        observacoes: data.observacoes || ''
      };
    } catch (error) {
      console.error('❌ Erro ao interpretar tipificação:', error);
      throw error;
    }
  }
}; 