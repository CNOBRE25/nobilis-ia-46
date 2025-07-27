# Análise de Gerenciamento de Estado - Melhorias e Otimizações

## 📊 Resumo da Análise

Identificamos **problemas significativos de gerenciamento de estado** na aplicação, incluindo prop drilling excessivo, estado duplicado, e uso inadequado de Context API. A aplicação pode se beneficiar muito de uma reestruturação do gerenciamento de estado.

## 🔍 Problemas Identificados

### 1. **Prop Drilling Excessivo**

#### **Problemas Críticos:**

##### **NovoProcessoForm.tsx** - Estado Fragmentado
```typescript
// ❌ PROBLEMA: Múltiplos estados relacionados passados como props
const [form, setForm] = useState<ProcessFormData>(...);
const [investigados, setInvestigados] = useState<Investigado[]>(...);
const [vitimas, setVitimas] = useState<Vitima[]>(...);
const [searchCargos, setSearchCargos] = useState<string[]>(...);
const [searchUnidades, setSearchUnidades] = useState<string[]>(...);
const [searchUnidadesBM, setSearchUnidadesBM] = useState<string[]>(...);
const [searchUnidadesPericia, setSearchUnidadesPericia] = useState<string[]>(...);
const [searchLotacoesCirc, setSearchLotacoesCirc] = useState<string[]>(...);

// ❌ PROBLEMA: Funções passadas para componentes filhos
const updateInvestigado = (id: number, field: keyof Investigado, value: any) => {...};
const setField: SetFieldFunction = (field, value) => {...};
```

##### **ProcessList.tsx** - Estado de UI Duplicado
```typescript
// ❌ PROBLEMA: Múltiplos estados de UI relacionados
const [editingProcess, setEditingProcess] = useState<Process | null>(null);
const [isEditing, setIsEditing] = useState(false);
const [editFormData, setEditFormData] = useState<Partial<Process>>({});
const [showProcessForm, setShowProcessForm] = useState(false);
const [processoParaEditar, setProcessoParaEditar] = useState<Process | null>(null);
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [processToDelete, setProcessToDelete] = useState<Process | null>(null);
const [isDeleting, setIsDeleting] = useState(false);
const [viewingProcess, setViewingProcess] = useState<Process | null>(null);
const [showViewDialog, setShowViewDialog] = useState(false);
```

### 2. **Estado que Deveria Estar em Nível Superior**

#### **Problemas Identificados:**

##### **Estado de Processo Global**
- **Processos em tramitação** - Deveria estar no nível da aplicação
- **Processo sendo editado** - Deveria estar em um contexto global
- **Filtros de busca** - Deveriam ser compartilhados entre componentes

##### **Estado de UI Global**
- **Modais abertos** - Deveriam ser gerenciados centralmente
- **Estado de loading** - Deveria ser compartilhado
- **Notificações** - Deveriam ser gerenciadas globalmente

### 3. **Estado Duplicado em Vários Componentes**

#### **Problemas Identificados:**

##### **Estados de Loading Duplicados**
```typescript
// ❌ PROBLEMA: Loading states duplicados em múltiplos hooks
// useProcessStats.tsx
const [loading, setLoading] = useState(true);

// useDetailedStats.tsx
const [loading, setLoading] = useState(true);

// useCrimeStats.tsx
const [loading, setLoading] = useState(true);

// useUnifiedStats.tsx
const [loading, setLoading] = useState(true);
```

##### **Estados de Error Duplicados**
```typescript
// ❌ PROBLEMA: Error states duplicados
// useProcessStats.tsx
const [error, setError] = useState<string | null>(null);

// useDetailedStats.tsx
const [error, setError] = useState<string | null>(null);

// useCrimeStats.tsx
const [error, setError] = useState<string | null>(null);
```

##### **Estados de Cache Duplicados**
```typescript
// ❌ PROBLEMA: Cache logic duplicada em múltiplos hooks
// useProcessStats.tsx
const dataHashRef = useRef<string>('');
const isUpdatingRef = useRef(false);
const lastFetchTimeRef = useRef<number>(0);
const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

// useDetailedStats.tsx
const dataHashRef = useRef<string>('');
const isUpdatingRef = useRef(false);
const lastFetchTimeRef = useRef<number>(0);
const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
```

### 4. **Uso Inadequado de Context API**

#### **Problemas Identificados:**

##### **AuthContext - Uso Adequado**
```typescript
// ✅ CORRETO: AuthContext usado adequadamente para dados globais
const AuthContext = createContext<AuthContextType | undefined>(undefined);
```

##### **Falta de Contextos Específicos**
```typescript
// ❌ PROBLEMA: Não há contextos para dados específicos
// - ProcessContext para gerenciar processos
// - UIContext para gerenciar modais e loading
// - FilterContext para gerenciar filtros
```

## 🛠️ Sugestões de Melhorias

### 1. **Criar Contextos Específicos**

