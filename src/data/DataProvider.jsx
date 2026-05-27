import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getMockData, getMockTable, getMockEvent, getMockInsights, getUpdatedData } from './adapters/mock';

// Split into 3 contexts so consumers only re-render when their slice changes:
// - MetricsContext: data (KPI values) — updates every 3s
// - StreamContext: events + table — updates every 3s, consumed by Globe + EventFeed
// - ControlContext: streaming flag + start/stop + insights — stable, rarely changes
const MetricsContext = createContext(null);
const StreamContext = createContext(null);
const ControlContext = createContext(null);

export function DataProvider({ config, children }) {
  const [data, setData] = useState(null);
  const [table] = useState(() => getMockTable());
  const [events, setEvents] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [insights] = useState(() => getMockInsights());
  const intervalRef = useRef(null);
  const refreshInterval = config?.data?.refreshInterval || 3000;

  useEffect(() => {
    setData(getMockData());
  }, []);

  const startStream = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStreaming(true);
    intervalRef.current = setInterval(() => {
      setData(prev => prev ? getUpdatedData(prev) : prev);
      setEvents(prev => {
        const newEvent = getMockEvent();
        return [newEvent, ...prev].slice(0, 10);
      });
    }, refreshInterval);
  }, [refreshInterval]);

  const stopStream = useCallback(() => {
    setStreaming(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (data && !intervalRef.current) startStream();
  }, [data]);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <ControlContext.Provider value={{ streaming, startStream, stopStream, insights }}>
      <MetricsContext.Provider value={data}>
        <StreamContext.Provider value={{ table, events }}>
          {children}
        </StreamContext.Provider>
      </MetricsContext.Provider>
    </ControlContext.Provider>
  );
}

// Granular hooks — components subscribe only to what they need
export function useMetrics() {
  return useContext(MetricsContext);
}

export function useStream() {
  return useContext(StreamContext);
}

export function useControl() {
  const ctx = useContext(ControlContext);
  if (!ctx) throw new Error('useControl must be used within DataProvider');
  return ctx;
}

// Backward-compat hook — still works, composes the three contexts
export function useData() {
  const data = useContext(MetricsContext);
  const stream = useContext(StreamContext);
  const control = useContext(ControlContext);
  if (!control) throw new Error('useData must be used within DataProvider');
  return { data, ...stream, ...control };
}
