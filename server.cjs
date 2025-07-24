require('dotenv').config({ path: '.env.local' });
console.log('DEBUG OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
const express = require('express');
const cors = require('cors');

// Importar fetch corretamente para Node.js
let fetch;
try {
  // Tentar usar fetch nativo (Node.js 18+)
  fetch = global.fetch;
} catch (error) {
  // Fallback para node-fetch
  fetch = require('node-fetch');
}

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://localhost:3023',
    'http://localhost:5177' // <--- ADICIONE ESTA LINHA
  ],
  credentials: true
}));
app.use(express.json());

// Rate limiting simples
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: 'Muitas requisições, tente novamente mais tarde.'
});
app.use('/api/openai', limiter);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

// Rota para análise de tipificação penal
app.post('/api/openai/interpretar-tipificacao', async (req, res) => {
  try {
    const { descricaoCrime, contexto } = req.body;
    
    if (!descricaoCrime) {
      return res.status(400).json({ error: 'Descrição do crime é obrigatória' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chave da API não configurada no servidor' });
    }

    console.log('🔍 Fazendo requisição para OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em direito penal brasileiro. Analise a descrição do crime fornecida e forneça uma análise jurídica estruturada e detalhada.

RESPONDA APENAS NO SEGUINTE FORMATO JSON (sem texto adicional):

{
  "tipificacao_principal": "Artigo e inciso do Código Penal",
  "fundamentacao": "Explicação detalhada da fundamentação legal",
  "tipificacoes_alternativas": ["Artigo alternativo 1", "Artigo alternativo 2"],
  "tipificacoes_disciplinares": ["Infração disciplinar 1", "Infração disciplinar 2"],
  "competencia": "Competência jurisdicional (Justiça Comum, Militar, etc.)",
  "prescricao_penal": "Data de prescrição penal (DD/MM/AAAA)",
  "prescricao_administrativa": "Data de prescrição administrativa (DD/MM/AAAA)",
  "observacoes": "Observações adicionais relevantes"
}

Seja preciso, técnico e fundamentado na legislação brasileira.`
          },
          {
            role: 'user',
            content: `Descrição do crime: ${descricaoCrime}\n\nContexto adicional: ${contexto || 'Não fornecido'}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    console.log('📡 Status da resposta OpenAI:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API OpenAI:', errorText);
      return res.status(response.status).json({ 
        error: 'Erro na API da OpenAI',
        details: errorText 
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'Resposta vazia da API' });
    }

    console.log('✅ Resposta recebida da OpenAI');

    // Tentar fazer parse do JSON
    try {
      const parsedResponse = JSON.parse(content);
      res.json(parsedResponse);
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta:', parseError);
      // Fallback: retornar resposta como texto
      res.json({
        tipificacao_principal: "Erro no processamento",
        fundamentacao: content,
        tipificacoes_alternativas: [],
        tipificacoes_disciplinares: [],
        competencia: "Não determinado",
        prescricao_penal: "Não determinado",
        prescricao_administrativa: "Não determinado",
        observacoes: "Erro no processamento da resposta da IA"
      });
    }

  } catch (error) {
    console.error('❌ Erro no servidor:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota para geração de relatório fundamentado
app.post('/api/openai/gerar-relatorio', async (req, res) => {
  try {
    const { dadosProcesso } = req.body;
    
    if (!dadosProcesso) {
      return res.status(400).json({ error: 'Dados do processo são obrigatórios' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chave da API não configurada no servidor' });
    }

    console.log('🔍 Gerando relatório com IA...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um perito jurídico especializado em elaborar relatórios de investigação fundamentados. Analise TODOS os campos do processo abaixo e elabore um relatório técnico-jurídico completo, estruturado e fundamentado, considerando cada informação fornecida. Use linguagem formal, técnica e cite a legislação e jurisprudência aplicáveis.\n\nIMPORTANTE: Considere cada campo do JSON como relevante para a análise.\n\n` +
              Object.entries(dadosProcesso).map(([k, v]) => `- ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n') +
              `\n\nFORMATO DO RELATÓRIO:\n\n1. PRELIMINARES\n   - Identificação do processo\n   - Competência jurisdicional\n   - Base legal\n\n2. DOS FATOS\n   - Narrativa cronológica dos fatos\n   - Elementos probatórios disponíveis\n\n3. DAS DILIGÊNCIAS\n   - Diligências realizadas\n   - Testemunhas ouvidas\n   - Perícias realizadas\n\n4. DA FUNDAMENTAÇÃO JURÍDICA\n   - Tipificação penal principal\n   - Fundamentação legal detalhada\n   - Jurisprudência aplicável\n   - Elementos do tipo penal\n\n5. DAS CONCLUSÕES\n   - Síntese conclusiva\n   - Recomendações\n\nSeja técnico, preciso e fundamentado na legislação brasileira.`
          },
          {
            role: 'user',
            content: `Elabore um relatório fundamentado para o seguinte processo:\n\n${JSON.stringify(dadosProcesso, null, 2)}`
          }
        ],
        max_tokens: 3000,
        temperature: 0.1,
      }),
    });

    console.log('📡 Status da resposta OpenAI:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API OpenAI:', errorText);
      return res.status(response.status).json({ 
        error: 'Erro na API da OpenAI',
        details: errorText 
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'Resposta vazia da API' });
    }

    console.log('✅ Relatório gerado com sucesso');

    res.json({ 
      relatorio: content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro no servidor:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log('📡 Endpoints disponíveis:');
  console.log('   - POST /api/openai/interpretar-tipificacao');
  console.log('   - POST /api/openai/gerar-relatorio');
  console.log('   - GET /api/health');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  ATENÇÃO: OPENAI_API_KEY não configurada!');
    console.log('💡 Configure a variável OPENAI_API_KEY no arquivo .env.local');
  } else {
    console.log('✅ OPENAI_API_KEY configurada');
  }
}); 