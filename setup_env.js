// Script para configurar o arquivo .env.local
const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando arquivo .env.local...');

const envContent = `# Configuração do Backend - Servidor Node.js
# Chave da API OpenAI (obrigatória para geração de relatórios)
# IMPORTANTE: Substitua 'sua_chave_api_openai_aqui' pela sua chave real da OpenAI
OPENAI_API_KEY=sua_chave_api_openai_aqui

# Configuração do servidor
PORT=3002
NODE_ENV=development

# Configuração do Supabase (se necessário)
SUPABASE_URL=sua_url_supabase
SUPABASE_ANON_KEY=sua_chave_anon_supabase

# Configurações de debug
DEBUG=true
LOG_LEVEL=info

# Configurações do Frontend (Vite)
VITE_APP_NAME=NOBILIS-IA
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_AI=true
VITE_ENABLE_REGISTRATION=true
VITE_ENABLE_PASSWORD_RESET=true
VITE_DEBUG_MODE=true
VITE_DEV_MODE=true
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('');
  console.log('📝 PRÓXIMOS PASSOS:');
  console.log('1. Abra o arquivo .env.local');
  console.log('2. Substitua "sua_chave_api_openai_aqui" pela sua chave real da OpenAI');
  console.log('3. A chave deve começar com "sk-"');
  console.log('4. Salve o arquivo');
  console.log('5. Reinicie o servidor: node server.cjs');
  console.log('');
  console.log('🔑 Para obter uma chave da OpenAI:');
  console.log('- Acesse: https://platform.openai.com/api-keys');
  console.log('- Faça login na sua conta');
  console.log('- Clique em "Create new secret key"');
  console.log('- Copie a chave gerada');
  console.log('');
  console.log('⚠️  IMPORTANTE: Nunca compartilhe sua chave da API!');
} catch (error) {
  console.error('❌ Erro ao criar arquivo .env.local:', error.message);
} 