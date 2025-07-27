import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// Interface do contexto
interface UIContextType {
  // Modais
  modals: {
    processForm: boolean;
    deleteDialog: boolean;
    viewDialog: boolean;
    statistics: boolean;
    profile: boolean;
    settings: boolean;
    changePassword: boolean;
    termsOfUse: boolean;
  };
  
  // Loading states
  loadingStates: {
    processes: boolean;
    statistics: boolean;
    reports: boolean;
    auth: boolean;
    form: boolean;
  };
  
  // Ações
  openModal: (modalName: keyof UIContextType['modals']) => void;
  closeModal: (modalName: keyof UIContextType['modals']) => void;
  closeAllModals: () => void;
  setLoading: (key: keyof UIContextType['loadingStates'], loading: boolean) => void;
  setAllLoading: (loading: boolean) => void;
}

// Contexto
const UIContext = createContext<UIContextType | undefined>(undefined);

// Provider
export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [modals, setModals] = useState({
    processForm: false,
    deleteDialog: false,
    viewDialog: false,
    statistics: false,
    profile: false,
    settings: false,
    changePassword: false,
    termsOfUse: false
  });
  
  const [loadingStates, setLoadingStates] = useState({
    processes: false,
    statistics: false,
    reports: false,
    auth: false,
    form: false
  });

  // Abrir modal
  const openModal = useCallback((modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, []);

  // Fechar modal
  const closeModal = useCallback((modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);

  // Fechar todos os modais
  const closeAllModals = useCallback(() => {
    setModals({
      processForm: false,
      deleteDialog: false,
      viewDialog: false,
      statistics: false,
      profile: false,
      settings: false,
      changePassword: false,
      termsOfUse: false
    });
  }, []);

  // Definir loading state específico
  const setLoading = useCallback((key: keyof typeof loadingStates, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  }, []);

  // Definir todos os loading states
  const setAllLoading = useCallback((loading: boolean) => {
    setLoadingStates({
      processes: loading,
      statistics: loading,
      reports: loading,
      auth: loading,
      form: loading
    });
  }, []);

  const value: UIContextType = {
    modals,
    loadingStates,
    openModal,
    closeModal,
    closeAllModals,
    setLoading,
    setAllLoading
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

// Hook para usar o contexto
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
}; 