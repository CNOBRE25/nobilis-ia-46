const fs = require('fs');

// Nova chave da API (a que está no documento)
const novaChave = 'sk-proj-sua-chave-aqui';

// Conteúdo correto do arquivo
const conteudo = `OPENAI_API_KEY=${novaChave}
PORT=3002`;

console.log('🔧 Corrigindo arquivo .env.local...');

try {
  fs.writeFileSync('.env.local', conteudo, 'utf8');
  console.log('✅ Arquivo .env.local corrigido!');
  console.log('🔑 Chave configurada:', novaChave.substring(0, 20) + '...');
  
  // Verificar se foi salvo corretamente
  const arquivoSalvo = fs.readFileSync('.env.local', 'utf8');
  console.log('📄 Conteúdo do arquivo:');
  console.log(arquivoSalvo);
  
} catch (error) {
  console.error('❌ Erro:', error.message);
} 