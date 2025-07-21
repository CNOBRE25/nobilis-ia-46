import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
      <div>
        <Label className="text-white">Número do Processo *</Label>
        <Input
          value={formData.numeroProcesso}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, numeroProcesso: e.target.value }))}
          disabled={isEditMode}
          className={`bg-white/20 border-white/30 text-white placeholder:text-white/70 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      </div>
      <div>
        <Label className="text-white">Tipo de Processo *</Label>
        <Select 
          value={formData.tipoProcesso} 
          onValueChange={(value) => setFormData((prev: any) => ({ ...prev, tipoProcesso: value }))}
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
        <Select value={formData.prioridade} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, prioridade: value }))}>
          <SelectTrigger className="bg-white/20 border-white/30 text-white">
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
        <Label className="text-white">Número do Despacho</Label>
        <Input
          value={formData.numeroDespacho}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, numeroDespacho: e.target.value }))}
          disabled={isEditMode}
          className={`bg-white/20 border-white/30 text-white placeholder:text-white/70 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder="Número do despacho"
        />
      </div>
      <div>
        <Label className="text-white">Origem do Processo</Label>
        <Select 
          value={formData.origemProcesso}
          onValueChange={(value) => setFormData((prev: any) => ({ ...prev, origemProcesso: value }))}
          disabled={isEditMode}
        >
          <SelectTrigger className={`bg-white/20 border-white/30 text-white ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
        <Label className="text-white">Status Funcional</Label>
        <Select 
          value={formData.statusFuncional} 
          onValueChange={(value) => setFormData((prev: any) => ({ ...prev, statusFuncional: value }))}
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
      <div>
        <Label className="text-white">Descrição dos Fatos *</Label>
        <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-white text-sm flex items-center">
          AVISO: Não inserir dados sensíveis (nome, CPF, RG, endereço). O sistema remove automaticamente.
        </div>
        <Textarea
          value={formData.descricaoFatos}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, descricaoFatos: e.target.value }))}
          className="bg-white/20 border-white/30 text-white placeholder:text-white/70 h-[200px] w-[1200px] max-w-full mx-auto resize-none"
          placeholder="Descreva detalhadamente os fatos ocorridos..."
        />
      </div>
      {/* Tipificação Criminal IA */}
      <div className="mt-8 p-4 bg-white/10 border border-white/20 rounded-lg">
        <h2 className="text-lg font-bold text-white mb-4">Tipificação Criminal</h2>
        <div className="mb-4">
          <Label className="text-white">Descreva o crime, parte do fato ou artigo</Label>
          <Textarea
            value={textoTipificacao}
            onChange={e => setTextoTipificacao(e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[60px]"
            placeholder="Ex: 'Lesão corporal durante serviço', 'Art. 209 CPM', 'Apropriação de bem público', etc."
          />
          <Button
            onClick={interpretarTipificacaoIA}
            disabled={isInterpretandoIA || !textoTipificacao || !formData.dataFato}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isInterpretandoIA ? 'Interpretando...' : 'Interpretar IA'}
          </Button>
        </div>
        {iaTipificacao && (
          <div className="mt-2 p-2 bg-green-500/20 border border-green-500/50 rounded text-white">
            <strong>Tipificação sugerida:</strong> {iaTipificacao}
            {iaPrescricao && <><br/><strong>Data da prescrição:</strong> {iaPrescricao}</>}
          </div>
        )}
      </div>
    </div>
  );
} 