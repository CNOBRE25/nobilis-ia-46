const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPasswordValidation() {
  console.log('🧪 Testando validação de senha...\n');

  const testPasswords = [
    '123456', // Muito fraca
    'password', // Comum
    'Password1', // Falta caractere especial
    'Password1!', // Válida
    'Test123!@#', // Válida
    'abc123', // Muito curta
    'ABCDEFGH', // Só maiúsculas
    'abcdefgh', // Só minúsculas
    '12345678', // Só números
    '!@#$%^&*', // Só especiais
  ];

  for (const password of testPasswords) {
    try {
      console.log(`📝 Testando senha: "${password}"`);
      
      // Teste da função RPC
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('validate_password_strength', { password });

      if (rpcError) {
        console.log(`❌ Erro RPC: ${rpcError.message}`);
      } else {
        console.log(`✅ RPC Result:`, rpcResult);
      }

      // Teste de validação local
      const localValidation = validatePasswordLocally(password);
      console.log(`🔍 Validação Local:`, localValidation);
      
      console.log('---');
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
      console.log('---');
    }
  }
}

function validatePasswordLocally(password) {
  const feedback = [];
  let score = 0;

  // Check minimum length
  if (password.length < 8) {
    feedback.push('Senha deve ter pelo menos 8 caracteres');
  } else {
    score++;
  }

  // Check for uppercase
  if (!/[A-Z]/.test(password)) {
    feedback.push('Senha deve conter pelo menos uma letra maiúscula');
  } else {
    score++;
  }

  // Check for lowercase
  if (!/[a-z]/.test(password)) {
    feedback.push('Senha deve conter pelo menos uma letra minúscula');
  } else {
    score++;
  }

  // Check for numbers
  if (!/[0-9]/.test(password)) {
    feedback.push('Senha deve conter pelo menos um número');
  } else {
    score++;
  }

  // Check for special characters
  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Senha deve conter pelo menos um caractere especial');
  } else {
    score++;
  }

  // Check for common patterns
  if (/(?:password|123456|qwerty|admin)/i.test(password)) {
    feedback.push('Senha não pode conter padrões comuns');
    score--;
  }

  return {
    valid: score >= 5,
    score,
    feedback
  };
}

// Executar teste
testPasswordValidation().catch(console.error); 