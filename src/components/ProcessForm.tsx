
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
import { CalendarIcon, Save, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
}

const ProcessForm = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
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
    sugestoes: ""
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

  const handleSave = () => {
    // Validação básica
    if (!formData.numeroProcesso || !formData.tipoProcesso) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Salvar processo (integração com backend)
    console.log("Salvando processo:", formData);
    toast({
      title: "Sucesso",
      description: "Processo salvo com sucesso!"
    });
  };

  const handleGenerateReport = () => {
    // Gerar relatório com IA
    console.log("Gerando relatório IA para:", formData);
    toast({
      title: "Relatório IA",
      description: "Relatório gerado com sucesso usando IA!"
    });
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
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                Salvar Dados
              </Button>
              <Button onClick={handleGenerateReport} className="bg-blue-600 hover:bg-blue-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório IA
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessForm;
