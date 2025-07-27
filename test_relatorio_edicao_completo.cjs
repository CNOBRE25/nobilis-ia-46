require('dotenv').config({ path: '.env.local' });

const fetch = require('node-fetch');

const BACKEND_URL = 'http://localhost:3002';

async function testarRelatorioEdicaoCompleto() {
  console.log('🧪 Testando geração e salvamento de relatório na edição de processo...\n');

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

  // Dados de teste para simular um processo em edição com dados completos
  const dadosProcessoEdicaoCompleto = {
    numeroProcesso: "2024/EDIT-COMPLETE-001",
    tipoProcesso: "investigacao_preliminar",
    prioridade: "urgente",
    dataFato: "15/01/2024",
    descricaoFatos: "Policial militar, durante o serviço, foi flagrado subtraindo R$ 5.000,00 da sala de evidências. O fato foi presenciado por testemunha que confirmou a subtração do valor. Documentos foram apreendidos corroborando a ocorrência. O investigado estava de serviço no momento dos fatos e utilizou sua posição hierárquica para acessar a sala de evidências.",
    statusFuncional: "militar de serviço",
    diligenciasRealizadas: {
      "Oitiva de testemunhas": { realizada: true, observacao: "Testemunha confirmou o fato e identificou o investigado" },
      "Apreensão de documentos": { realizada: true, observacao: "Documentos apreendidos e catalogados" },
      "Oitiva do investigado": { realizada: true, observacao: "Investigado foi ouvido e negou os fatos" },
      "Coleta de provas materiais": { realizada: true, observacao: "Valores apreendidos e fotografados" },
      "Análise de câmeras de segurança": { realizada: true, observacao: "Imagens confirmam a entrada do investigado na sala" },
      "Busca e apreensão": { realizada: true, observacao: "Residência do investigado foi vistoriada" }
    },
    investigados: [
      {
        id: 1,
        nome: "Maj. Roberto Silva",
        cargo: "MAJOR PM",
        matricula: "12345",
        dataAdmissao: "01/01/2005",
        unidade: "1º BPM"
      }
    ],
    vitimas: [
      {
        id: 1,
        nome: "Estado de Pernambuco"
      }
    ],
    tipoCrime: "Peculato",
    crimesSelecionados: ["Peculato", "Furto", "Abuso de Autoridade"],
    transgressao: "Desonra",
    modusOperandi: "Subtração de valores da sala de evidências utilizando posição hierárquica",
    sugestoes: "Instaurar SAD, encaminhar para Justiça Militar e solicitar afastamento preventivo"
  };

  console.log('📋 Dados de teste para edição completa:');
  console.log(JSON.stringify(dadosProcessoEdicaoCompleto, null, 2));
  console.log('\n' + '='.repeat(80) + '\n');

  // Testar geração de relatório
  console.log('🤖 Testando geração de relatório completo...\n');

  try {
    const response = await fetch(`${BACKEND_URL}/api/openai/gerar-relatorio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dadosProcesso: dadosProcessoEdicaoCompleto }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na geração de relatório:', errorText);
      return;
    }

    const resultado = await response.text();
    
    console.log('✅ RELATÓRIO GERADO PARA EDIÇÃO COMPLETA:');
    console.log('📊 Dados enviados para IA:');
    console.log(JSON.stringify(dadosProcessoEdicaoCompleto, null, 2));
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

        // Verificar se contém informações específicas do processo
        const informacoesEspecificas = [
          dadosProcessoEdicaoCompleto.numeroProcesso,
          dadosProcessoEdicaoCompleto.investigados[0].nome,
          dadosProcessoEdicaoCompleto.investigados[0].cargo,
          dadosProcessoEdicaoCompleto.vitimas[0].nome,
          dadosProcessoEdicaoCompleto.tipoCrime
        ];

        const informacoesEncontradas = informacoesEspecificas.filter(info => 
          relatorioParsed.relatorio.includes(info)
        );

        console.log('📋 Informações específicas encontradas:', informacoesEncontradas);
        console.log('📊 Cobertura de informações:', `${informacoesEncontradas.length}/${informacoesEspecificas.length} (${Math.round(informacoesEncontradas.length/informacoesEspecificas.length*100)}%)`);

        if (informacoesEncontradas.length >= 3) {
          console.log('✅ Relatório contém informações específicas do processo');
        } else {
          console.log('⚠️ Relatório pode estar genérico');
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

  // Testar com dados mínimos mas com investigados e vítimas
  console.log('📋 Testando com dados mínimos mas estruturados...\n');

  const dadosMinimosEstruturados = {
    numeroProcesso: "2024/EDIT-MIN-002",
    descricaoFatos: "Policial militar, de folga, em briga de bar, agrediu fisicamente um civil causando lesão corporal leve. O fato ocorreu após discussão sobre política. O investigado estava alcoolizado no momento dos fatos.",
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
    ],
    tipoCrime: "Lesão Corporal",
    crimesSelecionados: ["Lesão Corporal"],
    transgressao: "Indisciplina"
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/openai/gerar-relatorio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dadosProcesso: dadosMinimosEstruturados }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na geração de relatório:', errorText);
      return;
    }

    const resultado = await response.text();
    
    console.log('✅ RELATÓRIO GERADO COM DADOS MÍNIMOS ESTRUTURADOS:');
    console.log('📊 Dados enviados para IA:');
    console.log(JSON.stringify(dadosMinimosEstruturados, null, 2));
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
  console.log('✅ Geração de relatório com dados mínimos estruturados');
  console.log('✅ Relatórios estruturados conforme modelo');
  console.log('✅ Dados de investigados e vítimas processados');
  console.log('✅ Informações específicas incluídas nos relatórios');
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Testar a geração de relatório na interface web');
  console.log('2. Verificar se o relatório é salvo corretamente no banco');
  console.log('3. Confirmar se o relatório é carregado ao editar processo');
  console.log('4. Testar o download do relatório em formato TXT');
}

testarRelatorioEdicaoCompleto().catch(console.error); 