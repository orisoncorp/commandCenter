import { useState, useEffect, useRef } from 'react';
import { DURATION } from './constants';

// Mount: animates 0 → target (counter, DURATION.dramatic).
// Live updates: returns target immediately + increments animKey to trigger CSS fade-swap.
export function useCountUp(target, duration = DURATION.dramatic) {
  const [display, setDisplay] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const isMountRef = useRef(true);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target == null || isNaN(target)) return;

    if (isMountRef.current) {
      // First render: count up from 0
      isMountRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const startTime = performance.now();
      const animate = (now) => {
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
      // Live update: snap to value, trigger fade-swap via animKey
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      setDisplay(target);
      setAnimKey(k => k + 1);
    }

    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return { value: display, animKey };
}
