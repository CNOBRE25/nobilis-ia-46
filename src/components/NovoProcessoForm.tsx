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
import { checkProcessNumberExists } from "@/utils/processNumberGenerator";
import { Investigado, Vitima, ProcessFormData, SetFieldFunction } from "@/types/process";
import { NovoProcessoFormProps } from "@/types/components";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Brain } from "lucide-react";
import ProcessSelector from "./ProcessSelector";

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
  crimesSelecionados: [], // Novo campo para múltiplos crimes
  transgressao: "", // Adicionado campo transgressao
  modusOperandi: "", // Adicionado campo modusOperandi
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

const CARGOS_INVESTIGADO = [
  "SD PM","SD BM","CB PM","CB BM","3º SGT PM","3º SGT BM","2º SGT PM","2º SGT BM","1º SGT PM","1º SGT BM","ST PM","ST BM","2º TEN PM","2º TEN BM","1º TEN PM","1º TEN BM","CAP PM","CAP BM","MAJOR PM","MAJOR BM","TC PM","TC BM","CORONEL PM","CORONEL BM","DPC","APC","EPC","PERITO CRIMINAL","ASP",
  // Novos cargos:
  "Papiloscopista",
  "Assistente de Gestão Publica",
  "Identificador Civil e Criminal",
  "Perito",
  "Medico Legista",
  "Agente de Pericia Criminal",
  "Agente de Medicina Legal",
  "Assistente de Gestão Publica"
];

const UNIDADES_PM = [
  "1º BPM","2º BPM","3º BPM","4º BPM","5º BPM","6º BPM","7º BPM","8º BPM","9º BPM","10º BPM","11º BPM","12º BPM","13º BPM","14º BPM","15º BPM","16º BPM","17º BPM","18º BPM","19º BPM","20º BPM","21º BPM","22º BPM","23º BPM","24º BPM","25º BPM","26º BPM","1ª CIPM","2ª CIPM","3ª CIPM","4ª CIPM","5ª CIPM","6ª CIPM","7ª CIPM","8ª CIPM","9ª CIPM","10ª CIPM","1º BIESP","1º BPTRAN","2ª EMG","2º BIESP","ACGPM","AECI","AG PM","BEPI","BOPE","BPCHOQUE","BPGD","BPRP","BPRV","CAS-PM","CAMIL","CEC","CEFD","CEMATA","CEMET","CFARM","CG-GI","CGPM","CIATUR","CIMUS","CIOE","CIPCÃES","CIPMOTO","CIPOMA","CJD","CMH","CMT GERALCODONTO","CORGER","CPA","CPM/DGP","CPO","CPP","CREED","CRESEP","CSM/NT","CSM/MB","CTT","DAL/CSM/MOTO","DAL PM","DASDH","DASIS","DEAJA","DEIP","DF","DGA","DGP-2","DGP-3","DGP-4","DGP-5","DGP-6","DGP-7","DGP-8","DGP-8-CARTORIAL","DGP-8-CORREICIONAL","DGP-9","DGP-AJUDANCIA","DIM","DIM-SC","DIM-SC2","DINTER I","DINTER II","DIP","DIRESP","DPJM","DPO","DPO-SEFAZ","DS","DTEC","EMG","GP","GTA","OLS","RESERVA PM","RPMON","SCG PM","SECOR-DINTER I"
];

const UNIDADES_BM = [
  "1º GB","2º GB","3º GB","4º GB","5º GB","6º GB","7º GB","8º GB","9º GB","10º GB","AJS","CAC","CAS-BM","CAT AGRESTE","CAT-AGRESTE II","CAT-AGRESTE III","CAT RMR","CAT SERTÃO I","CAT SERTÃO II","CAT SERTÃO III","CAT SERTÃO IV","CAT SERTÃO V","CAT SERTÃO VI","CAT ZONA DA MATA","CAT ZONA DA MATA II","CCI","CCO","CCS","CEAO","CEFD","CEMET II","CG-GI","CGBM","CGFIN","CINT","CJD","CMAN","COESP","COINTER-1","COINTER-2","COM","CORGER","CPLAG","CTIC","DAL BM","DDIR","DEIP","DGO","DGP-SCP","DGP-CBMPE","DGP-SCO","DGP/CBMPE","DIESP","DINTER I","DINTER II","DIP","DJD"
];

