export interface RelatorioDados {
  nome: string;
  tipo_investigado: string;
  cargo: string;
  unidade: string;
  data_fato: string;
  descricao: string;
}

export interface RelatorioIA {
  descricao_sucinta: string;
  fundamentacao_legal: string;
  conclusao: string;
  tipificacao_penal: string;
  providencias_sugeridas: string;
  raw_response: string;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const PROMPT_TEMPLATE = `
Você é um analista jurídico especializado no Código Penal Militar e legislação disciplinar.
Com base nos dados abaixo, gere um **relatório técnico fundamentado**, com:
- descrição sucinta
- fundamentação legal (arts. do CPM/CP)
- conclusão com tipificação penal e sugerindo providências.

Dados:
Nome: {nome}
Tipo: {tipo_investigado}
Cargo: {cargo}
Unidade: {unidade}
Data: {data_fato}
Fatos: {descricao}

ESTRUTURA OBRIGATÓRIA DO RELATÓRIO:

## DESCRIÇÃO SUCINTA
[Resumo objetivo dos fatos em 2-3 parágrafos]

## FUNDAMENTAÇÃO LEGAL
[Artigos específicos do CPM, Regulamento Disciplinar e outras normas aplicáveis]

## CONCLUSÃO
[Análise jurídica detalhada]

## TIPIFICAÇÃO PENAL
[Crime(s) identificado(s) com artigos específicos]

## PROVIDÊNCIAS SUGERIDAS
[Recomendações de encaminhamento]

Seja preciso, técnico e use linguagem jurídica adequada. Cite artigos específicos do Código Penal Militar quando aplicável.
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
      .replace('{nome}', dados.nome)
      .replace('{tipo_investigado}', dados.tipo_investigado)
      .replace('{cargo}', dados.cargo)
      .replace('{unidade}', dados.unidade)
      .replace('{data_fato}', dados.data_fato)
      .replace('{descricao}', dados.descricao);
  }

  private parseResponse(response: string): RelatorioIA {
    // Extrair seções do relatório usando regex
    const extrairSecao = (texto: string, titulo: string): string => {
      const regex = new RegExp(`##\\s*${titulo}[\\s\\S]*?\\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
      const match = texto.match(regex);
      return match ? match[1].trim() : 'Não especificado';
    };

    return {
      descricao_sucinta: extrairSecao(response, 'DESCRIÇÃO SUCINTA'),
      fundamentacao_legal: extrairSecao(response, 'FUNDAMENTAÇÃO LEGAL'),
      conclusao: extrairSecao(response, 'CONCLUSÃO'),
      tipificacao_penal: extrairSecao(response, 'TIPIFICAÇÃO PENAL'),
      providencias_sugeridas: extrairSecao(response, 'PROVIDÊNCIAS SUGERIDAS'),
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
    const relatorioSimulado = `
## DESCRIÇÃO SUCINTA
Com base nos dados informados, trata-se de ocorrência envolvendo ${dados.nome}, ${dados.cargo}, lotado na ${dados.unidade}, referente aos fatos ocorridos em ${dados.data_fato}. A situação caracteriza ${dados.tipo_investigado} que demanda análise técnica especializada conforme legislação militar vigente.

## FUNDAMENTAÇÃO LEGAL
- Código Penal Militar (Decreto-Lei nº 1.001/69)
- Regulamento Disciplinar da Polícia Militar (Decreto nº 11.817/86-PE)
- Lei nº 6.425/72 (Estatuto dos Policiais Militares de PE)
- Artigos aplicáveis conforme tipificação específica

## CONCLUSÃO
A análise dos fatos apresentados indica a necessidade de aprofundamento investigativo para determinação precisa da tipificação penal/disciplinar. Os elementos coletados sugerem configuração de transgressão disciplinar ou crime militar, dependendo da gravidade e circunstâncias específicas.

## TIPIFICAÇÃO PENAL
Sujeito à análise detalhada dos fatos específicos. Possível enquadramento em:
- Transgressão disciplinar (RDPM)
- Crime militar específico (CPM)

## PROVIDÊNCIAS SUGERIDAS
1. Instauração de procedimento administrativo disciplinar
2. Oitiva de testemunhas e coleta de provas
3. Análise pela Assessoria Jurídica
4. Encaminhamento conforme gravidade apurada
`;

    return this.parseResponse(relatorioSimulado);
  }
}

export const openaiService = new OpenAIService(); 