import { createContext, useContext } from 'react';

// Contextos e hooks vivem fora do DataProvider.jsx para que aquele arquivo
// exporte apenas componentes — requisito do fast refresh.
//
// A divisão em três contextos é deliberada e boa: consumidores só re-renderizam
// quando a fatia que os interessa muda.
export const MetricsContext = createContext(null);
export const StreamContext = createContext(null);
export const ControlContext = createContext(null);

export function useMetrics() {
  return useContext(MetricsContext);
}

export function useStream() {
  return useContext(StreamContext) ?? { table: [], events: [] };
}

export function useControl() {
  const ctx = useContext(ControlContext);
  if (!ctx) throw new Error('useControl precisa estar dentro de DataProvider');
  return ctx;
}

export function useData() {
  const data = useContext(MetricsContext);
  const stream = useContext(StreamContext);
  const control = useContext(ControlContext);
  if (!control) throw new Error('useData precisa estar dentro de DataProvider');
  return { data, ...stream, ...control };
}
