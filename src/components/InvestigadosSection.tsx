import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, UserPlus, Trash2, Save, Loader2, Brain } from "lucide-react";
import { format } from "date-fns";
import { Investigado, Process } from "@/types/process";
import { InvestigadosSectionProps } from "@/types/components";
import { cn } from "@/lib/utils";



const InvestigadoCard = React.memo(({ investigado, index, updateInvestigado }: { investigado: Investigado, index: number, updateInvestigado: (id: number, field: string, value: any) => void }) => (
  <Card key={investigado.id} className="bg-white/5 border-white/20">
    <CardContent className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Label className="text-white font-medium">Investigado {index + 1}</Label>
        <Button 
          onClick={() => updateInvestigado(investigado.id, 'nome', '')} 
          size="sm" 
          variant="destructive"
          className="h-8 w-8 p-0"
          aria-label="Remover investigado"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remover investigado</span>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white text-sm">Nome</Label>
          <Input
            value={investigado.nome}
            onChange={(e) => updateInvestigado(investigado.id, 'nome', e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            placeholder="Nome completo"
          />
        </div>
        <div>
          <Label className="text-white text-sm">Cargo</Label>
          <Input
            value={investigado.cargo}
            onChange={(e) => updateInvestigado(investigado.id, 'cargo', e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            placeholder="Cargo/função"
          />
        </div>
        <div>
          <Label className="text-white text-sm">Unidade</Label>
          <Input
            value={investigado.unidade}
            onChange={(e) => updateInvestigado(investigado.id, 'unidade', e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            placeholder="Unidade/órgão"
          />
        </div>
        <div>
          <Label className="text-white text-sm">Matrícula</Label>
          <Input
            value={investigado.matricula}
            onChange={(e) => updateInvestigado(investigado.id, 'matricula', e.target.value)}
            className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
            placeholder="Número da matrícula"
          />
        </div>
        <div>
          <Label className="text-white text-sm">Data de Admissão</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal bg-white/20 border-white/30 text-white",
                  !investigado.dataAdmissao && "text-white/70"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {investigado.dataAdmissao ? format(investigado.dataAdmissao, "dd/MM/yyyy") : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={investigado.dataAdmissao || undefined}
                onSelect={(date) => updateInvestigado(investigado.id, 'dataAdmissao', date)}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </CardContent>
  </Card>
));

export const InvestigadosSection = React.memo(({
  investigados,
  addInvestigado,
  updateInvestigado,
  isSavingInvestigados,
  handleSaveInvestigados,
  savedProcessId,
  editProcess
}: InvestigadosSectionProps) => {
  // Função para adicionar um novo investigado
  const handleAddInvestigado = useCallback(() => {
    const novoInvestigado: Investigado = {
      id: Date.now(),
      nome: "",
      cargo: "",
      unidade: "",
      matricula: "",
      dataAdmissao: null
    };
    addInvestigado(novoInvestigado);
  }, [addInvestigado]);

  const memoizedUpdateInvestigado = useCallback(updateInvestigado, []);

  return (
    <div className="space-y-6 mt-6">
      {/* Seção de Investigados */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-white text-lg font-semibold">Investigados</Label>
          <Button 
            onClick={handleAddInvestigado} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Adicionar Investigado
          </Button>
        </div>

        {investigados.length === 0 && (
          <div className="text-white/70 text-center py-4 border border-white/20 rounded">
            Nenhum investigado adicionado
          </div>
        )}

        {investigados.map((investigado, index) => (
          <InvestigadoCard key={investigado.id} investigado={investigado} index={index} updateInvestigado={memoizedUpdateInvestigado} />
        ))}
      </div>

      {/* Botões de IA e Relatório - Apenas na aba Investigados */}
      <div className="mt-3 p-3 bg-blue-500/20 border border-blue-500/50 rounded text-white text-sm">
        <div className="flex items-center">
          <Brain className="h-4 w-4 mr-2" />
          <span className="font-medium">Funcionalidades de IA</span>
        </div>
        <p className="mt-1 text-white/80">
          Após preencher todos os dados do processo, utilize estes botões para gerar análises jurídicas 
          e relatórios completos baseados em IA.
        </p>
      </div>

      {/* Botão de Salvar Investigados */}
      <div className="flex justify-end pt-4 border-t border-white/20">
        <Button
          onClick={handleSaveInvestigados}
          disabled={isSavingInvestigados || (!savedProcessId && !editProcess?.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {isSavingInvestigados ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Investigados
            </>
          )}
        </Button>
      </div>
    </div>
  );
}); 