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