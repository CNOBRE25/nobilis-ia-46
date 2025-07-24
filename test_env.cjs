// Script para testar se o dotenv está lendo o arquivo .env.local
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testando leitura do arquivo .env.local...');
console.log('');

console.log('📁 Conteúdo do arquivo .env.local:');
const fs = require('fs');
try {
  const content = fs.readFileSync('.env.local', 'utf8');
  console.log(content);
} catch (error) {
  console.error('❌ Erro ao ler arquivo:', error.message);
}

console.log('');
console.log('🔑 Variáveis de ambiente carregadas:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Configurada' : '❌ Não configurada');

if (process.env.OPENAI_API_KEY) {
  console.log('Chave (primeiros 10 caracteres):', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
} else {
  console.log('❌ OPENAI_API_KEY está undefined');
}

console.log('');
console.log('📋 Todas as variáveis de ambiente:');
console.log(process.env); 