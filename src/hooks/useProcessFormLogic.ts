import { useState, useReducer } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { openaiService, RelatorioIA as RelatorioIAType } from "@/services/openaiService";
import { usePareceres } from "@/hooks/usePareceres";
import { useCrimeStats } from "../hooks/useCrimeStats";
import { supabase } from "@/integrations/supabase/client";

// Tipos de ação para o reducer

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: any }
  | { type: 'SET_FORM'; payload: any }
  | { type: 'ADD_INVESTIGADO'; payload: Investigado }
  | { type: 'UPDATE_INVESTIGADO'; id: number; field: string; value: any }
  | { type: 'SET_INVESTIGADOS'; payload: Investigado[] }
  | { type: 'RESET' };

function formReducer(state: any, action: FormAction) {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, formData: { ...state.formData, [action.field]: action.value } };
    case 'SET_FORM':
      return { ...state, formData: action.payload };
    case 'ADD_INVESTIGADO':
      return { ...state, investigados: [...state.investigados, action.payload] };
    case 'UPDATE_INVESTIGADO':
      return {
        ...state,
        investigados: state.investigados.map((inv: Investigado) =>
          inv.id === action.id ? { ...inv, [action.field]: action.value } : inv
        )
      };
    case 'SET_INVESTIGADOS':
      return { ...state, investigados: action.payload };
    case 'RESET':
      return action.payload;
    default:
      return state;
  }
}

export function useProcessFormLogic(editProcess?: any, isEditMode = false, onProcessSaved?: () => void) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useRoles();
  const { saveParecer } = usePareceres(user);
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

  // Estado para múltiplos investigados
  const initialInvestigados = (() => {
    if (editProcess?.investigados && Array.isArray(editProcess.investigados)) {
      return editProcess.investigados;
    } else if (editProcess?.nome_investigado) {
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
  })();
  const [state, dispatch] = useReducer(formReducer, {
    formData: {
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
    },
    investigados: initialInvestigados
  });

  // Wrappers para compatibilidade
  const setFormData = (newData: any) => dispatch({ type: 'SET_FORM', payload: newData });
  const setField = (field: string, value: any) => dispatch({ type: 'SET_FIELD', field, value });
  const setInvestigados = (arr: Investigado[]) => dispatch({ type: 'SET_INVESTIGADOS', payload: arr });
  const addInvestigado = (inv: Investigado) => dispatch({ type: 'ADD_INVESTIGADO', payload: inv });
  const updateInvestigado = (id: number, field: string, value: any) => dispatch({ type: 'UPDATE_INVESTIGADO', id, field, value });

  // Tipificação criminal IA
  const [textoTipificacao, setTextoTipificacao] = useState("");
  const [iaTipificacao, setIaTipificacao] = useState<string | null>(null);
  const [iaPrescricao, setIaPrescricao] = useState<string | null>(null);
  const [isInterpretandoIA, setIsInterpretandoIA] = useState(false);

  const interpretarTipificacaoIA = async () => {
    if (!textoTipificacao || !state.formData.dataFato) return;
    setIsInterpretandoIA(true);
    setIaTipificacao(null);
    setIaPrescricao(null);
    try {
      const resposta = await openaiService.interpretarTipificacao({
        texto: textoTipificacao,
        dataFato: state.formData.dataFato
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

  // Função para salvar o processo (exemplo robusto)
  const handleSave = async () => {
    setIsLoading(true);
    let sucesso = true;
    let mensagemErro = '';
    try {
      const { data, error } = await supabase
        .from('processos')
        .insert([
          {
            ...state.formData,
            user_id: user?.id || null,
            status: 'tramitacao',
          }
        ])
        .select()
        .single();
      if (error) {
        throw error;
      }
      toast({
        title: 'Processo salvo com sucesso!',
        description: 'Todos os dados do processo foram salvos.',
        variant: 'default',
      });
      if (onProcessSaved) onProcessSaved();
    } catch (err: any) {
      sucesso = false;
      mensagemErro = err.message || 'Erro desconhecido ao salvar o processo.';
      toast({
        title: 'Erro ao salvar processo',
        description: mensagemErro,
        variant: 'destructive',
      });
      console.error('Erro ao salvar processo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para cadastrar processo (exemplo)
  const handleCadastrarProcesso = async () => {
    // Implemente a lógica real de cadastro aqui
    await handleSave();
  };

  return {
    formData: state.formData,
    setFormData,
    setField,
    investigados: state.investigados,
    setInvestigados,
    addInvestigado,
    updateInvestigado,
    textoTipificacao,
    setTextoTipificacao,
    iaTipificacao,
    setIaTipificacao,
    iaPrescricao,
    setIaPrescricao,
    isInterpretandoIA,
    setIsInterpretandoIA,
    interpretarTipificacaoIA,
    isLoading,
    setIsLoading,
    isEditMode,
    editProcess,
    showRelatorioIA,
    setShowRelatorioIA,
    relatorioIA,
    setRelatorioIA,
    isGeneratingReport,
    setIsGeneratingReport,
    isGeneratingParecer,
    setIsGeneratingParecer,
    savedProcessId,
    setSavedProcessId,
    isSavingDadosBasicos,
    setIsSavingDadosBasicos,
    isSavingDetalhes,
    setIsSavingDetalhes,
    isSavingInvestigados,
    setIsSavingInvestigados,
    handleSave,
    handleCadastrarProcesso
  };
} 