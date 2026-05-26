import { useEffect, useState } from 'react';
import styles from './Globe.module.css';
import Badge from '../../components/atoms/Badge/Badge';

const STATUS_VARIANT = {
  ativo: 'positive',
  atencao: 'alert',
  trial: 'neutral',
  churn: 'crimson',
};

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export default function DetailPanel({ contract, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!contract) return null;

  return (
    <div
      className={styles.detailOverlay}
      onClick={onClose}
    >
      <div
        className={styles.detailPanel}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.96)',
          transition: 'opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.detailHeader}>
          <span className={styles.detailEmpresa}>{contract.empresa}</span>
          <button className={styles.detailClose} onClick={onClose}>×</button>
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
    </div>
  );
}
