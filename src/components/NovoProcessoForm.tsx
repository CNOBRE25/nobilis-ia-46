import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { openaiService } from "@/services/openaiService";
import { useAuth } from "@/hooks/useAuth";
// Removido import direto do JSON

const DILIGENCIAS = [
  { id: 'atestado_medico', label: 'Atestado Médico' },
  { id: 'bo_pcpe', label: 'BO PCPE' },
  { id: 'contato_whatsapp', label: 'Contato por WhatsApp' },
  { id: 'contato_telefonico', label: 'Contato Telefônico' },
  { id: 'email', label: 'E-mail' },
  { id: 'escala_servico', label: 'Escala de Serviço' },
  { id: 'extrato_certidao_conjunta', label: 'Extrato Certidão Conjunta PM/PC' },
  { id: 'extrato_cadastro_civil', label: 'Extrato do Cadastro Civil' },
  { id: 'extrato_infopol', label: 'Extrato INFOPOL' },
  { id: 'extrato_infoseg', label: 'Extrato INFOSEG' },
  { id: 'extrato_mppe', label: 'Extrato MPPE' },
  { id: 'extrato_tjpe', label: 'Extrato TJPE' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'laudo_medico', label: 'Laudo Médico' },
  { id: 'laudo_pericial_iml_positivo', label: 'Laudo Pericial - IML - Laudo Positivo' },
  { id: 'laudo_pericial_iml_negativo', label: 'Laudo Pericial - IML - Negativo' },
  { id: 'mapa_lancamento_viaturas', label: 'Mapa de Lançamento de Viaturas' },
  { id: 'ouvida_testemunha', label: 'Ouvida da Testemunha' },
  { id: 'ouvida_vitima', label: 'Ouvida da Vítima' },
  { id: 'ouvida_investigado', label: 'Ouvida do Investigado' },
  { id: 'ouvida_sindicado', label: 'Ouvida do Sindicado' },
  { id: 'rastreamento_viaturas_com_registro', label: 'Rastreamento de Viaturas - Com Registro' },
  { id: 'rastreamento_viaturas_sem_registro', label: 'Rastreamento de Viaturas - Sem Registro' },
  { id: 'sgpm', label: 'SGPM' },
  { id: 'sigpad_fato_apuração_outra_unidade', label: 'SIGPAD - Fato em Apuração por Outra Unidade' },
  { id: 'sigpad_fato_ja_apurado', label: 'SIGPAD - Fato Já Apurado' },
  { id: 'sigpad_nada_consta', label: 'SIGPAD - Nada Consta' },
  { id: 'videos', label: 'Vídeos' }
];

const tipoProcessoOptions = [
  "IP", "IP-DEVOLVIDO", "IPM", "SAD"
];
const prioridadeOptions = [
  "URGENTE-MARIA DA PENHA", "URGENTE", "MEDIO", "MODERADO"
];
const origemOptions = [
  "CI-GTAC", "Corregedoria", "DENUNCIA ANONIMA", "DISQUE 100", "E-MAIL", "MP", "NFND-GTAC", "PC", "PM", "REDE SOCIAL", "TELEFONE", "WHATSAPP"
];
const statusFuncionalOptions = [
  "MILITAR DE SERVIÇO", "MILITAR DE FOLGA", "POLICIAL CIVIL", "POLICIAL PENAL"
];

const desfechosFinais = [
  "Arquivamento por Falta de Provas",
  "Arquivamento por Laudo IML Negativo",
  "Arquivamento por Fato em Apuração por Outra Unidade",
  "Arquivamento por Fato Já Apurado",
  "Arquivamento por Não Indiciamento do(s) Investigado(s)",
  "Arquivamento por Desinteresse da Vítima",
  "Arquivamento por Falta de Autoria",
  "Arquivamento por Falta de Materialidade",
  "Redistribuição por Superior Hierárquico ao Encarregado",
  "Instauração de SAD",
  "Instauração de IPM",
  "Instauração de Conselho de Disciplina"
];

