import { useMemo } from 'react';
import styles from './KpiSpark.module.css';
import Label from '../../atoms/Label/Label';
import Delta from '../../atoms/Delta/Delta';
import { useCountUp } from '../../../motion/useCountUp';
import { usePrefersReducedMotion } from '../../../motion/usePrefersReducedMotion';

const W = 200;
const H = 48;
const PAD = 5;

function Sparkline({ data }) {
  const reduced = usePrefersReducedMotion();

  const { points, endPct } = useMemo(() => {
    const clean = data.filter(Number.isFinite);
    if (clean.length < 2) return { points: '', endPct: null };

    const min = Math.min(...clean);
    const max = Math.max(...clean);
    const range = max - min;
    const plotH = H - PAD * 2;

    const y = v => {
      // Série constante fica no MEIO, não colada na base. Antes, "sem
      // variação" era renderizado exatamente como "zero".
      if (range === 0) return H / 2;
      return H - PAD - ((v - min) / range) * plotH;
    };

    const coords = clean.map((v, i) => [(i / (clean.length - 1)) * W, y(v)]);
    const last = coords[coords.length - 1];
    return {
      points: coords.map(([x, yy]) => `${x},${yy}`).join(' '),
      // Percentuais, não unidades de viewBox: o marcador é um elemento HTML,
      // então mantém tamanho constante mesmo quando o SVG é esticado.
      endPct: { left: (last[0] / W) * 100, top: (last[1] / H) * 100 },
    };
  }, [data]);

  if (!points) return null;

  return (
    <div className={styles.sparkWrap}>
      <svg
        className={styles.spark}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Reveal por clip-path, não stroke-dashoffset: com
            vector-effect="non-scaling-stroke" o dasharray passa a ser
            interpretado em unidades de tela, então getTotalLength() (em
            unidades de viewBox) deixava o traço parcialmente desenhado. */}
        <g className={reduced ? undefined : styles.reveal}>
          <polyline
            points={points}
            fill="none"
            stroke="var(--color-data-primary)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            /* O SVG é esticado anisotropicamente para preencher a largura.
               Sem isto o traço renderiza mais grosso nos trechos verticais. */
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
      {endPct && (
        <span
          className={styles.endDot}
          style={{ left: `${endPct.left}%`, top: `${endPct.top}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default function KpiSpark({ label, value, delta, sparkline = [], format = 'percent' }) {
  const { value: animated, visible } = useCountUp(typeof value === 'number' ? value : 0);
  const display = format === 'percent' ? `${animated.toFixed(1)}%` : animated.toFixed(1);

  return (
    <div className={styles.card}>
      <Label>{label}</Label>
      <span className={`${styles.value} ${visible ? '' : styles.updating}`}>{display}</span>
      <Sparkline data={sparkline} />
      {delta != null && <Delta value={delta} />}
    </div>
  );
}
