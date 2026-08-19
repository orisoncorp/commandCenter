import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { resolveAdapter } from './adapters';
import { MetricsContext, StreamContext, ControlContext } from './contexts';

export function DataProvider({ config, children }) {
  const adapterName = config?.data?.adapter || 'mock';
  const refreshInterval = config?.data?.refreshInterval || 3000;

  // Resolve o adapter a partir do config, em vez de importar mock direto.
  const [adapter, adapterError] = useMemo(() => {
    try {
      return [resolveAdapter(adapterName), null];
    } catch (err) {
      return [null, err];
    }
  }, [adapterName]);

  const [data, setData] = useState(null);
  const [table, setTable] = useState([]);
  const [insights, setInsights] = useState([]);
  const [events, setEvents] = useState([]);
  // Otimista: o stream começa ligado. Assim o efeito de auto-start só
  // gerencia o interval (sistema externo) e não dispara setState em cascata.
  const [streaming, setStreaming] = useState(true);
  const [error, setError] = useState(adapterError);
  const [reloadToken, setReloadToken] = useState(0);

  const intervalRef = useRef(null);

  // Carga inicial. Assíncrona por desenho: um adapter REST vai suspender aqui,
  // e a UI precisa de um estado de carregamento real em vez de painéis vazios.
  useEffect(() => {
    if (!adapter) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const [snapshot, rows, ins] = await Promise.all([
          adapter.snapshot(),
          adapter.table(),
          adapter.insights(),
        ]);
        if (cancelled) return;
        setData(snapshot);
        setTable(rows);
        setInsights(ins);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adapter, reloadToken]);

  const stopStream = useCallback(() => setStreaming(false), []);

  const startStream = useCallback(() => setStreaming(true), []);

  const retry = useCallback(() => {
    setError(null);
    setReloadToken(n => n + 1);
  }, []);

  // Auto-start: cria o interval assim que houver dado. Não chama setState —
  // `streaming` já nasce true e só muda por ação do usuário.
  const hasData = data != null;
  useEffect(() => {
    if (!hasData || error || !adapter || !streaming) return undefined;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const id = setInterval(() => {
      try {
        setData(prev => (prev ? adapter.update(prev) : prev));
        setEvents(prev => [adapter.event(), ...prev].slice(0, 10));
      } catch (err) {
        setError(err);
      }
    }, refreshInterval);
    intervalRef.current = id;
    return () => {
      clearInterval(id);
      if (intervalRef.current === id) intervalRef.current = null;
    };
  }, [hasData, error, adapter, streaming, refreshInterval]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const controlValue = useMemo(
    () => ({ streaming, startStream, stopStream, insights, error, retry, loading: data == null && !error }),
    [streaming, startStream, stopStream, insights, error, retry, data]
  );

  const streamValue = useMemo(() => ({ table, events }), [table, events]);

  return (
    <ControlContext.Provider value={controlValue}>
      <MetricsContext.Provider value={data}>
        <StreamContext.Provider value={streamValue}>{children}</StreamContext.Provider>
      </MetricsContext.Provider>
    </ControlContext.Provider>
  );
}

export default DataProvider;
