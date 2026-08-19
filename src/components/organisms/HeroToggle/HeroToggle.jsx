import styles from './HeroToggle.module.css';

const LABELS = {
  globe: 'GLOBE',
  network: 'NET',
  particles: 'FLOW',
  cube: 'CUBE',
};

const DESCRIPTIONS = {
  globe: 'Visão geográfica',
  network: 'Visão de rede',
  particles: 'Visão de fluxo',
  cube: 'Visão multidimensional',
};

export default function HeroToggle({ heroes, active, onChange, disabled = false }) {
  return (
    <nav className={styles.toggle} aria-label="Modo de visualização">
      {heroes.map(key => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            className={`${styles.btn} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(key)}
            /* aria-pressed porque o estado ativo era comunicado só por cor. */
            aria-pressed={isActive}
            aria-label={DESCRIPTIONS[key] || key}
            /* Desabilitado durante o Suspense: antes o toggle era clicável em
               rajada, e cada clique destruía e recriava o contexto WebGL. */
            disabled={disabled}
          >
            {LABELS[key] || key.toUpperCase()}
          </button>
        );
      })}
    </nav>
  );
}
