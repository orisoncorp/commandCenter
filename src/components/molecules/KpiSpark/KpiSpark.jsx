import { useRef, useEffect } from 'react';
import styles from './KpiSpark.module.css';
import Label from '../../atoms/Label/Label';
import Delta from '../../atoms/Delta/Delta';
import { useCountUp } from '../../../motion/useCountUp';

function Sparkline({ data }) {
  const pathRef = useRef(null);

  const W = 200, H = 48;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
    el.style.transition = 'none';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `stroke-dashoffset 400ms cubic-bezier(0.25, 0.1, 0.25, 1.0)`;
        el.style.strokeDashoffset = '0';
      });
    });
  }, [data]);

  return (
    <svg className={styles.spark} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <polyline ref={pathRef} points={pts} fill="none" stroke="var(--color-crimson)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function KpiSpark({ label, value, delta, sparkline = [], format = 'percent' }) {
  const { value: animated, animKey } = useCountUp(typeof value === 'number' ? value : 0);
  const display = format === 'percent' ? `${animated.toFixed(1)}%` : animated.toFixed(1);

  return (
    <div className={styles.card}>
      <Label color="muted">{label}</Label>
      <span
        key={animKey}
        className={`${styles.value} ${animKey > 0 ? 'kpi-live-update' : ''}`}
      >
        {display}
      </span>
      {sparkline.length > 1 && <Sparkline data={sparkline} />}
      {delta != null && <Delta value={delta} />}
    </div>
  );
}
