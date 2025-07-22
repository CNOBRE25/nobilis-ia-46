import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, FileText, AlertTriangle, Brain, Users, UserPlus, Trash2, Printer, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { openaiService, RelatorioDados, RelatorioIA as RelatorioIAType } from "@/services/openaiService";
import RelatorioIA from "./RelatorioIA";
import { usePareceres } from "@/hooks/usePareceres";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCrimeStats } from "../hooks/useCrimeStats";
import { ProcessBasicDataForm } from "./ProcessBasicDataForm";
import { validateRequiredFields } from '@/utils/validation';
import { ProcessDetailsForm } from "./ProcessDetailsForm";

interface ProcessFormProps {
  onClose: () => void;
  onProcessSaved?: () => void;
  editProcess?: any;
  isEditMode?: boolean;
}

const ProcessForm = ({ onClose, onProcessSaved, editProcess, isEditMode = false }: ProcessFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useRoles();
  const { saveParecer } = usePareceres(user && user.id && user.email ? { id: user.id, email: user.email, role: (user as any).role || 'user' } : undefined);
  const { refreshStats: refreshCrimeStats } = useCrimeStats();
  const [isLoading, setIsLoading] = useState(false);
  const [showRelatorioIA, setShowRelatorioIA] = useState(false);
  const [relatorioIA, setRelatorioIA] = useState<RelatorioIAType | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingParecer, setIsGeneratingParecer] = useState(false);
  const [savedProcessId, setSavedProcessId] = useState<string | null>(editProcess?.id || null);
  const [isSavingDadosBasicos, setIsSavingDadosBasicos] = useState(false);
  const [isSavingDetalhes, setIsSavingDetalhes] = useState(false);
  const [isSavingInvestigados, setIsSavingInvestigados] = useState(false);
  const [processoCriadoAutomaticamente, setProcessoCriadoAutomaticamente] = useState(false);
  const [formData, setFormData] = useState({
    numeroProcesso: editProcess?.numero_processo || "",
    tipoProcesso: editProcess?.tipo_processo || "",
    prioridade: editProcess?.prioridade || "",
    numeroDespacho: editProcess?.numero_despacho || "",
    dataDespacho: editProcess?.data_despacho ? new Date(editProcess?.data_despacho) : null,
    dataRecebimento: editProcess?.data_recebimento ? new Date(editProcess?.data_recebimento) : null,
    dataFato: editProcess?.data_fato ? new Date(editProcess?.data_fato) : null,
    origemProcesso: editProcess?.origem_processo || "",
    descricaoFatos: editProcess?.descricao_fatos || "",
    diligenciasRealizadas: editProcess?.diligencias_realizadas || {},
    desfechoFinal: editProcess?.desfecho_final || "",
    redistribuicao: editProcess?.redistribuicao || "",
    sugestoes: editProcess?.sugestoes || "",
    statusFuncional: editProcess?.status_funcional || "",
    tipoCrime: editProcess?.tipo_crime || "",
    transgressao: editProcess?.transgressao || ""
  });
  const prevFormData = useRef(formData);

  // Remover useEffect de auto-save
  // Remover handleSaveDadosBasicos e toda lógica de cadastro de novo processo
  // Não remova lógica de edição, detalhes, investigados, ou integração IA

  // Estado para múltiplos investigados e vítimas
  const [investigados, setInvestigados] = useState(() => {
    if (editProcess?.investigados && Array.isArray(editProcess.investigados)) {
      return editProcess.investigados;
    } else if (editProcess?.nome_investigado) {
      // Se há um investigado único, convertê-lo para o formato de array
      return [{
        id: Date.now(),
        nome: editProcess.nome_investigado || "",
        cargo: editProcess.cargo_investigado || "",
        unidade: editProcess.unidade_investigado || "",
        matricula: editProcess.matricula_investigado || "",
        dataAdmissao: editProcess.data_admissao ? new Date(editProcess.data_admissao) : null
      }];
    }
    return [];
  });

  // Função para converter sexo do banco para o formato do formulário
  const converterSexoBancoParaFormulario = (sexo: string) => {
    switch (sexo) {
      case 'M': return 'masculino';
      case 'F': return 'feminino';
      case 'Não especificado': return 'nao_informado';
      default: return 'nao_informado';
    }
  };

  // 1. Remover o estado e funções relacionadas a 'vitimas', 'addVitima', 'updateVitima', 'removeVitima'.
  // 2. Remover campos e lógica de vítima e idade_vitima dos objetos processData e dos fluxos de salvamento.
  // 3. Remover referências a vítima em RelatorioDados e relatórios IA.
  // 4. Remover qualquer campo de vítima do formulário e do JSX.

  // 1. Adicionar estado para tipificação criminal
  const [crimeSelecionado, setCrimeSelecionado] = useState(editProcess?.crime || "");
  const [legislacaoSelecionada, setLegislacaoSelecionada] = useState(editProcess?.legislacao || "");

  // 1. Novo estado para texto livre e resultado da IA
  const [textoTipificacao, setTextoTipificacao] = useState("");
  const [iaTipificacao, setIaTipificacao] = useState<string | null>(null);
  const [iaPrescricao, setIaPrescricao] = useState<string | null>(null);
  const [isInterpretandoIA, setIsInterpretandoIA] = useState(false);

  // Função para interpretar via IA
  const interpretarTipificacaoIA = async () => {
    if (!textoTipificacao || !formData.dataFato) return;
    setIsInterpretandoIA(true);
    setIaTipificacao(null);
    setIaPrescricao(null);
    try {
      // Chame o serviço de IA (exemplo fictício, ajuste conforme seu openaiService)
      const resposta = await openaiService.interpretarTipificacao({
        texto: textoTipificacao,
        dataFato: formData.dataFato
      });
      setIaTipificacao(resposta.tipificacao);
      setIaPrescricao(resposta.dataPrescricao);
    } catch (err) {
      setIaTipificacao("Erro ao interpretar via IA");
      setIaPrescricao(null);
    } finally {
      setIsInterpretandoIA(false);
    }
  };

  // Funções para gerenciar investigados
  const addInvestigado = () => {
    const novoInvestigado = {
      id: Date.now(),
      nome: "",
      cargo: "",
      unidade: "",
      matricula: "",
      dataAdmissao: null
    };
    setInvestigados([...investigados, novoInvestigado]);
  };

  const updateInvestigado = (id: number, field: string, value: any) => {
    setInvestigados(investigados.map(inv => 
      inv.id === id ? { ...inv, [field]: value } : inv
    ));
  };

  // Funções para gerenciar vítimas
  // 1. Remover o estado e funções relacionadas a 'vitimas', 'addVitima', 'updateVitima', 'removeVitima'.
  // 2. Remover campos e lógica de vítima e idade_vitima dos objetos processData e dos fluxos de salvamento.
  // 3. Remover referências a vítima em RelatorioDados e relatórios IA.
  // 4. Remover qualquer campo de vítima do formulário e do JSX.

  const handleGerarRelatorioIA = async () => {
    if (!formData.descricaoFatos) {
      toast({
        title: "Dados insuficientes",
        description: "Preencha a descrição dos fatos para gerar a análise.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingReport(true);

    try {
      // Preparar dados para a análise IA
      const dadosRelatorio: RelatorioDados = {
        nome: investigados.length > 0 ? investigados[0].nome : "Não informado",
        tipo_investigado: formData.tipoProcesso,
        cargo: investigados.length > 0 ? investigados[0].cargo : "Não informado",
        unidade: investigados.length > 0 ? investigados[0].unidade : "Não informado",
        data_fato: formData.dataFato ? format(formData.dataFato, "dd/MM/yyyy") : "Não informado",
        descricao: formData.descricaoFatos,
        numero_despacho: formData.numeroDespacho,
        data_despacho: formData.dataDespacho ? format(formData.dataDespacho, "dd/MM/yyyy") : "Não informado",
        origem: formData.origemProcesso,
        matricula: investigados.length > 0 ? investigados[0].matricula : "Não informado",
        data_admissao: investigados.length > 0 && investigados[0].dataAdmissao ? format(investigados[0].dataAdmissao, "dd/MM/yyyy") : "Não informado"
      };

      const relatorio = await openaiService.gerarRelatorioJuridico(dadosRelatorio);
      setRelatorioIA(relatorio);
      setShowRelatorioIA(true);

      toast({
        title: "Análise IA Gerada!",
        description: "Relatório jurídico foi gerado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório IA:', error);
      toast({
        title: "Erro na Análise IA",
        description: "Erro ao gerar relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGerarRelatorio = async () => {
    if (!formData.descricaoFatos) {
      toast({
        title: "Dados insuficientes",
        description: "Preencha a descrição dos fatos para gerar o relatório.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingParecer(true);

    try {
      // Preparar dados para a análise IA
      const dadosRelatorio: RelatorioDados = {
        nome: investigados.length > 0 ? investigados[0].nome : "Não informado",
        tipo_investigado: formData.tipoProcesso,
        cargo: investigados.length > 0 ? investigados[0].cargo : "Não informado",
        unidade: investigados.length > 0 ? investigados[0].unidade : "Não informado",
        data_fato: formData.dataFato ? format(formData.dataFato, "dd/MM/yyyy") : "Não informado",
        descricao: formData.descricaoFatos,
        numero_despacho: formData.numeroDespacho,
        data_despacho: formData.dataDespacho ? format(formData.dataDespacho, "dd/MM/yyyy") : "Não informado",
        origem: formData.origemProcesso,
        matricula: investigados.length > 0 ? investigados[0].matricula : "Não informado",
        data_admissao: investigados.length > 0 && investigados[0].dataAdmissao ? format(investigados[0].dataAdmissao, "dd/MM/yyyy") : "Não informado"
      };

      const relatorio = await openaiService.gerarRelatorioJuridico(dadosRelatorio);
      
      // Criar parecer com os dados do relatório
      const parecerData = {
        numero_protocolo: formData.numeroProcesso,
        titulo: `Relatório de Investigação - ${formData.numeroProcesso}`,
        servidores: investigados.map(inv => ({
          nome: inv.nome,
          matricula: inv.matricula,
          categoria_funcional: inv.cargo,
          situacao_servico: "em_servico"
        })),
        data_fato: formData.dataFato ? formData.dataFato.toISOString().split('T')[0] : null,
        data_prescricao: null, // Será calculado automaticamente
        conteudo_parecer: relatorio.raw_response,
        questao_principal: `Análise jurídica do processo ${formData.numeroProcesso}`,
        caso_descricao: formData.descricaoFatos,
        area_direito: "penal_militar",
        complexidade: "media",
        tipo_crime: formData.tipoCrime || "Não especificado",
        legislacao_aplicavel: "Código Penal Militar",
        status: "rascunho" as const,
        urgencia: (formData.prioridade === "alta" ? "alta" : "media") as "alta" | "media" | "baixa",
        orgao: "PM-PE",
        usuario_id: user?.id
      };

      await saveParecer(parecerData);

      toast({
        title: "Relatório Gerado!",
        description: "Relatório foi gerado e salvo na aba Pareceres. Você pode visualizá-lo, imprimir ou baixar em PDF.",
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao Gerar Relatório",
        description: "Erro ao gerar relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingParecer(false);
    }
  };

  // Função auxiliar para buscar ID do usuário
  const getUserId = async () => {
      const currentUser = user;
      if (!currentUser) {
        toast({
          title: "Erro de Autenticação",
          description: "Usuário não autenticado. Faça login novamente.",
          variant: "destructive"
        });
      return null;
      }

      try {
      const { data: userProfile, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', currentUser.email)
          .single();
        
      if (userError) {
        console.error("Erro ao buscar usuário:", userError);
        toast({
          title: "Erro de Usuário",
          description: "Erro ao buscar dados do usuário.",
          variant: "destructive"
        });
        return null;
      }
      
      return userProfile?.id || null;
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      toast({
        title: "Erro de Usuário",
        description: "Erro ao buscar dados do usuário.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Salvar Dados Básicos (obrigatório para criar processo)
  // Remover handleSaveDadosBasicos e toda lógica de cadastro de novo processo
  // Não remova lógica de edição, detalhes, investigados, ou integração IA

  // Salvar Detalhes (requer processo já criado)
  const handleSaveDetalhes = async () => {
    if (!savedProcessId && !editProcess?.id) {
      toast({
        title: "Processo não criado",
        description: "Salve os dados básicos primeiro para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingDetalhes(true);

    try {
      const processId = savedProcessId || editProcess?.id;
      
      const processData = {
        diligencias_realizadas: formData.diligenciasRealizadas || {},
        desfecho_final: formData.desfechoFinal || null,
        redistribuicao: formData.redistribuicao || null,
        sugestoes: formData.sugestoes || null
      };

      const { data, error } = await supabase
        .from('processos' as any)
        .update(processData)
        .eq('id', processId)
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar detalhes:", error);
        toast({
          title: "Erro ao Salvar",
          description: `Erro ao salvar detalhes: ${error.message || 'Erro desconhecido'}`,
          variant: "destructive"
        });
      } else {
        console.log('Detalhes salvos com sucesso:', data);
        toast({
          title: "Detalhes Salvos!",
          description: "Detalhes do processo foram salvos com sucesso.",
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast({
        title: "Erro Inesperado",
        description: `Erro inesperado ao salvar detalhes: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setIsSavingDetalhes(false);
    }
  };

  // Salvar Investigados (requer processo já criado)
  const handleSaveInvestigados = async () => {
    if (!savedProcessId && !editProcess?.id) {
      toast({
        title: "Processo não criado",
        description: "Salve os dados básicos primeiro para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsSavingInvestigados(true);

    try {
      const processId = savedProcessId || editProcess?.id;
      const primeiroInvestigado = investigados[0] || {};
      
      // Converter valores do sexo da vítima para o formato do banco
      const converterSexoVitima = (sexo: string) => {
        switch (sexo) {
          case 'masculino': return 'M';
          case 'feminino': return 'F';
          case 'nao_informado': return 'Não especificado';
          default: return 'Não especificado';
        }
      };

      const processData: any = {
        nome_investigado: primeiroInvestigado.nome || null,
        cargo_investigado: primeiroInvestigado.cargo || null,
        unidade_investigado: primeiroInvestigado.unidade || null,
        matricula_investigado: primeiroInvestigado.matricula || null,
        data_admissao: primeiroInvestigado.dataAdmissao ? primeiroInvestigado.dataAdmissao.toISOString().split('T')[0] : null,
        crime_typing: formData.origemProcesso || null
      };

      // Só adiciona campos de vítima se houver nome preenchido
      if (primeiroInvestigado && primeiroInvestigado.nome && primeiroInvestigado.nome.trim() !== "") {
        processData.vitima = primeiroInvestigado.nome;
        processData.sexo_vitima = converterSexoVitima(primeiroInvestigado.sexo);
        processData.tipo_vitima = primeiroInvestigado.tipo || null;
        // Idade só se for número válido
        const idadeNum = parseInt(primeiroInvestigado.idade);
        processData.idade_vitima = !isNaN(idadeNum) ? idadeNum : null;
      } else {
        // Se não houver vítima, zera os campos no banco
        processData.vitima = null;
        processData.sexo_vitima = null;
        processData.tipo_vitima = null;
        processData.idade_vitima = null;
      }

      const { data, error } = await supabase
        .from('processos' as any)
        .update(processData)
        .eq('id', processId)
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar investigados:", error);
        toast({
          title: "Erro ao Salvar",
          description: `Erro ao salvar dados dos investigados: ${error.message || 'Erro desconhecido'}`,
          variant: "destructive"
        });
      } else {
        console.log('Investigados e vítimas salvos com sucesso:', data);
        toast({
          title: "Dados Salvos!",
          description: "Dados dos investigados e vítimas foram salvos com sucesso.",
        });
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast({
        title: "Erro Inesperado",
        description: `Erro inesperado ao salvar investigados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setIsSavingInvestigados(false);
    }
  };



  // Função de salvamento completo (mantida para compatibilidade)
  const handleSave = async () => {
    setIsLoading(true);
    let sucesso = true;
    let mensagemErro = '';
    try {
      // Remover handleSaveDadosBasicos e toda lógica de cadastro de novo processo
      // Não remova lógica de edição, detalhes, investigados, ou integração IA
      if (savedProcessId || editProcess?.id) {
        await handleSaveDetalhes();
        await handleSaveInvestigados();
      }
      await refreshCrimeStats();
    } catch (err) {
      sucesso = false;
      mensagemErro = err instanceof Error ? err.message : 'Erro desconhecido ao salvar o processo.';
    } finally {
      setIsLoading(false);
      if (sucesso) {
        toast({
          title: 'Processo salvo com sucesso!',
          description: 'Todos os dados do processo foram salvos e as estatísticas atualizadas.',
          variant: 'default',
        });
        if (onProcessSaved) onProcessSaved();
      } else {
        toast({
          title: 'Erro ao salvar processo',
          description: mensagemErro,
          variant: 'destructive',
        });
      }
    }
  };

  // Nova função para cadastrar novo processo
  const handleCadastrarProcesso = async () => {
    if (isLoading) return;
    // Validação dos campos obrigatórios
    const obrigatorios = [
      { nome: "Número do Processo", valor: formData.numeroProcesso },
      { nome: "Tipo de Processo", valor: formData.tipoProcesso },
      { nome: "Prioridade", valor: formData.prioridade },
      { nome: "Número do Despacho", valor: formData.numeroDespacho },
      { nome: "Data do Despacho", valor: formData.dataDespacho },
      { nome: "Data de Recebimento", valor: formData.dataRecebimento },
      { nome: "Data do Fato", valor: formData.dataFato },
      { nome: "Origem do Processo", valor: formData.origemProcesso },
      { nome: "Status Funcional", valor: formData.statusFuncional },
      { nome: "Descrição dos Fatos", valor: formData.descricaoFatos }
    ];
    const faltando = validateRequiredFields(obrigatorios);
    if (faltando.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: `Preencha: ${faltando.join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      // Verificar duplicidade
      const { data: existente, error: erroCheck } = await supabase
        .from('processos' as any)
        .select('id')
        .eq('numero_processo', formData.numeroProcesso.trim())
        .maybeSingle();
      if (erroCheck && erroCheck.code !== 'PGRST116') {
        toast({
          title: "Erro ao verificar duplicidade",
          description: erroCheck.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      if (existente) {
        toast({
          title: "Processo já existe",
          description: `Já existe um processo com o número ${formData.numeroProcesso}`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      // Criar processo
      const { data: novo, error: erroInsert } = await supabase
        .from('processos' as any)
        .insert([{
          numero_processo: formData.numeroProcesso.trim(),
          tipo_processo: formData.tipoProcesso,
          prioridade: formData.prioridade,
          numero_despacho: formData.numeroDespacho,
          data_despacho: formData.dataDespacho ? formData.dataDespacho.toISOString() : null,
          data_recebimento: formData.dataRecebimento ? formData.dataRecebimento.toISOString() : null,
          data_fato: formData.dataFato ? formData.dataFato.toISOString() : null,
          origem_processo: formData.origemProcesso,
          status_funcional: formData.statusFuncional,
          descricao_fatos: formData.descricaoFatos,
          status: 'tramitacao',
          user_id: user?.id || null,
          tipo_crime: formData.tipoCrime || null,
          transgressao: formData.transgressao || null
        }])
        .select()
        .single();
      if (erroInsert) {
        toast({
          title: "Erro ao cadastrar processo",
          description: erroInsert.message,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      setSavedProcessId((novo as any).id);
      setProcessoCriadoAutomaticamente(true);
      toast({
        title: "Processo cadastrado com sucesso!",
        description: `Processo ${(novo as any).numero_processo} foi criado.`,
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Erro inesperado",
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-50 overflow-auto">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {isEditMode 
                ? `Editar Processo - ${editProcess?.numero_processo}` 
                : savedProcessId 
                  ? `Processo - ${formData.numeroProcesso}` 
                  : 'Cadastrar Novo Processo'
              }
            </h1>
            {processoCriadoAutomaticamente && !isEditMode && (
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✅ Processo Criado
                </span>
                <span className="text-green-400 text-sm">
                  ID: {savedProcessId} | Número: {formData.numeroProcesso}
                </span>
              </div>
            )}
          </div>
          <Button onClick={onClose} variant="outline" className="text-white border-white">
            Fechar
          </Button>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <Tabs defaultValue="dados-basicos" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/20">
                <TabsTrigger value="dados-basicos" className="text-white data-[state=active]:bg-white/30">
                  Dados Básicos
                </TabsTrigger>
                <TabsTrigger 
                  value="detalhes" 
                  className={`text-white data-[state=active]:bg-white/30 ${(!savedProcessId && !editProcess?.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!savedProcessId && !editProcess?.id}
                >
                  Detalhes
                </TabsTrigger>
                <TabsTrigger 
                  value="investigados" 
                  className={`text-white data-[state=active]:bg-white/30 ${(!savedProcessId && !editProcess?.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!savedProcessId && !editProcess?.id}
                >
                  Investigados
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dados-basicos" className="space-y-6 mt-6">
                {!savedProcessId && !editProcess?.id && (
                  <div className="p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg text-white">
                    <div className="flex items-center">
                      <span className="font-medium">📋 Informações Principais</span>
                    </div>
                    <p className="mt-1 text-white/80 text-sm">
                      Preencha todas as informações principais. O processo será criado ao clicar em "Cadastrar Processo". Após a criação, as outras abas serão habilitadas.
                    </p>
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={handleCadastrarProcesso}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                      >
                        {isLoading ? 'Cadastrando...' : 'Cadastrar Processo'}
                      </Button>
                    </div>
                  </div>
                )}
                
                <ProcessBasicDataForm
                  formData={formData}
                  setFormData={setFormData}
                  isEditMode={isEditMode}
                  textoTipificacao={textoTipificacao}
                  setTextoTipificacao={setTextoTipificacao}
                  iaTipificacao={iaTipificacao}
                  iaPrescricao={iaPrescricao}
                  isInterpretandoIA={isInterpretandoIA}
                  interpretarTipificacaoIA={interpretarTipificacaoIA}
                />
                {/* Botão de Salvar Dados Básicos removido */}
              </TabsContent>

              <TabsContent value="detalhes" className="space-y-6 mt-6">
                <ProcessDetailsForm
                  formData={formData}
                  setFormData={setFormData}
                  isSavingDetalhes={isSavingDetalhes}
                  handleSaveDetalhes={handleSaveDetalhes}
                  savedProcessId={savedProcessId}
                  editProcess={editProcess}
                />
              </TabsContent>

              <TabsContent value="investigados" className="space-y-6 mt-6">
                {/* Seção de Investigados */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-white text-lg font-semibold">Investigados</Label>
                    <Button 
                      onClick={addInvestigado} 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Investigado
                    </Button>
                  </div>

                  {investigados.length === 0 && (
                    <div className="text-white/70 text-center py-4 border border-white/20 rounded">
                      Nenhum investigado adicionado
                    </div>
                  )}

                  {investigados.map((investigado, index) => (
                    <Card key={investigado.id} className="bg-white/5 border-white/20">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-white font-medium">Investigado {index + 1}</Label>
                          <Button 
                            onClick={() => updateInvestigado(investigado.id, 'nome', '')} 
                            size="sm" 
                            variant="destructive"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white text-sm">Nome</Label>
                            <Input
                              value={investigado.nome}
                              onChange={(e) => updateInvestigado(investigado.id, 'nome', e.target.value)}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="Nome completo"
                            />
                          </div>
                          <div>
                            <Label className="text-white text-sm">Cargo</Label>
                            <Input
                              value={investigado.cargo}
                              onChange={(e) => updateInvestigado(investigado.id, 'cargo', e.target.value)}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="Cargo/função"
                            />
                          </div>
                          <div>
                            <Label className="text-white text-sm">Unidade</Label>
                            <Input
                              value={investigado.unidade}
                              onChange={(e) => updateInvestigado(investigado.id, 'unidade', e.target.value)}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="Unidade/órgão"
                            />
                          </div>
                          <div>
                            <Label className="text-white text-sm">Matrícula</Label>
                            <Input
                              value={investigado.matricula}
                              onChange={(e) => updateInvestigado(investigado.id, 'matricula', e.target.value)}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="Número da matrícula"
                            />
                          </div>
                          <div>
                            <Label className="text-white text-sm">Data de Admissão</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal bg-white/20 border-white/30 text-white",
                                    !investigado.dataAdmissao && "text-white/70"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {investigado.dataAdmissao ? format(investigado.dataAdmissao, "dd/MM/yyyy") : "Selecionar data"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={investigado.dataAdmissao || undefined}
                                  onSelect={(date) => updateInvestigado(investigado.id, 'dataAdmissao', date)}
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Botões de IA e Relatório - Apenas na aba Investigados */}
                <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded text-white text-sm">
                  <div className="flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    <span className="font-medium">Funcionalidades de IA</span>
                  </div>
                  <p className="mt-1 text-white/80">
                    Após preencher todos os dados do processo, utilize estes botões para gerar análises jurídicas 
                    e relatórios completos baseados em IA.
                  </p>
                </div>

                {/* Botão de Salvar Investigados */}
                <div className="flex justify-end pt-4 border-t border-white/20">
                  <Button
                    onClick={handleSaveInvestigados}
                    disabled={isSavingInvestigados || (!savedProcessId && !editProcess?.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    {isSavingInvestigados ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Investigados
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Botão de Salvar */}
            <div className="flex gap-4 pt-6">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Salvando todas as informações..." : "Salvar Todos os Dados"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal do Relatório IA */}
      {showRelatorioIA && relatorioIA && (
        <RelatorioIA
          relatorio={relatorioIA}
          onClose={() => setShowRelatorioIA(false)}
          dadosProcesso={{
            numero: formData.numeroProcesso,
            nome: investigados.length > 0 ? investigados[0].nome : "",
            unidade: investigados.length > 0 ? investigados[0].unidade : "",
            data: formData.dataFato ? format(formData.dataFato, "dd/MM/yyyy") : ""
          }}
        />
      )}
    </div>
  );
};

export default ProcessForm; 