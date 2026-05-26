import styles from './BottomBar.module.css';

export default function BottomBar({ children }) {
  return (
    <div className={styles.bottom}>
      {children}
    </div>
  );
}
