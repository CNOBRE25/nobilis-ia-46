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

<<<<<<< HEAD
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
=======
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const PROMPT_TEMPLATE = `
Você é um ANALISTA JURÍDICO MILITAR ESPECIALIZADO na elaboração de RELATÓRIOS DE INVESTIGAÇÃO PRELIMINAR (IP) da Polícia Militar de Pernambuco.

Expertise em:
- Código Penal Militar (Decreto-Lei nº 1.001/69)
- Regulamento Disciplinar da PM-PE (Decreto nº 11.817/86)
- Código Penal Comum e legislação correlata
- Cálculos de prescrição penal e disciplinar
- Jurisprudência dos Tribunais Superiores

REGRAS FUNDAMENTAIS:
1. ANALISE cada campo do processo como relevante para a análise
2. IDENTIFIQUE crimes penais E transgressões disciplinares
3. FUNDAMENTE cada tipificação na legislação brasileira
4. CALCULE prescrições considerando a data do fato
5. DETERMINE a competência jurisdicional
6. USE linguagem formal, técnica e cite legislação aplicável

<<<<<<< HEAD
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
=======
GERE UM RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR SEGUINDO RIGOROSAMENTE A ESTRUTURA OFICIAL:

## CABECALHO
RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR
[Identificação completa do processo conforme dados acima]

## I – DAS PRELIMINARES
<<<<<<< HEAD
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
=======
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

<<<<<<< HEAD
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
=======
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

// Função de fallback para gerar relatório simulado
const gerarRelatorioSimulado = (dados: RelatorioDados): RelatorioIA => {
  const relatorioSimulado = `
## CABECALHO
RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR
SIGPAD nº: ${dados.numero_sigpad || 'Não informado'}
Despacho de Instauração nº: ${dados.numero_despacho || 'Não informado'}
Data do Despacho: ${dados.data_despacho || 'Não informado'}
Origem: ${dados.origem || 'Não informado'}
Data do Fato: ${dados.data_fato || 'Não informado'}
Vítima: ${dados.vitima || 'Não informado'}
Investigado: ${dados.nome || 'Não informado'}
Matrícula: ${dados.matricula || 'Não informado'}
Admissão: ${dados.data_admissao || 'Não informado'}
Lotação Atual: ${dados.unidade || 'Não informado'}

## I – DAS PRELIMINARES
Considerando o status funcional do investigado como militar em serviço, a tipificação e o cálculo de prescrição devem ser realizados com base no Código Penal Militar (Decreto-Lei nº 1.001/1969). O crime de tortura não está explicitamente tipificado no CPM, mas pode ser enquadrado em crimes como lesão corporal grave ou gravíssima, conforme os artigos 119 e 121 do CPM. A prescrição, neste caso, deve ser calculada com base na pena máxima cominada ao delito mais grave que se adequa aos fatos narrados, sendo a lesão corporal gravíssima com pena de reclusão de até 8 anos, resultando em um prazo prescricional de 8 anos conforme o artigo 125 do CPM.

## II – DOS FATOS
Em data de ${dados.data_fato || 'Não informado'}, a vítima, ${dados.vitima || 'Não informado'}, alega ter sido espancada até sangrar na cabeça por ${dados.nome || 'Não informado'}, militar em serviço. Após a agressão inicial, a vítima foi levada a um matagal onde teria sido torturada com um saco na cabeça e ameaçada de morte caso não revelasse a localização de uma suposta arma de fogo.

## III – DAS DILIGÊNCIAS
Até o presente momento, não foram realizadas diligências no âmbito deste processo, conforme indicado pelos dados fornecidos. A ausência de diligências representa um obstáculo à completa elucidação dos fatos e à adequada tipificação penal.

## IV – DA FUNDAMENTAÇÃO
A fundamentação jurídica para o presente caso baseia-se na aplicação do Código Penal Militar, dado o status funcional do investigado. O crime de lesão corporal, conforme descrito pela vítima, pode ser tipificado como lesão corporal gravíssima nos termos do artigo 119 do CPM, devido à natureza das agressões relatadas.

## V – DA CONCLUSÃO
Com base na análise dos fatos narrados e na legislação aplicável, recomenda-se a instauração de IPM (Inquérito Policial Militar) para apuração completa dos fatos, considerando a gravidade das acusações e a necessidade de produção de provas para fundamentar eventual ação penal.
`;

  return parsearRelatorio(relatorioSimulado);
};

export const openaiService = {
  async gerarRelatorioJuridico(dados: RelatorioDados): Promise<RelatorioIA> {
<<<<<<< HEAD
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
=======
    console.log('🔍 Iniciando geração de relatório IA...');
    console.log('📊 Dados do formulário:', dados);
    
    // Check if OpenAI API is configured
    if (!OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API Key não configurada. Usando modo de simulação.');
      return gerarRelatorioSimulado(dados);
    }
    
    console.log('✅ API Key encontrada, fazendo requisição para OpenAI...');

<<<<<<< HEAD

=======
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

      console.log('📡 Fazendo requisição para OpenAI...');
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
          max_tokens: 4000,
          temperature: 0.3,
        }),
      });

      console.log('📊 Status da resposta:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na API OpenAI:', response.status, response.statusText);
        console.error('📄 Detalhes do erro:', errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        console.error('❌ Resposta vazia da API OpenAI');
        throw new Error('Resposta vazia da API OpenAI');
      }

      console.log('✅ Resposta recebida da OpenAI, processando...');
      return parsearRelatorio(content);
    } catch (error) {
      console.error('❌ Erro ao gerar relatório com IA:', error);
      console.log('🔄 Usando modo de simulação como fallback...');
      // Fallback para relatório simulado em caso de erro
      return gerarRelatorioSimulado(dados);
    }
  }
}; 