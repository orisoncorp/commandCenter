import styles from './KpiSimple.module.css';
import Label from '../../atoms/Label/Label';
import Delta from '../../atoms/Delta/Delta';
import { useCountUp } from '../../../motion/useCountUp';

export default function KpiSimple({ label, value, delta, format = 'number', formatFn }) {
  const { value: animated, animKey } = useCountUp(typeof value === 'number' ? value : 0);

  const display = formatFn
    ? formatFn(animated)
    : format === 'currency'
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(animated)
    : format === 'percent'
    ? `${animated.toFixed(1)}%`
    : animated >= 1000
    ? `${(animated / 1000).toFixed(1)}k`
    : animated.toFixed(animated % 1 !== 0 ? 1 : 0);

  return (
    <div className={styles.card}>
      <Label color="muted">{label}</Label>
      <span
        key={animKey}
        className={`${styles.value} ${animKey > 0 ? 'kpi-live-update' : ''}`}
      >
        {display}
      </span>
      {delta != null && <Delta value={delta} />}
    </div>
  );
}
