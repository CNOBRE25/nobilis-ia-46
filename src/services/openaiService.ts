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
Você é um ANALISTA JURÍDICO MILITAR ESPECIALIZADO na elaboração de RELATÓRIOS DE INVESTIGAÇÃO PRELIMINAR (IP) da Polícia Militar de Pernambuco.

Expertise em:
- Código Penal Militar (Decreto-Lei nº 1.001/69)
- Regulamento Disciplinar da PM-PE (Decreto nº 11.817/86)
- Código Penal Comum e legislação correlata
- Cálculos de prescrição penal e disciplinar
- Jurisprudência dos Tribunais Superiores

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

GERE UM RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR SEGUINDO RIGOROSAMENTE A ESTRUTURA OFICIAL:

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
[Elabore um resumo objetivo dos fatos noticiados, identifique o(s) possível(eis) crime(s) ou transgressão(ões) disciplinar(es) com respectiva tipificação legal. Considere o status funcional do agente (militar em serviço, militar de folga, etc.). Aplique a legislação adequada (CPM, CP, Estatuto, Código Disciplinar). Analise a natureza da infração e, com base na data do fato, realize o cálculo da prescrição penal ou administrativa, indicando se o fato se encontra prescrito ou se a apuração deve prosseguir.]

## II – DOS FATOS
A presente investigação preliminar foi instaurada com a finalidade de apurar os fatos noticiados por meio da {origem}, que relata que, no dia {data_fato}, o policial militar {nome}, lotado no(a) {unidade}, teria {descricao}.

[Complete com análise detalhada dos fatos baseada na descrição fornecida]

## III – DAS DILIGÊNCIAS
Foram iniciadas diligências para esclarecimento dos fatos, conforme segue:

[Liste automaticamente as diligências padrão baseadas no tipo de investigação]

Documentos providenciados:
- Ficha Funcional do investigado
- Extrato do SIGPAD
- [Outros documentos relevantes baseados no caso]

[Forneça resumo analítico: Com base nas diligências realizadas, observou-se que: (exposição sintética dos elementos que seriam apurados)]

## IV – DA FUNDAMENTAÇÃO
[Consolide os elementos fáticos e jurídicos da investigação. Ofereça análise técnica fundamentada com respaldo na legislação vigente, doutrina e jurisprudência nacional. Destaque o nexo de causalidade, a existência (ou não) de autoria e materialidade, e a adequação típica, conforme o enquadramento legal aplicável (CP, CPM, CPP, Código Disciplinar, Estatuto da Corporação).]

## V – DA CONCLUSÃO
[Conclua justificadamente por uma das seguintes providências:
- Instauração de SAD (Sindicato Administrativo Disciplinar)
- Instauração de IPM (Inquérito Policial Militar)
- Instauração de PADS (Processo Administrativo Disciplinar Sumaríssimo)
- Redistribuição para outra unidade
- Arquivamento, por ausência de elementos suficientes ou prescrição

A conclusão deve vir acompanhada da justificativa legal e técnica, considerando o grau de relevância dos fatos, a existência de indícios mínimos de autoria e materialidade, e os critérios de oportunidade e conveniência da administração pública.]

RECIFE, [Data atual]

INSTRUÇÕES TÉCNICAS:
- Use APENAS legislação vigente
- Calcule datas de prescrição com precisão
- Cite artigos específicos
- Seja técnico e fundamentado
- Considere jurisprudência relevante
- Aplique corretamente as competências (Justiça Militar vs Comum)
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
        dataPrescricao: '20/07/2029',
        fundamentacao: 'Simulação: Lesão corporal durante serviço militar.'
      });
    }
    try {
      const prompt = `Você é um analista jurídico militar brasileiro, especialista em Direito Penal Militar, Direito Disciplinar e prescrição penal/administrativa.\n\nAnalise o seguinte caso:\n\nDescrição dos fatos: "${texto}"\nData do fato: ${dataFato instanceof Date ? dataFato.toLocaleDateString('pt-BR') : dataFato}\n\nSua tarefa:\n1. Identifique TODAS as possíveis tipificações penais e disciplinares aplicáveis (CPM, CP, Código Disciplinar, Estatuto, etc), citando artigo, nome do crime/transgressão e fundamentação.\n2. Explique, de forma técnica e fundamentada, por que chegou a cada tipificação.\n3. Calcule a data da prescrição penal e administrativa, explicando o cálculo e citando os artigos usados.\n4. Responda de forma estruturada, assim:\n\nTipificação penal sugerida: <tipificacao>\nFundamentação: <explicacao detalhada>\nData da prescrição penal: <data_prescricao_penal>\nData da prescrição administrativa: <data_prescricao_adm>\nObservações: <observacoes se houver>\n`;

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
      // Extrair tipificação, fundamentação e datas do texto retornado
      const tipMatch = content.match(/Tipificação penal sugerida:\s*(.*)/i);
      const fundMatch = content.match(/Fundamentação:\s*([\s\S]*?)\nData da prescrição penal:/i);
      const prescPenalMatch = content.match(/Data da prescrição penal:\s*(.*)/i);
      const prescAdmMatch = content.match(/Data da prescrição administrativa:\s*(.*)/i);
      const obsMatch = content.match(/Observações:\s*(.*)/i);
      return {
        tipificacao: tipMatch ? tipMatch[1].trim() : 'Não identificado',
        fundamentacao: fundMatch ? fundMatch[1].trim() : '',
        dataPrescricao: prescPenalMatch ? prescPenalMatch[1].trim() : '',
        dataPrescricaoAdm: prescAdmMatch ? prescAdmMatch[1].trim() : '',
        observacoes: obsMatch ? obsMatch[1].trim() : ''
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao interpretar tipificação com IA:', error);
      }
      return {
        tipificacao: 'Erro ao interpretar via IA',
        dataPrescricao: '',
        fundamentacao: '',
        dataPrescricaoAdm: '',
        observacoes: ''
      };
    }
  }
}; 