import styles from './KpiSimple.module.css';
import Label from '../../atoms/Label/Label';
import Delta from '../../atoms/Delta/Delta';
import { useCountUp } from '../../../motion/useCountUp';
import { formatValue } from '../../../data/format';

export default function KpiSimple({ label, value, delta, format = 'number', formatFn }) {
  const { value: animated, visible } = useCountUp(typeof value === 'number' ? value : 0);
  const display = formatFn ? formatFn(animated) : formatValue(animated, format);

  return (
    <div className={styles.card}>
      <Label>{label}</Label>
      <span className={`${styles.value} ${visible ? '' : styles.updating}`}>{display}</span>
      {delta != null && <Delta value={delta} />}
    </div>
  );
}
