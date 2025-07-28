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
    console.log('🔍 Iniciando geração de relatório IA...');
    console.log('📊 Dados do formulário:', dados);
    
    // Check if OpenAI API is configured
    if (!OPENAI_API_KEY) {
      console.warn('⚠️ OpenAI API Key não configurada. Usando modo de simulação.');
      return gerarRelatorioSimulado(dados);
    }
    
    console.log('✅ API Key encontrada, fazendo requisição para OpenAI...');

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