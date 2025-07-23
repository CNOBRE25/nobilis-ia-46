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
    const dados = req.body;
    
    if (!dados.descricao) {
      return res.status(400).json({ error: 'Descrição é obrigatória' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Chave da API não configurada no servidor' });
    }

    const prompt = `Você é um ANALISTA JURÍDICO MILITAR ESPECIALIZADO.

Gere um RELATÓRIO JURÍDICO COMPLETO baseado nos seguintes dados:

NOME: ${dados.nome || 'Não informado'}
CARGO: ${dados.cargo || 'Não informado'}
UNIDADE: ${dados.unidade || 'Não informado'}
DATA DO FATO: ${dados.data_fato || 'Não informado'}
TIPO DE INVESTIGADO: ${dados.tipo_investigado || 'Não informado'}
DESCRIÇÃO: ${dados.descricao}
NÚMERO SIGPAD: ${dados.numero_sigpad || 'Não informado'}
NÚMERO DESPACHO: ${dados.numero_despacho || 'Não informado'}

O relatório deve incluir:
1. RESUMO EXECUTIVO
2. ANÁLISE JURÍDICA DETALHADA
3. TIPIFICAÇÕES PENAIS APLICÁVEIS
4. RECOMENDAÇÕES
5. CONCLUSÕES

Responda em JSON com a seguinte estrutura:
{
  "resumo": "Resumo executivo do caso",
  "analise": "Análise jurídica detalhada",
  "tipificacoes": "Tipificações penais aplicáveis",
  "recomendacoes": "Recomendações para o caso",
  "conclusoes": "Conclusões finais"
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
        max_tokens: 3000
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
        resumo: 'Relatório gerado',
        analise: content,
        tipificacoes: 'Verificar análise completa',
        recomendacoes: 'Verificar análise completa',
        conclusoes: 'Verificar análise completa'
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