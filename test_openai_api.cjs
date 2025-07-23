// Teste da API OpenAI
require('dotenv').config({ path: '.env.local' });
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Função para testar a API
async function testOpenAIAPI() {
  console.log('🧪 Iniciando teste da API OpenAI...');
  
  // Verificar se a chave da API está disponível
  const apiKey = process.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ VITE_OPENAI_API_KEY não encontrada nas variáveis de ambiente');
    console.log('💡 Dica: Crie um arquivo .env.local com: VITE_OPENAI_API_KEY=sua-chave-aqui');
    return;
  }
  
  console.log('✅ Chave da API encontrada');
  console.log('🔑 Primeiros 20 caracteres da chave:', apiKey.substring(0, 20) + '...');
  
  try {
    console.log('📡 Fazendo requisição para a API OpenAI...');
    
    const response = await fetch(OPENAI_API_URL, {
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
            content: 'Você é um assistente de teste. Responda apenas "API funcionando corretamente!"'
          },
          {
            role: 'user',
            content: 'Teste simples'
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro na API:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da API recebida com sucesso!');
    console.log('🤖 Resposta:', data.choices[0]?.message?.content);
    
    return true;
  } catch (error) {
    console.log('❌ Erro ao testar API:', error.message);
    
    if (error.message.includes('401')) {
      console.log('🔐 Erro 401: Chave da API inválida ou expirada');
    } else if (error.message.includes('429')) {
      console.log('⏰ Erro 429: Limite de requisições excedido');
    } else if (error.message.includes('500')) {
      console.log('🔧 Erro 500: Problema interno da API OpenAI');
    }
    
    return false;
  }
}

// Executar o teste
testOpenAIAPI().then(success => {
  if (success) {
    console.log('🎉 Teste concluído com sucesso!');
  } else {
    console.log('💥 Teste falhou!');
  }
}); 