import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosError } from 'axios';
import type { ApiError } from '../services/api';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions<T> {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseFetchReturn<T> extends UseFetchState<T> {
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
}

/**
 * Hook pour le fetching automatique de données au montage du composant
 */
export function useFetch<T>(
  fetchFunction: () => Promise<T>,
  dependencies: unknown[] = [],
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const { enabled = true, refetchInterval, onSuccess, onError } = options;

  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: enabled,
    error: null,
  });

  const mountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchFunction();

      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err as AxiosError<ApiError>;
        const message = error.response?.data?.message || error.message || 'Une erreur est survenue';
        setState(prev => ({ ...prev, loading: false, error: message }));
        onError?.(message);
      }
    }
  }, [fetchFunction, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, enabled]);

  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(fetchData, refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  return {
    ...state,
    refetch: fetchData,
    setData,
  };
}

export default useFetch;
