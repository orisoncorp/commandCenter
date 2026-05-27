import { useEffect, useState } from 'react';
import styles from './Globe.module.css';
import Badge from '../../components/atoms/Badge/Badge';
import { formatBRL } from '../../data/format';

const STATUS_VARIANT = {
  ativo: 'positive',
  atencao: 'alert',
  trial: 'neutral',
  churn: 'crimson',
};

export default function DetailPanel({ contract }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!contract) return null;

  return (
    <div
      className={styles.detailPanel}
      style={{
        opacity: visible ? 1 : 0,
        transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.96})`,
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
