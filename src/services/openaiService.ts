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

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Debug: Verificar se a chave está sendo carregada
console.log('🔍 Debug - VITE_OPENAI_API_KEY:', OPENAI_API_KEY ? 'Configurada' : 'Não configurada');
console.log('🔍 Debug - Chave (primeiros 20 chars):', OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 20) + '...' : 'N/A');

if (!OPENAI_API_KEY && import.meta.env.DEV) {
  console.warn("A chave da OpenAI (VITE_OPENAI_API_KEY) não está definida. Adicione ao seu arquivo .env.local.");
}
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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
    // Check if OpenAI API is configured
    if (!OPENAI_API_KEY) {
      if (import.meta.env.DEV) {
        console.warn('OpenAI API Key não configurada. Usando modo de simulação.');
      }
      return gerarRelatorioSimulado(dados);
    }

    try {
      const prompt = PROMPT_TEMPLATE
        .replace(/{nome}/g, dados.nome || 'Não informado')
        .replace(/{cargo}/g, dados.cargo || 'Não informado')
        .replace(/{unidade}/g, dados.unidade || 'Não informado')
        .replace(/{data_fato}/g, dados.data_fato || 'Não informado')
        .replace(/{tipo_investigado}/g, dados.tipo_investigado || 'Não informado')
        .replace(/{descricao}/g, dados.descricao || 'Não informado')
        .replace(/{numero_sigpad}/g, dados.numero_sigpad || 'Não informado')
        .replace(/{numero_despacho}/g, dados.numero_despacho || 'Não informado')
        .replace(/{data_despacho}/g, dados.data_despacho || 'Não informado')
        .replace(/{origem}/g, dados.origem || 'Não informado')
        .replace(/{vitima}/g, dados.vitima || 'Não informado')
        .replace(/{matricula}/g, dados.matricula || 'Não informado')
        .replace(/{data_admissao}/g, dados.data_admissao || 'Não informado');

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um analista jurídico militar especializado em investigações preliminares da PM-PE.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Resposta vazia da API OpenAI');
      }

      return parsearRelatorio(content);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao gerar relatório com IA:', error);
      }
      // Fallback para relatório simulado em caso de erro
      return gerarRelatorioSimulado(dados);
    }
  },

  // Novo método: interpretarTipificacao
  /**
   * Recebe um texto livre e a data do fato, retorna a tipificação penal sugerida e a data da prescrição.
   */
  async interpretarTipificacao({ texto, dataFato }: { texto: string, dataFato: Date }) {
    if (!OPENAI_API_KEY) {
      // Simulação para dev
      return Promise.resolve({
        tipificacao: 'Art. 209, CPM – Lesão Corporal',
        fundamentacao: 'Simulação: Lesão corporal durante serviço militar.',
        tipificacoesAlternativas: 'Art. 129, CP – Lesão Corporal (Justiça Comum)',
        tipificacoesDisciplinares: 'Art. 25, RD-PE – Falta Grave',
        dataPrescricao: '20/07/2029',
        dataPrescricaoAdm: '20/07/2034',
        competencia: 'Justiça Militar Estadual',
        observacoes: 'Simulação para ambiente de desenvolvimento.'
      });
    }
    try {
      const prompt = `Você é um ANALISTA JURÍDICO MILITAR ESPECIALIZADO em Direito Penal Militar, Direito Disciplinar e prescrição penal/administrativa, com expertise em:

• Código Penal Militar (Decreto-Lei nº 1.001/69)
• Código Penal Comum (Lei nº 2.848/40)
• Regulamento Disciplinar da PM-PE (Decreto nº 11.817/86)
• Estatuto dos Militares Estaduais (Lei nº 6.880/80)
• Código de Processo Penal Militar (Decreto-Lei nº 1.002/69)
• Jurisprudência dos Tribunais Superiores (STF, STJ, STM)

ANALISE O SEGUINTE CASO:

**Descrição dos fatos:** "${texto}"
**Data do fato:** ${dataFato instanceof Date ? dataFato.toLocaleDateString('pt-BR') : dataFato}

SUA ANÁLISE DEVE SER ESTRUTURADA E FUNDAMENTADA:

1. **TIPIFICAÇÃO PENAL PRINCIPAL:**
   - Identifique a tipificação penal mais adequada (CPM ou CP)
   - Cite o artigo específico e o nome do crime
   - Fundamente por que esta tipificação é a mais aplicável

2. **TIPIFICAÇÕES ALTERNATIVAS:**
   - Liste outras possíveis tipificações penais aplicáveis
   - Cite artigos e fundamentação para cada uma

3. **TIPIFICAÇÕES DISCIPLINARES:**
   - Identifique possíveis transgressões disciplinares
   - Cite artigos do Regulamento Disciplinar ou Estatuto
   - Fundamente a aplicabilidade

4. **CÁLCULO DE PRESCRIÇÃO:**
   - Calcule a prescrição penal com base na data do fato
   - Calcule a prescrição administrativa/disciplinar
   - Cite os artigos utilizados no cálculo
   - Indique se o fato está prescrito ou não

5. **COMPETÊNCIA JURISDICIONAL:**
   - Defina se é competência da Justiça Militar Estadual, Justiça Comum, ou ambas
   - Fundamente a competência

RESPONDA NO SEGUINTE FORMATO ESTRUTURADO:

**Tipificação penal sugerida:** [Artigo, Código - Nome do Crime]
**Fundamentação:** [Explicação técnica detalhada com citação de artigos e fundamentação jurídica]
**Tipificações alternativas:** [Lista de outras tipificações aplicáveis]
**Tipificações disciplinares:** [Transgressões disciplinares identificadas]
**Prescrição penal:** [Data calculada - DD/MM/AAAA]
**Prescrição administrativa:** [Data calculada - DD/MM/AAAA]
**Competência:** [Justiça Militar Estadual / Justiça Comum / Ambas]
**Observações:** [Observações técnicas relevantes, se houver]

SEJA TÉCNICO, OBJETIVO E FUNDAMENTADO EM SUA ANÁLISE.`;

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Você é um analista jurídico militar especializado em tipificação penal, disciplinar e prescrição.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 600,
          temperature: 0.2,
        }),
      });
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      // Extrair todos os campos estruturados do texto retornado
      const tipMatch = content.match(/\*\*Tipificação penal sugerida:\*\*\s*(.*?)(?=\n\*\*|$)/i);
      const fundMatch = content.match(/\*\*Fundamentação:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i);
      const tipAltMatch = content.match(/\*\*Tipificações alternativas:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i);
      const tipDiscMatch = content.match(/\*\*Tipificações disciplinares:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i);
      const prescPenalMatch = content.match(/\*\*Prescrição penal:\*\*\s*(.*?)(?=\n\*\*|$)/i);
      const prescAdmMatch = content.match(/\*\*Prescrição administrativa:\*\*\s*(.*?)(?=\n\*\*|$)/i);
      const competenciaMatch = content.match(/\*\*Competência:\*\*\s*(.*?)(?=\n\*\*|$)/i);
      const obsMatch = content.match(/\*\*Observações:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/i);
      
      return {
        tipificacao: tipMatch ? tipMatch[1].trim() : 'Não identificado',
        fundamentacao: fundMatch ? fundMatch[1].trim() : '',
        tipificacoesAlternativas: tipAltMatch ? tipAltMatch[1].trim() : '',
        tipificacoesDisciplinares: tipDiscMatch ? tipDiscMatch[1].trim() : '',
        dataPrescricao: prescPenalMatch ? prescPenalMatch[1].trim() : '',
        dataPrescricaoAdm: prescAdmMatch ? prescAdmMatch[1].trim() : '',
        competencia: competenciaMatch ? competenciaMatch[1].trim() : '',
        observacoes: obsMatch ? obsMatch[1].trim() : ''
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao interpretar tipificação com IA:', error);
      }
      return {
        tipificacao: 'Erro ao interpretar via IA',
        fundamentacao: '',
        tipificacoesAlternativas: '',
        tipificacoesDisciplinares: '',
        dataPrescricao: '',
        dataPrescricaoAdm: '',
        competencia: '',
        observacoes: ''
      };
    }
  }
}; 