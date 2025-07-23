import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProcessBasicDataForm } from "./ProcessBasicDataForm";
import { ProcessDetailsForm } from "./ProcessDetailsForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { openaiService } from "@/services/openaiService";

// Estrutura inicial dos dados do formulário
const initialForm = {
  numeroProcesso: "",
  tipoProcesso: "",
  prioridade: "",
  numeroDespacho: "",
  dataDespacho: null,
  dataRecebimento: null,
  dataFato: null,
  origemProcesso: "",
  statusFuncional: "",
  descricaoFatos: "",
  tipoCrime: "",
  nomeInvestigado: "",
  cargoInvestigado: "",
  unidadeInvestigado: "",
  matriculaInvestigado: "",
  dataAdmissao: null,
  vitima: "",
  numeroSigpad: "",
  diligenciasRealizadas: {},
  desfechoFinal: "",
  sugestoes: "",
  relatorioFinal: "",
};

export default function NovoProcessoForm({ onProcessCreated, processo }: { onProcessCreated?: () => void, processo?: any }) {
  const { toast } = useToast();
  const [form, setForm] = useState(processo ? {
    ...initialForm,
    ...processo,
  } : initialForm);
  const [aba, setAba] = useState("dados-basicos");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDetalhes, setIsSavingDetalhes] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [iaTipificacao, setIaTipificacao] = useState<string | null>(null);
  const [iaPrescricao, setIaPrescricao] = useState<string | null>(null);
  const [isInterpretandoIA, setIsInterpretandoIA] = useState(false);

  // Handlers de campo
  const setField = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  // Handler para salvar o processo (dados básicos)
  const handleSaveBasic = async () => {
    setIsLoading(true);
    try {
      // Validação básica
      if (!form.numeroProcesso || !form.tipoProcesso || !form.dataFato) {
        toast({
          title: "Preencha todos os campos obrigatórios!",
          description: "Número do Processo, Tipo de Processo e Data do Fato são obrigatórios.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      // Salvar no Supabase
      const { error } = await supabase.from("processos").insert([
        {
          numero_processo: form.numeroProcesso,
          tipo_processo: form.tipoProcesso,
          prioridade: form.prioridade,
          numero_despacho: form.numeroDespacho,
          data_despacho: form.dataDespacho ? (typeof form.dataDespacho === 'string' ? form.dataDespacho : form.dataDespacho.toISOString().slice(0,10)) : null,
          data_recebimento: form.dataRecebimento ? (typeof form.dataRecebimento === 'string' ? form.dataRecebimento : form.dataRecebimento.toISOString().slice(0,10)) : null,
          data_fato: form.dataFato ? (typeof form.dataFato === 'string' ? form.dataFato : form.dataFato.toISOString().slice(0,10)) : null,
          origem_processo: form.origemProcesso,
          status_funcional: form.statusFuncional,
          descricao_fatos: form.descricaoFatos,
          tipo_crime: form.tipoCrime,
          nome_investigado: form.nomeInvestigado,
          cargo_investigado: form.cargoInvestigado,
          unidade_investigado: form.unidadeInvestigado,
          matricula_investigado: form.matriculaInvestigado,
          data_admissao: form.dataAdmissao ? (typeof form.dataAdmissao === 'string' ? form.dataAdmissao : form.dataAdmissao.toISOString().slice(0,10)) : null,
          vitima: form.vitima,
          numero_sigpad: form.numeroSigpad,
          status: 'tramitacao',
        }
      ]);
      if (error) throw error;
      toast({
        title: "Processo cadastrado!",
        description: `Processo ${form.numeroProcesso} cadastrado com sucesso.`
      });
      if (onProcessCreated) onProcessCreated();
      setAba("detalhes");
    } catch (err: any) {
      toast({
        title: "Erro ao cadastrar processo",
        description: err.message || "Erro desconhecido.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para salvar detalhes (diligências, desfecho, sugestões)
  const handleSaveDetalhes = async () => {
    setIsSavingDetalhes(true);
    try {
      // Atualizar processo (exemplo: buscar pelo número do processo)
      const { error } = await supabase.from("processos").update({
        diligencias_realizadas: form.diligenciasRealizadas,
        desfecho_final: form.desfechoFinal,
        sugestoes: form.sugestoes,
      }).eq("numero_processo", form.numeroProcesso);
      if (error) throw error;
      toast({
        title: "Detalhes salvos!",
        description: `Detalhes do processo ${form.numeroProcesso} salvos.`
      });
      setAba("relatorio-ia");
    } catch (err: any) {
      toast({
        title: "Erro ao salvar detalhes",
        description: err.message || "Erro desconhecido.",
        variant: "destructive"
      });
    } finally {
      setIsSavingDetalhes(false);
    }
  };

  // Handler para gerar relatório IA
  const handleGerarRelatorioIA = async () => {
    setIsGeneratingReport(true);
    try {
      // Montar dados para IA
      const dadosRelatorio = {
        nome: form.nomeInvestigado,
        cargo: form.cargoInvestigado,
        unidade: form.unidadeInvestigado,
        data_fato: form.dataFato,
        tipo_investigado: form.tipoProcesso,
        descricao: form.descricaoFatos,
        numero_sigpad: form.numeroSigpad,
        numero_despacho: form.numeroDespacho,
        data_despacho: form.dataDespacho,
        origem: form.origemProcesso,
        vitima: form.vitima,
        matricula: form.matriculaInvestigado,
        data_admissao: form.dataAdmissao
      };
      // Chamar IA
      const relatorioIA = await openaiService.gerarRelatorioJuridico(dadosRelatorio);
      setField("relatorioFinal", relatorioIA);
      // Salvar relatório no banco
      const { error } = await supabase.from("processos").update({
        relatorio_final: relatorioIA
      }).eq("numero_processo", form.numeroProcesso);
      if (error) throw error;
      toast({
        title: "Relatório gerado!",
        description: "Relatório final gerado e salvo com sucesso."
      });
    } catch (err: any) {
      toast({
        title: "Erro ao gerar relatório",
        description: err.message || "Erro desconhecido.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Renderização
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Novo Processo</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={aba} onValueChange={setAba} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/20 mb-6">
            <TabsTrigger value="dados-basicos" className="text-white data-[state=active]:bg-white/30">Dados Básicos</TabsTrigger>
            <TabsTrigger value="detalhes" className="text-white data-[state=active]:bg-white/30">Detalhes</TabsTrigger>
            <TabsTrigger value="relatorio-ia" className="text-white data-[state=active]:bg-white/30">Relatório IA</TabsTrigger>
          </TabsList>

          <TabsContent value="dados-basicos" className="space-y-6 mt-6">
            <ProcessBasicDataForm
              formData={form}
              setField={setField}
              isEditMode={false}
              textoTipificacao={""}
              setTextoTipificacao={() => {}}
              iaTipificacao={iaTipificacao}
              iaPrescricao={iaPrescricao}
              isInterpretandoIA={isInterpretandoIA}
              interpretarTipificacaoIA={() => {}}
            />
            <div className="flex justify-end">
              <Button onClick={handleSaveBasic} disabled={isLoading} className="bg-blue-600 text-white">
                {isLoading ? "Salvando..." : "Salvar e Avançar"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="detalhes" className="space-y-6 mt-6">
            <ProcessDetailsForm
              formData={form}
              setField={setField}
              isSavingDetalhes={isSavingDetalhes}
              handleSaveDetalhes={handleSaveDetalhes}
              savedProcessId={null}
              editProcess={null}
            />
          </TabsContent>

          <TabsContent value="relatorio-ia" className="space-y-6 mt-6">
            <div className="mb-4">
              <Label className="text-white">Relatório Final Gerado (IA)</Label>
              <Textarea
                value={form.relatorioFinal}
                onChange={e => setField("relatorioFinal", e.target.value)}
                className="bg-white/20 border-white/30 text-white min-h-[200px]"
                placeholder="O relatório gerado pela IA aparecerá aqui..."
                disabled
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleGerarRelatorioIA} disabled={isGeneratingReport || !form.numeroProcesso} className="bg-green-600 text-white">
                {isGeneratingReport ? "Gerando..." : "Gerar Relatório com IA"}
              </Button>
              <Button onClick={onProcessCreated} className="bg-gray-600 text-white">Concluir</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 