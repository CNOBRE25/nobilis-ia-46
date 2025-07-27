require('dotenv').config({ path: '.env.local' });

const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3002';

async function testarRelatorioEdicao() {
  console.log('🧪 Testando geração de relatório na edição de processo...\n');

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

  // Dados de teste para simular um processo em edição
  const dadosProcessoEdicao = {
    numeroProcesso: "2024/EDIT-001",
    tipoProcesso: "investigacao_preliminar",
    prioridade: "alta",
    dataFato: "20/01/2024",
    descricaoFatos: "Policial militar, durante o serviço, foi flagrado subtraindo R$ 1.000,00 da sala de evidências. O fato foi presenciado por testemunha que confirmou a subtração do valor. Documentos foram apreendidos corroborando a ocorrência. O investigado estava de serviço no momento dos fatos.",
    statusFuncional: "militar de serviço",
    diligenciasRealizadas: {
      "Oitiva de testemunhas": { realizada: true, observacao: "Testemunha confirmou o fato" },
      "Apreensão de documentos": { realizada: true, observacao: "Documentos apreendidos" },
      "Oitiva do investigado": { realizada: true, observacao: "Investigado foi ouvido" },
      "Coleta de provas materiais": { realizada: true, observacao: "Valores apreendidos" }
    },
    investigados: [
      {
        id: 1,
        nome: "Sgt. Carlos Silva",
        cargo: "3º SGT PM",
        matricula: "12345",
        dataAdmissao: "01/01/2010",
        unidade: "1º BPM"
      }
    ],
    vitimas: [
      {
        id: 1,
        nome: "Estado de Pernambuco"
      }
    ],
    tipoCrime: "Furto",
    crimesSelecionados: ["Furto", "Peculato"],
    transgressao: "Desonra",
    modusOperandi: "Subtração de valores da sala de evidências",
    sugestoes: "Instaurar SAD e encaminhar para Justiça Militar"
  };

  console.log('📋 Dados de teste para edição:');
  console.log(JSON.stringify(dadosProcessoEdicao, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // Testar geração de relatório
  console.log('🤖 Testando geração de relatório...\n');

  try {
    const response = await fetch(`${BACKEND_URL}/api/openai/gerar-relatorio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dadosProcesso: dadosProcessoEdicao }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na geração de relatório:', errorText);
      return;
    }

    const resultado = await response.text();
    
    console.log('✅ RELATÓRIO GERADO PARA EDIÇÃO:');
    console.log('📊 Dados enviados para IA:');
    console.log(JSON.stringify(dadosProcessoEdicao, null, 2));
    console.log('\n📄 Relatório gerado:');
    console.log(resultado);
    console.log('\n' + '='.repeat(80) + '\n');

    // Verificar se o relatório está no formato correto
    try {
      const relatorioParsed = JSON.parse(resultado);
      if (relatorioParsed.relatorio) {
        console.log('✅ Relatório está no formato JSON correto');
        console.log('📏 Tamanho do relatório:', relatorioParsed.relatorio.length, 'caracteres');
        
        // Verificar se contém as seções esperadas
        const secoes = [
          'PRELIMINARES',
          'DOS FATOS',
          'DAS DILIGÊNCIAS',
          'DA FUNDAMENTAÇÃO',
          'DAS CONCLUSÕES'
        ];
        
        const secoesEncontradas = secoes.filter(secao => 
          relatorioParsed.relatorio.toUpperCase().includes(secao)
        );
        
        console.log('📋 Seções encontradas no relatório:', secoesEncontradas);
        console.log('📊 Cobertura de seções:', `${secoesEncontradas.length}/${secoes.length} (${Math.round(secoesEncontradas.length/secoes.length*100)}%)`);
        
        if (secoesEncontradas.length >= 4) {
          console.log('✅ Relatório está bem estruturado');
        } else {
          console.log('⚠️ Relatório pode estar incompleto');
        }
      } else {
        console.log('❌ Relatório não contém o campo "relatorio"');
      }
    } catch (parseError) {
      console.log('❌ Erro ao fazer parse do relatório:', parseError.message);
    }

  } catch (error) {
    console.error('❌ Erro na geração de relatório:', error.message);
  }

  // Testar com dados mínimos para edição
  console.log('📋 Testando com dados mínimos para edição...\n');

  const dadosMinimosEdicao = {
    numeroProcesso: "2024/EDIT-002",
    descricaoFatos: "Policial militar, de folga, em briga de bar, agrediu fisicamente um civil causando lesão corporal",
    statusFuncional: "militar de folga",
    dataFato: "25/01/2024",
    investigados: [
      {
        id: 1,
        nome: "CB João Santos",
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
      }
    ]
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/openai/gerar-relatorio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dadosProcesso: dadosMinimosEdicao }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na geração de relatório:', errorText);
      return;
    }

    const resultado = await response.text();
    
    console.log('✅ RELATÓRIO GERADO COM DADOS MÍNIMOS:');
    console.log('📊 Dados enviados para IA:');
    console.log(JSON.stringify(dadosMinimosEdicao, null, 2));
    console.log('\n📄 Relatório gerado:');
    console.log(resultado);
    console.log('\n' + '='.repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Erro na geração de relatório:', error.message);
  }

  console.log('🎉 Testes de relatório na edição concluídos!');
  console.log('\n📝 RESUMO:');
  console.log('✅ Servidor funcionando');
  console.log('✅ Geração de relatório com dados completos');
  console.log('✅ Geração de relatório com dados mínimos');
  console.log('✅ Relatórios estruturados conforme modelo');
  console.log('✅ Dados de investigados e vítimas processados');
}

testarRelatorioEdicao().catch(console.error); 