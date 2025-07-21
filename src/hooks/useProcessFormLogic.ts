import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { openaiService, RelatorioIA as RelatorioIAType } from "@/services/openaiService";
import { usePareceres } from "@/hooks/usePareceres";
import { useCrimeStats } from "../hooks/useCrimeStats";

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
  const [investigados, setInvestigados] = useState(() => {
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
  });

  const [formData, setFormData] = useState({
    numeroProcesso: editProcess?.numero_processo || "",
    tipoProcesso: editProcess?.tipo_processo || "",
    prioridade: editProcess?.prioridade || "",
    numeroDespacho: editProcess?.numero_despacho || "",
    dataDespacho: editProcess?.data_despacho ? new Date(editProcess.data_despacho) : null,
    dataRecebimento: editProcess?.data_recebimento ? new Date(editProcess.data_recebimento) : null,
    dataFato: editProcess?.data_fato ? new Date(editProcess.data_fato) : null,
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

  // Tipificação criminal IA
  const [textoTipificacao, setTextoTipificacao] = useState("");
  const [iaTipificacao, setIaTipificacao] = useState<string | null>(null);
  const [iaPrescricao, setIaPrescricao] = useState<string | null>(null);
  const [isInterpretandoIA, setIsInterpretandoIA] = useState(false);

  const interpretarTipificacaoIA = async () => {
    if (!textoTipificacao || !formData.dataFato) return;
    setIsInterpretandoIA(true);
    setIaTipificacao(null);
    setIaPrescricao(null);
    try {
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

  // ... Outras funções de manipulação, salvamento, etc. (handleSave, etc.)

  return {
    formData,
    setFormData,
    investigados,
    setInvestigados,
    textoTipificacao,
    setTextoTipificacao,
    iaTipificacao,
    iaPrescricao,
    isInterpretandoIA,
    interpretarTipificacaoIA,
    isLoading,
    isEditMode,
    editProcess,
    // Adicione outros handlers e estados necessários
  };
} 