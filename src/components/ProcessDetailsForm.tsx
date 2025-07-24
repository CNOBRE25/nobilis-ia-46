import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import React from "react";

interface ProcessDetailsFormProps {
  formData: any;
  setField: (field: string, value: any) => void;
  isSavingDetalhes: boolean;
  handleSaveDetalhes: () => void;
  savedProcessId: string | null;
  editProcess: any;
}

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

const DiligenciasList = React.memo(({ formData, setField }: { formData: any, setField: (field: string, value: any) => void }) => (
  <div className="max-h-96 overflow-y-auto p-4 bg-white/10 rounded-lg border border-white/20">
    <div className="space-y-4">
      {DILIGENCIAS.map((diligencia) => (
        <div key={diligencia.id} className="border-b border-white/20 pb-3 last:border-b-0">
          <div className="flex items-start space-x-3">
            <Checkbox
              id={diligencia.id}
              checked={formData.diligenciasRealizadas?.[diligencia.id]?.realizada || false}
              onCheckedChange={(checked) => {
                const updated = {
                  ...formData.diligenciasRealizadas,
                  [diligencia.id]: {
                    ...formData.diligenciasRealizadas?.[diligencia.id],
                    realizada: checked
                  }
                };
                setField('diligenciasRealizadas', updated);
              }}
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
                    onChange={(e) => {
                      const updated = {
                        ...formData.diligenciasRealizadas,
                        [diligencia.id]: {
                          ...formData.diligenciasRealizadas?.[diligencia.id],
                          observacao: e.target.value
                        }
                      };
                      setField('diligenciasRealizadas', updated);
                    }}
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
));

export const ProcessDetailsForm: React.FC<ProcessDetailsFormProps> = ({
  formData,
  setField,
  isSavingDetalhes,
  handleSaveDetalhes,
  savedProcessId,
  editProcess
}) => {
  return (
    <>
      <div>
        <Label className="text-white">Desfecho Final (Sugestão do Encarregado)</Label>
        <Select value={formData.desfechoFinal} onValueChange={(value) => setField('desfechoFinal', value)}>
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
        <DiligenciasList formData={formData} setField={setField} />
      </div>

      <div>
        <Label className="text-white">Sugestões</Label>
        <Textarea
          value={formData.sugestoes}
          onChange={(e) => setField('sugestoes', e.target.value)}
          className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[100px]"
          placeholder="Sugestões adicionais..."
        />
      </div>

      {/* Botão de Salvar Detalhes */}
      <div className="flex justify-end pt-4 border-t border-white/20">
        <Button
          onClick={handleSaveDetalhes}
          disabled={isSavingDetalhes}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {isSavingDetalhes ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Detalhes
            </>
          )}
        </Button>
      </div>
    </>
  );
}; 