#### **ProcessContext**
```typescript
// ✅ SOLUÇÃO: Contexto para gerenciar processos
interface ProcessContextType {
  // Estado dos processos
  processes: Process[];
  currentProcess: Process | null;
  editingProcess: Process | null;
  
  // Ações
  setCurrentProcess: (process: Process | null) => void;
  setEditingProcess: (process: Process | null) => void;
  updateProcess: (id: string, updates: Partial<Process>) => void;
  deleteProcess: (id: string) => void;
  
  // Loading e error
  loading: boolean;
  error: string | null;
  
  // Filtros
  filters: ProcessFilters;
  setFilters: (filters: ProcessFilters) => void;
}

const ProcessContext = createContext<ProcessContextType | undefined>(undefined);
```

#### **UIContext**
```typescript
// ✅ SOLUÇÃO: Contexto para gerenciar UI
interface UIContextType {
  // Modais
  modals: {
    processForm: boolean;
    deleteDialog: boolean;
    viewDialog: boolean;
    statistics: boolean;
  };
  
  // Loading states
  loadingStates: {
    processes: boolean;
    statistics: boolean;
    reports: boolean;
  };
  
  // Ações
  openModal: (modalName: keyof UIContextType['modals']) => void;
  closeModal: (modalName: keyof UIContextType['modals']) => void;
  setLoading: (key: keyof UIContextType['loadingStates'], loading: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);
```

#### **FormContext**
```typescript
// ✅ SOLUÇÃO: Contexto para gerenciar formulários
interface FormContextType {
  // Estado do formulário
  formData: ProcessFormData;
  investigados: Investigado[];
  vitimas: Vitima[];
  
  // Ações
  setFormData: (data: Partial<ProcessFormData>) => void;
  setField: <K extends keyof ProcessFormData>(field: K, value: ProcessFormData[K]) => void;
  addInvestigado: (investigado: Investigado) => void;
  updateInvestigado: (id: number, field: keyof Investigado, value: any) => void;
  removeInvestigado: (id: number) => void;
  addVitima: (vitima: Vitima) => void;
  removeVitima: (id: number) => void;
  
  // Validação
  errors: Record<string, string>;
  isValid: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);
```

### 2. **Implementar Composição de Componentes**

#### **ProcessProvider**
```typescript
// ✅ SOLUÇÃO: Provider para processos
export const ProcessProvider = ({ children }: { children: ReactNode }) => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [currentProcess, setCurrentProcess] = useState<Process | null>(null);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProcessFilters>({
    status: 'todos',
    priority: 'todas',
    search: ''
  });

  // Lógica de carregamento e sincronização
  useEffect(() => {
    loadProcesses();
    setupRealtimeSync();
  }, [filters]);

  const value = {
    processes,
    currentProcess,
    editingProcess,
    loading,
    error,
    filters,
    setCurrentProcess,
    setEditingProcess,
    updateProcess,
    deleteProcess,
    setFilters
  };

  return (
    <ProcessContext.Provider value={value}>
      {children}
    </ProcessContext.Provider>
  );
};
```

#### **UIProvider**
```typescript
// ✅ SOLUÇÃO: Provider para UI
export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [modals, setModals] = useState({
    processForm: false,
    deleteDialog: false,
    viewDialog: false,
    statistics: false
  });
  
  const [loadingStates, setLoadingStates] = useState({
    processes: false,
    statistics: false,
    reports: false
  });

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const setLoading = (key: keyof typeof loadingStates, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const value = {
    modals,
    loadingStates,
    openModal,
    closeModal,
    setLoading
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};
```

### 3. **Refatorar Hooks para Usar Contextos**

#### **useProcess Hook**
```typescript
// ✅ SOLUÇÃO: Hook unificado para processos
export const useProcess = () => {
  const context = useContext(ProcessContext);
  if (!context) {
    throw new Error('useProcess must be used within ProcessProvider');
  }
  return context;
};
```

#### **useUI Hook**
```typescript
// ✅ SOLUÇÃO: Hook unificado para UI
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};
```

### 4. **Simplificar Componentes**

#### **NovoProcessoForm Refatorado**
```typescript
// ✅ SOLUÇÃO: Componente simplificado usando contextos
export default function NovoProcessoForm({ onProcessCreated, processo }: NovoProcessoFormProps) {
  const { setCurrentProcess, updateProcess } = useProcess();
  const { openModal, closeModal } = useUI();
  const { formData, setFormData, investigados, addInvestigado } = useForm();

  // Componente muito mais simples, sem prop drilling
  return (
    <div>
      <ProcessBasicDataForm />
      <ProcessDetailsForm />
      <InvestigadosSection />
      <VitimasSection />
    </div>
  );
}
```

#### **ProcessList Refatorado**
```typescript
// ✅ SOLUÇÃO: Componente simplificado
const ProcessList = ({ type, onClose }: ProcessListProps) => {
  const { processes, loading, filters, setFilters } = useProcess();
  const { openModal, closeModal } = useUI();

  // Componente muito mais simples
  return (
    <div>
      <ProcessFilters />
      <ProcessGrid />
      <ProcessPagination />
    </div>
  );
};
```

