import styles from './KpiMetric.module.css';
import Label from '../../atoms/Label/Label';
import Delta from '../../atoms/Delta/Delta';
import { useCountUp } from '../../../motion/useCountUp';
import { formatValue } from '../../../data/format';

export default function KpiMetric({ label, value, compare, delta, format = 'currency' }) {
  const { value: animated, visible } = useCountUp(typeof value === 'number' ? value : 0);
  const fmt = (v) => formatValue(v, format);

  return (
    <div className={styles.card}>
      <Label color="muted">{label}</Label>
      <span
        className={styles.value}
        style={{ transition: 'opacity 200ms cubic-bezier(0.4,0,0.2,1)', opacity: visible ? 1 : 0.4 }}
      >
        {fmt(animated)}
      </span>
      {compare != null && (
        <div className={styles.compare}>
          <span className={styles.vs}>vs</span>
          <span className={styles.compareVal}>{fmt(compare)}</span>
        </div>
      )}
      {delta != null && <Delta value={delta} />}
    </div>
  );
}
