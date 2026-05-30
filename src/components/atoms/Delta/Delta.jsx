import styles from './Delta.module.css';

export default function Delta({ value, format = 'percent' }) {
  const isPositive = value >= 0;
  const display = format === 'percent'
    ? `${isPositive ? '+' : ''}${value.toFixed(1)}%`
    : `${isPositive ? '+' : ''}${value}`;

  return (
    <span className={`${styles.delta} ${isPositive ? styles.positive : styles.negative}`}>
      <span style={{ fontSize: '6px', lineHeight: 1 }}>{isPositive ? '▲' : '▼'}</span>
      {display}
    </span>
  );
}
