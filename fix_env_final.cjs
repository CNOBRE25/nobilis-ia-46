const fs = require('fs');

// Nova chave da API (a que está no documento)
const novaChave = 'sk-proj-sua-chave-aqui';

// Conteúdo correto do arquivo - UMA ÚNICA LINHA
const conteudo = `OPENAI_API_KEY=${novaChave}\nPORT=3002`;

console.log('🔧 Corrigindo arquivo .env.local FINAL...');

try {
  // Deletar o arquivo atual
  if (fs.existsSync('.env.local')) {
    fs.unlinkSync('.env.local');
    console.log('🗑️ Arquivo antigo removido');
  }
  
  // Criar novo arquivo
  fs.writeFileSync('.env.local', conteudo, 'utf8');
  console.log('✅ Arquivo .env.local criado corretamente!');
  console.log('🔑 Chave configurada:', novaChave.substring(0, 20) + '...');
  
  // Verificar se foi salvo corretamente
  const arquivoSalvo = fs.readFileSync('.env.local', 'utf8');
  console.log('📄 Conteúdo do arquivo:');
  console.log('--- INÍCIO ---');
  console.log(arquivoSalvo);
  console.log('--- FIM ---');
  
  // Testar se a chave está sendo lida corretamente
  require('dotenv').config({ path: '.env.local' });
  console.log('🔍 Chave lida pelo dotenv:', process.env.OPENAI_API_KEY ? 'SIM' : 'NÃO');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
} 