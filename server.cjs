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
  origin: (origin, callback) => {
    // Permite qualquer localhost (desenvolvimento)
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    }
    // Permite o domínio de produção
    else if (origin === 'https://nobilis-ia.com.br' || origin === 'http://nobilis-ia.com.br') {
      callback(null, true);
    }
    // Bloqueia outros domínios
    else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
            content: `Você é um assistente jurídico altamente qualificado, treinado com base na legislação brasileira, especializado na elaboração de relatórios de investigação preliminar para a Corregedoria da Secretaria de Defesa Social de Pernambuco.

SUA TAREFA:
Elaborar um relatório completo, técnico, bem fundamentado e com linguagem formal, seguindo EXATAMENTE o formato institucional especificado.

REGRAS OBRIGATÓRIAS:
1. Use TODOS os dados fornecidos no processo
2. Inclua TODOS os nomes, números, datas e informações específicas
3. Cite especificamente cada dado fornecido
4. Não use placeholders genéricos como "Não especificado"
5. Siga EXATAMENTE o formato das seções especificadas
6. Use linguagem jurídica formal e técnica

FORMATO OBRIGATÓRIO DO RELATÓRIO:

**RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR**

**Processo nº**: [NÚMERO ESPECÍFICO DO PROCESSO]
**Despacho de instauração nº**: [NÚMERO ESPECÍFICO DO DESPACHO], de [DATA ESPECÍFICA]
**Origem**: [ORIGEM ESPECÍFICA]
**Data do fato**: [DATA ESPECÍFICA DO FATO]
**Investigado(s)**: [NOME(S) ESPECÍFICO(S) DO(S) INVESTIGADO(S)]
**Matrícula(s)**: [MATRÍCULA(S) ESPECÍFICA(S)]
**Admissão(ões)**: [DATA(S) ESPECÍFICA(S) DE ADMISSÃO]
**Lotação(ões)**: [UNIDADE(S) ESPECÍFICA(S)]
**Vítima(s)**: [NOME(S) ESPECÍFICO(S) DA(S) VÍTIMA(S)]
**Número SIGPAD**: [NÚMERO ESPECÍFICO DO SIGPAD]
**Tipo de Crime**: [TIPO ESPECÍFICO DE CRIME]
**Crimes Selecionados**: [CRIMES ESPECÍFICOS SELECIONADOS]
**Descrição dos Fatos**: [DESCRIÇÃO ESPECÍFICA DOS FATOS]
**Diligências Realizadas**: [DILIGÊNCIAS ESPECÍFICAS REALIZADAS]
**Sugestões**: [SUGESTÕES ESPECÍFICAS]

## I – DAS PRELIMINARES
[Análise técnica da prescrição e tipificação jurídica preliminar dos fatos]

## II – DOS FATOS
[Narração clara, objetiva e fidelidade jurídica dos fatos noticiados]

## III – DAS DILIGÊNCIAS
[Relação objetiva e cronológica das diligências realizadas]

## IV – DA FUNDAMENTAÇÃO
[Fundamentação jurídica baseada nos fatos e diligências]

## V – DA CONCLUSÃO
[Conclusão formal com recomendações específicas]

IMPORTANTE: Substitua TODOS os placeholders [TEXTO] pelos dados reais fornecidos no processo. NÃO DEIXE NENHUM CAMPO EM BRANCO OU COM "Não especificado".`


          },
                    {
            role: 'user',
            content: `Elabore um relatório fundamentado e completo para o processo abaixo, seguindo rigorosamente o formato especificado.

DADOS ESPECÍFICOS DO PROCESSO QUE DEVEM SER USADOS NO RELATÓRIO:

**RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR**  
**Processo nº**: ${dadosProcesso.numeroProcesso || 'Não informado'}  
**Despacho de instauração nº**: ${dadosProcesso.numeroDespacho || 'Não informado'}, de ${dadosProcesso.dataDespacho || 'Não informado'}  
**Origem**: ${dadosProcesso.origemProcesso || 'Não informado'}  
**Data do fato**: ${dadosProcesso.dataFato || 'Não informado'}  
**Investigado(s)**: ${(dadosProcesso.investigados && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.nome).join(', ') : 'Não informado'}  
**Matrícula(s)**: ${(dadosProcesso.investigados && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.matricula).join(', ') : 'Não informado'}  
**Admissão(ões)**: ${(dadosProcesso.investigados && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.dataAdmissao || 'Não informado').join(', ') : 'Não informado'}  
**Lotação(ões)**: ${(dadosProcesso.investigados && dadosProcesso.investigados.length > 0) ? dadosProcesso.investigados.map(i => i.unidade).join(', ') : 'Não informado'}  
**Vítima(s)**: ${(dadosProcesso.vitimas && dadosProcesso.vitimas.length > 0) ? dadosProcesso.vitimas.map(v => v.nome).join(', ') : 'Não informado'}  
**Número SIGPAD**: ${dadosProcesso.numeroSigpad || 'Não informado'}  
**Tipo de Crime**: ${dadosProcesso.tipoCrime || 'Não informado'}  
**Crimes Selecionados**: ${(dadosProcesso.crimesSelecionados && dadosProcesso.crimesSelecionados.length > 0) ? dadosProcesso.crimesSelecionados.join(', ') : 'Não informado'}  
**Descrição dos Fatos**: ${dadosProcesso.descricaoFatos || 'Não informado'}  
**Diligências Realizadas**: ${JSON.stringify(dadosProcesso.diligenciasRealizadas || {})}  
**Sugestões**: ${dadosProcesso.sugestoes || 'Não informado'}  

INSTRUÇÕES OBRIGATÓRIAS:
1. COPIE EXATAMENTE o cabeçalho acima no início do seu relatório
2. Use TODOS os dados específicos listados acima
3. Cite especificamente cada nome, número, data e informação
4. NÃO use "Não informado" - use os dados reais fornecidos
5. Siga o formato das 5 seções: I – DAS PRELIMINARES, II – DOS FATOS, III – DAS DILIGÊNCIAS, IV – DA FUNDAMENTAÇÃO, V – DA CONCLUSÃO
6. Use linguagem jurídica formal e técnica

EXEMPLO DE COMO USAR OS DADOS:
- Se o processo é "2024/TESTE-001", escreva "Processo nº 2024/TESTE-001"
- Se o investigado é "Sgt. Pedro Santos", escreva "Sargento Pedro Santos"
- Se a matrícula é "12345", escreva "matrícula 12345"
- Se a unidade é "1º BPM", escreva "lotado no 1º BPM"

NÃO INVENTE DADOS. USE APENAS OS DADOS FORNECIDOS ACIMA.`
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
  
  console.log('   - POST /api/openai/gerar-relatorio');
  console.log('   - GET /api/health');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  ATENÇÃO: OPENAI_API_KEY não configurada!');
    console.log('💡 Configure a variável OPENAI_API_KEY no arquivo .env.local');
  } else {
    console.log('✅ OPENAI_API_KEY configurada');
  }
}); 