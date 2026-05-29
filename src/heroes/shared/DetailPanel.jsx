import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './shared.module.css';
import Badge from '../../components/atoms/Badge/Badge';
import { formatBRL } from '../../data/format';

const STATUS_VARIANT = {
  ativo: 'positive',
  atencao: 'alert',
  trial: 'neutral',
  churn: 'crimson',
};

const PANEL_MARGIN = 16;
const PANEL_OFFSET = 22;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function DetailPanel({ contract, anchor }) {
  const panelRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState(() => ({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    placement: 'right',
  }));

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useLayoutEffect(() => {
    if (!contract) return;

    const updatePosition = () => {
      const rect = panelRef.current?.getBoundingClientRect();
      const width = rect?.width || 300;
      const height = rect?.height || 160;
      const origin = anchor || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      const opensLeft = origin.x + PANEL_OFFSET + width + PANEL_MARGIN > window.innerWidth;

      const rawX = opensLeft ? origin.x - width - PANEL_OFFSET : origin.x + PANEL_OFFSET;
      const rawY = origin.y - height / 2;

      setPosition({
        x: clamp(rawX, PANEL_MARGIN, window.innerWidth - width - PANEL_MARGIN),
        y: clamp(rawY, PANEL_MARGIN, window.innerHeight - height - PANEL_MARGIN),
        placement: opensLeft ? 'left' : 'right',
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [anchor, contract]);

  if (!contract) return null;

  return (
    <div
      ref={panelRef}
      className={styles.detailPanel}
      data-hero-detail-panel="true"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: visible ? 1 : 0,
        transform: `scale(${visible ? 1 : 0.96})`,
        transformOrigin: position.placement === 'left' ? 'right center' : 'left center',
        transition: 'opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className={styles.detailHeader}>
        <span className={styles.detailEmpresa}>{contract.empresa}</span>
      </div>
      <div className={styles.detailRows}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>CONTRATO</span>
          <span className={styles.detailValue}>{contract.contrato}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>MRR</span>
          <span className={styles.detailValueAccent}>{formatBRL(contract.mrr)}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>STATUS</span>
          <Badge variant={STATUS_VARIANT[contract.status] || 'neutral'}>{contract.status}</Badge>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>REVISÃO</span>
          <span className={styles.detailValue}>
            {new Date(contract.revisao).toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );
}
