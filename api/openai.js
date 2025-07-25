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
    
    if (!dadosProcesso.descricao && !dadosProcesso.descricaoFatos && !dadosProcesso.descricao_fatos) {
      return res.status(400).json({ error: 'Descrição é obrigatória' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Chave da API não configurada no servidor' });
    }

    // Novo prompt detalhado
    const prompt = `Você é um ANALISTA JURÍDICO MILITAR ESPECIALIZADO.\n\nAnalise o(s) seguinte(s) processo(s) e gere um RELATÓRIO JURÍDICO COMPLETO, considerando:\n\n1. O status do serviço do(s) acusado(s) no momento do fato (em serviço, de folga, policial civil, policial penal, etc).\n2. O contexto do fato e a função/cargo de cada investigado.\n3. A legislação pertinente (CPM, CP, Estatuto, Código Disciplinar, etc), conforme o status do serviço e o tipo de agente.\n4. Identifique todos os crimes e/ou transgressões disciplinares atribuíveis, com a devida tipificação legal.\n5. Calcule a prescrição penal e administrativa de cada crime/transgressão, com base na data do fato.\n6. Indique a competência (Justiça Militar Estadual/Federal ou Justiça Comum) para cada conduta.\n7. Estruture a resposta em JSON, incluindo para cada investigado:\n   - Nome\n   - Cargo/função\n   - Status do serviço no momento do fato\n   - Crimes/transgressões identificados (com artigo e lei)\n   - Fundamentação jurídica\n   - Data da prescrição penal\n   - Data da prescrição administrativa\n   - Competência\n   - Observações relevantes\n\nDADOS DO PROCESSO:\n${JSON.stringify(dadosProcesso, null, 2)}\n\nResponda em JSON com a seguinte estrutura:\n{\n  "investigados": [\n    {\n      "nome": "",\n      "cargo": "",\n      "status_servico": "",\n      "crimes": [\n        {\n          "descricao": "",\n          "artigo": "",\n          "lei": "",\n          "fundamentacao": "",\n          "prescricao_penal": "",\n          "prescricao_administrativa": "",\n          "competencia": "",\n          "observacoes": ""\n        }\n      ]\n    }\n  ],\n  "analise_geral": "",\n  "recomendacoes": "",\n  "conclusoes": ""\n}`;

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
        analise_geral: 'Relatório gerado',
        detalhes: content,
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