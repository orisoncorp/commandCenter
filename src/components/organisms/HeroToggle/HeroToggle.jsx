import styles from './HeroToggle.module.css';

const LABELS = {
  globe: 'GLOBE',
  network: 'NET',
  particles: 'FLOW',
  cube: 'CUBE',
};

export default function HeroToggle({ heroes, active, onChange }) {
  return (
    <div className={styles.toggle}>
      {heroes.map(key => (
        <button
          key={key}
          className={`${styles.btn} ${active === key ? styles.active : ''}`}
          onClick={() => onChange(key)}
          title={key}
        >
          {LABELS[key] || key.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
