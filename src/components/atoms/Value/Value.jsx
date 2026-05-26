import styles from './Value.module.css';

export default function Value({ children, size = 'md', color = 'primary' }) {
  return <span className={`${styles.value} ${styles[size]} ${styles[color]}`}>{children}</span>;
}
