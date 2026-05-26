import styles from './KpiSimple.module.css';
import Label from '../../atoms/Label/Label';
import Delta from '../../atoms/Delta/Delta';
import { useCountUp } from '../../../motion/useCountUp';

export default function KpiSimple({ label, value, delta, format = 'number', formatFn }) {
  const { value: animated, visible } = useCountUp(typeof value === 'number' ? value : 0);

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
        className={styles.value}
        style={{ transition: 'opacity 200ms cubic-bezier(0.4,0,0.2,1)', opacity: visible ? 1 : 0.4 }}
      >
        {display}
      </span>
      {delta != null && <Delta value={delta} />}
    </div>
  );
}
