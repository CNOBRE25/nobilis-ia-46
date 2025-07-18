
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
import { CalendarIcon, Save, FileText, AlertTriangle, Brain } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/hooks/useRoles";
import { openaiService, RelatorioDados, RelatorioIA as RelatorioIAType } from "@/services/openaiService";
import RelatorioIA from "./RelatorioIA";

interface ProcessFormData {
  numeroProcesso: string;
  tipoProcesso: string;
  prioridade: string;
  numeroDespacho: string;
  dataDespacho: Date | null;
  dataRecebimento: Date | null;
  dataFato: Date | null;
  origemProcesso: string;
  descricaoFatos: string;
  modusOperandi: string;
  diligenciasRealizadas: { [key: string]: { selected: boolean; observacao: string } };
  desfechoFinal: string;
  redistribuicao: string;
  sugestoes: string;
  // Campos adicionais para investigado
  nomeInvestigado: string;
  cargoInvestigado: string;
  unidadeInvestigado: string;
  matriculaInvestigado: string;
  dataAdmissao: Date | null;
  vitima: string;
  numeroSigpad: string;
  // Campos de crime
  tipoCrime: string;
  transgressao: string;
  sexoVitima: string;
}

const ProcessForm = ({ onClose, onProcessSaved }: { onClose: () => void; onProcessSaved?: () => void }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useRoles();
  const [isLoading, setIsLoading] = useState(false);
  const [showRelatorioIA, setShowRelatorioIA] = useState(false);
  const [relatorioIA, setRelatorioIA] = useState<RelatorioIAType | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [formData, setFormData] = useState<ProcessFormData>({
    numeroProcesso: "",
    tipoProcesso: "",
    prioridade: "",
    numeroDespacho: "",
    dataDespacho: null,
    dataRecebimento: null,
    dataFato: null,
    origemProcesso: "",
    descricaoFatos: "",
    modusOperandi: "",
    diligenciasRealizadas: {},
    desfechoFinal: "",
    redistribuicao: "",
    sugestoes: "",
    // Campos adicionais para investigado
    nomeInvestigado: "",
    cargoInvestigado: "",
    unidadeInvestigado: "",
    matriculaInvestigado: "",
    dataAdmissao: null,
    vitima: "",
    numeroSigpad: "",
    // Campos de crime
    tipoCrime: "",
    transgressao: "",
    sexoVitima: ""
  });

  const tiposProcesso = [
    "INVESTIGAÇÃO PRELIMINAR",
    "SINDICÂNCIA",
    "IP-RETORNO"
  ];

  const prioridades = [
    "URGENTE-MARIA DA PENHA",
    "URGENTE",
    "MODERADO"
  ];

  const origensProcesso = [
    "CI-GTAC",
    "Corregedoria",
    "DENÚNCIA ANÔNIMA",
    "DISQUE 100",
    "E-MAIL",
    "MP",
    "NFND-GTAC",
    "PC",
    "PM",
    "REDE SOCIAL",
    "TELEFONE",
    "WHATSAPP"
  ];

  const modusOperandiOptions = [
    "Militar de serviço",
    "Militar de folga",
    "Policial Civil"
  ];

  const diligenciasList = [
    "Atestado Médico", "BO PCPE", "Contato por WhatsApp", "Contato Telefônico",
    "E-mail", "Escala de Serviço", "Extrato Certidão Conjunta PM/PC",
    "Extrato do Cadastro Civil", "Extrato INFOPOL", "Extrato INFOSEG",
    "Extrato MPPE", "Extrato TJPE", "Fotos", "Laudo Médico",
    "Laudo Pericial - IML - Laudo Positivo", "Laudo Pericial - IML - Negativo",
    "Mapa de Lançamento de Viaturas", "Ouvida da Testemunha", "Ouvida da Vítima",
    "Ouvida do Investigado", "Ouvida do Sindicado", "Rastreamento de Viaturas - Com Registro",
    "Rastreamento de Viaturas - Sem Registro", "SGPM", "SIGPAD - Fato em Apuração por Outra Unidade",
    "SIGPAD - Fato Já Apurado", "SIGPAD - Nada Consta", "Vídeos"
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

  const tiposCrime = [
    "Homicídio",
    "Tentativa de Homicídio",
    "Lesão Corporal",
    "Estupro",
    "Roubo",
    "Furto",
    "Tráfico de Drogas",
    "Porte Ilegal de Arma",
    "Corrupção",
    "Abuso de Autoridade",
    "Deserção",
    "Insubordinação",
    "Violência Doméstica",
    "Ameaça",
    "Calúnia",
    "Difamação",
    "Injúria",
    "Outros"
  ];

  const transgressoes = [
    "Art. 121 CP - Homicídio",
    "Art. 121, §2º CP - Homicídio Qualificado",
    "Art. 129 CP - Lesão Corporal",
    "Art. 213 CP - Estupro",
    "Art. 157 CP - Roubo",
    "Art. 155 CP - Furto",
    "Art. 33 LAD - Tráfico de Drogas",
    "Art. 12 LAD - Porte Ilegal",
    "Art. 317 CP - Corrupção",
    "Art. 3º LCP - Abuso de Autoridade",
    "Art. 187 CPM - Deserção",
    "Art. 176 CPM - Insubordinação",
    "Art. 7º Lei Maria da Penha",
    "Art. 147 CP - Ameaça",
    "Art. 138 CP - Calúnia",
    "Art. 139 CP - Difamação",
    "Art. 140 CP - Injúria",
    "Outros"
  ];

  const sexoVitima = [
    "M",
    "F",
    "Não especificado"
  ];

  const sanitizeText = (text: string) => {
    // Substituir dados sensíveis por XX automaticamente
    let sanitized = text
      .replace(/\b(nome|rg|cpf|endereço)\s*:?\s*[^\s,\n]+/gi, (match) => {
        const prefix = match.split(/\s*:?\s*/)[0];
        return `${prefix}: XX`;
      })
      .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, 'XX.XXX.XXX-XX') // CPF
      .replace(/\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g, 'XX.XXX.XXX-X'); // RG
    
    return sanitized;
  };

  const handleDescricaoChange = (value: string) => {
    const sanitized = sanitizeText(value);
    setFormData(prev => ({ ...prev, descricaoFatos: sanitized }));
  };

  const handleDiligenciaChange = (diligencia: string, selected: boolean) => {
    setFormData(prev => ({
      ...prev,
      diligenciasRealizadas: {
        ...prev.diligenciasRealizadas,
        [diligencia]: {
          selected,
          observacao: prev.diligenciasRealizadas[diligencia]?.observacao || ""
        }
      }
    }));
  };

  const handleDiligenciaObservacao = (diligencia: string, observacao: string) => {
    setFormData(prev => ({
      ...prev,
      diligenciasRealizadas: {
        ...prev.diligenciasRealizadas,
        [diligencia]: {
          ...prev.diligenciasRealizadas[diligencia],
          observacao
        }
      }
    }));
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
      // Get current user from auth context first
      const currentUser = user;
      console.log("Current user from context:", currentUser);

      if (!currentUser) {
        console.error("Usuário não encontrado no contexto de autenticação");
        toast({
          title: "Erro de Autenticação",
          description: "Usuário não autenticado. Faça login novamente.",
          variant: "destructive"
        });
        return;
      }

      // Get user profile from Supabase
      let internalUserId = null;
      
      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('id')
          .eq('email', currentUser.email)
          .single();
        
        if (!profileError && userProfile) {
          internalUserId = userProfile.id;
          console.log("Internal User ID found:", internalUserId);
        } else {
          console.log("Usuário não encontrado no banco, continuando sem user_id");
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        // Continue without internal user ID
      }

      // Mapear tipos de processo para o formato do banco
      const mapTipoProcesso = (tipo: string) => {
        switch (tipo) {
          case "INVESTIGAÇÃO PRELIMINAR": return "investigacao_preliminar";
          case "SINDICÂNCIA": return "sindicancia";
          case "IP-RETORNO": return "investigacao_preliminar";
          default: return "investigacao_preliminar";
        }
      };

      // Mapear prioridades para o formato do banco
      const mapPrioridade = (prioridade: string) => {
        switch (prioridade) {
          case "URGENTE-MARIA DA PENHA": return "urgente";
          case "URGENTE": return "urgente";
          case "MODERADO": return "media";
          default: return "media";
        }
      };

      const processData = {
        numero_processo: formData.numeroProcesso,
        tipo_processo: mapTipoProcesso(formData.tipoProcesso),
        prioridade: mapPrioridade(formData.prioridade),
        numero_despacho: formData.numeroDespacho || null,
        data_despacho: formData.dataDespacho ? formData.dataDespacho.toISOString() : null,
        data_recebimento: formData.dataRecebimento ? formData.dataRecebimento.toISOString() : null,
        data_fato: formData.dataFato ? formData.dataFato.toISOString() : null,
        origem_processo: formData.origemProcesso || null,
        descricao_fatos: sanitizeText(formData.descricaoFatos),
        modus_operandi: formData.modusOperandi ? sanitizeText(formData.modusOperandi) : null,
        diligencias_realizadas: formData.diligenciasRealizadas,
        desfecho_final: formData.desfechoFinal ? sanitizeText(formData.desfechoFinal) : null,
        redistribuicao: formData.redistribuicao || null,
        sugestoes: formData.sugestoes ? sanitizeText(formData.sugestoes) : null,
        status: 'tramitacao',
        user_id: internalUserId,
        nome_investigado: formData.nomeInvestigado || null,
        cargo_investigado: formData.cargoInvestigado || null,
        unidade_investigado: formData.unidadeInvestigado || null,
        matricula_investigado: formData.matriculaInvestigado || null,
        data_admissao: formData.dataAdmissao ? formData.dataAdmissao.toISOString().split('T')[0] : null,
        vitima: formData.vitima || null,
        numero_sigpad: formData.numeroSigpad || null,
        crime_typing: formData.origemProcesso || null
      };

      console.log("Dados do processo a serem salvos:", processData);

      // Try to save to Supabase
      const { data, error } = await supabase
        .from('processos')
        .insert([processData])
        .select()
        .single();

      if (error) {
        console.error("Erro detalhado ao salvar processo:", error);
        console.error("Código do erro:", error.code);
        console.error("Mensagem do erro:", error.message);
        console.error("Detalhes do erro:", error.details);
        
        // Verificar tipo específico de erro
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Processo já existe",
            description: "Um processo com este número já existe no sistema.",
            variant: "destructive"
          });
        } else if (error.code === '42501') { // Permission denied
          toast({
            title: "Permissão Negada",
            description: "Você não tem permissão para salvar processos. Verifique suas credenciais.",
            variant: "destructive"
          });
        } else if (error.code === 'PGRST116') { // JWT error
          toast({
            title: "Erro de Autenticação",
            description: "Sessão expirada. Faça login novamente.",
            variant: "destructive"
          });
        } else {
          // Fallback to local storage
          const processosLocais = JSON.parse(localStorage.getItem('processos') || '[]');
          const processoLocal = {
            ...processData,
            id: Date.now().toString(),
            created_at: new Date().toISOString()
          };
          processosLocais.push(processoLocal);
          localStorage.setItem('processos', JSON.stringify(processosLocais));
          
          console.log("Processo salvo localmente:", processoLocal);

          toast({
            title: "Processo salvo localmente",
            description: `Processo salvo no navegador (modo offline). Erro: ${error.message}`,
          });
        }
      } else {
        console.log("Processo salvo com sucesso no Supabase:", data);
        toast({
          title: "Processo salvo!",
          description: "Processo salvo com sucesso no sistema.",
        });
        
        // Chamar callback para atualizar estatísticas
        if (onProcessSaved) {
          onProcessSaved();
        }
      }

      onClose();
    } catch (error) {
      console.error("Erro inesperado ao salvar processo:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar processo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    // Validação básica
    if (!formData.numeroProcesso || !formData.descricaoFatos) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos o número do processo e descrição dos fatos para gerar o relatório",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simular geração de relatório IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      const relatorio = `
RELATÓRIO GERADO POR IA - NOBILIS-IA
=====================================

Processo: ${formData.numeroProcesso}
Tipo: ${formData.tipoProcesso}
Prioridade: ${formData.prioridade}
Data do Fato: ${formData.dataFato ? format(formData.dataFato, "dd/MM/yyyy") : "Não informado"}

RESUMO DOS FATOS:
${formData.descricaoFatos}

MODUS OPERANDI:
${formData.modusOperandi || "Não informado"}

DILIGÊNCIAS REALIZADAS:
${Object.entries(formData.diligenciasRealizadas)
  .filter(([_, diligencia]) => diligencia.selected)
  .map(([nome, diligencia]) => `- ${nome}${diligencia.observacao ? `: ${diligencia.observacao}` : ''}`)
  .join('\n') || "Nenhuma diligência selecionada"}

CONCLUSÃO:
${formData.desfechoFinal || "Aguardando definição"}

---
Relatório gerado automaticamente pelo NOBILIS-IA em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
      `;

      // Criar e baixar arquivo
      const blob = new Blob([relatorio], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${formData.numeroProcesso || 'processo'}_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Relatório Gerado!",
        description: "Relatório IA gerado e baixado com sucesso!"
      });

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Erro ao gerar relatório:", error);
      }
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAnaliseJuridica = async () => {
    // Validação básica
    if (!formData.numeroProcesso || !formData.descricaoFatos) {
      toast({
        title: "Dados Insuficientes",
        description: "Preencha pelo menos o número do processo e descrição dos fatos para gerar análise jurídica",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingReport(true);

    try {
      // Preparar dados para a IA
      const dadosRelatorio: RelatorioDados = {
        nome: formData.nomeInvestigado || "Não informado",
        tipo_investigado: formData.tipoProcesso,
        cargo: formData.cargoInvestigado || "Não informado", 
        unidade: formData.unidadeInvestigado || "Não informado",
        data_fato: formData.dataFato ? format(formData.dataFato, "dd/MM/yyyy") : "Não informado",
        descricao: formData.descricaoFatos
      };

      // Gerar relatório com IA
      const relatorio = await openaiService.gerarRelatorioJuridico(dadosRelatorio);
      
      setRelatorioIA(relatorio);
      setShowRelatorioIA(true);

      toast({
        title: "Análise Jurídica Gerada!",
        description: "Análise jurídica militar gerada com sucesso pela IA",
        duration: 3000
      });

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Erro ao gerar análise jurídica:", error);
      }
      toast({
        title: "Erro na Análise",
        description: "Erro ao gerar análise jurídica. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 z-50 overflow-auto">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Cadastrar Novo Processo</h1>
          <Button onClick={onClose} variant="outline" className="text-white border-white">
            Fechar
          </Button>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6 space-y-6">
            {/* Dados Básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Número do Processo *</Label>
                <Input
                  value={formData.numeroProcesso}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroProcesso: e.target.value }))}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
              </div>

              <div>
                <Label className="text-white">Tipo de Processo *</Label>
                <Select value={formData.tipoProcesso} onValueChange={(value) => setFormData(prev => ({ ...prev, tipoProcesso: value }))}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposProcesso.map(tipo => (
                      <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                    ))}
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
                    {prioridades.map(prioridade => (
                      <SelectItem key={prioridade} value={prioridade}>{prioridade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Número do Despacho</Label>
                <Input
                  value={formData.numeroDespacho}
                  onChange={(e) => setFormData(prev => ({ ...prev, numeroDespacho: e.target.value }))}
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
              </div>

              <div>
                <Label className="text-white">Data do Despacho</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/20 border-white/30 text-white",
                        !formData.dataDespacho && "text-white/70"
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
                      onSelect={(date) => setFormData(prev => ({ ...prev, dataDespacho: date || null }))}
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
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/20 border-white/30 text-white",
                        !formData.dataRecebimento && "text-white/70"
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
                      onSelect={(date) => setFormData(prev => ({ ...prev, dataRecebimento: date || null }))}
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
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/20 border-white/30 text-white",
                        !formData.dataFato && "text-white/70"
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
                      onSelect={(date) => setFormData(prev => ({ ...prev, dataFato: date || null }))}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-white">Origem do Processo</Label>
                <Select value={formData.origemProcesso} onValueChange={(value) => setFormData(prev => ({ ...prev, origemProcesso: value }))}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    {origensProcesso.map(origem => (
                      <SelectItem key={origem} value={origem}>{origem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Modus Operandi</Label>
                <Select value={formData.modusOperandi} onValueChange={(value) => setFormData(prev => ({ ...prev, modusOperandi: value }))}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white">
                    <SelectValue placeholder="Selecione o modus operandi" />
                  </SelectTrigger>
                  <SelectContent>
                    {modusOperandiOptions.map(modus => (
                      <SelectItem key={modus} value={modus}>{modus}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição dos Fatos */}
            <div>
              <Label className="text-white">Descrição dos Fatos</Label>
              <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-white text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                AVISO: Não inserir dados sensíveis (nome, CPF, RG, endereço). O sistema remove automaticamente.
              </div>
              <Textarea
                value={formData.descricaoFatos}
                onChange={(e) => handleDescricaoChange(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[120px]"
                placeholder="Descreva os fatos relacionados ao processo..."
              />
            </div>

            {/* Diligências Realizadas */}
            <div>
              <Label className="text-white text-lg font-semibold mb-4 block">Diligências Realizadas</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diligenciasList.map((diligencia) => (
                  <div key={diligencia} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={diligencia}
                        checked={formData.diligenciasRealizadas[diligencia]?.selected || false}
                        onCheckedChange={(checked) => handleDiligenciaChange(diligencia, checked as boolean)}
                      />
                      <Label htmlFor={diligencia} className="text-white text-sm">{diligencia}</Label>
                    </div>
                    {formData.diligenciasRealizadas[diligencia]?.selected && (
                      <div className="ml-6">
                        <Input
                          placeholder="Observações..."
                          value={formData.diligenciasRealizadas[diligencia]?.observacao || ""}
                          onChange={(e) => handleDiligenciaObservacao(diligencia, e.target.value)}
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Desfecho Final */}
            <div>
              <Label className="text-white">Desfecho Final (Sugestão do Encarregado)</Label>
              <Select value={formData.desfechoFinal} onValueChange={(value) => setFormData(prev => ({ ...prev, desfechoFinal: value }))}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Selecione o desfecho" />
                </SelectTrigger>
                <SelectContent>
                  {desfechosFinais.map(desfecho => (
                    <SelectItem key={desfecho} value={desfecho}>{desfecho}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sugestões */}
            <div>
              <Label className="text-white">Sugestões</Label>
              <Textarea
                value={formData.sugestoes}
                onChange={(e) => setFormData(prev => ({ ...prev, sugestoes: e.target.value }))}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[100px]"
                placeholder="Sugestões adicionais..."
              />
            </div>

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
              <Button 
                onClick={handleGenerateReport} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isLoading ? "Gerando..." : "Gerar Relatório IA"}
              </Button>
              <Button 
                onClick={handleGenerateAnaliseJuridica} 
                disabled={isGeneratingReport || isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
              >
                <Brain className="h-4 w-4 mr-2" />
                {isGeneratingReport ? "Analisando..." : "Análise Jurídica IA"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Relatório IA */}
      {showRelatorioIA && relatorioIA && (
        <RelatorioIA
          relatorio={relatorioIA}
          onClose={() => setShowRelatorioIA(false)}
          dadosProcesso={{
            numero: formData.numeroProcesso,
            nome: formData.nomeInvestigado,
            unidade: formData.unidadeInvestigado,
            data: formData.dataFato ? format(formData.dataFato, "dd/MM/yyyy") : undefined
          }}
        />
      )}
    </div>
  );
};

export default ProcessForm;
