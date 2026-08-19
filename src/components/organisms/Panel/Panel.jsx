import styles from './Panel.module.css';

export default function Panel({ position = 'left', label, children }) {
  return (
    /* Sem aria-label eram dois landmarks complementares idênticos e sem nome. */
    <aside className={`${styles.panel} ${styles[position]}`} aria-label={label}>
      <div className={styles.scroll}>{children}</div>
    </aside>
  );
}
