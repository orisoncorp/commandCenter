import styles from './BottomBar.module.css';

export default function BottomBar({ children }) {
  return (
    <footer className={styles.bottom} aria-label="Contratos e eventos">
      {children}
    </footer>
  );
}
