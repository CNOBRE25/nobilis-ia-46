import { useRef, useCallback } from 'react';

/**
 * Hook para debouncing de funções assíncronas.
 * @param fn Função assíncrona a ser debounced
 * @param delay Tempo de debounce em ms (default: 500)
 * @returns Função debounced
 */
export function useDebouncedAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay = 500
) {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback((...args: Parameters<T>) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay]);

  // Cleanup no unmount
  // (deve ser chamado manualmente se necessário)
  const cancel = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  return [debouncedFn, cancel] as const;
} 