const LOTACOES_CIRC_DESEC = [
  // CIRC
  ...Array.from({length: 220}, (_, i) => `${String(i+1).padStart(3, '0')}ª CIRC`),
  // DESEC
  ...Array.from({length: 26}, (_, i) => `${String(i+1).padStart(2, '0')}ª DESEC`),
  // DP Mulher
  ...Array.from({length: 16}, (_, i) => `${i+1}ª DP Mulher`),
  // Extras
  "11ª SEC GOIANA","13ª DPLAN DPCRIA","16ª DPH-GOIANA","17ª DPH-VITÓRIA","18ª DPH-PALMARES","19ª DPH-CARUARU","19ª DPPLAN-JABOATÃO","1ª SEC-BOA VISTA","1ª DPRN","20ª DPH-CARUARU","21ª DPH-SANTA CRUZ","22ª DPH-GARANHUNS","2ª DP CAIC","2ª DPRN","2ª DPH","3ª DPH-AGRESTE","3ª DPRN","3ª DPH","4ª DPH","5ª DPH","7ª DPMUL-SURUBIM","7ª DPPLAN-GPCA","APOSENTADO-PC","CEPLANC","COORDEPLAN","COORDPPOL","CORE","CORGER","CPCE-1","CPCE-2","CPCE-3","CPCE-4","DDPP","DECASP","DECCOT","DENARC","DEPATRI","DEPRIM","DHMN","DHPP","DIAG","DIM-PC","DIMAVE","DINTEL","DINTER-1 PC","DINTER-2 PC","DIRESP-PC","DIRH","DIVASP","DP CONSUMIDOR","DP JABOATÃO","DPAI","DPCA","DPCRIA","DPDT","DPH","DPID","DPMUL","DPPH","DPRE","DPRFC","DPRFV","DPTUR","DRACCO","DTI","FTC DHPP","GCOE","GCOI2","GDIM-PC","GDINTER-1 PC","GDINTER-2 PC","GEPCA","GOE","GRESP-PC","IITB","NUPREV","P-ID AGUAS BELAS","P-ID PESQUEIRA","PAULISTA","PETROLINA","PLANT","POLINTER","SDS","UNEATEM","UNIMOPE","UNIOPE","UNIPA","UNIPRAI","UNIPRECA","UNISERG","UNISUT","UPREM","UTA-IITB"
];

const CARGOS_CIRC_DESEC = [
  "DPC","APC","EPC","PAPILOSCOPISTA","ASSISTENTE DE GESTÃO PUBLICA","IDENTIFICADOR CIVIL E CRIMINAL"
];

const UNIDADES_EXTRAS = [
  "ALEPE","CAMIL-CAD","CAMIL-CHEFIA","CAMIL-CINT","CAMIL-CODECIPE","CAMIL-CSI","CAMIL-CTEA","CAMIL-DAF","CAMIL-DSI","CAMIL-GAJ","CONTROLADORIA-GESTÃO CONTROLADORIA","CORGER","MPPE-CGPC","SDS","SDS-GTA","SEAP","TJPE-APMC"
];

