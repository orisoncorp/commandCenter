import styles from './KpiRing.module.css';
import Label from '../../atoms/Label/Label';
import { useCountUp } from '../../../motion/useCountUp';

function Ring({ value, target = 100, size = 40, stroke = 4 }) {
  const pct = Math.min(value / target, 1);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const cx = size / 2, cy = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.ring}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--color-crimson)"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="butt"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 600ms cubic-bezier(0.4, 0.0, 0.2, 1)' }}
      />
    </svg>
  );
}

export default function KpiRing({ label, value, target = 100 }) {
  const { value: animated, visible } = useCountUp(typeof value === 'number' ? value : 0);
  const pct = Math.round(animated);

  return (
    <div className={styles.card}>
      <Label color="muted">{label}</Label>
      <div className={styles.row}>
        <div className={styles.ringWrap}>
          <Ring value={animated} target={target} />
          <span className={styles.pct}>{pct}<span className={styles.sym}>%</span></span>
        </div>
        <div className={styles.meta}>
          <span
            className={styles.value}
            style={{ transition: 'opacity 180ms cubic-bezier(0.4,0,0.2,1)', opacity: visible ? 1 : 0.65 }}
          >
            {pct}%
          </span>
          <span className={styles.sub}>de {target}</span>
        </div>
      </div>
    </div>
  );
}
