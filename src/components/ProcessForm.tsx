import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, FileText, AlertTriangle, Brain, Users, UserPlus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { openaiService, RelatorioDados, RelatorioIA as RelatorioIAType } from "@/services/openaiService";
import RelatorioIA from "./RelatorioIA";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [isLoading, setIsLoading] = useState(false);
  const [showRelatorioIA, setShowRelatorioIA] = useState(false);
  const [relatorioIA, setRelatorioIA] = useState<RelatorioIAType | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

  const [vitimas, setVitimas] = useState(() => {
    if (editProcess?.vitimas && Array.isArray(editProcess.vitimas)) {
      return editProcess.vitimas;
    } else if (editProcess?.vitima) {
      // Se há uma vítima única, convertê-la para o formato de array
      return [{
        id: Date.now(),
        nome: editProcess.vitima || "",
        tipo: editProcess.tipo_vitima || "",
        idade: editProcess.idade_vitima || "",
        sexo: editProcess.sexo_vitima || ""
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

  const removeInvestigado = (id: number) => {
    setInvestigados(investigados.filter(inv => inv.id !== id));
  };

  // Funções para gerenciar vítimas
  const addVitima = () => {
    const novaVitima = {
      id: Date.now(),
      nome: "",
      tipo: "",
      idade: "",
      sexo: ""
    };
    setVitimas([...vitimas, novaVitima]);
  };

  const updateVitima = (id: number, field: string, value: any) => {
    setVitimas(vitimas.map(vit => 
      vit.id === id ? { ...vit, [field]: value } : vit
    ));
  };

  const removeVitima = (id: number) => {
    setVitimas(vitimas.filter(vit => vit.id !== id));
  };

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
        vitima: vitimas.length > 0 ? vitimas[0].nome : "Não informado",
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

  const handleSave = async () => {
    if (!formData.numeroProcesso || !formData.descricaoFatos) {
      toast({
        title: "Dados obrigatórios",
        description: "Preencha o número do processo e descrição dos fatos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = user;
      if (!currentUser) {
        toast({
          title: "Erro de Autenticação",
          description: "Usuário não autenticado. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      let internalUserId = null;
      try {
        const { data: userProfile } = await supabase
          .from('users')
          .select('id')
          .eq('email', currentUser.email)
          .single();
        
        if (userProfile) {
          internalUserId = userProfile.id;
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }

      // Preparar dados dos investigados para salvar
      const investigadosData = investigados.map(inv => ({
        nome: inv.nome,
        cargo: inv.cargo,
        unidade: inv.unidade,
        matricula: inv.matricula,
        data_admissao: inv.dataAdmissao ? inv.dataAdmissao.toISOString().split('T')[0] : null
      }));

      // Preparar dados das vítimas para salvar
      const vitimasData = vitimas.map(vit => ({
        nome: vit.nome,
        tipo: vit.tipo,
        idade: vit.idade,
        sexo: vit.sexo
      }));

      const processData = {
        numero_processo: formData.numeroProcesso,
        tipo_processo: formData.tipoProcesso,
        prioridade: formData.prioridade,
        numero_despacho: formData.numeroDespacho || null,
        data_despacho: formData.dataDespacho ? formData.dataDespacho.toISOString() : null,
        data_recebimento: formData.dataRecebimento ? formData.dataRecebimento.toISOString() : null,
        data_fato: formData.dataFato ? formData.dataFato.toISOString() : null,
        origem_processo: formData.origemProcesso || null,
        descricao_fatos: formData.descricaoFatos,
        diligencias_realizadas: formData.diligenciasRealizadas,
        desfecho_final: formData.desfechoFinal || null,
        redistribuicao: formData.redistribuicao || null,
        sugestoes: formData.sugestoes || null,
        status: 'tramitacao',
        user_id: internalUserId,
        investigados: investigadosData,
        vitimas: vitimasData,
        status_funcional: formData.statusFuncional || null,
        crime_typing: formData.origemProcesso || null
      };

      let data, error;
      
      if (isEditMode && editProcess) {
        const { data: updateData, error: updateError } = await supabase
          .from('processos')
          .update(processData)
          .eq('id', editProcess.id)
          .select()
          .single();
        
        data = updateData;
        error = updateError;
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from('processos')
          .insert([processData])
          .select()
          .single();
        
        data = insertData;
        error = insertError;
      }

      if (error) {
        console.error("Erro ao salvar processo:", error);
        toast({
          title: "Erro",
          description: "Erro ao salvar processo.",
          variant: "destructive"
        });
      } else {
        toast({
          title: isEditMode ? "Processo atualizado!" : "Processo salvo!",
          description: isEditMode ? "Processo atualizado com sucesso." : "Processo salvo com sucesso.",
        });
        
        if (onProcessSaved) {
          onProcessSaved();
        }
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar processo.",
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
          <h1 className="text-3xl font-bold text-white">
            {isEditMode ? `Editar Processo - ${editProcess?.numero_processo}` : 'Cadastrar Novo Processo'}
          </h1>
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
                <TabsTrigger value="detalhes" className="text-white data-[state=active]:bg-white/30">
                  Detalhes
                </TabsTrigger>
                <TabsTrigger value="investigados" className="text-white data-[state=active]:bg-white/30">
                  Investigados
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dados-basicos" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Número do Processo *</Label>
                    <Input
                      value={formData.numeroProcesso}
                      onChange={(e) => setFormData(prev => ({ ...prev, numeroProcesso: e.target.value }))}
                      disabled={isEditMode}
                      className={`bg-white/20 border-white/30 text-white placeholder:text-white/70 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div>
                    <Label className="text-white">Tipo de Processo *</Label>
                    <Select 
                      value={formData.tipoProcesso} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tipoProcesso: value }))}
                      disabled={isEditMode}
                    >
                      <SelectTrigger className={`bg-white/20 border-white/30 text-white ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investigacao_preliminar">INVESTIGAÇÃO PRELIMINAR</SelectItem>
                        <SelectItem value="sindicancia">SINDICÂNCIA</SelectItem>
                        <SelectItem value="processo_administrativo">PROCESSO ADMINISTRATIVO</SelectItem>
                        <SelectItem value="inquerito_policial_militar">INQUÉRITO POLICIAL MILITAR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Prioridade</Label>
                    <Select value={formData.prioridade} onValueChange={(value) => setFormData(prev => ({ ...prev, prioridade: value }))}>
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgente_maria_da_penha" className="text-red-600 font-bold">URGENTE-MARIA DA PENHA</SelectItem>
                        <SelectItem value="urgente">URGENTE</SelectItem>
                        <SelectItem value="alta">ALTA</SelectItem>
                        <SelectItem value="media">MÉDIA</SelectItem>
                        <SelectItem value="baixa">BAIXA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Número do Despacho</Label>
                    <Input
                      value={formData.numeroDespacho}
                      onChange={(e) => setFormData(prev => ({ ...prev, numeroDespacho: e.target.value }))}
                      disabled={isEditMode}
                      className={`bg-white/20 border-white/30 text-white placeholder:text-white/70 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Número do despacho"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Data do Despacho</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          disabled={isEditMode}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/20 border-white/30 text-white",
                            !formData.dataDespacho && "text-white/70",
                            isEditMode && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dataDespacho ? format(formData.dataDespacho, "dd/MM/yyyy") : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dataDespacho || undefined}
                          onSelect={(date) => setFormData(prev => ({ ...prev, dataDespacho: date }))}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-white">Data de Recebimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          disabled={isEditMode}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/20 border-white/30 text-white",
                            !formData.dataRecebimento && "text-white/70",
                            isEditMode && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dataRecebimento ? format(formData.dataRecebimento, "dd/MM/yyyy") : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dataRecebimento || undefined}
                          onSelect={(date) => setFormData(prev => ({ ...prev, dataRecebimento: date }))}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-white">Data do Fato</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          disabled={isEditMode}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-white/20 border-white/30 text-white",
                            !formData.dataFato && "text-white/70",
                            isEditMode && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dataFato ? format(formData.dataFato, "dd/MM/yyyy") : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dataFato || undefined}
                          onSelect={(date) => setFormData(prev => ({ ...prev, dataFato: date }))}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="text-white">Origem do Processo</Label>
                    <Input
                      value={formData.origemProcesso}
                      onChange={(e) => setFormData(prev => ({ ...prev, origemProcesso: e.target.value }))}
                      disabled={isEditMode}
                      className={`bg-white/20 border-white/30 text-white placeholder:text-white/70 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder="Origem do processo"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Status Funcional</Label>
                    <Select 
                      value={formData.statusFuncional} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, statusFuncional: value }))}
                      disabled={isEditMode}
                    >
                      <SelectTrigger className={`bg-white/20 border-white/30 text-white ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <SelectValue placeholder="Selecione o status funcional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="militar_servico">MILITAR DE SERVIÇO</SelectItem>
                        <SelectItem value="militar_folga">MILITAR DE FOLGA</SelectItem>
                        <SelectItem value="policial_civil">POLICIAL CIVIL</SelectItem>
                        <SelectItem value="policial_penal">POLICIAL PENAL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="detalhes" className="space-y-6 mt-6">
                <div>
                  <Label className="text-white">Descrição dos Fatos</Label>
                  <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-white text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    AVISO: Não inserir dados sensíveis (nome, CPF, RG, endereço). O sistema remove automaticamente.
                  </div>
                  <Textarea
                    value={formData.descricaoFatos}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricaoFatos: e.target.value }))}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[120px]"
                    placeholder="Descreva os fatos relacionados ao processo..."
                  />
                </div>

                <div>
                  <Label className="text-white">Desfecho Final (Sugestão do Encarregado)</Label>
                  <Select value={formData.desfechoFinal} onValueChange={(value) => setFormData(prev => ({ ...prev, desfechoFinal: value }))}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Selecione o desfecho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arquivamento por Falta de Provas">Arquivamento por Falta de Provas</SelectItem>
                      <SelectItem value="Arquivamento por Laudo IML Negativo">Arquivamento por Laudo IML Negativo</SelectItem>
                      <SelectItem value="Arquivamento por Fato em Apuração por Outra Unidade">Arquivamento por Fato em Apuração por Outra Unidade</SelectItem>
                      <SelectItem value="Arquivamento por Fato Já Apurado">Arquivamento por Fato Já Apurado</SelectItem>
                      <SelectItem value="Arquivamento por Não Indiciamento do(s) Investigado(s)">Arquivamento por Não Indiciamento do(s) Investigado(s)</SelectItem>
                      <SelectItem value="Arquivamento por Desinteresse da Vítima">Arquivamento por Desinteresse da Vítima</SelectItem>
                      <SelectItem value="Arquivamento por Falta de Autoria">Arquivamento por Falta de Autoria</SelectItem>
                      <SelectItem value="Arquivamento por Falta de Materialidade">Arquivamento por Falta de Materialidade</SelectItem>
                      <SelectItem value="Redistribuição por Superior Hierárquico ao Encarregado">Redistribuição por Superior Hierárquico ao Encarregado</SelectItem>
                      <SelectItem value="Instauração de SAD">Instauração de SAD</SelectItem>
                      <SelectItem value="Instauração de IPM">Instauração de IPM</SelectItem>
                      <SelectItem value="Instauração de Conselho de Disciplina">Instauração de Conselho de Disciplina</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Diligências Realizadas</Label>
                  <div className="max-h-96 overflow-y-auto p-4 bg-white/10 rounded-lg border border-white/20">
                    <div className="space-y-4">
                      {[
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
                      ].map((diligencia) => (
                        <div key={diligencia.id} className="border-b border-white/20 pb-3 last:border-b-0">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={diligencia.id}
                              checked={formData.diligenciasRealizadas?.[diligencia.id]?.realizada || false}
                              onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                diligenciasRealizadas: {
                                  ...prev.diligenciasRealizadas,
                                  [diligencia.id]: {
                                    ...prev.diligenciasRealizadas?.[diligencia.id],
                                    realizada: checked
                                  }
                                }
                              }))}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label htmlFor={diligencia.id} className="text-white text-sm cursor-pointer font-medium">
                                {diligencia.label}
                              </Label>
                              
                              {formData.diligenciasRealizadas?.[diligencia.id]?.realizada && (
                                <div className="mt-2">
                                  <Textarea
                                    value={formData.diligenciasRealizadas?.[diligencia.id]?.observacao || ''}
                                    onChange={(e) => setFormData(prev => ({
                                      ...prev,
                                      diligenciasRealizadas: {
                                        ...prev.diligenciasRealizadas,
                                        [diligencia.id]: {
                                          ...prev.diligenciasRealizadas?.[diligencia.id],
                                          observacao: e.target.value
                                        }
                                      }
                                    }))}
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
                </div>

                <div>
                  <Label className="text-white">Sugestões</Label>
                  <Textarea
                    value={formData.sugestoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, sugestoes: e.target.value }))}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[100px]"
                    placeholder="Sugestões adicionais..."
                  />
                </div>
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
                            onClick={() => removeInvestigado(investigado.id)} 
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

                {/* Seção de Vítimas */}
                <div className="space-y-4 pt-6 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <Label className="text-white text-lg font-semibold">Vítimas</Label>
                    <Button 
                      onClick={addVitima} 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Vítima
                    </Button>
                  </div>

                  {vitimas.length === 0 && (
                    <div className="text-white/70 text-center py-4 border border-white/20 rounded">
                      Nenhuma vítima adicionada
                    </div>
                  )}

                  {vitimas.map((vitima, index) => (
                    <Card key={vitima.id} className="bg-white/5 border-white/20">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-white font-medium">Vítima {index + 1}</Label>
                          <Button 
                            onClick={() => removeVitima(vitima.id)} 
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
                              value={vitima.nome}
                              onChange={(e) => updateVitima(vitima.id, 'nome', e.target.value)}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="Nome da vítima"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-white text-sm">Tipo</Label>
                            <Select 
                              value={vitima.tipo} 
                              onValueChange={(value) => updateVitima(vitima.id, 'tipo', value)}
                            >
                              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="civil">Civil</SelectItem>
                                <SelectItem value="militar">Militar</SelectItem>
                                <SelectItem value="policial">Policial</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label className="text-white text-sm">Idade</Label>
                            <Input
                              value={vitima.idade}
                              onChange={(e) => updateVitima(vitima.id, 'idade', e.target.value)}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                              placeholder="Idade"
                              type="number"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-white text-sm">Sexo</Label>
                            <Select 
                              value={vitima.sexo} 
                              onValueChange={(value) => updateVitima(vitima.id, 'sexo', value)}
                            >
                              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                                <SelectValue placeholder="Selecione o sexo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="feminino">Feminino</SelectItem>
                                <SelectItem value="nao_informado">Não Informado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-6">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar Dados"}
              </Button>

              {!isEditMode && (
                <Button 
                  onClick={handleGerarRelatorioIA}
                  disabled={isGeneratingReport || !formData.descricaoFatos}
                  className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {isGeneratingReport ? "Gerando..." : "Análise Jurídica IA"}
                </Button>
              )}

              {isEditMode && (
                <Button 
                  onClick={handleGerarRelatorioIA}
                  disabled={isGeneratingReport || !formData.descricaoFatos}
                  className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {isGeneratingReport ? "Gerando..." : "Atualizar Análise IA"}
                </Button>
              )}
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