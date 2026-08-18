import styles from './Delta.module.css';
import { formatDelta } from '../../../data/format';

export default function Delta({ value, format = 'percent' }) {
  if (!Number.isFinite(value)) return null;

  const isPositive = value >= 0;
  const display =
    format === 'percent' ? formatDelta(value) : `${isPositive ? '+' : ''}${value}`;

  return (
    <span className={`${styles.delta} ${isPositive ? styles.positive : styles.negative}`}>
      {/* aria-hidden: a direção já está no sinal e na cor. Sem isso o leitor
          de tela anuncia "black up-pointing triangle" antes de cada delta. */}
      <span className={styles.arrow} aria-hidden="true">
        {isPositive ? '▲' : '▼'}
      </span>
      {display}
    </span>
  );
}
