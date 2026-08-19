import styles from './HeaderBar.module.css';
import Timestamp from '../../atoms/Timestamp/Timestamp';
import Dot from '../../atoms/Dot/Dot';
import { formatBRL } from '../../../data/format';

function HeaderKpi({ label, value, format }) {
  if (value == null) return null;
  const display = format === 'currency' ? formatBRL(value) : value;
  return (
    <div className={styles.kpi}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue}>{display}</span>
    </div>
  );
}

export default function HeaderBar({
  title = 'Command Center',
  kpis = [],
  streaming = false,
  onToggleStream,
  children,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.logo} aria-hidden="true">
          ◉
        </span>
        {/* Único h1 do documento. Antes não havia nenhum heading em toda a
            aplicação — o outline era literalmente vazio. */}
        <h1 className={styles.brandLockup}>
          <span className={styles.brand}>ORISON</span>
          <span className={styles.sep} aria-hidden="true">
            ·
          </span>
          <span className={styles.title}>{title}</span>
        </h1>
      </div>

      {kpis.length > 0 && (
        <div className={styles.center}>
          {kpis.map(kpi => (
            <HeaderKpi key={kpi.label} label={kpi.label} value={kpi.value} format={kpi.format} />
          ))}
        </div>
      )}

      <div className={styles.right}>
        {children}
        <button
          type="button"
          className={`${styles.liveBtn} ${streaming ? styles.liveBtnActive : styles.liveBtnPaused}`}
          onClick={onToggleStream}
          aria-pressed={streaming}
          /* Abaixo de 600px o rótulo fica visualmente oculto, então o nome
             acessível precisa vir daqui. */
          aria-label={streaming ? 'Stream ao vivo — pausar' : 'Stream pausado — retomar'}
        >
          <Dot active={streaming} pulsing={streaming} />
          <span>{streaming ? 'LIVE' : 'PAUSED'}</span>
        </button>
        <Timestamp />
      </div>
    </header>
  );
}
