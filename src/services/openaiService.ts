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

class OpenAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API Key não configurada. Usando modo de simulação.');
    }
  }

  private formatPrompt(dados: RelatorioDados): string {
    return PROMPT_TEMPLATE
      .replace(/\{nome\}/g, dados.nome)
      .replace(/\{tipo_investigado\}/g, dados.tipo_investigado)
      .replace(/\{cargo\}/g, dados.cargo)
      .replace(/\{unidade\}/g, dados.unidade)
      .replace(/\{data_fato\}/g, dados.data_fato)
      .replace(/\{descricao\}/g, dados.descricao)
      .replace(/\{numero_sigpad\}/g, dados.numero_sigpad || 'A ser definido')
      .replace(/\{numero_despacho\}/g, dados.numero_despacho || 'A ser definido')
      .replace(/\{data_despacho\}/g, dados.data_despacho || 'A ser definido')
      .replace(/\{origem\}/g, dados.origem || 'Comunicação inicial')
      .replace(/\{vitima\}/g, dados.vitima || 'Não especificado')
      .replace(/\{matricula\}/g, dados.matricula || 'A ser verificado')
      .replace(/\{data_admissao\}/g, dados.data_admissao || 'A ser verificado');
  }

  private parseResponse(response: string): RelatorioIA {
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
  }

  async gerarRelatorioJuridico(dados: RelatorioDados): Promise<RelatorioIA> {
    // Modo simulação se não houver API key
    if (!this.apiKey) {
      return this.gerarRelatorioSimulado(dados);
    }

    try {
      const prompt = this.formatPrompt(dados);

      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em Direito Militar e análise jurídica de processos disciplinares e penais militares.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      return this.parseResponse(aiResponse);

    } catch (error) {
      console.error('Erro ao gerar relatório com IA:', error);
      // Fallback para modo simulado em caso de erro
      return this.gerarRelatorioSimulado(dados);
    }
  }

  private gerarRelatorioSimulado(dados: RelatorioDados): RelatorioIA {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const relatorioSimulado = `
## CABECALHO
RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR
SIGPAD nº: ${dados.numero_sigpad || '2025.01.001'}
Despacho de Instauração nº: ${dados.numero_despacho || '001/2025'}
Data do Despacho: ${dados.data_despacho || dataAtual}
Origem: ${dados.origem || 'Comunicação inicial'}
Data do Fato: ${dados.data_fato}
Vítima: ${dados.vitima || 'Estado/Administração Pública'}
Investigado: ${dados.nome}
Matrícula: ${dados.matricula || 'A ser verificado'}
Admissão: ${dados.data_admissao || 'A ser verificado'}
Lotação Atual: ${dados.unidade}

## I – DAS PRELIMINARES
Com base nos dados informados, trata-se de ocorrência envolvendo ${dados.nome}, ${dados.cargo}, lotado na ${dados.unidade}, referente aos fatos ocorridos em ${dados.data_fato}. 

A conduta descrita configura possível transgressão disciplinar e/ou crime militar, demandando análise técnica especializada conforme legislação militar vigente (Código Penal Militar - Decreto-Lei nº 1.001/69 e Regulamento Disciplinar da PM-PE - Decreto nº 11.817/86).

Considerando a data do fato (${dados.data_fato}), verifica-se que a apuração encontra-se dentro do prazo prescricional disciplinar (180 dias) e penal conforme legislação aplicável, devendo prosseguir a investigação.

## II – DOS FATOS
A presente investigação preliminar foi instaurada com a finalidade de apurar os fatos noticiados por meio da ${dados.origem || 'comunicação inicial'}, que relata que, no dia ${dados.data_fato}, o policial militar ${dados.nome}, lotado no(a) ${dados.unidade}, teria ${dados.descricao}.

Os fatos narrados sugerem conduta contrária aos deveres funcionais e ao regulamento disciplinar da corporação, demandando apuração detalhada para esclarecimento das circunstâncias e responsabilidades.

## III – DAS DILIGÊNCIAS
Foram iniciadas diligências para esclarecimento dos fatos, conforme segue:

1. Oitiva do investigado
2. Coleta de documentação funcional
3. Análise de registros disciplinares anteriores
4. Verificação de testemunhas, se houver

Documentos providenciados:
- Ficha Funcional do investigado
- Extrato do SIGPAD
- Histórico disciplinar
- Documentos relacionados ao fato

Com base nas diligências realizadas, observou-se que os elementos coletados são suficientes para o prosseguimento da apuração através do procedimento adequado.

## IV – DA FUNDAMENTAÇÃO
Os elementos fáticos e jurídicos coligidos demonstram a existência de indícios suficientes de materialidade e autoria da conduta investigada. A tipificação preliminar aponta para possível violação dos deveres funcionais previstos no Regulamento Disciplinar da PM-PE.

A legislação aplicável (Código Penal Militar, Regulamento Disciplinar e Estatuto da PM-PE) estabelece competência administrativa para apuração dos fatos, observando-se os princípios do contraditório, ampla defesa e devido processo legal.

O nexo de causalidade entre a conduta e o resultado é evidente, configurando adequação típica conforme o enquadramento legal específico a ser determinado no curso da investigação.

## V – DA CONCLUSÃO
Considerando os elementos colhidos na presente investigação preliminar, conclui-se pela necessidade de:

INSTAURAÇÃO DE SINDICÂNCIA ADMINISTRATIVA DISCIPLINAR (SAD)

Justificativa: Os fatos apurados configuram possível transgressão disciplinar de natureza leve a média, sendo adequado o procedimento de sindicância para esclarecimento completo das circunstâncias e eventual aplicação de sanção disciplinar, observando-se o princípio da proporcionalidade e os critérios de oportunidade e conveniência da administração pública.

RECIFE, ${dataAtual}
`;

    return this.parseResponse(relatorioSimulado);
  }
}

export const openaiService = new OpenAIService(); 