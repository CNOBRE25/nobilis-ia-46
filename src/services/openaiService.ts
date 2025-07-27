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
Você é um ANALISTA JURÍDICO MILITAR ESPECIALIZADO com vasta experiência em direito penal, direito penal militar e direito administrativo disciplinar. 

SUA FUNÇÃO:
Gerar um RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR fundamentado, estruturado e técnico, usando TODOS os dados fornecidos do processo.

REGRAS FUNDAMENTAIS:
1. ANALISE cada campo do processo como relevante para a análise
2. IDENTIFIQUE crimes penais E transgressões disciplinares
3. FUNDAMENTE cada tipificação na legislação brasileira
4. CALCULE prescrições considerando a data do fato
5. DETERMINE a competência jurisdicional
6. USE linguagem formal, técnica e cite legislação aplicável

LEGISLAÇÃO APLICÁVEL:
- Código Penal (CP) - Art. 1º a 361
- Código Penal Militar (CPM) - Decreto-Lei 1.001/1969
- Lei Maria da Penha (Lei 11.340/2006)
- Estatuto da Criança e Adolescente (Lei 8.069/1990)
- Código Disciplinar da PMPE
- Lei de Drogas (Lei 11.343/2006)
- Lei de Crimes Hediondos (Lei 8.072/1990)

DADOS DO PROCESSO:
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
Status Funcional: ${statusFuncional}
Descrição dos Fatos: ${descricaoFatos}
Número SIGPAD: ${numeroSigpad}
Documentos: ${documentos && documentos.length > 0 ? documentos.join(', ') : 'Não informado'}

FORMATO OBRIGATÓRIO DO RELATÓRIO:

## CABECALHO
RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR
[Identificação completa do processo conforme dados acima]

## I – DAS PRELIMINARES
[Análise pela IA]:
- Resumo objetivo dos fatos noticiados
- Identificação de possíveis crimes ou transgressões disciplinares atribuídos aos investigados
- Tipificação legal com fundamentação detalhada
- Análise da legislação aplicável (CP/CPM) baseada no status funcional
- Cálculo da prescrição penal e administrativa considerando a data do fato
- Determinação da competência jurisdicional
- Indicação se o fato se encontra prescrito ou se a apuração deve prosseguir

## II – DOS FATOS
A presente investigação preliminar foi instaurada para apurar os fatos noticiados por meio de ${origemProcesso || '[NFND / comunicação inicial]'}, que relata que, no dia ${dataFato || '[DATA DO FATO]'}, o(s) policial(is) militar(es) ${investigados && investigados.length > 0 ? investigados.map(i => i.nome).join(', ') : '[NOME / IDENTIFICAÇÃO]'}, lotado(s) no(a) ${investigados && investigados.length > 0 ? investigados.map(i => i.unidade).join(', ') : '[UNIDADE]'}, teria(m) ${descricaoFatos || '[DESCRIÇÃO RESUMIDA DOS FATOS]'}.

[Análise complementar pela IA]:
- Identificação dos elementos do tipo penal
- Análise da autoria e materialidade
- Contextualização temporal e espacial
- Nexo de causalidade

## III – DAS DILIGÊNCIAS
Foram iniciadas diligências para esclarecimento dos fatos, conforme segue:
${Object.keys(diligenciasRealizadas || {}).length > 0 ? Object.entries(diligenciasRealizadas).filter(([_, v]) => (v as any)?.realizada).map(([k, v]) => `- ${k}${(v as any).observacao ? ': ' + (v as any).observacao : ''}`).join('\n') : '[Lista automatizada pela IA com base nas diligências realizadas]'}

Documentos providenciados:
- Ficha Funcional do(s) investigado(s)
- Extrato do SIGPAD
${documentos && documentos.length > 0 ? documentos.map(d => `- ${d}`).join('\n') : ''}

[Resumo analítico pela IA]:
- Análise dos elementos probatórios colhidos
- Identificação de testemunhas e documentos
- Avaliação da suficiência probatória
- Exposição sintética dos elementos apurados em cada documento ou etapa da investigação

## IV – DA FUNDAMENTAÇÃO
[Elaboração pela IA com base nos dados e desfecho sugerido]:
- Tipificação penal principal fundamentada
- Análise dos elementos do tipo penal
- Jurisprudência aplicável
- Nexo de causalidade
- Adequação típica
- Fundamentação legal detalhada
- Consolidação dos elementos fáticos e jurídicos da investigação
- Análise técnica fundamentada com respaldo na legislação vigente, doutrina e jurisprudência nacional
- Destaque do nexo de causalidade, existência (ou não) de autoria e materialidade
- Adequação típica conforme o enquadramento legal aplicável (CP, CPM, CPP, Código Disciplinar, Estatuto da Corporação, etc.)

## V – DA CONCLUSÃO
[Decisão orientada pela IA com justificativa]:
Considerando os elementos colhidos na presente investigação, conclua, justificadamente, por uma das seguintes providências:
- Instauração de SAD (Sindicato Administrativo Disciplinar)
- Instauração de IPM (Inquérito Policial Militar)
- Instauração de PADS (Processo Administrativo Disciplinar Sumaríssimo)
- Redistribuição para outra unidade
- Arquivamento, por ausência de elementos suficientes ou prescrição

A conclusão deve vir acompanhada da justificativa legal e técnica, considerando:
- Grau de relevância dos fatos
- Existência de indícios mínimos de autoria e materialidade
- Critérios de oportunidade e conveniência da administração pública
- Síntese conclusiva fundamentada
- Recomendações específicas

IMPORTANTE:
- Seja PRECISO e TÉCNICO
- FUNDAMENTE cada afirmação na legislação
- ANALISE o contexto completo dos fatos
- CONSIDERE tanto aspectos penais quanto disciplinares
- CALCULE prescrições corretamente
- IDENTIFIQUE a competência jurisdicional adequada

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


}; 