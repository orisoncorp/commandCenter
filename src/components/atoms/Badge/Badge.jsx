import styles from './Badge.module.css';

const VARIANTS = {
  crimson: styles.crimson,
  alert: styles.alert,
  positive: styles.positive,
  neutral: styles.neutral,
};

export default function Badge({ children, variant = 'neutral' }) {
  return (
    <span className={`${styles.badge} ${VARIANTS[variant] || VARIANTS.neutral}`}>
      {children}
    </span>
  );
}
