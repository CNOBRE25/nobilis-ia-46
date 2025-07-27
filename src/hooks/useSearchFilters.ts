import { useState, useCallback } from 'react';
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