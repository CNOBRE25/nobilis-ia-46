// Script para testar a conectividade com o backend
// Execute este script para verificar se o servidor está funcionando

const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? 'https://nobilis-ia-46.vercel.app' 
  : 'http://localhost:3002';

console.log('🔍 Testando conectividade com o backend...');
console.log('URL do Backend:', BACKEND_URL);

async function testBackendConnection() {
  try {
    // Teste 1: Verificar se o servidor está respondendo
    console.log('\n1. Testando resposta básica do servidor...');
    const response = await fetch(`${BACKEND_URL}/api/openai/gerar-relatorio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dadosProcesso: {
          nome: 'Teste',
          descricao: 'Teste de conectividade'
        }
      }),
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Servidor respondendo corretamente');
      console.log('Resposta:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Erro na resposta:', errorText);
    }

  } catch (error) {
    console.error('❌ Erro de conectividade:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Dica: O servidor pode não estar rodando. Execute:');
      console.log('   npm run server');
      console.log('   ou');
      console.log('   node server.cjs');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Dica: Verifique se a URL do backend está correta');
    }
  }
}

// Teste 2: Verificar se o servidor está rodando localmente
async function testLocalServer() {
  console.log('\n2. Testando servidor local...');
  try {
    const response = await fetch('http://localhost:3002/api/openai/gerar-relatorio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dadosProcesso: {
          nome: 'Teste Local',
          descricao: 'Teste de conectividade local'
        }
      }),
    });

    console.log('Status local:', response.status);
    
    if (response.ok) {
      console.log('✅ Servidor local funcionando');
    } else {
      console.log('❌ Servidor local com erro');
    }
  } catch (error) {
    console.log('❌ Servidor local não está rodando');
    console.log('💡 Execute: node server.cjs');
  }
}

// Executar testes
async function runTests() {
  await testBackendConnection();
  await testLocalServer();
  
  console.log('\n📋 Resumo dos testes:');
  console.log('- Verifique se o servidor está rodando');
  console.log('- Verifique se a URL do backend está correta');
  console.log('- Verifique se as variáveis de ambiente estão configuradas');
}

runTests(); 