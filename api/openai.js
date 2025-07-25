import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fetch from 'node-fetch';

const app = express();

// Configuração do CORS
app.use(cors({
  origin: ['https://nobilis-ia-46.vercel.app', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005', 'http://localhost:3006', 'http://localhost:3023'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  }
});

app.use(limiter);
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor backend funcionando',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para interpretar tipificação
app.post('/api/openai/interpretar-tipificacao', async (req, res) => {
  try {
    const { descricaoCrime, contexto } = req.body;
    
    if (!descricaoCrime) {
      return res.status(400).json({ error: 'Descrição do crime é obrigatória' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Chave da API não configurada no servidor' });
    }

    const prompt = `Você é um ANALISTA JURÍDICO MILITAR ESPECIALIZADO em Direito Penal Militar e Direito Penal Comum.

ANALISE o seguinte fato e forneça:

1. TIPIFICAÇÃO PENAL PRINCIPAL (artigo, lei e descrição)
2. FUNDAMENTAÇÃO JURÍDICA
3. TIPIFICAÇÕES ALTERNATIVAS (se aplicável)
4. TIPIFICAÇÕES DISCIPLINARES (se aplicável)
5. DATA DA PRESCRIÇÃO (penal e administrativa)
6. COMPETÊNCIA (Justiça Militar ou Comum)
7. OBSERVAÇÕES RELEVANTES

FATO: ${descricaoCrime}
CONTEXTO: ${contexto || 'Não informado'}

Responda em JSON com a seguinte estrutura:
{
  "tipificacao": "Art. X, Lei Y - Descrição",
  "fundamentacao": "Fundamentação jurídica detalhada",
  "tipificacoesAlternativas": "Outras possíveis tipificações",
  "tipificacoesDisciplinares": "Tipificações disciplinares aplicáveis",
  "dataPrescricao": "DD/MM/AAAA",
  "dataPrescricaoAdm": "DD/MM/AAAA",
  "competencia": "Justiça Militar Estadual/Federal ou Justiça Comum",
  "observacoes": "Observações importantes"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em Direito Penal Militar. Responda sempre em JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API da OpenAI: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Tentar fazer parse do JSON
    try {
      const result = JSON.parse(content);
      res.json(result);
    } catch (parseError) {
      // Se não conseguir fazer parse, retornar como texto
      res.json({
        tipificacao: 'Análise realizada',
        fundamentacao: content,
        tipificacoesAlternativas: 'Verificar resposta completa',
        tipificacoesDisciplinares: 'Verificar resposta completa',
        dataPrescricao: 'A calcular',
        dataPrescricaoAdm: 'A calcular',
        competencia: 'A determinar',
        observacoes: 'Resposta não estruturada - verificar fundamentação'
      });
    }

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Endpoint para gerar relatório
app.post('/api/openai/gerar-relatorio', async (req, res) => {
  try {
    const dadosProcesso = req.body.dadosProcesso || req.body;

    // Extrair campos principais do input_schema
    const tipo_servico = dadosProcesso.tipo_servico || dadosProcesso.statusFuncional || dadosProcesso.status_funcional || 'Não se aplica';
    const descricao_fato = dadosProcesso.descricaoFatos || dadosProcesso.descricao_fato || dadosProcesso.descricao_fato || dadosProcesso.descricao || '';
    const data_fato = dadosProcesso.dataFato || dadosProcesso.data_fato || '';

    if (!descricao_fato) {
      return res.status(400).json({ error: 'Descrição do fato é obrigatória' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Chave da API não configurada no servidor' });
    }

    // Novo modelo: system prompt com template preenchido, user prompt com dados fornecidos
    const system_prompt = `Você é um jurista especialista em Direito brasileiro, com domínio avançado em Direito Penal Militar, Direito Penal Comum, Direito Civil, Direito Administrativo e Processo Disciplinar Militar.

A partir dos dados fornecidos, você deverá elaborar um RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR, de forma estruturada, técnica e fundamentada, conforme o seguinte modelo:

RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR

PROCESSO nº ${dadosProcesso.numeroProcesso || dadosProcesso.numero_processo || ''}
Despacho de Instauração nº ${dadosProcesso.numeroDespacho || dadosProcesso.numero_despacho || ''}
Data do Despacho: ${dadosProcesso.dataDespacho || dadosProcesso.data_despacho || ''}
Origem: ${dadosProcesso.origemProcesso || dadosProcesso.origem_processo || ''}
Data do Fato: ${dadosProcesso.dataFato || dadosProcesso.data_fato || ''}
Vítima: ${(Array.isArray(dadosProcesso.vitimas) && dadosProcesso.vitimas.length > 0) ? dadosProcesso.vitimas.map(v => v.nome).join(', ') : (dadosProcesso.vitima || 'Não informado')}
Investigado: ${(Array.isArray(dadosProcesso.investigados) && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.nome).join(', ') : (dadosProcesso.investigado || 'Não informado')}
Matrícula: ${(Array.isArray(dadosProcesso.investigados) && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.matricula).join(', ') : (dadosProcesso.matricula || 'Não informado')}
Admissão: ${(Array.isArray(dadosProcesso.investigados) && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.dataAdmissao || 'Não informado').join(', ') : (dadosProcesso.admissao || 'Não informado')}
Lotação Atual: ${(Array.isArray(dadosProcesso.investigados) && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.unidade).join(', ') : (dadosProcesso.lotacao_atual || 'Não informado')}

I – DAS PRELIMINARES  
[Aqui você deverá analisar os fatos, identificar possíveis crimes ou transgressões com tipificação legal aplicável – CPM, CP, Código Disciplinar, etc. – e calcular a prescrição com base na data do fato.]

II – DOS FATOS  
[Gerar narrativa automática a partir da descrição do fato informada, contextualizando local, data, agente, unidade, etc.]

III – DAS DILIGÊNCIAS  
[Listar diligências fictícias ou sugeridas com base na investigação: coleta de documentos, fichas, depoimentos, etc.]

IV – DA FUNDAMENTAÇÃO  
[Análise técnica: autoria, materialidade, nexo de causalidade, aplicação da legislação, doutrina e jurisprudência.]

V – DA CONCLUSÃO  
[Sugerir medida: Instauração de IPM, SAD, arquivamento, etc., com justificativa legal.]

RECIFE, ${(new Date()).toLocaleDateString('pt-BR')}
`;

    // Prompt do usuário: apenas os dados fornecidos
    const user_prompt = `Dados fornecidos:\n\nPROCESSO nº: ${dadosProcesso.numeroProcesso || dadosProcesso.numero_processo || ''}\nDespacho de Instauração nº: ${dadosProcesso.numeroDespacho || dadosProcesso.numero_despacho || ''}\nData do Despacho: ${dadosProcesso.dataDespacho || dadosProcesso.data_despacho || ''}\nOrigem: ${dadosProcesso.origemProcesso || dadosProcesso.origem_processo || ''}\nData do Fato: ${dadosProcesso.dataFato || dadosProcesso.data_fato || ''}\nVítima: ${(Array.isArray(dadosProcesso.vitimas) && dadosProcesso.vitimas.length > 0) ? dadosProcesso.vitimas.map(v => v.nome).join(', ') : (dadosProcesso.vitima || 'Não informado')}\nInvestigado: ${(Array.isArray(dadosProcesso.investigados) && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.nome).join(', ') : (dadosProcesso.investigado || 'Não informado')}\nMatrícula: ${(Array.isArray(dadosProcesso.investigados) && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.matricula).join(', ') : (dadosProcesso.matricula || 'Não informado')}\nAdmissão: ${(Array.isArray(dadosProcesso.investigados) && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.dataAdmissao || 'Não informado').join(', ') : (dadosProcesso.admissao || 'Não informado')}\nLotação Atual: ${(Array.isArray(dadosProcesso.investigados) && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.unidade).join(', ') : (dadosProcesso.lotacao_atual || 'Não informado')}\nMeio de origem: ${dadosProcesso.meio_origem || ''}\nDescrição resumida dos fatos: ${dadosProcesso.descricaoFatos || dadosProcesso.descricao_fato || dadosProcesso.descricao || ''}\nData atual: ${(new Date()).toLocaleDateString('pt-BR')}\n`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: system_prompt
          },
          {
            role: 'user',
            content: user_prompt
          }
        ],
        temperature: 0.2,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 3500
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API da OpenAI: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Tentar fazer parse do JSON
    try {
      const result = JSON.parse(content);
      res.json(result);
    } catch (parseError) {
      // Se não conseguir fazer parse, retornar como texto
      res.json({
        resultado: content,
        observacoes: 'Resposta não estruturada - verificar análise completa'
      });
    }

  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

export default app; 