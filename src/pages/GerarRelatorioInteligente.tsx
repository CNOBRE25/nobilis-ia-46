import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { openaiService } from "@/services/openaiService";
import { useToast } from "@/hooks/use-toast";

interface Process {
  id: string;
  numero_processo: string;
  tipo_processo: string;
  prioridade: string;
  data_recebimento: string;
  data_fato?: string;
  desfecho_final?: string;
  status: string;
  nome_investigado?: string;
  cargo_investigado?: string;
  unidade_investigado?: string;
  created_at: string;
  updated_at: string;
  descricao_fatos?: string;
  diligencias_realizadas?: any;
  matricula_investigado?: string;
  data_admissao?: string;
  numero_sigpad?: string;
  vitima?: string;
}

const GerarRelatorioInteligente = () => {
  const { toast } = useToast();
  const [processos, setProcessos] = useState<Process[]>([]);
  const [busca, setBusca] = useState("");
  const [processoSelecionado, setProcessoSelecionado] = useState<Process | null>(null);
  const [relatorio, setRelatorio] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProcessos = async () => {
      const { data, error } = await supabase
        .from("processos")
        .select("*")
        .neq("status", "arquivado")
        .order("created_at", { ascending: false });
      if (!error && data) setProcessos(data);
    };
    fetchProcessos();
  }, []);

  const handleGerarRelatorio = async () => {
    if (!processoSelecionado) return;
    setLoading(true);
    setRelatorio(null);
    toast({ title: "Gerando relatório com IA...", description: "Aguarde alguns segundos." });
    try {
      const dados = processoSelecionado;
      const prompt = `RELATÓRIO DE INVESTIGAÇÃO PRELIMINAR\nSIGPAD nº: ${dados.numero_sigpad || "[●]"}\nDespacho de Instauração nº: ${dados.numero_despacho || "[●]"}\nData do Despacho: ${dados.data_despacho || "[●]"}\nOrigem: ${dados.origem_processo || "[●]"}\nData do Fato: ${dados.data_fato || "[●]"}\nVítima: ${dados.vitima || "[●]"}\nInvestigado: ${dados.nome_investigado || "[●]"}\nMatrícula: ${dados.matricula_investigado || "[●]"}\nAdmissão: ${dados.data_admissao || "[●]"}\nLotação Atual: ${dados.unidade_investigado || "[●]"}\n\nI – DAS PRELIMINARES\n[Análise pela IA]:\nNeste campo, a inteligência artificial deverá elaborar um resumo objetivo dos fatos noticiados, com identificação do(s) possível(eis) crime(s) ou transgressão(ões) disciplinar(es) atribuídos ao(s) investigado(s), com respectiva tipificação legal, levando em consideração o status funcional do agente no momento do fato (militar em serviço, militar de folga, policial civil etc.).\n\nA IA deverá aplicar a legislação adequada (CPM, CP, Estatuto, Código Disciplinar, etc.), analisar a natureza da infração, e com base na data do fato, realizar o cálculo da prescrição penal ou administrativa, indicando se o fato se encontra prescrito ou se a apuração deve prosseguir.\n\nII – DOS FATOS\n[Inserção automatizada pela IA com base nos dados fornecidos]\nA presente investigação preliminar foi instaurada com a finalidade de apurar os fatos noticiados por meio da ${dados.origem_processo || "[NFND / comunicação inicial]"}, que relata que, no dia ${dados.data_fato || "[DATA DO FATO]"}, o policial militar ${dados.nome_investigado || "[NOME / IDENTIFICAÇÃO]"}, lotado no(a) ${dados.unidade_investigado || "[UNIDADE]"}, teria ${dados.descricao_fatos || "[DESCRIÇÃO RESUMIDA DOS FATOS]"}.\n\nIII – DAS DILIGÊNCIAS\nForam iniciadas diligências para esclarecimento dos fatos, conforme segue:\n\n[Lista automatizada pela IA com base nas diligências realizadas]\n\nDocumentos providenciados:\n- Ficha Funcional do investigado\n- Extrato do SIGPAD\n- [Outros documentos, se houver]\n\n[Resumo analítico pela IA]\nCom base nas diligências realizadas, observou-se que:\n[Exposição sintética dos elementos apurados em cada documento ou etapa da investigação]\n\nIV – DA FUNDAMENTAÇÃO\n[Elaboração pela IA com base nos dados e desfecho sugerido]\nNeste campo, a inteligência artificial deverá consolidar os elementos fáticos e jurídicos da investigação, oferecendo uma análise técnica fundamentada, com respaldo na legislação vigente, doutrina e jurisprudência nacional, destacando o nexo de causalidade, a existência (ou não) de autoria e materialidade, e a adequação típica, conforme o enquadramento legal aplicável (CP, CPM, CPP, Código Disciplinar, Estatuto da Corporação, etc.).\n\nV – DA CONCLUSÃO\n[Decisão orientada pela IA com justificativa]\nConsiderando os elementos colhidos na presente investigação, a inteligência artificial deverá concluir, justificadamente, por uma das seguintes providências:\n- Instauração de SAD (Sindicato Administrativo Disciplinar)\n- Instauração de IPM (Inquérito Policial Militar)\n- Instauração de PADS (Processo Administrativo Disciplinar Sumaríssimo)\n- Redistribuição para outra unidade\n- Arquivamento, por ausência de elementos suficientes ou prescrição\n\nA conclusão deverá vir acompanhada da justificativa legal e técnica, considerando o grau de relevância dos fatos, a existência de indícios mínimos de autoria e materialidade, e os critérios de oportunidade e conveniência da administração pública.\n\nRECIFE, [DATA DA ASSINATURA ELETRÔNICA]`;
      const resposta = await openaiService.gerarRelatorioJuridico({
        nome: dados.nome_investigado || "[●]",
        tipo_investigado: dados.tipo_processo || "[●]",
        cargo: dados.cargo_investigado || "[●]",
        unidade: dados.unidade_investigado || "[●]",
        data_fato: dados.data_fato || "[●]",
        descricao: dados.descricao_fatos || "[●]",
        numero_sigpad: dados.numero_sigpad || "[●]",
        numero_despacho: dados.numero_despacho || "[●]",
        data_despacho: dados.data_despacho || "[●]",
        origem: dados.origem_processo || "[●]",
        vitima: dados.vitima || "[●]",
        matricula: dados.matricula_investigado || "[●]",
        data_admissao: dados.data_admissao || "[●]",
        diligencias_realizadas: Object.keys(dados.diligencias_realizadas || {}).filter(k => dados.diligencias_realizadas[k]?.realizada)
      });
      setRelatorio(resposta);
      toast({ title: "Relatório gerado!", description: "Confira o relatório abaixo." });
    } catch (err) {
      toast({ title: "Erro ao gerar relatório", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Gerar Relatório Inteligente</h2>
          <div className="mb-4">
            <Input
              placeholder="Buscar processo por número, investigado, unidade..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="bg-white/20 text-white"
            />
          </div>
          <div className="max-h-64 overflow-y-auto mb-6">
            {processos.filter(p =>
              p.numero_processo?.toLowerCase().includes(busca.toLowerCase()) ||
              p.nome_investigado?.toLowerCase().includes(busca.toLowerCase()) ||
              p.unidade_investigado?.toLowerCase().includes(busca.toLowerCase())
            ).map(p => (
              <div
                key={p.id}
                className={`p-3 rounded-lg mb-2 cursor-pointer border ${processoSelecionado?.id === p.id ? "border-purple-500 bg-purple-100/10" : "border-white/10 bg-white/5"}`}
                onClick={() => setProcessoSelecionado(p)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">{p.numero_processo}</span>
                  <span className="text-blue-200">{p.nome_investigado}</span>
                  <Badge className="bg-blue-700 text-white ml-2">{p.status}</Badge>
                </div>
                <div className="text-xs text-white/70">{p.unidade_investigado} | {p.data_fato}</div>
              </div>
            ))}
          </div>
          {processoSelecionado && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-2">Dados do Processo Selecionado</h3>
              <div className="grid grid-cols-2 gap-2 text-white text-sm">
                <div><b>Nº Processo:</b> {processoSelecionado.numero_processo}</div>
                <div><b>Investigado:</b> {processoSelecionado.nome_investigado}</div>
                <div><b>Unidade:</b> {processoSelecionado.unidade_investigado}</div>
                <div><b>Data Fato:</b> {processoSelecionado.data_fato}</div>
                <div><b>Vítima:</b> {processoSelecionado.vitima}</div>
                <div><b>Descrição:</b> {processoSelecionado.descricao_fatos}</div>
                <div><b>Status:</b> {processoSelecionado.status}</div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleGerarRelatorio} disabled={loading} className="bg-purple-700 hover:bg-purple-800 text-white">
                  {loading ? "Gerando..." : "Gerar Relatório com IA"}
                </Button>
              </div>
            </div>
          )}
          {relatorio && (
            <div className="mt-8 bg-white/10 border border-purple-500/30 p-4 rounded-lg text-white">
              <h4 className="font-bold text-lg mb-2 text-purple-300">Relatório Gerado</h4>
              <pre className="whitespace-pre-wrap text-white text-sm">{JSON.stringify(relatorio, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GerarRelatorioInteligente; 