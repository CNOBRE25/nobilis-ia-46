require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarDesfechoFinal() {
  console.log('🧪 Testando salvamento do desfecho final...\n');

  try {
    // 1. Buscar um processo existente
    console.log('📋 Buscando processo existente...');
    const { data: processos, error: fetchError } = await supabase
      .from('processos')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Erro ao buscar processos:', fetchError);
      return;
    }

    if (!processos || processos.length === 0) {
      console.log('⚠️ Nenhum processo encontrado. Criando um processo de teste...');
      
      // Criar um processo de teste
      const { data: novoProcesso, error: createError } = await supabase
        .from('processos')
        .insert({
          numero_processo: 'TESTE-DESFECHO-2024/001',
          numero_despacho: 'DESP-TESTE-001',
          data_despacho: '2024-01-20',
          origem_processo: 'NFND - Teste',
          data_fato: '2024-01-15',
          descricao_fatos: 'Processo de teste para verificar desfecho final',
          status_funcional: 'militar de serviço',
          status: 'tramitacao'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar processo de teste:', createError);
        return;
      }

      console.log('✅ Processo de teste criado:', novoProcesso.id);
      processos[0] = novoProcesso;
    }

    const processo = processos[0];
    console.log('📄 Processo encontrado:', {
      id: processo.id,
      numero_processo: processo.numero_processo,
      desfecho_final_atual: processo.desfecho_final
    });

    // 2. Testar atualização do desfecho final
    console.log('\n🔄 Testando atualização do desfecho final...');
    
    const novoDesfecho = 'Instauração de SAD';
    const updateData = {
      desfecho_final: novoDesfecho,
      diligencias_realizadas: { teste: { realizada: true, observacao: 'Teste de diligência' } },
      sugestoes: 'Sugestão de teste para verificar salvamento',
      updated_at: new Date().toISOString()
    };

    console.log('📝 Dados para atualizar:', updateData);

    const { data: processoAtualizado, error: updateError } = await supabase
      .from('processos')
      .update(updateData)
      .eq('id', processo.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar processo:', updateError);
      return;
    }

    console.log('✅ Processo atualizado com sucesso!');
    console.log('📊 Dados atualizados:', {
      id: processoAtualizado.id,
      numero_processo: processoAtualizado.numero_processo,
      desfecho_final: processoAtualizado.desfecho_final,
      diligencias_realizadas: processoAtualizado.diligencias_realizadas,
      sugestoes: processoAtualizado.sugestoes,
      updated_at: processoAtualizado.updated_at
    });

    // 3. Verificar se os dados foram salvos corretamente
    console.log('\n🔍 Verificando se os dados foram salvos corretamente...');
    
    const { data: processoVerificado, error: verifyError } = await supabase
      .from('processos')
      .select('*')
      .eq('id', processo.id)
      .single();

    if (verifyError) {
      console.error('❌ Erro ao verificar processo:', verifyError);
      return;
    }

    console.log('✅ Verificação concluída!');
    console.log('📋 Dados finais do processo:', {
      id: processoVerificado.id,
      numero_processo: processoVerificado.numero_processo,
      desfecho_final: processoVerificado.desfecho_final,
      diligencias_realizadas: processoVerificado.diligencias_realizadas,
      sugestoes: processoVerificado.sugestoes,
      updated_at: processoVerificado.updated_at
    });

    // 4. Verificar se o desfecho final foi salvo corretamente
    if (processoVerificado.desfecho_final === novoDesfecho) {
      console.log('\n🎉 SUCESSO: Desfecho final foi salvo corretamente!');
    } else {
      console.log('\n❌ ERRO: Desfecho final não foi salvo corretamente!');
      console.log('Esperado:', novoDesfecho);
      console.log('Encontrado:', processoVerificado.desfecho_final);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarDesfechoFinal(); 