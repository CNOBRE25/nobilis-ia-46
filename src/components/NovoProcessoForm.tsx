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
import DadosBasicosForm from './NovoProcessoForm/DadosBasicosForm';
import InvestigadosForm from './NovoProcessoForm/InvestigadosForm';
import DiligenciasForm from './NovoProcessoForm/DiligenciasForm';
import RelatorioIASection from './NovoProcessoForm/RelatorioIASection';
import { ProcessFormProvider } from './NovoProcessoForm/ProcessFormContext';

interface NovoProcessoFormProps {
  onProcessCreated?: () => void;
  processo?: ProcessFormData;
}

export interface ProcessFormData {
  numeroProcesso: string;
  tipoProcesso: string;
  prioridade: string;
  numeroDespacho: string;
  dataDespacho: string;
  dataRecebimento: string;
  dataFato: string;
  origemProcesso: string;
  statusFuncional: string;
  descricaoFatos: string;
  tipificacaoCriminal: string;
  diligenciasRealizadas: Record<string, any>;
  nomeInvestigado: string;
  cargoInvestigado: string;
  unidadeInvestigado: string;
  matriculaInvestigado: string;
  dataAdmissao: string;
  vitima: string;
  numeroSigpad: string;
  id?: string; // Adicionado para identificar o processo ao editar
}

const initialForm: ProcessFormData = {
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
  nomeInvestigado: "",
  cargoInvestigado: "",
  unidadeInvestigado: "",
  matriculaInvestigado: "",
  dataAdmissao: "",
  vitima: "",
  numeroSigpad: "",
};

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

export default function NovoProcessoForm({ onProcessCreated, processo }: NovoProcessoFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState<ProcessFormData>(initialForm);
  const [aba, setAba] = useState<string>("dados-basicos");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processoCriado, setProcessoCriado] = useState<boolean>(false);
  const [desfechoFinal, setDesfechoFinal] = useState<string>("");
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [prescricaoIA, setPrescricaoIA] = useState<string>("");
  const [iaFundamentacao, setIaFundamentacao] = useState<string>("");
  const [prescricaoAdmIA, setPrescricaoAdmIA] = useState<string>("");
  const [iaObservacoes, setIaObservacoes] = useState<string>("");
  const [iaTipificacoesAlternativas, setIaTipificacoesAlternativas] = useState<string>("");
  const [iaTipificacoesDisciplinares, setIaTipificacoesDisciplinares] = useState<string>("");
  const [iaCompetencia, setIaCompetencia] = useState<string>("");
  const [crimesData, setCrimesData] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (processo) {
      console.log("[DEBUG NovoProcessoForm] Recebendo processo para edição:", processo);
      setForm({
        numeroProcesso: processo.numeroProcesso || "",
        tipoProcesso: processo.tipoProcesso || "",
        prioridade: processo.prioridade || "",
        numeroDespacho: processo.numeroDespacho || "",
        dataDespacho: processo.dataDespacho || "",
        dataRecebimento: processo.dataRecebimento || "",
        dataFato: processo.dataFato || "",
        origemProcesso: processo.origemProcesso || "",
        statusFuncional: processo.statusFuncional || "",
        descricaoFatos: processo.descricaoFatos || "",
        tipificacaoCriminal: processo.tipificacaoCriminal || "",
        diligenciasRealizadas: processo.diligenciasRealizadas || {},
        nomeInvestigado: processo.nomeInvestigado || "",
        cargoInvestigado: processo.cargoInvestigado || "",
        unidadeInvestigado: processo.unidadeInvestigado || "",
        matriculaInvestigado: processo.matriculaInvestigado || "",
        dataAdmissao: processo.dataAdmissao || "",
        vitima: processo.vitima || "",
        numeroSigpad: processo.numeroSigpad || "",
        id: processo.id
      });
    }
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

  const handleSelect = (field: keyof ProcessFormData, value: string) => {
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
        nome: processo?.nomeInvestigado || "Não informado",
        cargo: processo?.cargoInvestigado || "Não informado",
        unidade: processo?.unidadeInvestigado || "Não informado",
        data_fato: form.dataFato || processo?.dataFato || "Não informado",
        tipo_investigado: form.tipoProcesso || processo?.tipoProcesso || "Não informado",
        descricao: form.descricaoFatos || processo?.descricaoFatos || "Não informado",
        numero_sigpad: processo?.numeroSigpad || "Não informado",
        numero_despacho: form.numeroDespacho || processo?.numeroDespacho || "Não informado",
        data_despacho: form.dataDespacho || processo?.dataDespacho || "Não informado",
        origem: form.origemProcesso || processo?.origemProcesso || "Não informado",
        vitima: processo?.vitima || "Não informado",
        matricula: processo?.matriculaInvestigado || "Não informado",
        data_admissao: processo?.dataAdmissao || "Não informado"
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

  console.log("[DEBUG NovoProcessoForm] Renderizando. Processo:", processo);

  return (
    <ProcessFormProvider initialForm={processo ? processo : initialForm}>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <Tabs value={aba} onValueChange={setAba} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/20">
              <TabsTrigger value="dados-basicos" className="text-white data-[state=active]:bg-white/30">Dados Básicos</TabsTrigger>
              <TabsTrigger value="investigados" className="text-white data-[state=active]:bg-white/30">Investigados</TabsTrigger>
              <TabsTrigger value="diligencias" className="text-white data-[state=active]:bg-white/30">Diligências</TabsTrigger>
              <TabsTrigger value="relatorio-ia" className="text-white data-[state=active]:bg-white/30">Relatório IA</TabsTrigger>
            </TabsList>
            <TabsContent value="dados-basicos" className="space-y-6 mt-6">
              <DadosBasicosForm />
            </TabsContent>
            <TabsContent value="investigados" className="space-y-6 mt-6">
              <InvestigadosForm />
            </TabsContent>
            <TabsContent value="diligencias" className="space-y-6 mt-6">
              <DiligenciasForm />
            </TabsContent>
            <TabsContent value="relatorio-ia" className="space-y-6 mt-6">
              <RelatorioIASection iaFundamentacao={iaFundamentacao} prescricaoIA={prescricaoIA} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </ProcessFormProvider>
  );
} 