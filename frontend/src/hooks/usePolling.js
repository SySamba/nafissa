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
    const tick = () => savedFn.current();
    const id = setInterval(tick, intervalMs);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps]);
}
