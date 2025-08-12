#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Configuração do Ambiente Supabase');
console.log('=====================================\n');

// Verificar se o arquivo .env.local existe
const envLocalPath = path.join(process.cwd(), '.env.local');
const templatePath = path.join(process.cwd(), 'env.local.template');

if (!fs.existsSync(envLocalPath)) {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('📝 Criando arquivo .env.local a partir do template...\n');
  
  if (fs.existsSync(templatePath)) {
    const template = fs.readFileSync(templatePath, 'utf8');
    fs.writeFileSync(envLocalPath, template);
    console.log('✅ Arquivo .env.local criado com sucesso!');
    console.log('⚠️  IMPORTANTE: Edite o arquivo .env.local e preencha suas credenciais reais do Supabase');
  } else {
    console.log('❌ Template não encontrado. Criando arquivo básico...');
    const basicEnv = `# Configuração do Supabase
VITE_SUPABASE_URL=https://ligcnslmsybwzcmjuoli.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Configuração da OpenAI
OPENAI_API_KEY=sua_chave_openai_aqui

# Configurações da aplicação
VITE_APP_NAME=NOBILIS-IA
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
VITE_DEBUG_MODE=true`;
    
    fs.writeFileSync(envLocalPath, basicEnv);
    console.log('✅ Arquivo .env.local básico criado!');
  }
} else {
  console.log('✅ Arquivo .env.local já existe!');
}

console.log('\n📋 Próximos passos:');
console.log('1. Edite o arquivo .env.local');
console.log('2. Preencha VITE_SUPABASE_URL com sua URL do Supabase');
console.log('3. Preencha VITE_SUPABASE_ANON_KEY com sua chave anônima');
console.log('4. Reinicie o servidor de desenvolvimento');
console.log('\n🔗 Para obter suas credenciais do Supabase:');
console.log('   - Acesse: https://supabase.com/dashboard');
console.log('   - Selecione seu projeto');
console.log('   - Vá em Settings > API');
console.log('   - Copie a URL e a anon key'); 