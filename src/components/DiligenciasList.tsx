import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DILIGENCIAS } from '@/constants/processData';
import { ProcessFormData, SetFieldFunction } from '@/types/process';
import { DiligenciasListProps } from '@/types/components';



export const DiligenciasList = React.memo(({ 
  formData, 
  setField, 
  className = "" 
}: DiligenciasListProps) => (
  <div className={`max-h-96 overflow-y-auto p-4 bg-white/10 rounded-lg border border-white/20 ${className}`}>
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

DiligenciasList.displayName = 'DiligenciasList'; 