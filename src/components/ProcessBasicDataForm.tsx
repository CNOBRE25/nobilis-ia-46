import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Brain, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { openaiService } from "@/services/openaiService";
import { useToast } from "@/hooks/use-toast";
import ReactSelect from 'react-select';
import crimesData from '../../public/crimes_brasil.json';
import { useEffect } from "react";

interface ProcessBasicDataFormProps {
  formData: any;
  setField: (field: string, value: any) => void;
  isEditMode: boolean;
  textoTipificacao: string;
  setTextoTipificacao: (v: string) => void;
  iaTipificacao: string | null;
  iaPrescricao: string | null;
  isInterpretandoIA: boolean;
  interpretarTipificacaoIA: () => void;
  editProcess: any; // Adicionado para edição
}

export function ProcessBasicDataForm({
  formData,
  setField,
  isEditMode,
  textoTipificacao,
  setTextoTipificacao,
  iaTipificacao,
  iaPrescricao,
  isInterpretandoIA,
  interpretarTipificacaoIA,
  editProcess
}: ProcessBasicDataFormProps) {
  const { toast } = useToast();
  const [isAnalisandoFatos, setIsAnalisandoFatos] = useState(false);
  const [analiseFatos, setAnaliseFatos] = useState<{
    crimes: string[];
    tipificacao: string;
    prescricao: string;
    competencia: string;
  } | null>(null);

  // Função para analisar automaticamente os fatos
  const analisarFatosAutomaticamente = async () => {
    if (!formData.descricaoFatos || formData.descricaoFatos.trim().length < 10) {
      toast({
        title: "Descrição insuficiente",
        description: "A descrição dos fatos deve ter pelo menos 10 caracteres para análise.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.dataFato) {
      toast({
        title: "Data do fato obrigatória",
        description: "É necessário informar a data do fato para calcular a prescrição.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalisandoFatos(true);
    setAnaliseFatos(null);

    try {
      // Preparar dados para análise
      const dadosAnalise = {
        descricaoFatos: formData.descricaoFatos,
        dataFato: formData.dataFato instanceof Date 
          ? formData.dataFato.toISOString().split('T')[0]
          : formData.dataFato,
        nomeInvestigado: formData.nomeInvestigado || "Não informado",
        cargoInvestigado: formData.cargoInvestigado || "Não informado",
        unidadeInvestigado: formData.unidadeInvestigado || "Não informado",
        vitima: formData.vitima || "Não informado",
        tipo_serviço: formData.statusFuncional || formData.status_funcional || 'Não se aplica',
        descricao_fato: formData.descricaoFatos || '',
        data_fato: formData.dataFato instanceof Date 
          ? formData.dataFato.toISOString().split('T')[0]
          : formData.dataFato,
      };

      // Chamar IA para análise
      const resultado = await openaiService.interpretarTipificacao({
        texto: dadosAnalise.descricao_fato,
        dataFato: dadosAnalise.data_fato
      });

      // Processar resultado
      if (resultado) {
        setAnaliseFatos({
          crimes: resultado.tipificacoes_alternativas || [],
          tipificacao: resultado.tipificacao_principal || "Não identificada",
          prescricao: resultado.prescricao_penal || "Não calculada",
          competencia: resultado.competencia || "Não definida"
        });

        // Atualizar campos do formulário automaticamente
        if (resultado.tipificacao_principal) {
          setField('tipoCrime', resultado.tipificacao_principal);
        }

        toast({
          title: "Análise concluída!",
          description: "Crimes identificados e tipificação aplicada automaticamente.",
        });
      }
    } catch (error: any) {
      console.error('Erro na análise automática:', error);
      toast({
        title: "Erro na análise",
        description: error.message || "Erro ao analisar os fatos automaticamente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalisandoFatos(false);
    }
  };

  // Função para aplicar análise automaticamente
  const aplicarAnalise = () => {
    if (analiseFatos) {
      // Aplicar crimes identificados
      if (analiseFatos.crimes.length > 0) {
        setField('crimesSelecionados', analiseFatos.crimes);
      }

      // Aplicar tipificação principal
      if (analiseFatos.tipificacao) {
        setField('tipoCrime', analiseFatos.tipificacao);
      }

      toast({
        title: "Análise aplicada!",
        description: "Os dados foram aplicados automaticamente ao formulário.",
      });
    }
  };

  // Lista de crimes agrupados por categoria
  const crimes = {
    "Crimes contra a Pessoa": [
      "Homicídio simples",
      "Homicídio qualificado",
      "Homicídio culposo",
      "Infanticídio",
      "Aborto provocado pela gestante",
      "Aborto provocado por terceiro",
      "Lesão corporal",
      "Sequestro e cárcere privado",
      "Redução à condição análoga à de escravo",
      "Ameaça",
      "Induzimento ao suicídio",
      "Morte em decorrencia de enfrentamento com agente de Estado"
    ],
    "Crimes contra a Mulher": [
      "Violência doméstica",
      "Feminicídio",
      "Tortura (em contexto de violência contra mulher)",
      "Violência sexual",
      "Assédio sexual",
      "Estupro",
      "Estupro de vulnerável",
      "Importunação sexual"
    ],
    "Crimes contra Criança e Adolescente": [
      "Abuso sexual de criança",
      "Exploração sexual de criança e adolescente",
      "Violência física contra criança",
      "Maus-tratos",
      "Negligência",
      "Aliciamento de menor",
      "Tráfico de menores"
    ],
    "Crimes contra População Racial": [
      "Racismo",
      "Discriminação racial",
      "Injúria racial",
      "Incitação ao ódio racial",
      "Lesão corporal por motivo racial"
    ],
    "Crimes contra LGBTQIA+": [
      "Discriminação por orientação sexual",
      "Lesão corporal por motivação LGBTfóbica",
      "Homicídio motivado por LGBTfobia",
      "Assédio sexual",
      "Violência contra pessoas trans",
      "Homofobia (tipificada como racismo)"
    ],
    "Crimes Cibernéticos / Informática": [
      "Invasão de dispositivo informático",
      "Divulgação de dados pessoais sem consentimento",
      "Fraude eletrônica",
      "Crimes contra a privacidade",
      "Difamação e calúnia pela internet",
      "Extorsão eletrônica",
      "Phishing",
      "Ataques de negação de serviço (DDoS)"
    ],
    "Crimes contra a Honra": [
      "Calúnia",
      "Difamação",
      "Injúria"
    ],
    "Crimes contra a Liberdade Individual": [
      "Constrangimento ilegal",
      "Violação de domicílio",
      "Violação de correspondência",
      "Tráfico de pessoas"
    ],
    "Crimes contra a Dignidade Sexual": [
      "Estupro",
      "Estupro de vulnerável",
      "Importunação sexual",
      "Assédio sexual",
      "Divulgação de cena de sexo sem consentimento",
      "Corrupção de menores"
    ],
    "Crimes contra o Patrimônio": [
      "Furto",
      "Roubo",
      "Extorsão",
      "Estelionato",
      "Apropriação indébita",
      "Receptação",
      "Dano"
    ],
    "Crimes contra a Fé Pública": [
      "Falsidade ideológica",
      "Falsificação de documento público",
      "Falsificação de documento particular",
      "Moeda falsa"
    ],
    "Crimes contra a Administração Pública": [
      "Peculato",
      "Corrupção passiva",
      "Corrupção ativa",
      "Concussão",
      "Prevaricação",
      "Violação de sigilo funcional",
      "Desobediência"
    ],
    "Crimes contra a Administração da Justiça": [
      "Desacato",
      "Desobediência",
      "Coação no curso do processo",
      "Corrupção de testemunha",
      "Fraude processual"
    ],
    "Crimes da Lei de Drogas (Lei 11.343/2006)": [
      "Tráfico de drogas",
      "Associação para o tráfico",
      "Financiamento do tráfico",
      "Porte para uso pessoal"
    ],
    "Crimes da Lei de Tortura (Lei 9.455/1997)": [
      "Tortura física",
      "Tortura psicológica",
      "Tortura por discriminação racial ou religiosa"
    ],
    "Crimes da Lei de Lavagem de Dinheiro (Lei 9.613/1998)": [
      "Lavagem de dinheiro"
    ],
    "Crimes da Lei Antiterrorismo (Lei 13.260/2016)": [
      "Terrorismo"
    ],
    "Crimes Hediondos (Lei 8.072/1990)": [
      "Homicídio qualificado",
      "Latrocínio",
      "Estupro",
      "Estupro de vulnerável",
      "Extorsão mediante sequestro com morte",
      "Genocídio",
      "Epidemia com resultado morte"
    ],
    "Crimes Militares (Código Penal Militar)": [
      "Motim",
      "Revolta",
      "Insubordinação",
      "Deserção",
      "Abandono de posto",
      "Violência contra superior",
      "Furto de armamento",
      "Recusa de obediência",
      "Pederastia ou libidinagem em ambiente militar",
      "Traição em tempo de guerra"
    ]
  };

  // Transformar crimesData em opções para React Select
  const crimeOptions = Object.entries(crimesData).flatMap(([categoria, lista]) =>
    lista.map(crime => ({ value: crime, label: crime, categoria }))
  );
  const groupedOptions = Object.entries(crimesData).map(([categoria, lista]) => ({
    label: categoria,
    options: lista.map(crime => ({ value: crime, label: crime }))
  }));

  useEffect(() => {
    if (editProcess && editProcess.analise_fatos) {
      try {
        setAnaliseFatos(JSON.parse(editProcess.analise_fatos));
      } catch {}
    }
  }, [editProcess]);

  return (
    <div className="space-y-6">
      {/* Seção: Informações Principais */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg font-semibold">Informações Principais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white text-sm font-medium">Número do Processo *</Label>
              <Input
                value={formData.numeroProcesso}
                onChange={(e) => setField('numeroProcesso', e.target.value)}
                disabled={isEditMode}
                className={`mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={isEditMode ? "Número do processo (não pode ser alterado)" : "Digite qualquer número de processo"}
              />
            </div>
            
            <div>
              <Label className="text-white text-sm font-medium">Tipo de Processo *</Label>
              <Select 
                value={formData.tipoProcesso} 
                onValueChange={(value) => setField('tipoProcesso', value)}
                disabled={isEditMode}
              >
                <SelectTrigger className={`mt-1 bg-white/20 border-white/30 text-white ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
              <Label className="text-white text-sm font-medium">Prioridade</Label>
              <Select value={formData.prioridade} onValueChange={(value) => setField('prioridade', value)}>
                <SelectTrigger className="mt-1 bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgente_maria_penha" className="text-red-600 font-bold">URGENTE-MARIA DA PENHA</SelectItem>
                  <SelectItem value="urgente">URGENTE</SelectItem>
                  <SelectItem value="alta">ALTA</SelectItem>
                  <SelectItem value="media">MÉDIA</SelectItem>
                  <SelectItem value="baixa">BAIXA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm font-medium">Número do Despacho</Label>
              <Input
                value={formData.numeroDespacho}
                onChange={(e) => setField('numeroDespacho', e.target.value)}
                disabled={isEditMode}
                className={`mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Número do despacho"
              />
            </div>

            <div>
              <Label className="text-white text-sm font-medium">Data do Despacho</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1 bg-white/20 border-white/30 text-white",
                      !formData.dataDespacho && "text-white/70"
                    )}
                    disabled={isEditMode}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataDespacho ? format(formData.dataDespacho, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataDespacho || undefined}
                    onSelect={(date) => setField('dataDespacho', date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-white text-sm font-medium">Data de Recebimento pelo Encarregado</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1 bg-white/20 border-white/30 text-white",
                      !formData.dataRecebimento && "text-white/70"
                    )}
                    disabled={isEditMode}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataRecebimento ? format(formData.dataRecebimento, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataRecebimento || undefined}
                    onSelect={(date) => setField('dataRecebimento', date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-white text-sm font-medium">Data do Fato</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1 bg-white/20 border-white/30 text-white",
                      !formData.dataFato && "text-white/70"
                    )}
                    disabled={isEditMode}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataFato ? format(formData.dataFato, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataFato || undefined}
                    onSelect={(date) => setField('dataFato', date)}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção: Origem e Status */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg font-semibold">Origem e Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white text-sm font-medium">Origem do Processo</Label>
              <Select 
                value={formData.origemProcesso}
                onValueChange={(value) => setField('origemProcesso', value)}
                disabled={isEditMode}
              >
                <SelectTrigger className={`mt-1 bg-white/20 border-white/30 text-white ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Denúncia">Denúncia</SelectItem>
                  <SelectItem value="Representação">Representação</SelectItem>
                  <SelectItem value="Portaria">Portaria</SelectItem>
                  <SelectItem value="Ofício">Ofício</SelectItem>
                  <SelectItem value="Memorando">Memorando</SelectItem>
                  <SelectItem value="Relatório">Relatório</SelectItem>
                  <SelectItem value="Comunicação">Comunicação</SelectItem>
                  <SelectItem value="Solicitação">Solicitação</SelectItem>
                  <SelectItem value="Determinação Superior">Determinação Superior</SelectItem>
                  <SelectItem value="Notícia de Fato">Notícia de Fato</SelectItem>
                  <SelectItem value="Representação da Vítima">Representação da Vítima</SelectItem>
                  <SelectItem value="Representação de Terceiro">Representação de Terceiro</SelectItem>
                  <SelectItem value="Auto de Prisão em Flagrante">Auto de Prisão em Flagrante</SelectItem>
                  <SelectItem value="Auto de Infração">Auto de Infração</SelectItem>
                  <SelectItem value="Boletim de Ocorrência">Boletim de Ocorrência</SelectItem>
                  <SelectItem value="Comunicação de Crime">Comunicação de Crime</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white text-sm font-medium">Status Funcional</Label>
              <Select 
                value={formData.statusFuncional} 
                onValueChange={(value) => setField('statusFuncional', value)}
                disabled={isEditMode}
              >
                <SelectTrigger className={`mt-1 bg-white/20 border-white/30 text-white ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
        </CardContent>
      </Card>

      {/* Seção: Descrição dos Fatos */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg font-semibold">Descrição dos Fatos *</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm flex items-center">
            <span className="font-medium">⚠️ AVISO:</span> Não inserir dados sensíveis (nome, CPF, RG, endereço). O sistema remove automaticamente.
          </div>
          <Textarea
            value={formData.descricaoFatos}
            onChange={(e) => setField('descricaoFatos', e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[200px] resize-none"
            placeholder="Descreva detalhadamente os fatos ocorridos..."
          />
          <div className="mt-4 flex justify-end">
            <Button
              onClick={analisarFatosAutomaticamente}
              disabled={isAnalisandoFatos || !formData.descricaoFatos || formData.descricaoFatos.trim().length < 10 || !formData.dataFato}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAnalisandoFatos ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analisar Fatos
                </>
              )}
            </Button>
            {analiseFatos && (
              <Button
                onClick={aplicarAnalise}
                disabled={!analiseFatos || !formData.descricaoFatos}
                className="ml-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Aplicar Análise
              </Button>
            )}
          </div>

          {/* Resultados da Análise Automática */}
          {analiseFatos && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <h4 className="text-green-300 font-semibold">Análise Automática Concluída</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="text-green-200 font-medium mb-2">Tipificação Principal:</h5>
                  <p className="text-white bg-green-500/20 p-2 rounded">{analiseFatos.tipificacao}</p>
                </div>
                
                <div>
                  <h5 className="text-green-200 font-medium mb-2">Prescrição Penal:</h5>
                  <p className="text-white bg-green-500/20 p-2 rounded">{analiseFatos.prescricao}</p>
                </div>
                
                <div>
                  <h5 className="text-green-200 font-medium mb-2">Competência:</h5>
                  <p className="text-white bg-green-500/20 p-2 rounded">{analiseFatos.competencia}</p>
                </div>
                
                <div>
                  <h5 className="text-green-200 font-medium mb-2">Crimes Identificados:</h5>
                  <div className="flex flex-wrap gap-1">
                    {analiseFatos.crimes.map((crime, index) => (
                      <Badge key={index} className="bg-green-600 text-white text-xs">
                        {crime}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção: Tipificação Criminal */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg font-semibold">Tipificação Criminal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-100 text-sm flex items-center">
            <span className="font-medium">⚠️ Observação:</span> A tipificação criminal é opcional e pode ser preenchida ou ajustada posteriormente. O processo pode ser cadastrado normalmente sem este dado.
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-white text-sm font-medium">Buscar e selecionar crimes (múltipla seleção)</Label>
              <ReactSelect
                isMulti
                options={groupedOptions}
                value={groupedOptions.flatMap(g => g.options).filter(opt => formData.crimesSelecionados?.includes(opt.value))}
                onChange={selected => setField('crimesSelecionados', selected.map(opt => opt.value))}
                placeholder="Digite para buscar e selecione os crimes..."
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({ ...base, backgroundColor: '#1e293b', borderColor: '#64748b', color: 'white' }),
                  menu: (base) => ({ ...base, backgroundColor: '#1e293b', color: 'white' }),
                  multiValue: (base) => ({ ...base, backgroundColor: '#2563eb', color: 'white' }),
                  multiValueLabel: (base) => ({ ...base, color: 'white' }),
                  option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#2563eb' : '#1e293b', color: 'white' }),
                }}
                theme={theme => ({
                  ...theme,
                  borderRadius: 6,
                  colors: {
                    ...theme.colors,
                    primary25: '#2563eb',
                    primary: '#2563eb',
                    neutral0: '#1e293b',
                    neutral80: 'white',
                  },
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 