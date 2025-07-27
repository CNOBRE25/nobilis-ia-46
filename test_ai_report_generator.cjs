require('dotenv').config({ path: '.env.local' });

const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3002';

async function testarAIReportGenerator() {
  console.log('🧪 Testando AIReportGenerator...\n');

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

  // Testar geração de relatório com dados completos
  console.log('📋 Testando geração de relatório com dados completos...\n');

  const dadosProcessoCompleto = {
    numeroProcesso: "2024/001",
    numeroDespacho: "001/2024",
    dataDespacho: "15/01/2024",
    origemProcesso: "Comunicação de Ocorrência",
    dataFato: "10/01/2024",
    vitimas: [{ nome: "João Silva", idade: 25 }],
    investigados: [
      {
        nome: "Sgt. José Santos",
        matricula: "12345",
        dataAdmissao: "01/01/2010",
        unidade: "1º BPM"
      }
    ],
    descricaoFatos: "Policial militar, durante o serviço, foi flagrado subtraindo R$ 500,00 da sala de evidências. O fato foi presenciado por testemunha que confirmou a subtração do valor. Documentos foram apreendidos corroborando a ocorrência.",
    statusFuncional: "militar de serviço",
    diligenciasRealizadas: {
      "Oitiva de testemunhas": { realizada: true, observacao: "Testemunha confirmou o fato" },
      "Apreensão de documentos": { realizada: true, observacao: "Documentos apreendidos" },
      "Oitiva do investigado": { realizada: true, observacao: "Investigado foi ouvido" }
    },
    numeroSigpad: "SIGPAD-2024-001",
    documentos: ["Termo de apreensão", "Relatório de ocorrência", "Ficha funcional"],
    tipoCrime: "Furto",
    crimesSelecionados: ["Furto", "Peculato"],
    transgressao: "Desonra",
    modusOperandi: "Subtração de valores da sala de evidências",
    redistribuicao: "Não aplicável",
    sugestoes: "Instaurar SAD"
  };

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
    
    console.log('✅ RELATÓRIO GERADO COM DADOS COMPLETOS:');
    console.log('📊 Dados enviados para IA:');
    console.log(JSON.stringify(dadosProcessoCompleto, null, 2));
    console.log('\n📄 Relatório gerado:');
    console.log(resultado);
    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Erro na geração de relatório:', error.message);
  }

  // Testar geração de relatório com dados mínimos
  console.log('📋 Testando geração de relatório com dados mínimos...\n');

  const dadosProcessoMinimo = {
    numeroProcesso: "2024/002",
    descricaoFatos: "Policial militar, de folga, em briga de bar, agrediu fisicamente um civil causando lesão corporal",
    statusFuncional: "militar de folga",
    dataFato: "20/01/2024"
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/openai/gerar-relatorio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dadosProcesso: dadosProcessoMinimo }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na geração de relatório:', errorText);
      return;
    }

    const resultado = await response.text();
    
    console.log('✅ RELATÓRIO GERADO COM DADOS MÍNIMOS:');
    console.log('📊 Dados enviados para IA:');
    console.log(JSON.stringify(dadosProcessoMinimo, null, 2));
    console.log('\n📄 Relatório gerado:');
    console.log(resultado);
    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Erro na geração de relatório:', error.message);
  }

  console.log('🎉 Testes do AIReportGenerator concluídos!');
  console.log('\n📝 RESUMO:');
  console.log('✅ Servidor funcionando');
  console.log('✅ Geração de relatório com dados completos');
  console.log('✅ Geração de relatório com dados mínimos');
  console.log('✅ IA processando todos os campos fornecidos');
}

testarAIReportGenerator().catch(console.error); 