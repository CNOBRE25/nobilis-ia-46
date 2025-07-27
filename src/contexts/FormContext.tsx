import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ProcessFormData, Investigado, Vitima, SetFieldFunction } from '@/types/process';

// Interface do contexto
interface FormContextType {
  // Estado do formulário
  formData: ProcessFormData;
  investigados: Investigado[];
  vitimas: Vitima[];
  
  // Ações
  setFormData: (data: Partial<ProcessFormData>) => void;
  setField: SetFieldFunction;
  addInvestigado: (investigado: Investigado) => void;
  updateInvestigado: (id: number, field: keyof Investigado, value: Investigado[keyof Investigado]) => void;
  removeInvestigado: (id: number) => void;
  addVitima: (vitima: Vitima) => void;
  removeVitima: (id: number) => void;
  updateVitima: (id: number, value: string) => void;
  
  // Validação
  errors: Record<string, string>;
  isValid: boolean;
  validate: () => boolean;
  clearErrors: () => void;
  
  // Utilitários
  resetForm: () => void;
  loadFormData: (data: ProcessFormData) => void;
}

// Dados iniciais do formulário
const initialFormData: ProcessFormData = {
  numeroProcesso: '',
  tipoProcesso: '',
  prioridade: 'media',
  numeroDespacho: '',
  dataDespacho: null,
  dataRecebimento: null,
  dataFato: null,
  origemProcesso: '',
  statusFuncional: '',
  descricaoFatos: '',
  tipoCrime: '',
  crimesSelecionados: [],
  transgressao: '',
  modusOperandi: '',
  nomeInvestigado: '',
  cargoInvestigado: '',
  unidadeInvestigado: '',
  matriculaInvestigado: '',
  dataAdmissao: null,
  vitima: '',
  numeroSigpad: '',
  diligenciasRealizadas: {},
  desfechoFinal: '',
  sugestoes: '',
  relatorioFinal: ''
};

// Contexto
const FormContext = createContext<FormContextType | undefined>(undefined);

// Provider
export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormDataState] = useState<ProcessFormData>(initialFormData);
  const [investigados, setInvestigados] = useState<Investigado[]>([]);
  const [vitimas, setVitimas] = useState<Vitima[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Definir dados do formulário
  const setFormData = useCallback((data: Partial<ProcessFormData>) => {
    setFormDataState(prev => ({ ...prev, ...data }));
  }, []);

  // Definir campo específico
  const setField: SetFieldFunction = useCallback((field, value) => {
    setFormDataState(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  // Adicionar investigado
  const addInvestigado = useCallback((investigado: Investigado) => {
    setInvestigados(prev => [...prev, investigado]);
  }, []);

  // Atualizar investigado
  const updateInvestigado = useCallback((
    id: number, 
    field: keyof Investigado, 
    value: Investigado[keyof Investigado]
  ) => {
    setInvestigados(prev => prev.map(inv => 
      inv.id === id ? { ...inv, [field]: value } : inv
    ));
  }, []);

  // Remover investigado
  const removeInvestigado = useCallback((id: number) => {
    setInvestigados(prev => prev.filter(inv => inv.id !== id));
  }, []);

  // Adicionar vítima
  const addVitima = useCallback((vitima: Vitima) => {
    setVitimas(prev => [...prev, vitima]);
  }, []);

  // Remover vítima
  const removeVitima = useCallback((id: number) => {
    setVitimas(prev => prev.filter(v => v.id !== id));
  }, []);

  // Atualizar vítima
  const updateVitima = useCallback((id: number, value: string) => {
    setVitimas(prev => prev.map(v => 
      v.id === id ? { ...v, nome: value } : v
    ));
  }, []);

  // Validar formulário
  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    // Validações obrigatórias
    if (!formData.numeroProcesso?.trim()) {
      newErrors.numeroProcesso = 'Número do processo é obrigatório';
    }
    
    if (!formData.tipoProcesso?.trim()) {
      newErrors.tipoProcesso = 'Tipo do processo é obrigatório';
    }
    
    if (!formData.prioridade) {
      newErrors.prioridade = 'Prioridade é obrigatória';
    }
    
    if (!formData.numeroDespacho?.trim()) {
      newErrors.numeroDespacho = 'Número do despacho é obrigatório';
    }
    
    if (!formData.origemProcesso?.trim()) {
      newErrors.origemProcesso = 'Origem do processo é obrigatória';
    }
    
    if (!formData.descricaoFatos?.trim()) {
      newErrors.descricaoFatos = 'Descrição dos fatos é obrigatória';
    }
    
    if (!formData.tipoCrime?.trim()) {
      newErrors.tipoCrime = 'Tipo de crime é obrigatório';
    }
    
    // Validações de investigados
    if (investigados.length === 0) {
      newErrors.investigados = 'Pelo menos um investigado é obrigatório';
    } else {
      investigados.forEach((inv, index) => {
        if (!inv.nome?.trim()) {
          newErrors[`investigado_${index}_nome`] = 'Nome do investigado é obrigatório';
        }
        if (!inv.cargo?.trim()) {
          newErrors[`investigado_${index}_cargo`] = 'Cargo do investigado é obrigatório';
        }
        if (!inv.unidade?.trim()) {
          newErrors[`investigado_${index}_unidade`] = 'Unidade do investigado é obrigatória';
        }
        if (!inv.matricula?.trim()) {
          newErrors[`investigado_${index}_matricula`] = 'Matrícula do investigado é obrigatória';
        }
      });
    }
    
    // Validações de vítimas
    if (vitimas.length === 0) {
      newErrors.vitimas = 'Pelo menos uma vítima é obrigatória';
    } else {
      vitimas.forEach((vit, index) => {
        if (!vit.nome?.trim()) {
          newErrors[`vitima_${index}_nome`] = 'Nome da vítima é obrigatório';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, investigados, vitimas]);

  // Limpar erros
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Resetar formulário
  const resetForm = useCallback(() => {
    setFormDataState(initialFormData);
    setInvestigados([]);
    setVitimas([]);
    setErrors({});
  }, []);

  // Carregar dados do formulário
  const loadFormData = useCallback((data: ProcessFormData) => {
    setFormDataState(data);
    setErrors({});
  }, []);

  const value: FormContextType = {
    formData,
    investigados,
    vitimas,
    setFormData,
    setField,
    addInvestigado,
    updateInvestigado,
    removeInvestigado,
    addVitima,
    removeVitima,
    updateVitima,
    errors,
    isValid: Object.keys(errors).length === 0,
    validate,
    clearErrors,
    resetForm,
    loadFormData
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

// Hook para usar o contexto
export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within FormProvider');
  }
  return context;
}; 