import { useState, useEffect, useRef } from 'react';
import { DURATION } from './constants';

// Mount: animates 0 → target (counter, DURATION.dramatic).
// Live updates: fade-out (80ms) → swap value → fade-in (150ms).
export function useCountUp(target, duration = DURATION.dramatic) {
  const [display, setDisplay] = useState(0);
  const [visible, setVisible] = useState(true);
  const isMountRef = useRef(true);
  const rafRef = useRef(null);
  const swapTimerRef = useRef(null);
  const prevTargetRef = useRef(null);

  useEffect(() => {
    if (target == null || isNaN(target)) return;

    if (isMountRef.current) {
      isMountRef.current = false;
      prevTargetRef.current = target;
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
      // Skip if value didn't actually change (prevents stale-closure re-runs)
      if (target === prevTargetRef.current) return;
      prevTargetRef.current = target;

      // Live update: subtle fade-out → swap → fade-in
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      if (swapTimerRef.current) { clearTimeout(swapTimerRef.current); }
      setVisible(false);
      swapTimerRef.current = setTimeout(() => {
        setDisplay(target);
        setVisible(true);
        swapTimerRef.current = null;
      }, 100);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return { value: display, visible };
}
