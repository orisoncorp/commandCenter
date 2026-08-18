import { useRef, useEffect } from 'react';
import styles from './EventFeed.module.css';
import Badge from '../../atoms/Badge/Badge';
import { formatBRLCompact } from '../../../data/format';
import { usePrefersReducedMotion } from '../../../motion/usePrefersReducedMotion';

const TYPE_VARIANT = {
  contrato: { label: 'NOVO', variant: 'positive' },
  upsell: { label: 'UP', variant: 'positive' },
  alerta: { label: 'ALERT', variant: 'alert' },
  churn: { label: 'CHURN', variant: 'crimson' },
};

// Chaves são estáveis por evento, então só uma linha realmente nova monta —
// "é novo" é exatamente "acabou de montar". Antes isso era inferido lendo um
// ref durante o render.
function EventRow({ event }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current || reduced) return;
    ref.current.animate(
      [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 150, easing: 'cubic-bezier(0, 0, 0.2, 1)', fill: 'forwards' }
    );
  }, [reduced]);

  const variant = TYPE_VARIANT[event.type] || {
    label: String(event.type ?? '').toUpperCase(),
    variant: 'neutral',
  };

  return (
    /* Duas linhas, não quatro colunas. Em 240px, quatro dados lado a lado
       deixavam ~21px para o nome da empresa — "Zeta SA" virava "Zet…". */
    <li ref={ref} className={styles.row}>
      <div className={styles.rowTop}>
        <Badge variant={variant.variant}>{variant.label}</Badge>
        <span className={styles.empresa} title={event.empresa}>
          {event.empresa}
        </span>
      </div>
      <div className={styles.rowBottom}>
        <span className={styles.ts}>{event.timestamp}</span>
        <span className={`${styles.value} ${event.value < 0 ? styles.neg : styles.pos}`}>
          {formatBRLCompact(event.value)}
        </span>
      </div>
    </li>
  );
}

export default function EventFeed({ events = [] }) {
  return (
    <section className={styles.feed} aria-label="Eventos em tempo real">
      <h2 className={styles.header}>Eventos</h2>
      {/* aria-live desligado de propósito: a 3s por evento, anunciar cada um
          seria um torrente. O histórico fica legível sob demanda. */}
      <ol className={styles.rows} aria-live="off">
        {events.length === 0 && <li className={styles.empty}>aguardando stream…</li>}
        {/* Renderiza tudo o que o provider guarda. Antes, cinco dos dez
            eventos eram descartados em silêncio, sem scroll nem indicação. */}
        {events.map(ev => (
          <EventRow key={`${ev.timestamp}-${ev.empresa}`} event={ev} />
        ))}
      </ol>
    </section>
  );
}
