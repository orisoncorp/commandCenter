import { useState, useEffect } from 'react';
import styles from './DataTable.module.css';
import Badge from '../../atoms/Badge/Badge';
import { calcStaggerDelay } from '../../../motion/constants';

const STATUS_VARIANT = {
  ativo: 'positive',
  atencao: 'alert',
  trial: 'neutral',
  churn: 'crimson',
};

const COL_LABELS = {
  empresa: 'EMPRESA',
  contrato: 'CONTRATO',
  mrr: 'MRR',
  status: 'STATUS',
  revisao: 'REVISÃO',
};

function formatCell(col, value) {
  if (col === 'mrr') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
  }
  if (col === 'status') {
    return <Badge variant={STATUS_VARIANT[value] || 'neutral'}>{value}</Badge>;
  }
  if (col === 'revisao') {
    return new Date(value).toLocaleDateString('pt-BR');
  }
  return value;
}

export default function DataTable({ data = [], columns = [] }) {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    data.forEach((_, i) => {
      const delay = calcStaggerDelay(i, 40);
      setTimeout(() => {
        setVisible(prev => [...prev, i]);
      }, delay);
    });
  }, [data.length]);

  if (!data.length || !columns.length) return null;

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col} className={styles.th}>{COL_LABELS[col] || col.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={styles.tr}
              style={{
                opacity: visible.includes(i) ? 1 : 0,
                transition: `opacity 250ms cubic-bezier(0.25, 0.1, 0.25, 1.0)`,
              }}
            >
              {columns.map(col => (
                <td key={col} className={styles.td}>{formatCell(col, row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
