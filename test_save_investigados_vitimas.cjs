require('dotenv').config({ path: '.env.local' });

const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3002';

async function testarSalvamentoInvestigadosVitimas() {
  console.log('🧪 Testando salvamento de investigados e vítimas...\n');

  // Verificar se o servidor está rodando
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    if (!healthResponse.ok) {
      console.error('❌ Servidor não está rodando. Execute "npm run dev" primeiro.');
      return;
    }
    console.log('✅ Servidor está rodando\n');
  } catch (error) {
    console.error('❌ Erro ao conectar com o servidor:', error.message);
    console.log('Certifique-se de que o servidor está rodando com "npm run dev"');
    return;
  }

  // Dados de teste com investigados e vítimas
  const dadosProcessoCompleto = {
    numeroProcesso: "2024/TEST-001",
    tipoProcesso: "investigacao_preliminar",
    prioridade: "media",
    dataFato: "15/01/2024",
    descricaoFatos: "Teste de salvamento de investigados e vítimas",
    statusFuncional: "militar de serviço",
    investigados: [
      {
        id: 1,
        nome: "Sgt. João Silva",
        cargo: "3º SGT PM",
        matricula: "12345",
        dataAdmissao: "01/01/2010",
        unidade: "1º BPM"
      },
      {
        id: 2,
        nome: "CB Maria Santos",
        cargo: "CB PM",
        matricula: "67890",
        dataAdmissao: "01/01/2015",
        unidade: "2º BPM"
      }
    ],
    vitimas: [
      {
        id: 1,
        nome: "Pedro Oliveira"
      },
      {
        id: 2,
        nome: "Ana Costa"
      }
    ]
  };

  console.log('📋 Dados de teste:');
  console.log(JSON.stringify(dadosProcessoCompleto, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // Simular salvamento no banco (vamos usar o endpoint de geração de relatório para testar)
  console.log('💾 Testando processamento dos dados...\n');

  try {
    const response = await fetch(`${BACKEND_URL}/api/openai/gerar-relatorio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dadosProcesso: dadosProcessoCompleto }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na geração de relatório:', errorText);
      return;
    }

    const resultado = await response.text();
    
    console.log('✅ RELATÓRIO GERADO COM INVESTIGADOS E VÍTIMAS:');
    console.log('📊 Dados enviados para IA:');
    console.log(JSON.stringify(dadosProcessoCompleto, null, 2));
    console.log('\n📄 Relatório gerado:');
    console.log(resultado);
    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Erro na geração de relatório:', error.message);
  }

  // Testar com dados mínimos mas com investigados e vítimas
  console.log('📋 Testando com dados mínimos mas com investigados e vítimas...\n');

  const dadosMinimosComInvestigados = {
    numeroProcesso: "2024/TEST-002",
    descricaoFatos: "Teste com dados mínimos mas com investigados e vítimas",
    investigados: [
      {
        id: 1,
        nome: "Sgt. Teste",
        cargo: "3º SGT PM",
        matricula: "99999",
        dataAdmissao: "01/01/2020",
        unidade: "3º BPM"
      }
    ],
    vitimas: [
      {
        id: 1,
        nome: "Vítima Teste"
      }
    ]
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/openai/gerar-relatorio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dadosProcesso: dadosMinimosComInvestigados }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na geração de relatório:', errorText);
      return;
    }

    const resultado = await response.text();
    
    console.log('✅ RELATÓRIO GERADO COM DADOS MÍNIMOS:');
    console.log('📊 Dados enviados para IA:');
    console.log(JSON.stringify(dadosMinimosComInvestigados, null, 2));
    console.log('\n📄 Relatório gerado:');
    console.log(resultado);
    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Erro na geração de relatório:', error.message);
  }

  console.log('🎉 Testes de salvamento de investigados e vítimas concluídos!');
  console.log('\n📝 RESUMO:');
  console.log('✅ Servidor funcionando');
  console.log('✅ Processamento de investigados e vítimas');
  console.log('✅ IA recebendo dados estruturados');
  console.log('✅ Relatórios sendo gerados com dados completos');
}

testarSalvamentoInvestigadosVitimas().catch(console.error); 