import styles from './ChartBar.module.css';
import Label from '../../atoms/Label/Label';
import { calcStaggerDelay, DURATION } from '../../../motion/constants';

const W = 220, H = 90, PAD_L = 8, PAD_B = 20, PAD_T = 8;
const CHART_W = W - PAD_L;
const CHART_H = H - PAD_B - PAD_T;

export default function ChartBar({ label, data = [] }) {
  if (!data.length) return null;

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = Math.floor((CHART_W / data.length) * 0.6);
  const gap = CHART_W / data.length;

  return (
    <div className={styles.wrap}>
      {label && <Label color="muted">{label}</Label>}
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chart}>
        {[0.25, 0.5, 0.75, 1].map(frac => {
          const y = PAD_T + CHART_H * (1 - frac);
          return (
            <line key={frac} x1={PAD_L} y1={y} x2={W} y2={y}
              stroke="var(--color-border)" strokeWidth="0.5" />
          );
        })}

        {data.map((d, i) => {
          const barH = (d.value / maxVal) * CHART_H;
          const x = PAD_L + gap * i + (gap - barW) / 2;
          const baseY = PAD_T + CHART_H;
          return (
            <rect
              key={i}
              x={x}
              y={baseY - barH}
              width={barW}
              height={barH}
              fill="var(--color-crimson)"
              className={styles.bar}
              style={{
                transformOrigin: `${x + barW / 2}px ${baseY}px`,
                animationDelay: `${calcStaggerDelay(i, 60)}ms`,
                animationDuration: `${DURATION.moderate}ms`,
              }}
            />
          );
        })}

        {data.map((d, i) => {
          const x = PAD_L + gap * i + gap / 2;
          return (
            <text key={i} x={x} y={H - 4}
              textAnchor="middle"
              fill="var(--color-text-muted)"
              fontSize="6"
              fontFamily="var(--font-body)"
              letterSpacing="1"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
