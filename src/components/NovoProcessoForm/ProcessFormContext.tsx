import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProcessFormData } from '@/types/process';

interface ProcessFormContextType {
  form: ProcessFormData;
  setForm: React.Dispatch<React.SetStateAction<ProcessFormData>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  // Adicione outros estados/handlers relevantes aqui
}

const ProcessFormContext = createContext<ProcessFormContextType | undefined>(undefined);

export const useProcessFormContext = () => {
  const context = useContext(ProcessFormContext);
  if (!context) {
    throw new Error('useProcessFormContext deve ser usado dentro de ProcessFormProvider');
  }
  return context;
};

export const ProcessFormProvider = ({ children, initialForm }: { children: ReactNode; initialForm: ProcessFormData }) => {
  const [form, setForm] = useState<ProcessFormData>(initialForm);
  const [isLoading, setIsLoading] = useState(false);

  // Adicione outros estados/handlers relevantes aqui

  return (
    <ProcessFormContext.Provider value={{ form, setForm, isLoading, setIsLoading }}>
      {children}
    </ProcessFormContext.Provider>
  );
}; 