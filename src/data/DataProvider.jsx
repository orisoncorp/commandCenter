import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getMockData, getMockTable, getMockEvent, getMockInsights, getUpdatedData } from './adapters/mock';

const DataContext = createContext(null);

export function DataProvider({ config, children }) {
  const [data, setData] = useState(null);
  const [table, setTable] = useState([]);
  const [events, setEvents] = useState([]);
  const [insights] = useState(() => getMockInsights());
  const [streaming, setStreaming] = useState(false);
  const intervalRef = useRef(null);
  const refreshInterval = config?.data?.refreshInterval || 3000;

  // Initial load
  useEffect(() => {
    setData(getMockData());
    setTable(getMockTable());
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

  // Auto-start stream once data is loaded
  useEffect(() => {
    if (data && !intervalRef.current) {
      startStream();
    }
  }, [data]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <DataContext.Provider value={{ data, table, events, insights, streaming, startStream, stopStream }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
