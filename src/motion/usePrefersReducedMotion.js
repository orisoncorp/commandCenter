import { useSyncExternalStore } from 'react';

/**
 * Lê `prefers-reduced-motion` de forma reativa.
 *
 * O bloco CSS em global.css só alcança animação declarativa. Motion em JS —
 * o contador de KPI, os loops dos heroes 3D — precisa ler a preferência
 * explicitamente. Antes, os quatro heroes tinham `reducedMotion = false`
 * hardcoded, com toda a instrumentação já construída e ligada em 40+ pontos.
 */
const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(callback) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
