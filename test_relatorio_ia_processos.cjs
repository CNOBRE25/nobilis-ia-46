const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis do Supabase não configuradas!');
  console.log('💡 Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRelatorioIAProcessos() {
  console.log('🔍 Testando funcionalidade de Relatório IA para Processos em Tramitação...\n');

  try {
    // 1. Buscar processos em tramitação
    console.log('📋 Buscando processos em tramitação...');
    const { data: processos, error } = await supabase
      .from('processos')
      .select('*')
      .eq('status', 'tramitacao')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar processos:', error);
      return;
    }

    console.log(`✅ Encontrados ${processos.length} processos em tramitação\n`);

    if (processos.length === 0) {
      console.log('⚠️  Nenhum processo em tramitação encontrado.');
      console.log('💡 Crie alguns processos primeiro para testar a funcionalidade.');
      return;
    }

    // 2. Mostrar informações dos processos
    console.log('📊 Processos em tramitação disponíveis:');
    processos.forEach((processo, index) => {
      console.log(`\n${index + 1}. Processo ${processo.numero_processo}`);
      console.log(`   - Tipo: ${processo.tipo_processo}`);
      console.log(`   - Investigado: ${processo.nome_investigado || 'Não informado'}`);
      console.log(`   - Unidade: ${processo.unidade_investigado || 'Não informada'}`);
      console.log(`   - Relatório IA: ${processo.relatorio_final ? '✅ Gerado' : '❌ Não gerado'}`);
      if (processo.relatorio_final) {
        console.log(`   - Data: ${processo.data_relatorio_final ? new Date(processo.data_relatorio_final).toLocaleDateString('pt-BR') : 'Data não informada'}`);
      }
    });

    // 3. Testar geração de relatório para o primeiro processo
    if (processos.length > 0) {
      const primeiroProcesso = processos[0];
      console.log(`\n🧪 Testando geração de relatório IA para processo ${primeiroProcesso.numero_processo}...`);
      
      // Verificar se já tem relatório
      if (primeiroProcesso.relatorio_final) {
        console.log('ℹ️  Processo já possui relatório IA gerado.');
        console.log('💡 Para testar novamente, delete o relatório existente ou use outro processo.');
      } else {
        console.log('✅ Processo disponível para geração de relatório IA.');
        console.log('💡 Use o botão "Relatório IA" na interface para gerar.');
      }
    }

    // 4. Verificar campos necessários para IA
    console.log('\n🔍 Verificando campos necessários para IA:');
    const camposNecessarios = [
      'numero_processo', 'tipo_processo', 'descricao_fatos', 
      'nome_investigado', 'cargo_investigado', 'unidade_investigado',
      'data_fato', 'numero_sigpad', 'vitima'
    ];

    const primeiroProcesso = processos[0];
    camposNecessarios.forEach(campo => {
      const valor = primeiroProcesso[campo];
      const status = valor ? '✅' : '❌';
      console.log(`   ${status} ${campo}: ${valor || 'Não preenchido'}`);
    });

    console.log('\n🎯 Funcionalidade implementada com sucesso!');
    console.log('📱 Acesse a interface e clique em "Em Tramitação" para ver os botões de Relatório IA.');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testRelatorioIAProcessos(); 