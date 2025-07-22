import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProcessBasicDataFormProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
  isEditMode: boolean;
  textoTipificacao: string;
  setTextoTipificacao: (v: string) => void;
  iaTipificacao: string | null;
  iaPrescricao: string | null;
  isInterpretandoIA: boolean;
  interpretarTipificacaoIA: () => void;
}

export function ProcessBasicDataForm({
  formData,
  setFormData,
  isEditMode,
  textoTipificacao,
  setTextoTipificacao,
  iaTipificacao,
  iaPrescricao,
  isInterpretandoIA,
  interpretarTipificacaoIA
}: ProcessBasicDataFormProps) {
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
                onChange={(e) => setFormData((prev: any) => ({ ...prev, numeroProcesso: e.target.value }))}
                disabled={isEditMode}
                className={`mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Digite o número do processo"
              />
            </div>
            
            <div>
              <Label className="text-white text-sm font-medium">Tipo de Processo *</Label>
              <Select 
                value={formData.tipoProcesso} 
                onValueChange={(value) => setFormData((prev: any) => ({ ...prev, tipoProcesso: value }))}
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
              <Select value={formData.prioridade} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, prioridade: value }))}>
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
                onChange={(e) => setFormData((prev: any) => ({ ...prev, numeroDespacho: e.target.value }))}
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
                    onSelect={(date) => setFormData((prev: any) => ({ ...prev, dataDespacho: date }))}
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
                    onSelect={(date) => setFormData((prev: any) => ({ ...prev, dataRecebimento: date }))}
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
                    onSelect={(date) => setFormData((prev: any) => ({ ...prev, dataFato: date }))}
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
                onValueChange={(value) => setFormData((prev: any) => ({ ...prev, origemProcesso: value }))}
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
                onValueChange={(value) => setFormData((prev: any) => ({ ...prev, statusFuncional: value }))}
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
            onChange={(e) => setFormData((prev: any) => ({ ...prev, descricaoFatos: e.target.value }))}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[200px] resize-none"
            placeholder="Descreva detalhadamente os fatos ocorridos..."
          />
        </CardContent>
      </Card>

      {/* Seção: Tipificação Criminal IA */}
      <Card className="bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg font-semibold">Tipificação Criminal IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-white text-sm font-medium">Descreva o crime, parte do fato ou artigo</Label>
              <Textarea
                value={textoTipificacao}
                onChange={e => setTextoTipificacao(e.target.value)}
                className="mt-1 bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[80px] resize-none"
                placeholder="Ex: 'Lesão corporal durante serviço', 'Art. 209 CPM', 'Apropriação de bem público', etc."
              />
              <Button
                onClick={interpretarTipificacaoIA}
                disabled={isInterpretandoIA || !textoTipificacao || !formData.dataFato}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {isInterpretandoIA ? 'Interpretando...' : 'Interpretar IA'}
              </Button>
            </div>
            
            {iaTipificacao && (
              <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-white">
                <div className="font-medium text-green-300 mb-1">Tipificação sugerida:</div>
                <div className="text-sm">{iaTipificacao}</div>
                {iaPrescricao && (
                  <div className="mt-2 pt-2 border-t border-green-500/30">
                    <div className="font-medium text-green-300 text-sm">Data da prescrição:</div>
                    <div className="text-sm">{iaPrescricao}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 