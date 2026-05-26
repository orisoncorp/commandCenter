import styles from './Label.module.css';

export default function Label({ children, color = 'muted' }) {
  return <span className={`${styles.label} ${styles[color]}`}>{children}</span>;
}
