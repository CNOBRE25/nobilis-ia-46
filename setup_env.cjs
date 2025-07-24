const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando ambiente...');

const envPath = path.join(__dirname, '.env.local');
const apiKey = 'skprojEv2kxUhqVO12ffbrt5l9VcnGLu6GViYoycIG6AWTneIy5SM2Cpu4zaCOU3Qe1lm16Wd7sbkdx';

const envContent = `OPENAI_API_KEY=${apiKey}
PORT=3002`;

try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('📁 Caminho:', envPath);
  console.log('🔑 Chave da API configurada');
} catch (error) {
  console.error('❌ Erro ao criar arquivo .env.local:', error.message);
  console.log('💡 Tente criar manualmente o arquivo .env.local com:');
  console.log('   OPENAI_API_KEY=' + apiKey);
}

console.log('\n🚀 Agora você pode executar:');
console.log('   node server.cjs'); 