const initialForm = {
  numeroProcesso: "",
  tipoProcesso: "",
  prioridade: "",
  numeroDespacho: "",
  dataDespacho: "",
  dataRecebimento: "",
  dataFato: "",
  origemProcesso: "",
  statusFuncional: "",
  descricaoFatos: "",
  tipificacaoCriminal: "",
  diligenciasRealizadas: {},
  // Campos adicionais para o relatório
  nomeInvestigado: "",
  cargoInvestigado: "",
  unidadeInvestigado: "",
  matriculaInvestigado: "",
  dataAdmissao: "",
  vitima: "",
  numeroSigpad: "",
};



export default function NovoProcessoForm({ onProcessCreated, processo }: { onProcessCreated?: () => void, processo?: any }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [aba, setAba] = useState("dados-basicos");
  const [isLoading, setIsLoading] = useState(false);
  const [processoCriado, setProcessoCriado] = useState(false);
  const [desfechoFinal, setDesfechoFinal] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [prescricaoIA, setPrescricaoIA] = useState("");
  const [iaFundamentacao, setIaFundamentacao] = useState("");
  const [prescricaoAdmIA, setPrescricaoAdmIA] = useState("");
  const [iaObservacoes, setIaObservacoes] = useState("");
  const [iaTipificacoesAlternativas, setIaTipificacoesAlternativas] = useState("");
  const [iaTipificacoesDisciplinares, setIaTipificacoesDisciplinares] = useState("");
  const [iaCompetencia, setIaCompetencia] = useState("");
  const [crimesData, setCrimesData] = useState<any>(null);

  useEffect(() => {
    if (processo) setForm({
      numeroProcesso: processo.numero_processo || "",
      tipoProcesso: processo.tipo_processo || "",
      prioridade: processo.prioridade || "",
      numeroDespacho: processo.numero_despacho || "",
      dataDespacho: processo.data_despacho || "",
      dataRecebimento: processo.data_recebimento || "",
      dataFato: processo.data_fato || "",
      origemProcesso: processo.origem_processo || "",
      statusFuncional: processo.status_funcional || "",
      descricaoFatos: processo.descricao_fatos || "",
      tipificacaoCriminal: processo.tipo_crime || "",
      diligenciasRealizadas: processo.diligencias_realizadas || {},
      // Campos adicionais para o relatório
      nomeInvestigado: processo.nome_investigado || "",
      cargoInvestigado: processo.cargo_investigado || "",
      unidadeInvestigado: processo.unidade_investigado || "",
      matriculaInvestigado: processo.matricula_investigado || "",
      dataAdmissao: processo.data_admissao || "",
      vitima: processo.vitima || "",
      numeroSigpad: processo.numero_sigpad || ""
    });
  }, [processo]);

  useEffect(() => {
    fetch("/crimes_brasil.json")
      .then(res => res.json())
      .then(setCrimesData)
      .catch(() => setCrimesData(null));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "numeroProcesso" && value.length > 15) return;
    if (name === "numeroDespacho" && value.length > 6) return;
    setForm({ ...form, [name]: value });
  };

  const handleSelect = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleDiligenciaChange = (id: string, checked: boolean) => {
    setForm({
      ...form,
      diligenciasRealizadas: {
        ...form.diligenciasRealizadas,
        [id]: {
          ...form.diligenciasRealizadas?.[id],
          realizada: checked
        }
      }
    });
  };
  const handleDiligenciaObsChange = (id: string, value: string) => {
    setForm({
      ...form,
      diligenciasRealizadas: {
        ...form.diligenciasRealizadas,
        [id]: {
          ...form.diligenciasRealizadas?.[id],
          observacao: value
        }
      }
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!form.numeroProcesso || !form.tipoProcesso || !form.dataFato) {
      toast({
        title: "Preencha todos os campos obrigatórios!",
        description: "Número do Processo, Tipo de Processo e Data do Fato são obrigatórios.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    try {
      if (processo) {
        // update
        const { error } = await supabase.from("processos").update({
          numero_processo: form.numeroProcesso,
          tipo_processo: form.tipoProcesso,
          prioridade: form.prioridade,
          numero_despacho: form.numeroDespacho,
          data_despacho: form.dataDespacho || null,
          data_recebimento: form.dataRecebimento || null,
          data_fato: form.dataFato,
          origem_processo: form.origemProcesso,
          status_funcional: form.statusFuncional,
          descricao_fatos: form.descricaoFatos,
          tipo_crime: form.tipificacaoCriminal,
          diligencias_realizadas: form.diligenciasRealizadas
        }).eq("id", processo.id);
        if (error) throw error;
        toast({
          title: "Processo atualizado!",
          description: `Processo ${form.numeroProcesso} atualizado com sucesso.`
        });
      } else {
        // insert
        const { error } = await supabase.from("processos").insert([
          {
            numero_processo: form.numeroProcesso,
            tipo_processo: form.tipoProcesso,
            prioridade: form.prioridade,
            numero_despacho: form.numeroDespacho,
            data_despacho: form.dataDespacho || null,
            data_recebimento: form.dataRecebimento || null,
            data_fato: form.dataFato,
            origem_processo: form.origemProcesso,
            status_funcional: form.statusFuncional,
            descricao_fatos: form.descricaoFatos,
            tipo_crime: form.tipificacaoCriminal,
            diligencias_realizadas: form.diligenciasRealizadas
          }
        ]);
        if (error) throw error;
        toast({
          title: "Processo cadastrado!",
          description: `Processo ${form.numeroProcesso} cadastrado com sucesso.`
        });
        setProcessoCriado(true);
        setAba("descricao-fatos");
      }
      if (onProcessCreated) onProcessCreated();
    } catch (err: any) {
      toast({
        title: processo ? "Erro ao atualizar processo" : "Erro ao cadastrar processo",
        description: err.message || "Erro desconhecido.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndConclude = async () => {
    setIsLoading(true);
    setIsGeneratingReport(true);
    
    if (!form.numeroProcesso || !form.tipoProcesso || !form.dataFato) {
      toast({
        title: "Preencha todos os campos obrigatórios!",
        description: "Número do Processo, Tipo de Processo e Data do Fato são obrigatórios.",
        variant: "destructive"
      });
      setIsLoading(false);
      setIsGeneratingReport(false);
      return;
    }

    try {
      let processoId = processo?.id;
      
      // Primeiro, salvar o processo
      if (processo) {
        // update, concluir e arquivar automaticamente
        const { error } = await supabase.from("processos").update({
          numero_processo: form.numeroProcesso,
          tipo_processo: form.tipoProcesso,
          prioridade: form.prioridade,
          numero_despacho: form.numeroDespacho,
          data_despacho: form.dataDespacho || null,
          data_recebimento: form.dataRecebimento || null,
          data_fato: form.dataFato,
          origem_processo: form.origemProcesso,
          status_funcional: form.statusFuncional,
          descricao_fatos: form.descricaoFatos,
          tipo_crime: form.tipificacaoCriminal,
          diligencias_realizadas: form.diligenciasRealizadas,
          desfecho_final: desfechoFinal,
          status: 'arquivado'
        }).eq("id", processo.id);
        if (error) throw error;
      } else {
        // insert, concluir e arquivar automaticamente
        const { data, error } = await supabase.from("processos").insert([
          {
            numero_processo: form.numeroProcesso,
            tipo_processo: form.tipoProcesso,
            prioridade: form.prioridade,
            numero_despacho: form.numeroDespacho,
            data_despacho: form.dataDespacho || null,
            data_recebimento: form.dataRecebimento || null,
            data_fato: form.dataFato,
            origem_processo: form.origemProcesso,
            status_funcional: form.statusFuncional,
            descricao_fatos: form.descricaoFatos,
            tipo_crime: form.tipificacaoCriminal,
            diligencias_realizadas: form.diligenciasRealizadas,
            desfecho_final: desfechoFinal,
            status: 'arquivado'
          }
        ]).select().single();
        if (error) throw error;
        processoId = data.id;
      }

      // Agora gerar o relatório final automaticamente
      toast({
        title: "Gerando relatório final...",
        description: "Processo salvo. Gerando relatório com IA...",
      });

      // Preparar dados para o relatório
      const dadosRelatorio = {
        nome: processo?.nome_investigado || "Não informado",
        cargo: processo?.cargo_investigado || "Não informado",
        unidade: processo?.unidade_investigado || "Não informado",
        data_fato: form.dataFato || processo?.data_fato || "Não informado",
        tipo_investigado: form.tipoProcesso || processo?.tipo_processo || "Não informado",
        descricao: form.descricaoFatos || processo?.descricao_fatos || "Não informado",
        numero_sigpad: processo?.numero_sigpad || "Não informado",
        numero_despacho: form.numeroDespacho || processo?.numero_despacho || "Não informado",
        data_despacho: form.dataDespacho || processo?.data_despacho || "Não informado",
        origem: form.origemProcesso || processo?.origem_processo || "Não informado",
        vitima: processo?.vitima || "Não informado",
        matricula: processo?.matricula_investigado || "Não informado",
        data_admissao: processo?.data_admissao || "Não informado"
      };

      // Gerar relatório com IA
      const relatorioIA = await openaiService.gerarRelatorioJuridico(dadosRelatorio);

      // Salvar o relatório no banco de dados
      const { error: relatorioError } = await supabase
        .from("processos")
        .update({
          relatorio_final: relatorioIA,
          data_relatorio_final: new Date().toISOString(),
          relatorio_gerado_por: user?.id || null
        })
        .eq("id", processoId);

      if (relatorioError) {
        console.error("Erro ao salvar relatório:", relatorioError);
        toast({
          title: "Aviso",
          description: "Processo finalizado, mas houve erro ao salvar o relatório.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Processo finalizado com sucesso!",
          description: `Processo ${form.numeroProcesso} foi concluído, arquivado e relatório final gerado automaticamente.`
        });
      }

      if (onProcessCreated) onProcessCreated();
    } catch (err: any) {
      console.error("Erro ao finalizar processo:", err);
      toast({
        title: "Erro ao finalizar processo",
        description: err.message || "Erro desconhecido.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <Tabs value={aba} onValueChange={setAba} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/20">
              <TabsTrigger value="dados-basicos" className="text-white data-[state=active]:bg-white/30">Dados Básicos</TabsTrigger>
              <TabsTrigger value="descricao-fatos" className="text-white data-[state=active]:bg-white/30" disabled={!processoCriado && !processo}>Descrição dos Fatos</TabsTrigger>
              <TabsTrigger value="tipificacao-criminal" className="text-white data-[state=active]:bg-white/30" disabled={!processoCriado && !processo}>Tipificação Criminal</TabsTrigger>
            </TabsList>
            <TabsContent value="dados-basicos" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroProcesso" className="text-white">Número do Processo *</Label>
                  <Input id="numeroProcesso" name="numeroProcesso" value={form.numeroProcesso} onChange={handleChange} className="bg-white/20 text-white" required maxLength={15} />
                </div>
                <div>
                  <Label htmlFor="tipoProcesso" className="text-white">Tipo de Processo *</Label>
                  <Select value={form.tipoProcesso} onValueChange={v => handleSelect("tipoProcesso", v)}>
                    <SelectTrigger className="bg-white/20 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoProcessoOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prioridade" className="text-white">Prioridade</Label>
                  <Select value={form.prioridade} onValueChange={v => handleSelect("prioridade", v)}>
                    <SelectTrigger className="bg-white/20 text-white">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridadeOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numeroDespacho" className="text-white">Número do Despacho</Label>
                  <Input id="numeroDespacho" name="numeroDespacho" value={form.numeroDespacho} onChange={handleChange} className="bg-white/20 text-white" maxLength={6} />
                </div>
                <div>
                  <Label htmlFor="dataDespacho" className="text-white">Data do Despacho</Label>
                  <Input id="dataDespacho" name="dataDespacho" type="date" value={form.dataDespacho ? form.dataDespacho.split('T')[0] : ''} onChange={handleChange} className="bg-white/20 text-white" />
                </div>
                <div>
                  <Label htmlFor="dataRecebimento" className="text-white">Data de Recebimento</Label>
                  <Input id="dataRecebimento" name="dataRecebimento" type="date" value={form.dataRecebimento ? form.dataRecebimento.split('T')[0] : ''} onChange={handleChange} className="bg-white/20 text-white" />
                </div>
                <div>
                  <Label htmlFor="dataFato" className="text-white">Data do Fato *</Label>
                  <Input id="dataFato" name="dataFato" type="date" value={form.dataFato ? form.dataFato.split('T')[0] : ''} onChange={handleChange} className="bg-white/20 text-white" required />
                </div>
                <div>
                  <Label htmlFor="origemProcesso" className="text-white">Origem do Procedimento</Label>
                  <Select value={form.origemProcesso} onValueChange={v => handleSelect("origemProcesso", v)}>
                    <SelectTrigger className="bg-white/20 text-white">
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {origemOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="statusFuncional" className="text-white">Status Funcional</Label>
                  <Select value={form.statusFuncional} onValueChange={v => handleSelect("statusFuncional", v)}>
                    <SelectTrigger className="bg-white/20 text-white">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusFuncionalOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50">
                  {isLoading ? (processo ? "Salvando..." : "Cadastrando...") : (processo ? "Salvar Alterações" : "Cadastrar Processo")}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="descricao-fatos" className="space-y-6 mt-6">
              <Label htmlFor="descricaoFatos" className="text-white">Descrição dos Fatos</Label>
              <Textarea id="descricaoFatos" name="descricaoFatos" value={form.descricaoFatos} onChange={handleChange} className="bg-white/20 text-white min-h-[120px]" />
              <Label className="text-white">Diligências Realizadas</Label>
              <div className="max-h-96 overflow-y-auto p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="space-y-4">
                  {DILIGENCIAS.map((diligencia) => (
                    <div key={diligencia.id} className="border-b border-white/20 pb-3 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={diligencia.id}
                          checked={form.diligenciasRealizadas?.[diligencia.id]?.realizada || false}
                          onCheckedChange={(checked) => handleDiligenciaChange(diligencia.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={diligencia.id} className="text-white text-sm cursor-pointer font-medium">
                            {diligencia.label}
                          </Label>
                          {form.diligenciasRealizadas?.[diligencia.id]?.realizada && (
                            <div className="mt-2">
                              <Textarea
                                value={form.diligenciasRealizadas?.[diligencia.id]?.observacao || ''}
                                onChange={(e) => handleDiligenciaObsChange(diligencia.id, e.target.value)}
                                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 text-sm min-h-[80px]"
                                placeholder="Adicione observações sobre esta diligência..."
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setAba("tipificacao-criminal")} disabled={!processoCriado && !processo} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                  Próxima: Tipificação Criminal
                </Button>
              </div>

              {/* Botão IA: Analisar Fatos */}
              <div className="flex flex-col items-end mt-4 gap-2">
                <Button
                  type="button"
                  className="bg-purple-700 hover:bg-purple-800 text-white"
                  disabled={!form.descricaoFatos || !form.dataFato || isLoading}
                  onClick={async () => {
                    setIsLoading(true);
                    toast({ title: "Analisando fatos com IA...", description: "Aguarde a sugestão de tipificação e prescrição." });
                    try {
                      const result = await openaiService.interpretarTipificacao({
                        texto: form.descricaoFatos,
                        dataFato: new Date(form.dataFato)
                      });
                      setForm(f => ({ ...f, tipificacaoCriminal: result.tipificacao }));
                      setPrescricaoIA(result.dataPrescricao || "");
                      setIaFundamentacao(result.fundamentacao || "");
                      setPrescricaoAdmIA(result.dataPrescricaoAdm || "");
                      setIaObservacoes(result.observacoes || "");
                      setIaTipificacoesAlternativas(result.tipificacoesAlternativas || "");
                      setIaTipificacoesDisciplinares(result.tipificacoesDisciplinares || "");
                      setIaCompetencia(result.competencia || "");
                      toast({ title: "Sugestão da IA aplicada!", description: `Tipificação: ${result.tipificacao} | Prescrição: ${result.dataPrescricao}` });
                    } catch (err) {
                      toast({ title: "Erro na IA", description: "Não foi possível obter sugestão automática.", variant: "destructive" });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Analisar Fatos com IA
                </Button>
                {form.tipificacaoCriminal && (
                  <div className="w-full bg-purple-100 border border-purple-300 rounded p-3 mt-2 text-purple-900">
                    <div className="font-bold text-base mb-2 text-purple-800">📋 ANÁLISE JURÍDICA INTELIGENTE</div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="font-bold text-sm text-purple-700">⚖️ Tipificação Principal:</div>
                        <div className="text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-400">{form.tipificacaoCriminal}</div>
                      </div>

                      {iaFundamentacao && (
                        <div>
                          <div className="font-bold text-sm text-purple-700">📚 Fundamentação:</div>
                          <div className="text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-400 whitespace-pre-line">{iaFundamentacao}</div>
                        </div>
                      )}

                      {iaTipificacoesAlternativas && (
                        <div>
                          <div className="font-bold text-sm text-purple-700">🔄 Tipificações Alternativas:</div>
                          <div className="text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-400">{iaTipificacoesAlternativas}</div>
                        </div>
                      )}

                      {iaTipificacoesDisciplinares && (
                        <div>
                          <div className="font-bold text-sm text-purple-700">🎖️ Tipificações Disciplinares:</div>
                          <div className="text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-400">{iaTipificacoesDisciplinares}</div>
                        </div>
                      )}

                      {iaCompetencia && (
                        <div>
                          <div className="font-bold text-sm text-purple-700">⚡ Competência:</div>
                          <div className="text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-400">{iaCompetencia}</div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {prescricaoIA && (
                          <div>
                            <div className="font-bold text-sm text-purple-700">⏰ Prescrição Penal:</div>
                            <div className="text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-400">{prescricaoIA}</div>
                          </div>
                        )}
                        {prescricaoAdmIA && (
                          <div>
                            <div className="font-bold text-sm text-purple-700">📅 Prescrição Administrativa:</div>
                            <div className="text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-400">{prescricaoAdmIA}</div>
                          </div>
                        )}
                      </div>

                      {iaObservacoes && (
                        <div>
                          <div className="font-bold text-sm text-purple-700">💡 Observações:</div>
                          <div className="text-xs bg-purple-50 p-2 rounded border-l-4 border-purple-400 text-purple-700">{iaObservacoes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="tipificacao-criminal" className="space-y-6 mt-6">
              <Label htmlFor="tipificacaoCriminal" className="text-white">Tipificação Criminal</Label>
              <Select value={form.tipificacaoCriminal} onValueChange={v => setForm({ ...form, tipificacaoCriminal: v })}>
                <SelectTrigger className="bg-white/20 text-white">
                  <SelectValue placeholder="Selecione o crime" />
                </SelectTrigger>
                <SelectContent>
                  {crimesData ? Object.entries(crimesData).map(([categoria, crimes]) => (
                    <div key={categoria}>
                      <div className="px-2 py-1 text-xs font-bold text-blue-300 uppercase bg-white/5 border-b border-white/10">{categoria}</div>
                      {(crimes as string[]).map((crime) => (
                        <SelectItem key={crime} value={crime}>{crime}</SelectItem>
                      ))}
                    </div>
                  )) : (
                    <SelectItem value="" disabled>Carregando crimes...</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Label htmlFor="desfechoFinal" className="text-white">Desfecho Final</Label>
              <Select value={desfechoFinal} onValueChange={setDesfechoFinal}>
                <SelectTrigger className="bg-white/20 text-white">
                  <SelectValue placeholder="Selecione o desfecho" />
                </SelectTrigger>
                <SelectContent>
                  {desfechosFinais.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setAba("dados-basicos")} className="bg-gray-600 hover:bg-gray-700 text-white">
                  Voltar
                </Button>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={handleSubmit} disabled={isLoading} className="bg-green-700 hover:bg-green-800 text-white">
                  {isLoading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 