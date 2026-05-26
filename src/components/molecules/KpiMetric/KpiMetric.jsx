import styles from './KpiMetric.module.css';
import Label from '../../atoms/Label/Label';
import Delta from '../../atoms/Delta/Delta';
import { useCountUp } from '../../../motion/useCountUp';

export default function KpiMetric({ label, value, compare, delta, format = 'currency' }) {
  const { value: animated, animKey } = useCountUp(typeof value === 'number' ? value : 0);

  const fmt = (v) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
    }
    return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0);
  };

  return (
    <div className={styles.card}>
      <Label color="muted">{label}</Label>
      <span
        key={animKey}
        className={`${styles.value} ${animKey > 0 ? 'kpi-live-update' : ''}`}
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
