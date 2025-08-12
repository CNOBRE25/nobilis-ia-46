#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo arquivo .env.local para incluir Supabase');
console.log('==================================================\n');

const envLocalPath = path.join(process.cwd(), '.env.local');

// Ler o arquivo atual
let currentContent = '';
if (fs.existsSync(envLocalPath)) {
  currentContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('✅ Arquivo .env.local encontrado');
} else {
  console.log('❌ Arquivo .env.local não encontrado, criando novo...');
}

// Verificar se já tem as variáveis do Supabase
if (currentContent.includes('VITE_SUPABASE_URL')) {
  console.log('⚠️  Variáveis do Supabase já existem no arquivo');
  console.log('📝 Verifique se as URLs estão corretas');
} else {
  console.log('📝 Adicionando variáveis do Supabase...');
  
  // Adicionar as variáveis do Supabase
  const supabaseVars = `

# Configuração do Supabase
VITE_SUPABASE_URL=https://ligcnslmsybwzcmjuoli.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui`;

  const newContent = currentContent + supabaseVars;
  
  try {
    fs.writeFileSync(envLocalPath, newContent);
    console.log('✅ Variáveis do Supabase adicionadas com sucesso!');
  } catch (error) {
    console.log('❌ Erro ao escrever no arquivo:', error.message);
    console.log('📝 Crie manualmente o arquivo .env.local com o seguinte conteúdo:');
    console.log('\n' + newContent);
    return;
  }
}

console.log('\n📋 Próximos passos:');
console.log('1. Edite o arquivo .env.local');
console.log('2. Substitua "sua_chave_anon_aqui" pela sua chave anônima real do Supabase');
console.log('3. Verifique se a URL está correta');
console.log('4. Reinicie o servidor de desenvolvimento');
console.log('\n🔗 Para obter suas credenciais do Supabase:');
console.log('   - Acesse: https://supabase.com/dashboard');
console.log('   - Selecione seu projeto');
console.log('   - Vá em Settings > API');
console.log('   - Copie a URL e a anon key');
console.log('\n⚠️  IMPORTANTE: A URL deve corresponder ao seu projeto atual');
console.log('   Projeto configurado: ligcnslmsybwzcmjuoli');
console.log('   Se for diferente, atualize a URL no arquivo .env.local');
