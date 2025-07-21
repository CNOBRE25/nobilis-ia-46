import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProcessDetailsFormProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
}

export function ProcessDetailsForm({ formData, setFormData }: ProcessDetailsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-white">Desfecho Final (Sugestão do Encarregado)</Label>
        <Select value={formData.desfechoFinal} onValueChange={(value) => setFormData((prev: any) => ({ ...prev, desfechoFinal: value }))}>
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
              <div key={diligencia.id} className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={!!formData.diligenciasRealizadas?.[diligencia.id]?.realizada}
                  onChange={e => setFormData((prev: any) => ({
                    ...prev,
                    diligenciasRealizadas: {
                      ...prev.diligenciasRealizadas,
                      [diligencia.id]: {
                        ...prev.diligenciasRealizadas?.[diligencia.id],
                        realizada: e.target.checked
                      }
                    }
                  }))}
                  className="mr-2"
                />
                <div className="flex-1">
                  <Label htmlFor={diligencia.id} className="text-white text-sm cursor-pointer font-medium">
                    {diligencia.label}
                  </Label>
                  {formData.diligenciasRealizadas?.[diligencia.id]?.realizada && (
                    <div className="mt-2">
                      <Textarea
                        value={formData.diligenciasRealizadas?.[diligencia.id]?.observacao || ''}
                        onChange={e => setFormData((prev: any) => ({
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
            ))}
          </div>
        </div>
      </div>
      <div>
        <Label className="text-white">Sugestões</Label>
        <Textarea
          value={formData.sugestoes}
          onChange={e => setFormData((prev: any) => ({ ...prev, sugestoes: e.target.value }))}
          className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[100px]"
          placeholder="Sugestões adicionais..."
        />
      </div>
    </div>
  );
} 