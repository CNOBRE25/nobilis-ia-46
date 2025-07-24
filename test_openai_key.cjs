require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.OPENAI_API_KEY;

console.log('🔍 Testando configuração da API OpenAI...');
console.log('📋 Chave da API configurada:', apiKey ? 'Sim' : 'Não');

if (!apiKey) {
  console.log('❌ ERRO: OPENAI_API_KEY não encontrada no .env.local');
  console.log('💡 Solução:');
  console.log('   1. Acesse: https://platform.openai.com/account/api-keys');
  console.log('   2. Crie uma nova chave da API');
  console.log('   3. Adicione no arquivo .env.local:');
  console.log('      OPENAI_API_KEY=sua_chave_aqui');
  process.exit(1);
}

console.log('🔑 Chave da API:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));

// Testar a chave fazendo uma requisição simples
async function testOpenAIKey() {
  try {
    console.log('\n🧪 Testando conectividade com OpenAI...');
    
    let fetch;
    try {
      fetch = global.fetch;
    } catch (error) {
      fetch = require('node-fetch');
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Status da resposta:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chave da API válida!');
      console.log('📊 Modelos disponíveis:', data.data.length);
      console.log('🎯 Modelos principais:');
      data.data.slice(0, 5).forEach(model => {
        console.log(`   - ${model.id}`);
      });
    } else {
      const errorText = await response.text();
      console.log('❌ Erro na API:', errorText);
      
      if (errorText.includes('invalid_api_key')) {
        console.log('\n💡 A chave da API parece ser inválida.');
        console.log('🔧 Soluções possíveis:');
        console.log('   1. Verifique se a chave está correta');
        console.log('   2. Verifique se a chave não expirou');
        console.log('   3. Verifique se você tem créditos na conta');
        console.log('   4. Crie uma nova chave em: https://platform.openai.com/account/api-keys');
      }
    }

  } catch (error) {
    console.error('❌ Erro de conectividade:', error.message);
  }
}

testOpenAIKey(); 