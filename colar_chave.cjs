const fs = require('fs');
const path = require('path');

console.log('🔑 Colar Nova Chave da API OpenAI');
console.log('==================================');
console.log('');

// Nova chave (substitua pela sua chave real)
const novaChave = 'sk-sua_nova_chave_aqui';

if (novaChave === 'sk-sua_nova_chave_aqui') {
  console.log('❌ ERRO: Você precisa substituir a chave no script!');
  console.log('');
  console.log('💡 Como fazer:');
  console.log('   1. Abra o arquivo colar_chave.cjs');
  console.log('   2. Substitua "sk-sua_nova_chave_aqui" pela sua chave real');
  console.log('   3. Execute novamente: node colar_chave.cjs');
  console.log('');
  console.log('🔗 Obter chave em: https://platform.openai.com/account/api-keys');
  process.exit(1);
}

const envPath = path.join(__dirname, '.env.local');
const envContent = `OPENAI_API_KEY=${novaChave}
PORT=3002`;

try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Chave atualizada com sucesso!');
  console.log('🔑 Nova chave:', novaChave.substring(0, 10) + '...' + novaChave.substring(novaChave.length - 4));
  console.log('');
  console.log('🧪 Testando a nova chave...');
  
  // Testar a chave
  require('./test_openai_key.cjs');
  
} catch (error) {
  console.error('❌ Erro ao atualizar:', error.message);
} 