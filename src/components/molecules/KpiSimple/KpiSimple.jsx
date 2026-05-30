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
      <Label color="muted">{label}</Label>
      <span
        className={styles.value}
        style={{ transition: 'opacity 180ms cubic-bezier(0.4,0,0.2,1)', opacity: visible ? 1 : 0.65 }}
      >
        {display}
      </span>
      {delta != null && <Delta value={delta} />}
    </div>
  );
}
