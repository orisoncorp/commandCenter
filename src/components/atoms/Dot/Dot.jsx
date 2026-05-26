import styles from './Dot.module.css';

export default function Dot({ active = true, pulsing = false }) {
  return (
    <span className={`${styles.dot} ${active ? styles.active : styles.inactive} ${pulsing ? styles.pulsing : ''}`} />
  );
}
