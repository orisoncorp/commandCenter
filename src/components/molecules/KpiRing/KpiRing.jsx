import styles from './KpiRing.module.css';
import Label from '../../atoms/Label/Label';
import { useCountUp } from '../../../motion/useCountUp';
import { formatCompact } from '../../../data/format';

// Attainment as a 0..1 fraction. Clamped on BOTH ends: an unclamped negative
// produces a negative strokeDasharray, which browsers discard entirely — so a
// negative KPI would render as a complete ring, i.e. full attainment.
function attainment(value, target) {
  if (!Number.isFinite(value) || !Number.isFinite(target) || target === 0) return 0;
  return Math.max(0, Math.min(value / target, 1));
}

function Ring({ fraction, size = 40, stroke = 4 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * fraction;
  const cx = size / 2, cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={styles.ring}
      aria-hidden="true"
    >
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--color-ring-track)"
        strokeWidth={stroke}
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--color-ring-fill)"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
        className={styles.ringFill}
      />
    </svg>
  );
}

export default function KpiRing({ label, value, target = 100 }) {
  const { value: animated, visible } = useCountUp(typeof value === 'number' ? value : 0);
  const fraction = attainment(animated, target);
  const pct = Math.round(fraction * 100);

  return (
    <div className={styles.card}>
      <Label color="muted">{label}</Label>
      <div className={styles.row}>
        <div className={styles.ringWrap}>
          <Ring fraction={fraction} />
        </div>
        <div className={styles.meta}>
          <span
            className={styles.value}
            style={{ opacity: visible ? 1 : 0.65 }}
          >
            {pct}%
          </span>
          <span className={styles.sub}>de {formatCompact(target)}</span>
        </div>
      </div>
    </div>
  );
}
