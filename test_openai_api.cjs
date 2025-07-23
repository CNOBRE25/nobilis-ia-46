// Script de teste para verificar a integração com a API OpenAI
// Execute com: node test_openai_api.js

// Carregar variáveis de ambiente do arquivo .env.local
require('dotenv').config({ path: '.env.local' });

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

async function testOpenAIAPI() {
  console.log('🔍 Testando integração com OpenAI API...');
  console.log('─'.repeat(50));
  
  // Verificar se a chave existe
  if (!OPENAI_API_KEY) {
    console.log('❌ Erro: Variável VITE_OPENAI_API_KEY não encontrada');
    console.log('💡 Verifique se o arquivo .env.local existe e contém a chave');
    return;
  }
  
  // Verificar se é a chave placeholder
  if (OPENAI_API_KEY === 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
    console.log('❌ Erro: Chave API ainda é placeholder');
    console.log('💡 Edite o arquivo .env.local e substitua pela sua chave real');
    console.log('📍 Localização: C:\\Users\\CRN\\Documents\\GitHub\\nobilis-ia-46\\.env.local');
    return;
  }
  
  console.log('✅ Chave API configurada:', OPENAI_API_KEY.substring(0, 20) + '...');
  
  try {
    console.log('🚀 Enviando requisição de teste...');
    
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
            content: 'Gere um relatório de investigação preliminar para um caso de lesão corporal envolvendo um policial militar. Use a estrutura oficial com cabeçalho, preliminares, fatos, diligências, fundamentação e conclusão.'
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro na API:', response.status, response.statusText);
      console.log('📄 Detalhes:', errorText);
      
      if (response.status === 401) {
        console.log('🔑 Erro 401: Chave API inválida ou expirada');
        console.log('💡 Verifique se a chave está correta em: https://platform.openai.com/api-keys');
      }
      return;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.log('❌ Resposta vazia da API');
      return;
    }

    console.log('✅ API funcionando corretamente!');
    console.log('📊 Modelo usado:', data.model);
    console.log('💰 Tokens usados:', data.usage?.total_tokens);
    console.log('📝 Resposta de exemplo:');
    console.log('─'.repeat(50));
    console.log(content.substring(0, 300) + '...');
    console.log('─'.repeat(50));
    console.log('🎉 Tudo pronto! A API está funcionando perfeitamente!');

  } catch (error) {
    console.log('❌ Erro ao testar API:', error.message);
    console.log('💡 Verifique sua conexão com a internet');
  }
}

// Executar teste
testOpenAIAPI(); 