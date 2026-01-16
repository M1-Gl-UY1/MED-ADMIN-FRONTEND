import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import type { ApiError } from '../services/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T, P extends unknown[]> extends UseApiState<T> {
  execute: (...params: P) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
}

/**
 * Hook générique pour les appels API avec gestion d'état
 */
export function useApi<T, P extends unknown[] = []>(
  apiFunction: (...params: P) => Promise<T>
): UseApiReturn<T, P> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...params);
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const error = err as AxiosError<ApiError>;
        const message = error.response?.data?.message || error.message || 'Une erreur est survenue';
        setState(prev => ({ ...prev, loading: false, error: message }));
        return null;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
  };
}

export default useApi;
