import { useEffect, useRef } from 'react';

/**
 * Hook de polling : appelle fetchFn toutes les intervalMs millisecondes.
 * Se nettoie automatiquement au démontage du composant.
 */
export default function usePolling(fetchFn, intervalMs = 15000, deps = []) {
  const savedFn = useRef(fetchFn);

  useEffect(() => {
    savedFn.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    const id = setInterval(() => savedFn.current(), intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);
}
