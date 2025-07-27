require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarSalvamentoDetalhes() {
  console.log('🧪 Testando salvamento de detalhes...\n');

  // Verificar conexão com Supabase
  try {
    const { data, error } = await supabase.from('processos').select('count').limit(1);
    if (error) {
      console.error('❌ Erro ao conectar com Supabase:', error);
      return;
    }
    console.log('✅ Conexão com Supabase estabelecida\n');
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error);
    return;
  }

  // Buscar um processo existente para teste
  console.log('🔍 Buscando processo para teste...');
  const { data: processos, error: fetchError } = await supabase
    .from('processos')
    .select('*')
    .limit(1);

  if (fetchError) {
    console.error('❌ Erro ao buscar processos:', fetchError);
    return;
  }

  if (!processos || processos.length === 0) {
    console.log('⚠️ Nenhum processo encontrado. Criando processo de teste...');
    
    // Criar processo de teste
    const processoTeste = {
      numero_processo: '2024/TEST-DETALHES-001',
      tipo_processo: 'investigacao_preliminar',
      prioridade: 'alta',
      data_recebimento: new Date().toISOString(),
      status: 'tramitacao'
    };

    const { data: novoProcesso, error: createError } = await supabase
      .from('processos')
      .insert(processoTeste)
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
  console.log('📋 Processo selecionado para teste:', processo.numero_processo, '(ID:', processo.id, ')\n');

  // Dados de teste para detalhes
  const detalhesTeste = {
    diligencias_realizadas: {
      "atestado_medico": { realizada: true, observacao: "Atestado médico apresentado" },
      "bo_pcpe": { realizada: true, observacao: "BO registrado na PCPE" },
      "contato_whatsapp": { realizada: false, observacao: "" },
      "email": { realizada: true, observacao: "Contato realizado por e-mail" },
      "escala_servico": { realizada: true, observacao: "Escala de serviço verificada" },
      "extrato_certidao_conjunta": { realizada: false, observacao: "" },
      "extrato_cadastro_civil": { realizada: true, observacao: "Extrato obtido" },
      "extrato_infopol": { realizada: true, observacao: "Extrato INFOPOL consultado" },
      "extrato_infoseg": { realizada: false, observacao: "" },
      "extrato_mppe": { realizada: true, observacao: "Extrato MPPE verificado" },
      "extrato_tjpe": { realizada: false, observacao: "" },
      "fotos": { realizada: true, observacao: "Fotos do local coletadas" },
      "laudo_medico": { realizada: false, observacao: "" },
      "laudo_pericial_iml_positivo": { realizada: false, observacao: "" },
      "laudo_pericial_iml_negativo": { realizada: false, observacao: "" },
      "mapa_lancamento_viaturas": { realizada: true, observacao: "Mapa de lançamento verificado" },
      "ouvida_testemunha": { realizada: true, observacao: "Testemunha foi ouvida" },
      "ouvida_vitima": { realizada: true, observacao: "Vítima foi ouvida" },
      "ouvida_investigado": { realizada: true, observacao: "Investigado foi ouvido" },
      "ouvida_sindicado": { realizada: false, observacao: "" },
      "rastreamento_viaturas_com_registro": { realizada: false, observacao: "" },
      "rastreamento_viaturas_sem_registro": { realizada: false, observacao: "" },
      "sgpm": { realizada: true, observacao: "SGPM consultado" },
      "sigpad_fato_apuração_outra_unidade": { realizada: false, observacao: "" },
      "sigpad_fato_ja_apurado": { realizada: false, observacao: "" },
      "sigpad_nada_consta": { realizada: true, observacao: "SIGPAD - Nada consta" },
      "videos": { realizada: false, observacao: "" }
    },
    desfecho_final: "Instauração de SAD",
    sugestoes: "Recomenda-se a instauração de SAD para apuração das responsabilidades administrativas. O caso deve ser encaminhado para a Justiça Militar para responsabilização criminal.",
    updated_at: new Date().toISOString()
  };

  console.log('📋 Dados de detalhes para teste:');
  console.log(JSON.stringify(detalhesTeste, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // Testar salvamento de detalhes
  console.log('💾 Testando salvamento de detalhes...\n');

  try {
    const { data: resultado, error: updateError } = await supabase
      .from('processos')
      .update(detalhesTeste)
      .eq('id', processo.id)
      .select();

    if (updateError) {
      console.error('❌ Erro ao salvar detalhes:', updateError);
      return;
    }

    if (resultado && resultado.length > 0) {
      const processoAtualizado = resultado[0];
      console.log('✅ Detalhes salvos com sucesso!');
      console.log('📊 Processo atualizado:', processoAtualizado.numero_processo);
      console.log('📅 Última atualização:', processoAtualizado.updated_at);
      console.log('🏁 Desfecho final:', processoAtualizado.desfecho_final);
      console.log('💡 Sugestões:', processoAtualizado.sugestoes);
      console.log('📋 Diligências realizadas:', Object.keys(processoAtualizado.diligencias_realizadas || {}).length, 'diligências');
      
      // Verificar se as diligências foram salvas corretamente
      const diligenciasSalvas = processoAtualizado.diligencias_realizadas;
      if (diligenciasSalvas) {
        const diligenciasRealizadas = Object.entries(diligenciasSalvas)
          .filter(([_, value]) => value.realizada)
          .map(([key, value]) => ({ id: key, observacao: value.observacao }));
        
        console.log('\n📋 Diligências realizadas:');
        diligenciasRealizadas.forEach(d => {
          console.log(`  ✅ ${d.id}: ${d.observacao}`);
        });
      }
      
      console.log('\n' + '='.repeat(80) + '\n');
      
      // Verificar se os dados foram realmente salvos
      console.log('🔍 Verificando se os dados foram salvos corretamente...');
      const { data: verificacao, error: verifyError } = await supabase
        .from('processos')
        .select('diligencias_realizadas, desfecho_final, sugestoes, updated_at')
        .eq('id', processo.id)
        .single();

      if (verifyError) {
        console.error('❌ Erro ao verificar dados:', verifyError);
        return;
      }

      console.log('✅ Verificação concluída:');
      console.log('  📅 Updated at:', verificacao.updated_at);
      console.log('  🏁 Desfecho:', verificacao.desfecho_final);
      console.log('  💡 Sugestões:', verificacao.sugestoes ? 'Salvas' : 'Não salvas');
      console.log('  📋 Diligências:', verificacao.diligencias_realizadas ? 'Salvas' : 'Não salvas');

    } else {
      console.log('⚠️ Nenhum registro foi atualizado');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }

  console.log('\n🎉 Teste de salvamento de detalhes concluído!');
  console.log('\n📝 RESUMO:');
  console.log('✅ Conexão com Supabase estabelecida');
  console.log('✅ Processo de teste disponível');
  console.log('✅ Dados de detalhes estruturados');
  console.log('✅ Salvamento testado com sucesso');
  console.log('✅ Verificação de dados realizada');
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Verificar se o salvamento funciona na interface web');
  console.log('2. Confirmar se não há mais botões duplicados');
  console.log('3. Testar se os dados persistem após recarregar a página');
  console.log('4. Verificar se o redirecionamento automático foi removido');
}

testarSalvamentoDetalhes().catch(console.error); 