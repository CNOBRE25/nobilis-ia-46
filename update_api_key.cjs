const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🔑 Atualizar Chave da API OpenAI');
console.log('================================');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('📝 Cole sua nova chave da API OpenAI: ', (newApiKey) => {
  // Limpar a chave (remover espaços extras)
  const cleanApiKey = newApiKey.trim();
  
  if (!cleanApiKey.startsWith('sk-')) {
    console.log('❌ Erro: A chave da API deve começar com "sk-"');
    rl.close();
    return;
  }

  const envPath = path.join(__dirname, '.env.local');
  const envContent = `OPENAI_API_KEY=${cleanApiKey}
PORT=3002`;

  try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ Chave da API atualizada com sucesso!');
    console.log('🔑 Nova chave:', cleanApiKey.substring(0, 10) + '...' + cleanApiKey.substring(cleanApiKey.length - 4));
    console.log('\n🚀 Agora você pode executar:');
    console.log('   node server.cjs');
  } catch (error) {
    console.error('❌ Erro ao atualizar arquivo:', error.message);
  }

  rl.close();
}); 