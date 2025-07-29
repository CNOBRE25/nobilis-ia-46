// Teste da API OpenAI
async function testOpenAI() {
  const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  
  console.log('🔍 Testando API OpenAI...');
  console.log('📋 API Key configurada:', OPENAI_API_KEY ? 'Sim' : 'Não');
  
  if (!OPENAI_API_KEY) {
    console.log('❌ API Key não encontrada. Configure VITE_OPENAI_API_KEY ou OPENAI_API_KEY');
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'Teste de conexão com a API OpenAI. Responda apenas "Conexão OK" se estiver funcionando.'
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro na API:', response.status, response.statusText);
      console.log('📄 Detalhes:', errorText);
      return;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    console.log('✅ API OpenAI funcionando!');
    console.log('📝 Resposta:', content);
    
  } catch (error) {
    console.log('❌ Erro ao testar API:', error.message);
  }
}

// Executar teste
testOpenAI(); 