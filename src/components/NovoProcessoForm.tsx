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
import crimesData from "../../public/leis_crimes_militares_pe.json";
const crimesMilitares = crimesData.crimes_militares.map((c: any) => `${c.crime} (${c.artigo})`);

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

const initialForm = {
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
};

// Crimes agrupados por categoria
const crimesPorCategoria = {
  "Crimes contra a Pessoa": [
    "Aborto provocado pela gestante",
    "Aborto provocado por terceiro",
    "Ameaça",
    "Homicídio culposo",
    "Homicídio qualificado",
    "Homicídio simples",
    "Homicídio decorrente de enfrentamento com agente de segurança",
    "Induzimento ao suicídio",
    "Infanticídio",
    "Lesão corporal",
    "Lesão corporal decorrente de enfrentamento com agente de segurança",
    "Redução à condição análoga à de escravo",
    "Sequestro e cárcere privado"
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
  ]
};

export default function NovoProcessoForm({ onProcessCreated, processo }: { onProcessCreated?: () => void, processo?: any }) {
  const { toast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [aba, setAba] = useState("dados-basicos");
  const [isLoading, setIsLoading] = useState(false);
  const [processoCriado, setProcessoCriado] = useState(false);
  const [desfechoFinal, setDesfechoFinal] = useState("");

  useEffect(() => {
    if (processo) setForm({
      numeroProcesso: processo.numero_processo || "",
      tipoProcesso: processo.tipo_processo || "",
      prioridade: processo.prioridade || "",
      numeroDespacho: processo.numero_despacho || "",
      dataDespacho: processo.data_despacho || "",
      dataRecebimento: processo.data_recebimento || "",
      dataFato: processo.data_fato || "",
      origemProcesso: processo.origem_processo || "",
      statusFuncional: processo.status_funcional || "",
      descricaoFatos: processo.descricao_fatos || "",
      tipificacaoCriminal: processo.tipo_crime || "",
      diligenciasRealizadas: processo.diligencias_realizadas || {}
    });
  }, [processo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "numeroProcesso" && value.length > 15) return;
    if (name === "numeroDespacho" && value.length > 6) return;
    setForm({ ...form, [name]: value });
  };

  const handleSelect = (field: string, value: string) => {
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
        // update e concluir
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
          status: 'concluido'
        }).eq("id", processo.id);
        if (error) throw error;
        toast({
          title: "Processo concluído!",
          description: `Processo ${form.numeroProcesso} foi concluído e relatório gerado.`
        });
      } else {
        // insert e concluir
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
            diligencias_realizadas: form.diligenciasRealizadas,
            desfecho_final: desfechoFinal,
            status: 'concluido'
          }
        ]);
        if (error) throw error;
        toast({
          title: "Processo concluído!",
          description: `Processo ${form.numeroProcesso} foi concluído e relatório gerado.`
        });
      }
      if (onProcessCreated) onProcessCreated();
    } catch (err: any) {
      toast({
        title: "Erro ao concluir processo",
        description: err.message || "Erro desconhecido.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <Tabs value={aba} onValueChange={setAba} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/20">
              <TabsTrigger value="dados-basicos" className="text-white data-[state=active]:bg-white/30">Dados Básicos</TabsTrigger>
              <TabsTrigger value="descricao-fatos" className="text-white data-[state=active]:bg-white/30" disabled={!processoCriado && !processo}>Descrição dos Fatos</TabsTrigger>
              <TabsTrigger value="tipificacao-criminal" className="text-white data-[state=active]:bg-white/30" disabled={!processoCriado && !processo}>Tipificação Criminal</TabsTrigger>
            </TabsList>
            <TabsContent value="dados-basicos" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroProcesso" className="text-white">Número do Processo *</Label>
                  <Input id="numeroProcesso" name="numeroProcesso" value={form.numeroProcesso} onChange={handleChange} className="bg-white/20 text-white" required maxLength={15} />
                </div>
                <div>
                  <Label htmlFor="tipoProcesso" className="text-white">Tipo de Processo *</Label>
                  <Select value={form.tipoProcesso} onValueChange={v => handleSelect("tipoProcesso", v)}>
                    <SelectTrigger className="bg-white/20 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoProcessoOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prioridade" className="text-white">Prioridade</Label>
                  <Select value={form.prioridade} onValueChange={v => handleSelect("prioridade", v)}>
                    <SelectTrigger className="bg-white/20 text-white">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridadeOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numeroDespacho" className="text-white">Número do Despacho</Label>
                  <Input id="numeroDespacho" name="numeroDespacho" value={form.numeroDespacho} onChange={handleChange} className="bg-white/20 text-white" maxLength={6} />
                </div>
                <div>
                  <Label htmlFor="dataDespacho" className="text-white">Data do Despacho</Label>
                  <Input id="dataDespacho" name="dataDespacho" type="date" value={form.dataDespacho} onChange={handleChange} className="bg-white/20 text-white" />
                </div>
                <div>
                  <Label htmlFor="dataRecebimento" className="text-white">Data de Recebimento</Label>
                  <Input id="dataRecebimento" name="dataRecebimento" type="date" value={form.dataRecebimento} onChange={handleChange} className="bg-white/20 text-white" />
                </div>
                <div>
                  <Label htmlFor="dataFato" className="text-white">Data do Fato *</Label>
                  <Input id="dataFato" name="dataFato" type="date" value={form.dataFato} onChange={handleChange} className="bg-white/20 text-white" required />
                </div>
                <div>
                  <Label htmlFor="origemProcesso" className="text-white">Origem do Procedimento</Label>
                  <Select value={form.origemProcesso} onValueChange={v => handleSelect("origemProcesso", v)}>
                    <SelectTrigger className="bg-white/20 text-white">
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {origemOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="statusFuncional" className="text-white">Status Funcional</Label>
                  <Select value={form.statusFuncional} onValueChange={v => handleSelect("statusFuncional", v)}>
                    <SelectTrigger className="bg-white/20 text-white">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusFuncionalOptions.map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50">
                  {isLoading ? (processo ? "Salvando..." : "Cadastrando...") : (processo ? "Salvar Alterações" : "Cadastrar Processo")}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="descricao-fatos" className="space-y-6 mt-6">
              <Label htmlFor="descricaoFatos" className="text-white">Descrição dos Fatos</Label>
              <Textarea id="descricaoFatos" name="descricaoFatos" value={form.descricaoFatos} onChange={handleChange} className="bg-white/20 text-white min-h-[120px]" />
              <Label className="text-white">Diligências Realizadas</Label>
              <div className="max-h-96 overflow-y-auto p-4 bg-white/10 rounded-lg border border-white/20">
                <div className="space-y-4">
                  {DILIGENCIAS.map((diligencia) => (
                    <div key={diligencia.id} className="border-b border-white/20 pb-3 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={diligencia.id}
                          checked={form.diligenciasRealizadas?.[diligencia.id]?.realizada || false}
                          onCheckedChange={(checked) => handleDiligenciaChange(diligencia.id, checked as boolean)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={diligencia.id} className="text-white text-sm cursor-pointer font-medium">
                            {diligencia.label}
                          </Label>
                          {form.diligenciasRealizadas?.[diligencia.id]?.realizada && (
                            <div className="mt-2">
                              <Textarea
                                value={form.diligenciasRealizadas?.[diligencia.id]?.observacao || ''}
                                onChange={(e) => handleDiligenciaObsChange(diligencia.id, e.target.value)}
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
              <div className="flex justify-end mt-6">
                <Button onClick={() => setAba("tipificacao-criminal")} disabled={!processoCriado && !processo} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                  Próxima: Tipificação Criminal
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="tipificacao-criminal" className="space-y-6 mt-6">
              <Label htmlFor="tipificacaoCriminal" className="text-white">Tipificação Criminal</Label>
              <Select value={form.tipificacaoCriminal} onValueChange={v => setForm({ ...form, tipificacaoCriminal: v })}>
                <SelectTrigger className="bg-white/20 text-white">
                  <SelectValue placeholder="Selecione o crime" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(crimesPorCategoria).map(([categoria, crimes]) => (
                    <React.Fragment key={categoria}>
                      <div className="px-2 py-1 text-xs font-bold text-blue-300 uppercase bg-white/5 border-b border-white/10">{categoria}</div>
                      {crimes.map((crime) => (
                        <SelectItem key={crime} value={crime}>{crime}</SelectItem>
                      ))}
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
              <Label htmlFor="desfechoFinal" className="text-white">Desfecho Final</Label>
              <Select value={desfechoFinal} onValueChange={setDesfechoFinal}>
                <SelectTrigger className="bg-white/20 text-white">
                  <SelectValue placeholder="Selecione o desfecho" />
                </SelectTrigger>
                <SelectContent>
                  {desfechosFinais.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setAba("dados-basicos")} className="bg-gray-600 hover:bg-gray-700 text-white">
                  Voltar
                </Button>
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveAndConclude} disabled={isLoading || !desfechoFinal} className="bg-green-700 hover:bg-green-800 text-white mt-4">
                  {isLoading ? "Salvando..." : "Salvar e Gerar Relatório Final"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 