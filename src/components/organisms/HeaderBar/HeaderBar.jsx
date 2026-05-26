import styles from './HeaderBar.module.css';
import Timestamp from '../../atoms/Timestamp/Timestamp';
import Dot from '../../atoms/Dot/Dot';

function HeaderKpi({ label, value, format }) {
  if (value == null) return null;
  const display = format === 'currency'
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)
    : value;
  return (
    <div className={styles.kpi}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue}>{display}</span>
    </div>
  );
}

export default function HeaderBar({ title = 'COMMAND CENTER', kpis = [], streaming = false, onToggleStream, children }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.logo}>◉</span>
        <span className={styles.brand}>ORISON</span>
        <span className={styles.sep}>·</span>
        <span className={styles.title}>{title}</span>
      </div>

      {kpis.length > 0 && (
        <div className={styles.center}>
          {kpis.map((kpi, i) => (
            <HeaderKpi key={i} label={kpi.label} value={kpi.value} format={kpi.format} />
          ))}
        </div>
      )}

      <div className={styles.right}>
        {children}
        <button
          className={`${styles.liveBtn} ${streaming ? styles.liveBtnActive : styles.liveBtnPaused}`}
          onClick={onToggleStream}
          title={streaming ? 'Pausar stream' : 'Retomar stream'}
        >
          <Dot active={streaming} pulsing={streaming} />
          <span>{streaming ? 'LIVE' : 'PAUSED'}</span>
        </button>
        <Timestamp />
      </div>
    </header>
  );
}
