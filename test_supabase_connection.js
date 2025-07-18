// Script para testar a conexão com o Supabase
// Execute este script no navegador (F12 -> Console)

// Configuração do Supabase
const SUPABASE_URL = "https://vjxljkfspzcvhlsweqjd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqeGxqa2ZzcHpjdmhsc3dlcWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3OTg5NzEsImV4cCI6MjA2ODM3NDk3MX0.FXmp4zYbnXvPbuAyTZ9YPDWh81oFKNgBciqFeFBpZBI";

// Função para testar a conexão
async function testSupabaseConnection() {
  console.log("🔍 Testando conexão com Supabase...");
  
  try {
    // Teste 1: Verificar se consegue fazer uma requisição
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    console.log("✅ Conexão básica:", response.status === 200 ? "OK" : "ERRO");
    
    // Teste 2: Verificar se a tabela users existe
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log("✅ Tabela users:", "EXISTE");
      console.log("📊 Total de usuários:", usersData.length);
    } else {
      console.log("❌ Tabela users:", "NÃO EXISTE");
    }
    
    // Teste 3: Verificar se a tabela processos existe
    const processosResponse = await fetch(`${SUPABASE_URL}/rest/v1/processos?select=count`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (processosResponse.ok) {
      const processosData = await processosResponse.json();
      console.log("✅ Tabela processos:", "EXISTE");
      console.log("📊 Total de processos:", processosData.length);
    } else {
      console.log("❌ Tabela processos:", "NÃO EXISTE");
    }
    
    // Teste 4: Tentar inserir um usuário de teste
    const testUser = {
      auth_id: 'test-connection-id',
      username: 'test_connection',
      email: 'test@connection.com',
      role: 'user',
      nome_completo: 'Teste de Conexão',
      matricula: 'TEST001',
      cargo_funcao: 'Teste',
      ativo: true
    };
    
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    if (insertResponse.ok) {
      console.log("✅ Inserção de dados:", "FUNCIONA");
      
      // Limpar o usuário de teste
      const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?auth_id=eq.test-connection-id`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      if (deleteResponse.ok) {
        console.log("✅ Deleção de dados:", "FUNCIONA");
      }
    } else {
      const errorData = await insertResponse.json();
      console.log("❌ Inserção de dados:", "ERRO");
      console.log("🔍 Erro:", errorData);
    }
    
  } catch (error) {
    console.log("❌ Erro na conexão:", error.message);
  }
}

// Executar o teste
testSupabaseConnection();

// Função para testar diretamente no console
window.testSupabase = testSupabaseConnection; 