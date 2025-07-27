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