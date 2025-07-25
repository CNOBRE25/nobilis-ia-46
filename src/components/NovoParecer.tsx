import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Save, 
  Send, 
  Bot,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import ReactSelect from 'react-select';
import crimesData from '../../public/crimes_brasil.json';

interface NovoParecerProps {
  user: any;
  onClose: () => void;
  onSave: (parecer: any) => void;
  numeroProcesso?: string;
  parecer?: any; // Adicionado para edição
}

const NovoParecer = ({ user, onClose, onSave, numeroProcesso, parecer }: NovoParecerProps) => {
  const [formData, setFormData] = useState({
    numero_processo: numeroProcesso || "",
    servidores: [
      {
        nome: "",
        matricula: "",
        categoria_funcional: "",
        situacao_servico: "em_servico"
      }
    ],
    data_fato: null as Date | null,
    area_direito: "",
    questao_principal: "",
    caso_descricao: "",
    urgencia: "media",
    complexidade: "media",
    tipo_crime: "",
    legislacao_aplicavel: "",
    crimesSelecionados: [] as string[]
  });

  const [activeTab, setActiveTab] = useState("dados");
  const [isGenerating, setIsGenerating] = useState(false);
  const [parecerGerado, setParecerGerado] = useState("");
  const [prescricaoInfo, setPrescricaoInfo] = useState(null);
  const { toast } = useToast();

  // Ao abrir para edição, carregar analise_fatos:
  useEffect(() => {
    if (parecer && parecer.analise_fatos) {
      setParecerGerado(parecer.analise_fatos);
    }
  }, [parecer]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServidorChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      servidores: prev.servidores.map((servidor, i) => 
        i === index ? { ...servidor, [field]: value } : servidor
      )
    }));
  };

  const addServidor = () => {
    setFormData(prev => ({
      ...prev,
      servidores: [...prev.servidores, {
        nome: "",
        matricula: "",
        categoria_funcional: "",
        situacao_servico: "em_servico"
      }]
    }));
  };

  const removeServidor = (index: number) => {
    if (formData.servidores.length > 1) {
      setFormData(prev => ({
        ...prev,
        servidores: prev.servidores.filter((_, i) => i !== index)
      }));
    }
  };

  const calcularPrescricao = () => {
    if (!formData.data_fato || formData.servidores.length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Preencha a data do fato e pelo menos um servidor.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se todos os servidores têm dados básicos
    const servidoresIncompletos = formData.servidores.some(s => 
      !s.nome || !s.categoria_funcional || !s.situacao_servico
    );

    if (servidoresIncompletos) {
      toast({
        title: "Dados incompletos",
        description: "Preencha nome, categoria funcional e situação de serviço para todos os servidores.",
        variant: "destructive",
      });
      return;
    }

    // Calcular prescrição baseada no servidor com prazo mais longo (mais restritivo)
    const dataFato = new Date(formData.data_fato);
    let prazoPrescricao = 20; // anos - padrão para crimes comuns
    let legislacaoAplicavel = "Código Penal Brasileiro";
    
    formData.servidores.forEach(servidor => {
      if (servidor.categoria_funcional === 'militar_estadual' || servidor.categoria_funcional === 'bombeiro_militar') {
        if (servidor.situacao_servico === 'em_servico') {
          prazoPrescricao = Math.min(prazoPrescricao, 8);
          legislacaoAplicavel = "Código Penal Militar";
        }
      }
    });

    const dataPrescricao = new Date(dataFato);
    dataPrescricao.setFullYear(dataPrescricao.getFullYear() + prazoPrescricao);

    const info = {
      legislacao: legislacaoAplicavel,
      prazo: prazoPrescricao,
      dataPrescricao: dataPrescricao,
      fundamentacao: `Baseado na ${legislacaoAplicavel} considerando ${formData.servidores.length} servidor(es) envolvido(s)`
    };

    setPrescricaoInfo(info);
    handleInputChange("legislacao_aplicavel", legislacaoAplicavel);
    
    toast({
      title: "Prescrição calculada!",
      description: `Prescrição em ${format(dataPrescricao, "dd/MM/yyyy", { locale: pt })}`,
    });
  };

  const gerarParecer = async () => {
    setIsGenerating(true);
    try {
      // Montar objeto conforme novo padrão do backend
      const dadosParecer = {
        ...formData,
        tipo_serviço: formData.statusFuncional || formData.status_funcional || 'Não se aplica',
        descricao_fato: formData.caso_descricao || formData.descricaoFatos || formData.descricao_fato || formData.descricao || '',
        data_fato: formData.dataFato || formData.data_fato || '',
      };
      // Se houver integração IA, chamar aqui:
      // const parecerIA = await openaiService.gerarParecerJuridico(dadosParecer);
      // setParecerGerado(parecerIA);
      // ... restante do código ...
    } catch (error) {
      toast({
        title: "Erro ao gerar parecer",
        description: "Não foi possível gerar o parecer jurídico via IA.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const salvarParecer = () => {
    const novoParecer = {
      numero_protocolo: formData.numero_processo || `${user?.orgao || 'Sistema'}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-2024`,
      titulo: formData.questao_principal || `Parecer sobre ${formData.servidores[0]?.nome || 'caso'}`,
      servidores: formData.servidores,
      data_fato: formData.data_fato,
      data_prescricao: prescricaoInfo?.dataPrescricao || null,
      conteudo_parecer: parecerGerado,
      status: "rascunho",
      urgencia: formData.urgencia,
      questao_principal: formData.questao_principal,
      caso_descricao: formData.caso_descricao,
      area_direito: formData.area_direito,
      complexidade: formData.complexidade,
      tipo_crime: formData.tipo_crime,
      legislacao_aplicavel: formData.legislacao_aplicavel,
      analise_fatos: parecerGerado,
    };

    onSave(novoParecer);
  };

  // Transformar crimesData em opções para React Select
  const groupedOptions = Object.entries(crimesData).map(([categoria, lista]) => ({
    label: categoria,
    options: lista.map(crime => ({ value: crime, label: crime }))
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onClose} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Novo Parecer</h2>
            <p className="text-gray-600">Crie um novo parecer jurídico com auxílio da IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={salvarParecer} disabled={!parecerGerado}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button onClick={gerarParecer} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
            <Bot className="h-4 w-4 mr-2" />
            {isGenerating ? "Gerando..." : "Gerar Parecer"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dados" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Dados Básicos
          </TabsTrigger>
          <TabsTrigger value="caso" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Caso e Questão
          </TabsTrigger>
          <TabsTrigger value="prescricao" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Prescrição
          </TabsTrigger>
          <TabsTrigger value="parecer" className="flex items-center" disabled={!parecerGerado}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Parecer Gerado
          </TabsTrigger>
        </TabsList>

        {/* Dados Básicos */}
        <TabsContent value="dados" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados dos Servidores</CardTitle>
                <CardDescription>Informações dos servidores envolvidos no caso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.servidores.map((servidor, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm text-gray-700">
                        Servidor {index + 1}
                      </h4>
                      {formData.servidores.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeServidor(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`servidor_nome_${index}`}>Nome Completo</Label>
                      <Input
                        id={`servidor_nome_${index}`}
                        value={servidor.nome}
                        onChange={(e) => handleServidorChange(index, "nome", e.target.value)}
                        placeholder="Nome completo do servidor"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`servidor_matricula_${index}`}>Matrícula</Label>
                      <Input
                        id={`servidor_matricula_${index}`}
                        value={servidor.matricula}
                        onChange={(e) => handleServidorChange(index, "matricula", e.target.value)}
                        placeholder="Número da matrícula"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`categoria_funcional_${index}`}>Categoria Funcional</Label>
                      <Select 
                        value={servidor.categoria_funcional} 
                        onValueChange={(value) => handleServidorChange(index, "categoria_funcional", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="militar_estadual">Militar Estadual</SelectItem>
                          <SelectItem value="bombeiro_militar">Bombeiro Militar</SelectItem>
                          <SelectItem value="policial_civil">Policial Civil</SelectItem>
                          <SelectItem value="servidor_civil">Servidor Civil</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`situacao_servico_${index}`}>Situação de Serviço</Label>
                      <Select 
                        value={servidor.situacao_servico} 
                        onValueChange={(value) => handleServidorChange(index, "situacao_servico", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a situação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="em_servico">Em Serviço</SelectItem>
                          <SelectItem value="de_folga">De Folga</SelectItem>
                          <SelectItem value="licenciado">Licenciado</SelectItem>
                          <SelectItem value="afastado">Afastado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addServidor}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Servidor
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações do Parecer</CardTitle>
                <CardDescription>Definições técnicas e organizacionais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="numero_processo">Número do Processo</Label>
                  <Input
                    id="numero_processo"
                    value={formData.numero_processo}
                    onChange={(e) => handleInputChange("numero_processo", e.target.value)}
                    placeholder="Digite o número do processo"
                    className="font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="data_fato">Data do Fato</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.data_fato ? format(formData.data_fato, "dd/MM/yyyy", { locale: pt }) : "Selecione a data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.data_fato}
                        onSelect={(date) => handleInputChange("data_fato", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="area_direito">Área do Direito</Label>
                  <Select value={formData.area_direito} onValueChange={(value) => handleInputChange("area_direito", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="penal">Penal</SelectItem>
                      <SelectItem value="penal_militar">Penal Militar</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="processual_penal">Processual Penal</SelectItem>
                      <SelectItem value="civil">Civil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="urgencia">Urgência</Label>
                  <Select value={formData.urgencia} onValueChange={(value) => handleInputChange("urgencia", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="complexidade">Complexidade</Label>
                  <Select value={formData.complexidade} onValueChange={(value) => handleInputChange("complexidade", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a complexidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simples">Simples</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="complexa">Complexa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Caso e Questão */}
        <TabsContent value="caso" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Questão Principal</CardTitle>
                <CardDescription>Descreva objetivamente a questão jurídica</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.questao_principal}
                  onChange={(e) => handleInputChange("questao_principal", e.target.value)}
                  placeholder="Ex: Análise da prescrição de crime de deserção praticado por militar em serviço"
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Descrição do Caso</CardTitle>
                <CardDescription>Relate os fatos de forma completa e detalhada</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.caso_descricao}
                  onChange={(e) => handleInputChange("caso_descricao", e.target.value)}
                  placeholder="Descreva todos os fatos relevantes para o caso, incluindo datas, locais, pessoas envolvidas e circunstâncias..."
                  rows={8}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Prescrição */}
        <TabsContent value="prescricao" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cálculo de Prescrição</CardTitle>
                <CardDescription>Calcule automaticamente o prazo prescricional</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={calcularPrescricao} className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Calcular Prescrição
                </Button>

                {prescricaoInfo && (
                  <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Prescrição Calculada</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Legislação:</span> {prescricaoInfo.legislacao}
                      </div>
                      <div>
                        <span className="font-medium">Prazo:</span> {prescricaoInfo.prazo} anos
                      </div>
                      <div>
                        <span className="font-medium">Data de Prescrição:</span> {format(prescricaoInfo.dataPrescricao, "dd/MM/yyyy", { locale: pt })}
                      </div>
                      <div>
                        <span className="font-medium">Fundamentação:</span> {prescricaoInfo.fundamentacao}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações Adicionais</CardTitle>
                <CardDescription>Configurações específicas para o cálculo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tipo_crime">Tipo de Crime</Label>
                  <Select value={formData.tipo_crime} onValueChange={(value) => handleInputChange("tipo_crime", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="militar">Militar</SelectItem>
                      <SelectItem value="comum">Comum</SelectItem>
                      <SelectItem value="especial">Especial</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Campo de busca/autocomplete para crimes */}
                <div>
                  <Label className="text-gray-800 text-sm font-medium">Buscar e selecionar crimes (múltipla seleção)</Label>
                  <ReactSelect
                    isMulti
                    options={groupedOptions}
                    value={groupedOptions.flatMap(g => g.options).filter(opt => formData.crimesSelecionados?.includes(opt.value))}
                    onChange={selected => handleInputChange('crimesSelecionados', selected.map(opt => opt.value))}
                    placeholder="Digite para buscar e selecione os crimes..."
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({ ...base, backgroundColor: '#f1f5f9', borderColor: '#64748b', color: '#0f172a' }),
                      menu: (base) => ({ ...base, backgroundColor: '#f1f5f9', color: '#0f172a' }),
                      multiValue: (base) => ({ ...base, backgroundColor: '#2563eb', color: 'white' }),
                      multiValueLabel: (base) => ({ ...base, color: 'white' }),
                      option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#2563eb' : '#f1f5f9', color: '#0f172a' }),
                    }}
                    theme={theme => ({
                      ...theme,
                      borderRadius: 6,
                      colors: {
                        ...theme.colors,
                        primary25: '#2563eb',
                        primary: '#2563eb',
                        neutral0: '#f1f5f9',
                        neutral80: '#0f172a',
                      },
                    })}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.crimesSelecionados && formData.crimesSelecionados.map((crime: string) => (
                      <Badge key={crime} className="bg-blue-700 text-white cursor-pointer" onClick={() => handleInputChange('crimesSelecionados', formData.crimesSelecionados.filter((c: string) => c !== crime))}>
                        {crime} ✕
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="legislacao_aplicavel">Legislação Aplicável</Label>
                  <Input
                    id="legislacao_aplicavel"
                    value={formData.legislacao_aplicavel}
                    onChange={(e) => handleInputChange("legislacao_aplicavel", e.target.value)}
                    placeholder="Ex: Código Penal Militar"
                    readOnly={!!prescricaoInfo}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Parecer Gerado */}
        <TabsContent value="parecer" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 text-blue-600 mr-2" />
                Parecer Gerado pela IA
              </CardTitle>
              <CardDescription>
                Parecer gerado automaticamente pelo ChatGPT 4-o Mini baseado nos dados fornecidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-lg font-semibold mb-2">Gerando Parecer...</h3>
                    <p className="text-gray-600">A IA está analisando os dados e gerando o parecer jurídico</p>
                  </div>
                </div>
              ) : parecerGerado ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <pre className="whitespace-pre-wrap font-mono text-sm">{parecerGerado}</pre>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Parecer Gerado com Sucesso
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setActiveTab("caso")}>
                        Editar Dados
                      </Button>
                      <Button onClick={gerarParecer}>
                        <Bot className="h-4 w-4 mr-2" />
                        Regenerar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Parecer não gerado</h3>
                  <p className="text-gray-600 mb-4">Preencha os dados e clique em "Gerar Parecer" para continuar</p>
                  <Button onClick={() => setActiveTab("dados")}>
                    Voltar aos Dados
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NovoParecer;
