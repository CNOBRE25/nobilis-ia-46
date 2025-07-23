// Script para testar o status dos processos no banco de dados
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProcessosStatus() {
  console.log('🔍 Verificando status dos processos no banco de dados...\n');

  try {
    // Buscar todos os processos
    const { data: allProcesses, error: allError } = await supabase
      .from('processos')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Erro ao buscar todos os processos:', allError);
      return;
    }

    console.log(`📊 Total de processos encontrados: ${allProcesses?.length || 0}\n`);

    if (allProcesses && allProcesses.length > 0) {
      // Agrupar por status
      const statusCount = {};
      allProcesses.forEach(process => {
        statusCount[process.status] = (statusCount[process.status] || 0) + 1;
      });

      console.log('📈 Distribuição por status:');
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} processos`);
      });

      console.log('\n📋 Detalhes dos processos:');
      allProcesses.forEach((process, index) => {
        console.log(`   ${index + 1}. ${process.numero_processo} - Status: ${process.status} - Criado: ${new Date(process.created_at).toLocaleDateString('pt-BR')}`);
      });

      // Verificar processos finalizados (concluído + arquivado)
      const processosFinalizados = allProcesses.filter(p => p.status === 'concluido' || p.status === 'arquivado');
      console.log(`\n✅ Processos finalizados (concluído + arquivado): ${processosFinalizados.length}`);

      if (processosFinalizados.length > 0) {
        console.log('📋 Lista de processos finalizados:');
        processosFinalizados.forEach((process, index) => {
          console.log(`   ${index + 1}. ${process.numero_processo} - Status: ${process.status} - Desfecho: ${process.desfecho_final || 'N/A'}`);
        });
      }

    } else {
      console.log('⚠️  Nenhum processo encontrado no banco de dados.');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o teste
testProcessosStatus(); 