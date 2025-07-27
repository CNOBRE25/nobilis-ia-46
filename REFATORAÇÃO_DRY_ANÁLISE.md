# Análise de Código Duplicado - Refatoração DRY

## 📊 Resumo da Análise

Identificamos **padrões significativos de duplicação** no projeto que podem ser refatorados seguindo o princípio DRY (Don't Repeat Yourself). As refatorações sugeridas manterão todas as funcionalidades existentes intactas.

## 🔍 Padrões de Duplicação Identificados

### 1. **Hooks de Estatísticas - Padrão Repetitivo**

**Arquivos Afetados:**
- `src/hooks/useProcessStats.tsx`
- `src/hooks/useDetailedStats.tsx`
- `src/hooks/useCrimeStats.tsx`
- `src/hooks/useUnifiedStats.tsx`

**Padrão Duplicado:**
```typescript
// Padrão repetido em todos os hooks de estatísticas
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

// Refs para controle de cache e debounce
const dataHashRef = useRef<string>('');
const isUpdatingRef = useRef(false);
const lastFetchTimeRef = useRef<number>(0);
const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

// Função para gerar hash dos dados
const generateDataHash = (data: any): string => {
  return JSON.stringify(data);
};
```

### 2. **Constantes de Dados - Arrays Duplicados**

**Arquivos Afetados:**
- `src/components/NovoProcessoForm.tsx`
- `src/components/ProcessDetailsForm.tsx`
- `src/components/ProcessList.tsx`

**Padrão Duplicado:**
```typescript
// Arrays de cargos e unidades duplicados
const CARGOS_INVESTIGADO = [...];
const UNIDADES_PM = [...];
const UNIDADES_BM = [...];
const DILIGENCIAS = [...];
```

### 3. **Lógica de Loading/Error - Padrão Repetitivo**

**Arquivos Afetados:**
- Múltiplos componentes e hooks

**Padrão Duplicado:**
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### 4. **Cores para Gráficos - Array Duplicado**

**Arquivos Afetados:**
- `src/hooks/useDetailedStats.tsx`
- `src/hooks/useCrimeStats.tsx`

**Padrão Duplicado:**
```typescript
const colors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
  '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
];
```

## 🛠️ Sugestões de Refatoração

### 1. **Hook Base para Estatísticas**

**Criar:** `src/hooks/useBaseStats.ts`

```typescript
import { useState, useRef, useCallback } from 'react';

interface BaseStatsState {
  loading: boolean;
  error: string | null;
  lastUpdateTime: Date | null;
}

interface BaseStatsRefs {
  dataHashRef: React.MutableRefObject<string>;
  isUpdatingRef: React.MutableRefObject<boolean>;
  lastFetchTimeRef: React.MutableRefObject<number>;
  debounceTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export function useBaseStats() {
  const [state, setState] = useState<BaseStatsState>({
    loading: true,
    error: null,
    lastUpdateTime: null
  });

  const refs: BaseStatsRefs = {
    dataHashRef: useRef<string>(''),
    isUpdatingRef: useRef<boolean>(false),
    lastFetchTimeRef: useRef<number>(0),
    debounceTimerRef: useRef<NodeJS.Timeout | null>(null)
  };

  const generateDataHash = useCallback((data: any): string => {
    return JSON.stringify(data);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLastUpdateTime = useCallback((time: Date | null) => {
    setState(prev => ({ ...prev, lastUpdateTime: time }));
  }, []);

  const shouldSkipUpdate = useCallback((forceUpdate = false): boolean => {
    if (refs.isUpdatingRef.current && !forceUpdate) {
      console.log('Atualização já em andamento, ignorando...');
      return true;
    }

    const now = Date.now();
    if (now - refs.lastFetchTimeRef.current < 2000 && !forceUpdate) {
      console.log('Debounce: muito rápido, ignorando...');
      return true;
    }

    return false;
  }, [refs]);

  const startUpdate = useCallback(() => {
    refs.isUpdatingRef.current = true;
    refs.lastFetchTimeRef.current = Date.now();
  }, [refs]);

  const finishUpdate = useCallback(() => {
    refs.isUpdatingRef.current = false;
  }, [refs]);

  return {
    state,
    refs,
    generateDataHash,
    setLoading,
    setError,
    setLastUpdateTime,
    shouldSkipUpdate,
    startUpdate,
    finishUpdate
  };
}
```

### 2. **Arquivo de Constantes Centralizado**

**Criar:** `src/constants/processData.ts`

```typescript
// Cargos e unidades
export const CARGOS_INVESTIGADO = [
  "SD PM","SD BM","CB PM","CB BM","3º SGT PM","3º SGT BM","2º SGT PM","2º SGT BM",
  "1º SGT PM","1º SGT BM","ST PM","ST BM","2º TEN PM","2º TEN BM","1º TEN PM",
  "1º TEN BM","CAP PM","CAP BM","MAJOR PM","MAJOR BM","TC PM","TC BM",
  "CORONEL PM","CORONEL BM","DPC","APC","EPC","PERITO CRIMINAL","ASP",
  "Papiloscopista","Assistente de Gestão Publica","Identificador Civil e Criminal",
  "Perito","Medico Legista","Agente de Pericia Criminal","Agente de Medicina Legal",
  "Assistente de Gestão Publica"
];

export const UNIDADES_PM = [
  "1º BPM","2º BPM","3º BPM","4º BPM","5º BPM","6º BPM","7º BPM","8º BPM",
  "9º BPM","10º BPM","11º BPM","12º BPM","13º BPM","14º BPM","15º BPM",
  "16º BPM","17º BPM","18º BPM","19º BPM","20º BPM","21º BPM","22º BPM",
  "23º BPM","24º BPM","25º BPM","26º BPM","1ª CIPM","2ª CIPM","3ª CIPM",
  "4ª CIPM","5ª CIPM","6ª CIPM","7ª CIPM","8ª CIPM","9ª CIPM","10ª CIPM",
  "1º BIESP","1º BPTRAN","2ª EMG","2º BIESP","ACGPM","AECI","AG PM",
  "BEPI","BOPE","BPCHOQUE","BPGD","BPRP","BPRV","CAS-PM","CAMIL","CEC",
  "CEFD","CEMATA","CEMET","CFARM","CG-GI","CGPM","CIATUR","CIMUS",
  "CIOE","CIPCÃES","CIPMOTO","CIPOMA","CJD","CMH","CMT GERALCODONTO",
  "CORGER","CPA","CPM/DGP","CPO","CPP","CREED","CRESEP","CSM/NT",
  "CSM/MB","CTT","DAL/CSM/MOTO","DAL PM","DASDH","DASIS","DEAJA",
  "DEIP","DF","DGA","DGP-2","DGP-3","DGP-4","DGP-5","DGP-6","DGP-7",
  "DGP-8","DGP-8-CARTORIAL","DGP-8-CORREICIONAL","DGP-9","DGP-AJUDANCIA",
  "DIM","DIM-SC","DIM-SC2","DINTER I","DINTER II","DIP","DIRESP",
  "DPJM","DPO","DPO-SEFAZ","DS","DTEC","EMG","GP","GTA","OLS",
  "RESERVA PM","RPMON","SCG PM","SECOR-DINTER I"
];

export const UNIDADES_BM = [
  "1º GB","2º GB","3º GB","4º GB","5º GB","6º GB","7º GB","8º GB",
  "9º GB","10º GB","AJS","CAC","CAS-BM","CAT AGRESTE","CAT-AGRESTE II",
  "CAT-AGRESTE III","CAT RMR","CAT SERTÃO I","CAT SERTÃO II",
  "CAT SERTÃO III","CAT SERTÃO IV","CAT SERTÃO V","CAT SERTÃO VI",
  "CAT ZONA DA MATA","CAT ZONA DA MATA II","CCI","CCO","CCS","CEAO",
  "CEFD","CEMET II","CG-GI","CGBM","CGFIN","CINT","CJD","CMAN",
  "COESP","COINTER-1","COINTER-2","COM","CORGER","CPLAG","CTIC",
  "DAL BM","DDIR","DEIP","DGO","DGP-SCP","DGP-CBMPE","DGP-SCO",
  "DGP/CBMPE","DIESP","DINTER I","DINTER II","DIP","DJD"
];

export const LOTACOES_CIRC_DESEC = [
  // CIRC
  ...Array.from({length: 220}, (_, i) => `${String(i+1).padStart(3, '0')}ª CIRC`),
  // DESEC
  ...Array.from({length: 26}, (_, i) => `${String(i+1).padStart(2, '0')}ª DESEC`),
  // DP Mulher
  ...Array.from({length: 16}, (_, i) => `${i+1}ª DP Mulher`),
  // Extras
  "11ª SEC GOIANA","13ª DPLAN DPCRIA","16ª DPH-GOIANA","17ª DPH-VITÓRIA",
  "18ª DPH-PALMARES","19ª DPH-CARUARU","19ª DPPLAN-JABOATÃO","1ª SEC-BOA VISTA",
  "1ª DPRN","20ª DPH-CARUARU","21ª DPH-SANTA CRUZ","22ª DPH-GARANHUNS",
  "2ª DP CAIC","2ª DPRN","2ª DPH","3ª DPH-AGRESTE","3ª DPRN","3ª DPH",
  "4ª DPH","5ª DPH","7ª DPMUL-SURUBIM","7ª DPPLAN-GPCA","APOSENTADO-PC",
  "CEPLANC","COORDEPLAN","COORDPPOL","CORE","CORGER","CPCE-1","CPCE-2",
  "CPCE-3","CPCE-4","DDPP","DECASP","DECCOT","DENARC","DEPATRI","DEPRIM",
  "DHMN","DHPP","DIAG","DIM-PC","DIMAVE","DINTEL","DINTER-1 PC",
  "DINTER-2 PC","DIRESP-PC","DIRH","DIVASP","DP CONSUMIDOR","DP JABOATÃO",
  "DPAI","DPCA","DPCRIA","DPDT","DPH","DPID","DPMUL","DPPH","DPRE",
  "DPRFC","DPRFV","DPTUR","DRACCO","DTI","FTC DHPP","GCOE","GCOI2",
  "GDIM-PC","GDINTER-1 PC","GDINTER-2 PC","GEPCA","GOE","GRESP-PC",
  "IITB","NUPREV","P-ID AGUAS BELAS","P-ID PESQUEIRA","PAULISTA",
  "PETROLINA","PLANT","POLINTER","SDS","UNEATEM","UNIMOPE","UNIOPE",
  "UNIPA","UNIPRAI","UNIPRECA","UNISERG","UNISUT","UPREM","UTA-IITB"
];

export const CARGOS_CIRC_DESEC = [
  "DPC","APC","EPC","PAPILOSCOPISTA","ASSISTENTE DE GESTÃO PUBLICA",
  "IDENTIFICADOR CIVIL E CRIMINAL"
];

export const UNIDADES_EXTRAS = [
  "ALEPE","CAMIL-CAD","CAMIL-CHEFIA","CAMIL-CINT","CAMIL-CODECIPE",
  "CAMIL-CSI","CAMIL-CTEA","CAMIL-DAF","CAMIL-DSI","CAMIL-GAJ",
  "CONTROLADORIA-GESTÃO CONTROLADORIA","CORGER","MPPE-CGPC","SDS",
  "SDS-GTA","SEAP","TJPE-APMC"
];

export const UNIDADES_PERICIA = [
  "DIRH-PCIE","DIRH PCIE","GICPAS","IC","IML","IMLAPC",
  "URPOC-NAZARÉ DA MATA","URPOC-AFOGADOS DA INGAZERA","URPOC-ARCOVERDE",
  "URPOC-CARUARU","URPOC-OURICURI","URPOC-PALMARES","URPOC-PETROLINA"
];

export const CARGOS_PERICIA = [
  "PERITO CRIMINAL","MEDICO LEGISTA","AGENTE DE PERICIA CRIMINAL",
  "AGENTE DE MEDICINA LEGAL","AUXILIAR GESTAO PUBLICA",
  "ASSISTENTE GESTAO PUBLICA"
];

// Diligências
export const DILIGENCIAS = [
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

// Cores para gráficos
export const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000',
  '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'
];
```

### 3. **Hook para Loading/Error State**

**Criar:** `src/hooks/useLoadingState.ts`

```typescript
import { useState, useCallback } from 'react';

interface LoadingState {
  loading: boolean;
  error: string | null;
}

export function useLoadingState(initialLoading = true) {
  const [state, setState] = useState<LoadingState>({
    loading: initialLoading,
    error: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null });
  }, []);

  const startLoading = useCallback(() => {
    setState({ loading: true, error: null });
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    reset,
    startLoading
  };
}
```

### 4. **Componente Reutilizável para Diligências**

**Criar:** `src/components/DiligenciasList.tsx`

```typescript
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DILIGENCIAS } from '@/constants/processData';

interface DiligenciasListProps {
  formData: any;
  setField: (field: string, value: any) => void;
  className?: string;
}

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
```

### 5. **Hook para Filtros de Busca**

**Criar:** `src/hooks/useSearchFilters.ts`

```typescript
import { useState, useCallback, useMemo } from 'react';
import { 
  CARGOS_INVESTIGADO, 
  UNIDADES_PM, 
  UNIDADES_BM, 
  LOTACOES_CIRC_DESEC,
  CARGOS_CIRC_DESEC,
  UNIDADES_EXTRAS,
  UNIDADES_PERICIA,
  CARGOS_PERICIA
} from '@/constants/processData';

interface SearchFiltersState {
  searchCargos: string[];
  searchUnidades: string[];
  searchUnidadesBM: string[];
  searchUnidadesPericia: string[];
  searchLotacoesCirc: string[];
}

export function useSearchFilters() {
  const [filters, setFilters] = useState<SearchFiltersState>({
    searchCargos: [],
    searchUnidades: [],
    searchUnidadesBM: [],
    searchUnidadesPericia: [],
    searchLotacoesCirc: []
  });

  const updateFilter = useCallback((filterType: keyof SearchFiltersState, index: number, value: string) => {
    setFilters(prev => {
      const newFilters = [...prev[filterType]];
      newFilters[index] = value;
      return { ...prev, [filterType]: newFilters };
    });
  }, []);

  const getFilteredCargos = useCallback((index: number) => {
    const searchCargo = filters.searchCargos[index] || "";
    return CARGOS_INVESTIGADO.filter(c => 
      c.toLowerCase().includes(searchCargo.toLowerCase())
    );
  }, [filters.searchCargos]);

  const getFilteredUnidadesPM = useCallback((index: number) => {
    const searchUnidade = filters.searchUnidades[index] || "";
    return UNIDADES_PM.filter(u => 
      u.toLowerCase().includes(searchUnidade.toLowerCase())
    );
  }, [filters.searchUnidades]);

  const getFilteredUnidadesBM = useCallback((index: number) => {
    const searchUnidadeBM = filters.searchUnidadesBM[index] || "";
    return UNIDADES_BM.filter(u => 
      u.toLowerCase().includes(searchUnidadeBM.toLowerCase())
    );
  }, [filters.searchUnidadesBM]);

  const getFilteredUnidadesPericia = useCallback((index: number) => {
    const searchUnidadePericia = filters.searchUnidadesPericia[index] || "";
    return UNIDADES_PERICIA.filter(u => 
      u.toLowerCase().includes(searchUnidadePericia.toLowerCase())
    );
  }, [filters.searchUnidadesPericia]);

  const getFilteredLotacoesCirc = useCallback((index: number) => {
    const searchLotacaoCirc = filters.searchLotacoesCirc[index] || "";
    return LOTACOES_CIRC_DESEC.filter(l => 
      l.toLowerCase().includes(searchLotacaoCirc.toLowerCase())
    );
  }, [filters.searchLotacoesCirc]);

  return {
    filters,
    updateFilter,
    getFilteredCargos,
    getFilteredUnidadesPM,
    getFilteredUnidadesBM,
    getFilteredUnidadesPericia,
    getFilteredLotacoesCirc
  };
}
```

## 📋 Plano de Implementação

### Fase 1: Criar Arquivos Base
1. ✅ Criar `src/constants/processData.ts`
2. ✅ Criar `src/hooks/useBaseStats.ts`
3. ✅ Criar `src/hooks/useLoadingState.ts`
4. ✅ Criar `src/components/DiligenciasList.tsx`
5. ✅ Criar `src/hooks/useSearchFilters.ts`

### Fase 2: Refatorar Hooks de Estatísticas
1. Refatorar `useProcessStats.tsx` para usar `useBaseStats`
2. Refatorar `useDetailedStats.tsx` para usar `useBaseStats`
3. Refatorar `useCrimeStats.tsx` para usar `useBaseStats`
4. Refatorar `useUnifiedStats.tsx` para usar `useBaseStats`

### Fase 3: Refatorar Componentes
1. Refatorar `NovoProcessoForm.tsx` para usar constantes centralizadas
2. Refatorar `ProcessDetailsForm.tsx` para usar `DiligenciasList`
3. Refatorar `ProcessList.tsx` para usar constantes centralizadas
4. Refatorar outros componentes para usar `useLoadingState`

### Fase 4: Testes e Validação
1. Testar todas as funcionalidades refatoradas
2. Verificar se não há quebras de funcionalidade
3. Validar performance das refatorações

## 🎯 Benefícios Esperados

### Redução de Código
- **~40% menos linhas de código** nos hooks de estatísticas
- **~30% menos duplicação** de constantes
- **~50% menos repetição** de lógica de loading/error

### Manutenibilidade
- **Centralização** de dados e lógica
- **Facilidade** para atualizar constantes
- **Consistência** entre componentes

### Performance
- **Reutilização** de lógica otimizada
- **Menos re-renders** desnecessários
- **Cache compartilhado** entre hooks

### Legibilidade
- **Código mais limpo** e organizado
- **Separação clara** de responsabilidades
- **Documentação** implícita através da estrutura

## ⚠️ Considerações Importantes

1. **Compatibilidade**: Todas as funcionalidades existentes serão mantidas
2. **Gradual**: Refatoração pode ser feita gradualmente, arquivo por arquivo
3. **Testes**: Cada refatoração deve ser testada individualmente
4. **Rollback**: Manter commits separados para facilitar rollback se necessário

## 📝 Próximos Passos

1. **Aprovação** da análise e plano de refatoração
2. **Implementação** da Fase 1 (arquivos base)
3. **Refatoração** gradual dos hooks e componentes
4. **Testes** e validação de cada etapa
5. **Documentação** final das mudanças 