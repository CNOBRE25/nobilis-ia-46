const fetch = require('node-fetch');

async function testAnaliseFatos() {
  console.log('🧪 Testando análise automática de fatos...\n');

  const testData = {
    descricaoCrime: "O policial militar João Silva, lotado no 1º BPM, em serviço, no dia 15/01/2024, teria agredido fisicamente um cidadão durante abordagem, causando lesões corporais leves. O fato ocorreu durante patrulhamento na área central da cidade.",
    contexto: "Data do fato: 15/01/2024"
  };

  try {
    console.log('📤 Enviando dados para análise...');
    console.log('Descrição:', testData.descricaoCrime);
    console.log('Contexto:', testData.contexto);
    console.log('');

    const response = await fetch('http://localhost:3002/api/openai/interpretar-tipificacao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Análise concluída!\n');

    console.log('📋 RESULTADOS DA ANÁLISE:');
    console.log('='.repeat(50));
    console.log('🔍 Tipificação Principal:', data.tipificacao_principal);
    console.log('📚 Fundamentação:', data.fundamentacao);
    console.log('⚖️ Competência:', data.competencia);
    console.log('📅 Prescrição Penal:', data.prescricao_penal);
    console.log('📅 Prescrição Administrativa:', data.prescricao_administrativa);
    console.log('📝 Observações:', data.observacoes);
    
    console.log('\n🔗 Tipificações Alternativas:');
    if (data.tipificacoes_alternativas && data.tipificacoes_alternativas.length > 0) {
      data.tipificacoes_alternativas.forEach((tip, index) => {
        console.log(`  ${index + 1}. ${tip}`);
      });
    } else {
      console.log('  Nenhuma tipificação alternativa identificada');
    }

    console.log('\n⚖️ Tipificações Disciplinares:');
    if (data.tipificacoes_disciplinares && data.tipificacoes_disciplinares.length > 0) {
      data.tipificacoes_disciplinares.forEach((tip, index) => {
        console.log(`  ${index + 1}. ${tip}`);
      });
    } else {
      console.log('  Nenhuma tipificação disciplinar identificada');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar o teste
testAnaliseFatos(); 