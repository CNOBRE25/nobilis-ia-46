// Script para iniciar o servidor com verificações
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando servidor backend...');

// Verificar se o arquivo .env.local existe
const fs = require('fs');
const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ Arquivo .env.local não encontrado!');
  console.log('💡 Crie o arquivo .env.local com as seguintes variáveis:');
  console.log('   OPENAI_API_KEY=sua_chave_api_aqui');
  console.log('   PORT=3002 (opcional)');
  process.exit(1);
}

// Verificar se a chave da API está configurada
const envContent = fs.readFileSync(envPath, 'utf8');
if (!envContent.includes('OPENAI_API_KEY=')) {
  console.error('❌ OPENAI_API_KEY não encontrada no .env.local!');
  console.log('💡 Adicione sua chave da API OpenAI no arquivo .env.local');
  process.exit(1);
}

console.log('✅ Configuração verificada');

// Iniciar o servidor
const server = spawn('node', ['server.cjs'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
});

server.on('close', (code) => {
  console.log(`📴 Servidor encerrado com código: ${code}`);
});

// Capturar sinais para encerrar graciosamente
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando servidor...');
  server.kill('SIGTERM');
});

console.log('✅ Servidor iniciado na porta 3002');
console.log('🌐 Acesse: http://localhost:3002');
console.log('📝 Para testar: curl -X POST http://localhost:3002/api/openai/gerar-relatorio'); 