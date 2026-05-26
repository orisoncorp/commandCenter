import { useRef, useEffect } from 'react';
import styles from './EventFeed.module.css';

const MAX_VISIBLE = 5;

const TYPE_VARIANT = {
  contrato: { label: 'NOVO', color: 'positive' },
  upsell:   { label: 'UP',   color: 'positive' },
  alerta:   { label: 'ALERT',color: 'alert' },
  churn:    { label: 'CHURN',color: 'crimson' },
};

function formatBRL(v) {
  const abs = Math.abs(v);
  return `${v < 0 ? '-' : '+'}R$ ${abs >= 1000 ? `${(abs/1000).toFixed(1)}k` : abs}`;
}

function EventRow({ event, isNew }) {
  const ref = useRef();

  useEffect(() => {
    if (!ref.current || !isNew) return;
    // enter-data: opacity 0→1 + translateY 8→0, 150ms, micro easing
    ref.current.animate(
      [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 150, easing: 'cubic-bezier(0.0, 0.0, 0.2, 1)', fill: 'forwards' }
    );
  }, [isNew]);

  const variant = TYPE_VARIANT[event.type] || { label: event.type.toUpperCase(), color: 'neutral' };

  return (
    <div ref={ref} className={styles.row} style={{ opacity: isNew ? 0 : 1 }}>
      <span className={`${styles.badge} ${styles[variant.color]}`}>{variant.label}</span>
      <span className={styles.empresa}>{event.empresa}</span>
      <span className={`${styles.value} ${event.value < 0 ? styles.neg : styles.pos}`}>
        {formatBRL(event.value)}
      </span>
      <span className={styles.ts}>{event.timestamp}</span>
    </div>
  );
}

export default function EventFeed({ events = [] }) {
  const visible = events.slice(0, MAX_VISIBLE);
  const prevLenRef = useRef(0);
  const isNew = (i) => i === 0 && events.length > prevLenRef.current;

  useEffect(() => {
    prevLenRef.current = events.length;
  }, [events.length]);

  return (
    <div className={styles.feed}>
      <span className={styles.header}>EVENTOS</span>
      <div className={styles.rows}>
        {visible.length === 0 && (
          <span className={styles.empty}>aguardando stream…</span>
        )}
        {visible.map((ev, i) => (
          <EventRow key={`${ev.timestamp}-${ev.empresa}-${i}`} event={ev} isNew={isNew(i)} />
        ))}
      </div>
    </div>
  );
}