const UNIDADES_PERICIA = [
  "DIRH-PCIE","DIRH PCIE","GICPAS","IC","IML","IMLAPC","URPOC-NAZARÉ DA MATA","URPOC-AFOGADOS DA INGAZERA","URPOC-ARCOVERDE","URPOC-CARUARU","URPOC-OURICURI","URPOC-PALMARES","URPOC-PETROLINA"
];
const CARGOS_PERICIA = [
  "PERITO CRIMINAL","MEDICO LEGISTA","AGENTE DE PERICIA CRIMINAL","AGENTE DE MEDICINA LEGAL","AUXILIAR GESTAO PUBLICA","ASSISTENTE GESTAO PUBLICA"
];
function normalize(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

export default function NovoProcessoForm({ onProcessCreated, processo }: NovoProcessoFormProps) {
  const { toast } = useToast();
  const isEditMode = !!processo; // Detecta se é modo de edição
  
  console.log("[DEBUG] NovoProcessoForm - processo recebido:", processo);
  console.log("[DEBUG] NovoProcessoForm - isEditMode:", isEditMode);
  console.log("[DEBUG] NovoProcessoForm - investigados do processo:", processo?.investigados);
  console.log("[DEBUG] NovoProcessoForm - vitimas do processo:", processo?.vitimas);
  
  const [form, setForm] = useState<ProcessFormData>(processo ? {
    ...initialForm,
    ...processo,
    // Garantir que o relatório final seja carregado corretamente
    relatorioFinal: processo.relatorioFinal || processo.relatorio_final || "",
    // Garantir que o desfecho final seja carregado corretamente
    desfechoFinal: processo.desfechoFinal || processo.desfecho_final || "",
  } : initialForm);
  
  console.log("[DEBUG] NovoProcessoForm - form inicial:", form);
  console.log("[DEBUG] NovoProcessoForm - relatorioFinal:", form.relatorioFinal);
  const [aba, setAba] = useState(isEditMode ? "detalhes" : "dados-basicos"); // Se for edição, vai direto para detalhes
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDetalhes, setIsSavingDetalhes] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [iaTipificacao, setIaTipificacao] = useState<string | null>(null);
  const [iaPrescricao, setIaPrescricao] = useState<string | null>(null);
  const [isInterpretandoIA, setIsInterpretandoIA] = useState(false);

  // Estado para múltiplos investigados e vítimas
  const [investigados, setInvestigados] = useState<Investigado[]>(() => {
    if (processo?.investigados) {
      // Se os dados vierem como string JSON, fazer parse
      if (typeof processo.investigados === 'string') {
        try {
          return JSON.parse(processo.investigados);
        } catch (e) {
          console.error('Erro ao fazer parse dos investigados:', e);
          return [];
        }
      }
      // Se já for array, usar diretamente
      return Array.isArray(processo.investigados) ? processo.investigados : [];
    }
    return [];
  });
  
  const [vitimas, setVitimas] = useState<Vitima[]>(() => {
    if (processo?.vitimas) {
      // Se os dados vierem como string JSON, fazer parse
      if (typeof processo.vitimas === 'string') {
        try {
          return JSON.parse(processo.vitimas);
        } catch (e) {
          console.error('Erro ao fazer parse das vítimas:', e);
          return [];
        }
      }
      // Se já for array, usar diretamente
      return Array.isArray(processo.vitimas) ? processo.vitimas : [];
    }
    return [];
  });
  // Estado para busca de cargos de cada investigado
  const [searchCargos, setSearchCargos] = useState<string[]>([]);
  // Estado para busca de unidade de cada investigado
  const [searchUnidades, setSearchUnidades] = useState<string[]>([]);
  // Estado para busca de unidade BM de cada investigado
  const [searchUnidadesBM, setSearchUnidadesBM] = useState<string[]>([]);
  // Estado para busca de unidade Perícia de cada investigado
  const [searchUnidadesPericia, setSearchUnidadesPericia] = useState<string[]>([]);
  // Estado para busca de lotação CIRC/DESEC de cada investigado
  const [searchLotacoesCirc, setSearchLotacoesCirc] = useState<string[]>([]);

  // Função para atualizar o valor de busca de unidade de um investigado específico
  const handleSearchUnidadeChange = (idx: number, value: string) => {
    setSearchUnidades(prev => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  // Função para atualizar o valor de busca de unidade BM de um investigado específico
  const handleSearchUnidadeBMChange = (idx: number, value: string) => {
    setSearchUnidadesBM(prev => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  // Função para atualizar o valor de busca de unidade Perícia de um investigado específico
  const handleSearchUnidadePericiaChange = (idx: number, value: string) => {
    setSearchUnidadesPericia(prev => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  // Função para atualizar o valor de busca de lotação CIRC/DESEC de um investigado específico
  const handleSearchLotacaoCircChange = (idx: number, value: string) => {
    setSearchLotacoesCirc(prev => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  // Funções para adicionar/remover investigados
  const addInvestigado = () => {
    setInvestigados(prev => [
      ...prev,
      { id: Date.now(), nome: "", cargo: "", matricula: "", dataAdmissao: null, unidade: "" }
    ]);
    setSearchCargos(prev => [...prev, ""]);
    setSearchUnidades(prev => [...prev, ""]);
    setSearchUnidadesBM(prev => [...prev, ""]);
    setSearchUnidadesPericia(prev => [...prev, ""]);
    setSearchLotacoesCirc(prev => [...prev, ""]);
  };
  const removeInvestigado = (id: number) => {
    setInvestigados(prev => {
      const idx = prev.findIndex(inv => inv.id === id);
      setSearchCargos(sc => sc.filter((_, i) => i !== idx));
      setSearchUnidades(su => su.filter((_, i) => i !== idx));
      setSearchUnidadesBM(sb => sb.filter((_, i) => i !== idx));
      setSearchUnidadesPericia(sp => sp.filter((_, i) => i !== idx));
      setSearchLotacoesCirc(sl => sl.filter((_, i) => i !== idx));
      return prev.filter(inv => inv.id !== id);
    });
  };
  const updateInvestigado = (id: number, field: keyof Investigado, value: Investigado[keyof Investigado]) => {
    setInvestigados(prev => prev.map(inv => inv.id === id ? { ...inv, [field]: value } : inv));
  };

  // Funções para adicionar/remover vítimas
  const addVitima = () => {
    setVitimas(prev => [
      ...prev,
      { id: Date.now(), nome: "" }
    ]);
  };
  const removeVitima = (id: number) => {
    setVitimas(prev => prev.filter(v => v.id !== id));
  };
  const updateVitima = (id: number, value: string) => {
    setVitimas(prev => prev.map(v => v.id === id ? { ...v, nome: value } : v));
  };

  // Função para atualizar o valor de busca de cargo de um investigado específico
  const handleSearchCargoChange = (idx: number, value: string) => {
    setSearchCargos(prev => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  // Handlers de campo
  const setField: SetFieldFunction = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

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

      if (isEditMode) {
        // MODO EDIÇÃO: Atualizar processo existente
        const { error } = await supabase.from("processos").update({
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
          crimes_selecionados: form.crimesSelecionados, // Adicionado campo crimes_selecionados
          transgressao: form.transgressao, // Adicionado campo transgressao
          modus_operandi: form.modusOperandi, // Adicionado campo modus_operandi
          nome_investigado: form.nomeInvestigado,
          cargo_investigado: form.cargoInvestigado,
          unidade_investigado: form.unidadeInvestigado,
          matricula_investigado: form.matriculaInvestigado,
          data_admissao: form.dataAdmissao ? (typeof form.dataAdmissao === 'string' ? form.dataAdmissao : form.dataAdmissao.toISOString().slice(0,10)) : null,
          vitima: form.vitima,
          numero_sigpad: form.numeroSigpad,
          investigados: JSON.stringify(investigados),
          vitimas: JSON.stringify(vitimas),
        }).eq("id", processo.id); // Usar ID do processo para atualizar

        if (error) throw error;

        toast({
          title: "Processo atualizado!",
          description: `Processo ${form.numeroProcesso} atualizado com sucesso.`
        });
        if (onProcessCreated) onProcessCreated();
        setAba("detalhes");
      } else {
        // MODO NOVO: Criar novo processo
        // Verificar se o número já existe (apenas para novos processos)
        const exists = await checkProcessNumberExists(form.numeroProcesso, supabase);
        if (exists) {
          toast({
            title: "Número de processo já existe!",
            description: "Este número de processo já está cadastrado. Use outro número.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // Salvar novo processo no Supabase
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
            crimes_selecionados: form.crimesSelecionados, // Adicionado campo crimes_selecionados
            transgressao: form.transgressao, // Adicionado campo transgressao
            modus_operandi: form.modusOperandi, // Adicionado campo modus_operandi
            nome_investigado: form.nomeInvestigado,
            cargo_investigado: form.cargoInvestigado,
            unidade_investigado: form.unidadeInvestigado,
            matricula_investigado: form.matriculaInvestigado,
            data_admissao: form.dataAdmissao ? (typeof form.dataAdmissao === 'string' ? form.dataAdmissao : form.dataAdmissao.toISOString().slice(0,10)) : null,
            vitima: form.vitima,
            numero_sigpad: form.numeroSigpad,
            status: 'tramitacao',
            investigados: JSON.stringify(investigados),
            vitimas: JSON.stringify(vitimas),
          }
        ]);
        
        if (error) {
          // Tratamento específico para erro de chave duplicada
          if (error.code === '23505' && error.message.includes('numero_processo')) {
            toast({
              title: "Erro: Número de processo duplicado!",
              description: "Este número de processo já existe no sistema. Use outro número.",
              variant: "destructive"
            });
          } else {
            throw error;
          }
          setIsLoading(false);
          return;
        }
        toast({
          title: "Processo cadastrado!",
          description: `Processo ${form.numeroProcesso} cadastrado com sucesso.`
        });
        if (onProcessCreated) onProcessCreated();
        setAba("detalhes");
      }
      setIsLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao salvar o processo.";
      toast({
        title: isEditMode ? "Erro ao atualizar processo" : "Erro ao cadastrar processo",
        description: errorMessage,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Handler para salvar detalhes (diligências, desfecho, sugestões)
  const handleSaveDetalhes = async () => {
    console.log("[DEBUG] Iniciando salvamento de detalhes...");
    console.log("[DEBUG] isEditMode:", isEditMode);
    console.log("[DEBUG] processo?.id:", processo?.id);
    console.log("[DEBUG] form.numeroProcesso:", form.numeroProcesso);
    console.log("[DEBUG] Dados do formulário:", form);
    
    setIsSavingDetalhes(true);
    try {
      // Preparar dados para atualização
      const updateData = {
        diligencias_realizadas: form.diligenciasRealizadas || {},
        desfecho_final: form.desfechoFinal || '',
        sugestoes: form.sugestoes || '',
        updated_at: new Date().toISOString()
      };



      console.log("[DEBUG] Dados para atualizar:", updateData);
      console.log("[DEBUG] Desfecho final sendo salvo:", updateData.desfecho_final);

      let result;
      if (isEditMode && processo?.id) {
        // MODO EDIÇÃO: Usar ID do processo
        console.log("[DEBUG] Modo edição - usando ID:", processo.id);
        result = await supabase
          .from("processos")
          .update(updateData)
          .eq("id", processo.id)
          .select();
        
        console.log("[DEBUG] Resultado da atualização (edição):", result);
      } else {
        // MODO NOVO: Usar número do processo
        console.log("[DEBUG] Modo novo - usando número:", form.numeroProcesso);
        result = await supabase
          .from("processos")
          .update(updateData)
          .eq("numero_processo", form.numeroProcesso)
          .select();
        
        console.log("[DEBUG] Resultado da atualização (novo):", result);
      }

      if (result.error) {
        console.error("[DEBUG] Erro na atualização:", result.error);
        throw result.error;
      }

      if (result.data && result.data.length > 0) {
        console.log("[DEBUG] Dados atualizados com sucesso:", result.data[0]);
      }
      
      console.log("[DEBUG] Detalhes salvos com sucesso!");
      toast({
        title: "Detalhes salvos com sucesso!",
        description: `Detalhes do processo ${form.numeroProcesso} foram salvos no banco de dados.`
      });
      
      // Não redirecionar automaticamente, deixar o usuário decidir
      // setAba("relatorio-ia");
    } catch (err: unknown) {
      console.error("[DEBUG] Erro ao salvar detalhes:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao salvar os detalhes.";
      toast({
        title: "Erro ao salvar detalhes",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSavingDetalhes(false);
    }
  };

  // Handler para salvar investigados e vítimas
  const handleSaveInvestigadosVitimas = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        investigados: JSON.stringify(investigados),
        vitimas: JSON.stringify(vitimas),
      };

      let error;
      if (isEditMode && processo?.id) {
        // MODO EDIÇÃO: Usar ID do processo
        const result = await supabase.from("processos").update(updateData).eq("id", processo.id);
        error = result.error;
      } else {
        // MODO NOVO: Usar número do processo
        const result = await supabase.from("processos").update(updateData).eq("numero_processo", form.numeroProcesso);
        error = result.error;
      }

      if (error) throw error;
      
      toast({
        title: "Investigados e Vítimas salvos!",
        description: `Dados de investigados e vítimas do processo ${form.numeroProcesso} salvos.`
      });
      setAba("relatorio-ia");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao salvar os dados.";
      toast({
        title: "Erro ao salvar investigados e vítimas",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para salvar relatório IA
  const handleSaveRelatorioIA = async () => {
    setIsLoading(true);
    try {
      console.log('💾 Salvando relatório IA...');
      console.log('📄 Conteúdo do relatório:', form.relatorioFinal);
      
      const updateData = {
        relatorio_final: form.relatorioFinal,
        data_relatorio_final: new Date().toISOString(),
        relatorio_gerado_por: 'Sistema'
      };

      let error;
      if (isEditMode && processo?.id) {
        console.log('💾 Salvando relatório (modo edição) - ID:', processo.id);
        const result = await supabase.from("processos").update(updateData).eq("id", processo.id);
        error = result.error;
      } else {
        console.log('💾 Salvando relatório (modo novo) - Número:', form.numeroProcesso);
        const result = await supabase.from("processos").update(updateData).eq("numero_processo", form.numeroProcesso);
        error = result.error;
      }

      if (error) {
        console.error('❌ Erro ao salvar relatório:', error);
        throw error;
      }
      
      console.log('✅ Relatório salvo com sucesso');
      
      toast({
        title: "Relatório IA salvo!",
        description: `Relatório IA do processo ${form.numeroProcesso} salvo com sucesso.`
      });
    } catch (err: unknown) {
      console.error('❌ Erro ao salvar relatório IA:', err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao salvar o relatório.";
      toast({
        title: "Erro ao salvar relatório IA",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para gerar relatório IA
  const handleGerarRelatorioIA = async () => {
    setIsGeneratingReport(true);
    try {
      console.log('🔍 Iniciando geração de relatório IA...');
      console.log('📊 Dados do formulário:', form);
      console.log('👥 Investigados:', investigados);
      console.log('👤 Vítimas:', vitimas);

      // Montar objeto conforme novo padrão do backend
      const dadosRelatorio = {
        numeroProcesso: form.numeroProcesso,
        numeroDespacho: form.numeroDespacho || '',
        dataDespacho: form.dataDespacho || '',
        origemProcesso: form.origemProcesso || '',
        dataFato: form.dataFato || '',
        vitimas: Array.isArray(vitimas) ? vitimas : [],
        investigados: Array.isArray(investigados) ? investigados : [],
        descricaoFatos: form.descricaoFatos || '',
        statusFuncional: form.statusFuncional || '',
        diligenciasRealizadas: form.diligenciasRealizadas || {},
        numeroSigpad: form.numeroSigpad || '',
        documentos: [],
        tipoCrime: form.tipoCrime || '',
        crimesSelecionados: form.crimesSelecionados || [],
        transgressao: form.transgressao || '',
        modusOperandi: form.modusOperandi || '',
        redistribuicao: form.redistribuicao || '',
        sugestoes: form.sugestoes || ''
      };

      console.log('📋 Dados estruturados para IA:', dadosRelatorio);

      // Chamar IA
      console.log('🤖 Chamando serviço OpenAI...');
      const relatorioIA = await openaiService.gerarRelatorioJuridico(dadosRelatorio);
      
      console.log('📄 Relatório gerado:', relatorioIA);
      
      // Converter o relatório estruturado para texto completo
      const relatorioTexto = `
${relatorioIA.cabecalho}

## I – DAS PRELIMINARES
${relatorioIA.das_preliminares}

## II – DOS FATOS
${relatorioIA.dos_fatos}

## III – DAS DILIGÊNCIAS
${relatorioIA.das_diligencias}

## IV – DA FUNDAMENTAÇÃO
${relatorioIA.da_fundamentacao}

## V – DA CONCLUSÃO
${relatorioIA.da_conclusao}
      `.trim();
      
      console.log('📝 Relatório convertido para texto:', relatorioTexto);
      
      // Atualizar o campo no formulário
      setField("relatorioFinal", relatorioTexto);
      
      // Salvar relatório no banco usando ID se for edição, ou número do processo se for novo
      let error;
      if (isEditMode && processo?.id) {
        console.log('💾 Salvando relatório no banco (modo edição) - ID:', processo.id);
        const result = await supabase.from("processos").update({
          relatorio_final: relatorioTexto,
          data_relatorio_final: new Date().toISOString(),
          relatorio_gerado_por: 'Sistema'
        }).eq("id", processo.id);
        error = result.error;
      } else {
        console.log('💾 Salvando relatório no banco (modo novo) - Número:', form.numeroProcesso);
        const result = await supabase.from("processos").update({
          relatorio_final: relatorioTexto,
          data_relatorio_final: new Date().toISOString(),
          relatorio_gerado_por: 'Sistema'
        }).eq("numero_processo", form.numeroProcesso);
        error = result.error;
      }
      
      if (error) {
        console.error('❌ Erro ao salvar no banco:', error);
        throw error;
      }
      
      console.log('✅ Relatório salvo com sucesso no banco');
      
      toast({
        title: "Relatório gerado com sucesso!",
        description: "Relatório final gerado e salvo com sucesso."
      });
    } catch (err: unknown) {
      console.error('❌ Erro ao gerar relatório:', err);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao gerar relatório.";
      toast({
        title: "Erro ao gerar relatório",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Renderização
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4 overflow-auto">
      <Card className="w-full max-w-6xl h-full max-h-[95vh] flex flex-col bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-3xl font-bold tracking-wide">{isEditMode ? "Editar Processo" : "Novo Processo"}</CardTitle>
            <Button 
              onClick={onProcessCreated} 
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Dashboard
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <Tabs value={aba} onValueChange={setAba} className="w-full">
            <TabsList className="mb-6 flex flex-wrap gap-2 justify-center">
              <TabsTrigger value="dados-basicos" className="text-white data-[state=active]:bg-blue-700/80 data-[state=active]:text-white px-6 py-2 rounded-lg font-semibold">Dados Básicos</TabsTrigger>
              <TabsTrigger value="detalhes" className="text-white data-[state=active]:bg-blue-700/80 data-[state=active]:text-white px-6 py-2 rounded-lg font-semibold">Detalhes</TabsTrigger>
              <TabsTrigger value="investigado-vitima" className="text-white data-[state=active]:bg-blue-700/80 data-[state=active]:text-white px-6 py-2 rounded-lg font-semibold">Investigado/Vítima</TabsTrigger>
              <TabsTrigger value="relatorio-ia" className="text-white data-[state=active]:bg-blue-700/80 data-[state=active]:text-white px-6 py-2 rounded-lg font-semibold">Relatório IA</TabsTrigger>
            </TabsList>

            <TabsContent value="dados-basicos" className="space-y-8 mt-6">
              <div className="bg-white/20 rounded-xl p-6 shadow-md border border-white/30 flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-xl font-bold text-blue-200 mb-4 text-center">Dados Básicos do Processo</h2>
                <div className="w-full max-w-2xl grid grid-cols-1 gap-8 mx-auto">
                  <ProcessBasicDataForm
                    formData={form}
                    setField={setField}
                    isEditMode={isEditMode}
                    textoTipificacao={iaTipificacao}
                    setTextoTipificacao={setIaTipificacao}
                    iaTipificacao={iaTipificacao}
                    iaPrescricao={iaPrescricao}
                    isInterpretandoIA={isInterpretandoIA}

                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSaveBasic} disabled={isLoading} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 font-semibold rounded-lg">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isEditMode ? "Salvar Dados Básicos" : "Salvar Dados Básicos"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="detalhes" className="space-y-8 mt-6">
              <div className="bg-white/20 rounded-xl p-6 shadow-md border border-white/30">
                <h2 className="text-xl font-bold text-blue-200 mb-4">Detalhes do Processo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProcessDetailsForm
                    formData={form}
                    setField={setField}
                    isSavingDetalhes={isSavingDetalhes}
                    handleSaveDetalhes={handleSaveDetalhes}
                    savedProcessId={isEditMode ? processo?.id : null}
                    editProcess={isEditMode ? processo : null}
                  />
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSaveDetalhes} disabled={isSavingDetalhes} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 font-semibold rounded-lg">
                    {isSavingDetalhes ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {isEditMode ? "Salvar Detalhes" : "Salvar Detalhes"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="investigado-vitima" className="space-y-8 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/20 rounded-xl p-6 shadow-md border border-white/30">
                  <h2 className="text-xl font-bold text-blue-200 mb-4">Investigados</h2>
                  {investigados.map((inv, idx) => {
                    const searchCargo = searchCargos[idx] || "";
                    const cargosFiltrados = CARGOS_INVESTIGADO.filter(c => c.toLowerCase().includes(searchCargo.toLowerCase()));
                    const searchUnidade = searchUnidades[idx] || "";
                    const unidadesFiltradas = [
                      ...UNIDADES_PM.filter(u => u.toLowerCase().includes(searchUnidade.toLowerCase())),
                      ...UNIDADES_EXTRAS.filter(u => u.toLowerCase().includes(searchUnidade.toLowerCase()))
                    ];
                    const searchUnidadeBM = searchUnidadesBM[idx] || "";
                    const unidadesBMFiltradas = [
                      ...UNIDADES_BM.filter(u => u.toLowerCase().includes(searchUnidadeBM.toLowerCase())),
                      ...UNIDADES_EXTRAS.filter(u => u.toLowerCase().includes(searchUnidadeBM.toLowerCase()))
                    ];
                    const searchUnidadePericia = searchUnidadesPericia[idx] || "";
                    const unidadesPericiaFiltradas = UNIDADES_PERICIA.filter(u => u.toLowerCase().includes(searchUnidadePericia.toLowerCase()));
                    const searchLotacaoCirc = searchLotacoesCirc[idx] || "";
                    const lotacoesCircFiltradas = [
                      ...LOTACOES_CIRC_DESEC.filter(u => u.toLowerCase().includes(searchLotacaoCirc.toLowerCase())),
                      ...UNIDADES_EXTRAS.filter(u => u.toLowerCase().includes(searchLotacaoCirc.toLowerCase()))
                    ];
                    const searchUnidadeLivre = searchUnidade; // Reutiliza searchUnidade para input livre
                    const unidadesExtrasFiltradas = UNIDADES_EXTRAS.filter(u => u.toLowerCase().includes(searchUnidadeLivre.toLowerCase()));
                    const cargoUpper = normalize(inv.cargo || "");
                    const isPM = cargoUpper.includes("PM");
                    const isBM = cargoUpper.includes("BM");
                    const isCirc = CARGOS_CIRC_DESEC.some(c => cargoUpper === c);
                    const isPericia = CARGOS_PERICIA.some(c => cargoUpper === normalize(c));
                    return (
                      <div key={inv.id} className="mb-4 p-4 bg-blue-900/10 rounded-lg border border-blue-700/30 flex flex-col gap-2 relative">
                        <div className="flex flex-col md:flex-row gap-2">
                          <Input
                            placeholder="Nome do Investigado"
                            value={inv.nome}
                            onChange={e => updateInvestigado(inv.id, "nome", e.target.value)}
                            className="bg-white/30 text-white placeholder:text-blue-200"
                          />
                          <div className="w-full">
                            <Input
                              placeholder="Buscar cargo..."
                              value={searchCargo}
                              onChange={e => handleSearchCargoChange(idx, e.target.value)}
                              className="mb-2 bg-white/20 text-white placeholder:text-blue-200"
                            />
                            <Select value={inv.cargo} onValueChange={v => updateInvestigado(inv.id, "cargo", v)}>
                              <SelectTrigger className="bg-white/30 text-white placeholder:text-blue-200">
                                <SelectValue placeholder="Cargo do Investigado" />
                              </SelectTrigger>
                              <SelectContent>
                                {cargosFiltrados.map(cargo => (
                                  <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2">
                          <Input
                            placeholder="Matrícula do Investigado"
                            value={inv.matricula}
                            onChange={e => updateInvestigado(inv.id, "matricula", e.target.value)}
                            className="bg-white/30 text-white placeholder:text-blue-200"
                          />
                          <Input
                            placeholder="Data de Admissão"
                            type="date"
                            value={inv.dataAdmissao ? (typeof inv.dataAdmissao === 'string' ? inv.dataAdmissao : inv.dataAdmissao.toISOString().slice(0,10)) : ''}
                            onChange={e => updateInvestigado(inv.id, "dataAdmissao", e.target.value)}
                            className="bg-white/30 text-white placeholder:text-blue-200"
                          />
                          {isCirc ? (
                            <div className="w-full">
                              <Input
                                placeholder="Buscar lotação..."
                                value={searchLotacaoCirc}
                                onChange={e => handleSearchLotacaoCircChange(idx, e.target.value)}
                                className="mb-2 bg-white/20 text-white placeholder:text-blue-200"
                              />
                              <Select value={inv.unidade} onValueChange={v => updateInvestigado(inv.id, "unidade", v)}>
                                <SelectTrigger className="bg-white/30 text-white placeholder:text-blue-200">
                                  <SelectValue placeholder="Lotação Atual (CIRC/DESEC/DP Mulher)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {lotacoesCircFiltradas.map(unidade => (
                                    <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : isPM ? (
                            <div className="w-full">
                              <Input
                                placeholder="Buscar unidade..."
                                value={searchUnidade}
                                onChange={e => handleSearchUnidadeChange(idx, e.target.value)}
                                className="mb-2 bg-white/20 text-white placeholder:text-blue-200"
                              />
                              <Select value={inv.unidade} onValueChange={v => updateInvestigado(inv.id, "unidade", v)}>
                                <SelectTrigger className="bg-white/30 text-white placeholder:text-blue-200">
                                  <SelectValue placeholder="Lotação Atual (PM)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unidadesFiltradas.map(unidade => (
                                    <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : isBM ? (
                            <div className="w-full">
                              <Input
                                placeholder="Buscar unidade..."
                                value={searchUnidadeBM}
                                onChange={e => handleSearchUnidadeBMChange(idx, e.target.value)}
                                className="mb-2 bg-white/20 text-white placeholder:text-blue-200"
                              />
                              <Select value={inv.unidade} onValueChange={v => updateInvestigado(inv.id, "unidade", v)}>
                                <SelectTrigger className="bg-white/30 text-white placeholder:text-blue-200">
                                  <SelectValue placeholder="Lotação Atual (BM)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unidadesBMFiltradas.map(unidade => (
                                    <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : isPericia ? (
                            <div className="w-full">
                              <Input
                                placeholder="Buscar unidade..."
                                value={searchUnidadePericia}
                                onChange={e => handleSearchUnidadePericiaChange(idx, e.target.value)}
                                className="mb-2 bg-white/20 text-white placeholder:text-blue-200"
                              />
                              <Select value={inv.unidade} onValueChange={v => updateInvestigado(inv.id, "unidade", v)}>
                                <SelectTrigger className="bg-white/30 text-white placeholder:text-blue-200">
                                  <SelectValue placeholder="Lotação Atual (Perícia)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unidadesPericiaFiltradas.map(unidade => (
                                    <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="w-full">
                              <Input
                                placeholder="Buscar lotação..."
                                value={searchUnidadeLivre}
                                onChange={e => handleSearchUnidadeChange(idx, e.target.value)}
                                className="mb-2 bg-white/20 text-white placeholder:text-blue-200"
                              />
                              <Select value={inv.unidade} onValueChange={v => updateInvestigado(inv.id, "unidade", v)}>
                                <SelectTrigger className="bg-white/30 text-white placeholder:text-blue-200">
                                  <SelectValue placeholder="Lotação Atual (Outros)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unidadesExtrasFiltradas.map(unidade => (
                                    <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      <div className="flex justify-end mt-2">
                        <Button type="button" variant="destructive" className="bg-red-700 hover:bg-red-800 text-white" onClick={() => removeInvestigado(inv.id)}>
                          Remover
                        </Button>
                      </div>
                    </div>
                  );
                })}
                  <Button type="button" onClick={addInvestigado} className="bg-green-700 hover:bg-green-800 text-white mt-2 w-full">Adicionar Investigado</Button>
                </div>
                <div className="bg-white/20 rounded-xl p-6 shadow-md border border-white/30">
                  <h2 className="text-xl font-bold text-blue-200 mb-4">Vítimas</h2>
                  {vitimas.map((v, idx) => (
                    <div key={v.id} className="mb-2 flex gap-2 items-center">
                      <Input
                        placeholder="Nome da Vítima"
                        value={v.nome}
                        onChange={e => updateVitima(v.id, e.target.value)}
                        className="bg-white/30 text-white placeholder:text-blue-200"
                      />
                      <Button type="button" variant="destructive" className="bg-red-700 hover:bg-red-800 text-white" onClick={() => removeVitima(v.id)}>
                        Remover
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={addVitima} className="bg-green-700 hover:bg-green-800 text-white mt-2 w-full">Adicionar Vítima</Button>
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSaveInvestigadosVitimas} disabled={isLoading} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 font-semibold rounded-lg">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Investigado/Vítima
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="relatorio-ia" className="space-y-8 mt-6">
              <div className="bg-white/20 rounded-xl p-6 shadow-md border border-white/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-blue-200">Relatório Final Gerado (IA)</h2>
                  {form.relatorioFinal && (
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm">Relatório disponível</span>
                    </div>
                  )}
                </div>

                {/* Seletor de Processo (apenas quando não está editando) */}
                {!isEditMode && (
                  <div className="bg-white/10 rounded-lg p-4 border border-white/20 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Selecionar Processo para Relatório</h3>
                    <ProcessSelector 
                      onProcessSelect={(selectedProcess) => {
                        console.log('Processo selecionado para relatório:', selectedProcess);
                        // Preencher o formulário com os dados do processo selecionado
                        setForm(prev => ({
                          ...prev,
                          numeroProcesso: selectedProcess.numero_processo,
                          numeroDespacho: selectedProcess.numero_despacho || '',
                          dataDespacho: selectedProcess.data_despacho || '',
                          origemProcesso: selectedProcess.origem_processo || '',
                          dataFato: selectedProcess.data_fato || '',
                          descricaoFatos: selectedProcess.descricao_fatos || '',
                          statusFuncional: selectedProcess.status_funcional || '',
                          diligenciasRealizadas: selectedProcess.diligencias_realizadas || {},
                          numeroSigpad: selectedProcess.numero_sigpad || '',
                          tipoCrime: selectedProcess.tipo_crime || '',
                          crimesSelecionados: selectedProcess.crimes_selecionados || [],
                          transgressao: selectedProcess.transgressao || '',
                          modusOperandi: selectedProcess.modus_operandi || '',
                          redistribuicao: selectedProcess.redistribuicao || '',
                          sugestoes: selectedProcess.sugestoes || '',
                          relatorioFinal: selectedProcess.relatorio_final || ''
                        }));
                        
                        // Preencher investigados e vítimas
                        if (selectedProcess.investigados) {
                          setInvestigados(Array.isArray(selectedProcess.investigados) ? selectedProcess.investigados : []);
                        }
                        if (selectedProcess.vitimas) {
                          setVitimas(Array.isArray(selectedProcess.vitimas) ? selectedProcess.vitimas : []);
                        }
                      }}
                    />
                  </div>
                )}
                
                {form.relatorioFinal ? (
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">Relatório Técnico-Jurídico</h3>
                        <Button 
                          onClick={() => {
                            const blob = new Blob([form.relatorioFinal], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `relatorio_${form.numeroProcesso}_${new Date().toISOString().split('T')[0]}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm"
                        >
                          📄 Download TXT
                        </Button>
                      </div>
                      <Textarea
                        value={form.relatorioFinal}
                        onChange={e => setField("relatorioFinal", e.target.value)}
                        className="bg-white/30 border-white/30 text-white min-h-[300px] placeholder:text-blue-200 font-mono text-sm"
                        placeholder="O relatório gerado pela IA aparecerá aqui..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/10 rounded-lg p-8 text-center border border-white/20">
                    <div className="text-blue-200 mb-4">
                      <Brain className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                      <h3 className="text-lg font-semibold mb-2">
                        {isEditMode ? 'Nenhum relatório gerado' : 'Selecione um processo para gerar relatório'}
                      </h3>
                      <p className="text-sm">
                        {isEditMode 
                          ? 'Clique em "Gerar Relatório com IA" para criar um relatório técnico-jurídico completo.'
                          : 'Escolha um processo da lista acima e clique em "Gerar Relatório com IA" para criar um relatório técnico-jurídico completo.'
                        }
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4 mt-6">
                  <Button 
                    onClick={handleSaveRelatorioIA} 
                    disabled={isLoading || !form.relatorioFinal} 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold rounded-lg"
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Relatório
                  </Button>
                  <Button 
                    onClick={handleGerarRelatorioIA} 
                    disabled={isGeneratingReport || !form.numeroProcesso} 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold rounded-lg"
                  >
                    {isGeneratingReport ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Gerando Relatório...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Gerar Relatório com IA
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={onProcessCreated} 
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 font-semibold rounded-lg"
                  >
                    Concluir
                  </Button>
                </div>
                
                {isGeneratingReport && (
                  <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <div className="flex items-center gap-2 text-blue-200">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processando dados e gerando relatório técnico-jurídico...</span>
                    </div>
                    <p className="text-sm text-blue-300 mt-2">
                      Isso pode levar alguns minutos. O relatório será estruturado conforme o modelo padrão.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 