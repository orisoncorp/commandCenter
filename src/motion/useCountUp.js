import { useState, useEffect, useRef } from 'react';
import { DURATION } from './constants';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Mount: anima 0 → alvo. Live update: fade-out → swap → fade-in.
//
// Com reduced motion, o valor salta direto para o alvo. O CSS não alcança
// este loop — é requestAnimationFrame puro, então a preferência precisa ser
// lida aqui explicitamente.
export function useCountUp(target, duration = DURATION.dramatic) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(() => (Number.isFinite(target) ? target : 0));
  const [visible, setVisible] = useState(true);
  const isMountRef = useRef(true);
  const rafRef = useRef(null);
  const swapTimerRef = useRef(null);
  const prevTargetRef = useRef(null);

  // Com reduced motion o valor acompanha o alvo diretamente. Sincronizar
  // durante o render (em vez de num efeito) evita um render em cascata e é o
  // padrão recomendado para estado derivado de props.
  const [syncedTarget, setSyncedTarget] = useState(target);
  if (reduced && syncedTarget !== target && Number.isFinite(target)) {
    setSyncedTarget(target);
    setDisplay(target);
    setVisible(true);
  }

  useEffect(() => {
    if (!Number.isFinite(target) || reduced) return undefined;

    if (isMountRef.current) {
      isMountRef.current = false;
      prevTargetRef.current = target;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const startTime = performance.now();
      const animate = now => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(target * eased);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setDisplay(target);
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(animate);
    } else {
      if (target === prevTargetRef.current) return undefined;
      prevTargetRef.current = target;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
      setVisible(false);
      swapTimerRef.current = setTimeout(() => {
        setDisplay(target);
        setVisible(true);
        swapTimerRef.current = null;
      }, DURATION.instant);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, [target, duration, reduced]);

  return { value: display, visible };
}