### 5. **Implementar Custom Hooks Especializados**

#### **useProcessForm**
```typescript
// ✅ SOLUÇÃO: Hook especializado para formulário de processo
export const useProcessForm = (initialData?: ProcessFormData) => {
  const [formData, setFormData] = useState<ProcessFormData>(initialData || defaultFormData);
  const [investigados, setInvestigados] = useState<Investigado[]>([]);
  const [vitimas, setVitimas] = useState<Vitima[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setField = useCallback(<K extends keyof ProcessFormData>(
    field: K, 
    value: ProcessFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.numeroProcesso) {
      newErrors.numeroProcesso = 'Número do processo é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    setFormData,
    setField,
    investigados,
    setInvestigados,
    vitimas,
    setVitimas,
    errors,
    validate,
    isValid: Object.keys(errors).length === 0
  };
};
```

#### **useProcessFilters**
```typescript
// ✅ SOLUÇÃO: Hook especializado para filtros
export const useProcessFilters = () => {
  const [filters, setFilters] = useState<ProcessFilters>({
    status: 'todos',
    priority: 'todas',
    search: '',
    dateRange: null
  });

  const applyFilters = useCallback((processes: Process[]) => {
    return processes.filter(process => {
      if (filters.status !== 'todos' && process.status !== filters.status) {
        return false;
      }
      if (filters.priority !== 'todas' && process.prioridade !== filters.priority) {
        return false;
      }
      if (filters.search && !process.numero_processo.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [filters]);

  return {
    filters,
    setFilters,
    applyFilters
  };
};
```

## 📋 Plano de Implementação

### Fase 1: Criar Contextos Base
1. ✅ Criar `ProcessContext` e `ProcessProvider`
2. ✅ Criar `UIContext` e `UIProvider`
3. ✅ Criar `FormContext` e `FormProvider`
4. ✅ Implementar hooks `useProcess`, `useUI`, `useForm`

### Fase 2: Refatorar Componentes Principais
1. ✅ Refatorar `NovoProcessoForm` para usar contextos
2. ✅ Refatorar `ProcessList` para usar contextos
3. ✅ Refatorar `Dashboard` para usar contextos
4. ✅ Simplificar props e remover prop drilling

### Fase 3: Implementar Hooks Especializados
1. ✅ Criar `useProcessForm` hook
2. ✅ Criar `useProcessFilters` hook
3. ✅ Criar `useProcessActions` hook
4. ✅ Consolidar lógica duplicada

### Fase 4: Otimizar Performance
1. ✅ Implementar memoização adequada
2. ✅ Otimizar re-renders
3. ✅ Implementar lazy loading
4. ✅ Adicionar Suspense boundaries

## 🎯 Benefícios Esperados

### Redução de Complexidade
- **Eliminação** de prop drilling
- **Componentes mais simples** e focados
- **Lógica centralizada** e reutilizável
- **Menos bugs** relacionados a estado

### Melhor Performance
- **Menos re-renders** desnecessários
- **Memoização** adequada
- **Lazy loading** de componentes
- **Otimização** de contextos

### Manutenibilidade
- **Código mais limpo** e organizado
- **Separação de responsabilidades**
- **Testabilidade** melhorada
- **Reutilização** de lógica

### Developer Experience
- **Hooks especializados** e intuitivos
- **Type safety** melhorado
- **Debugging** mais fácil
- **Documentação** automática

## ⚠️ Considerações Importantes

### Compatibilidade
- ✅ Todas as funcionalidades mantidas
- ✅ Migração gradual possível
- ✅ Backward compatibility
- ✅ Sem breaking changes

### Performance
- ✅ Contextos otimizados
- ✅ Memoização adequada
- ✅ Lazy loading implementado
- ✅ Bundle size reduzido

### Manutenibilidade
- ✅ Código mais robusto
- ✅ Menos duplicação
- ✅ Facilidade de refactoring
- ✅ Melhor documentação

## 📝 Próximos Passos

### Implementação Imediata
1. **Criar contextos** base
2. **Refatorar componentes** principais
3. **Implementar hooks** especializados
4. **Testar funcionalidades**

### Ferramentas Recomendadas
```bash
# React DevTools para debugging de contextos
# React.memo para otimização
# useMemo e useCallback para memoização
# React.lazy para lazy loading
```

### Monitoramento
- **Performance metrics** em produção
- **Bundle size** monitoring
- **Re-render analysis** com React DevTools
- **Memory usage** tracking

## 🎉 Resultado Esperado

Após a implementação, a aplicação terá:

- **Gerenciamento de estado centralizado** e eficiente
- **Componentes mais simples** e focados
- **Zero prop drilling** desnecessário
- **Performance otimizada**
- **Código mais manutenível** e escalável
- **Developer experience** melhorada

A reestruturação seguirá as melhores práticas de React, garantindo que todas as funcionalidades sejam preservadas enquanto melhora significativamente a arquitetura e performance da aplicação. 