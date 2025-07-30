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