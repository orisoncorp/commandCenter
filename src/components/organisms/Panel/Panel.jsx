import styles from './Panel.module.css';

export default function Panel({ position = 'left', children }) {
  return (
    <aside className={`${styles.panel} ${styles[position]}`}>
      {children}
    </aside>
  );
}
