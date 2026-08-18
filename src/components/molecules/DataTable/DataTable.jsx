import styles from './DataTable.module.css';
import Badge from '../../atoms/Badge/Badge';
import { calcStaggerDelay, STAGGER } from '../../../motion/constants';
import { formatBRL, formatDate } from '../../../data/format';

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

// Columns carry different information density — a company name needs room, a
// status chip does not. Without this every column gets an equal share.
const COL_WIDTH = {
  empresa: '28%',
  contrato: '16%',
  mrr: '20%',
  status: '18%',
  revisao: '18%',
};

// Numeric columns align right so digits stack by magnitude.
const NUMERIC_COLS = new Set(['mrr']);

function formatCell(col, value) {
  if (col === 'mrr') return formatBRL(value);
  if (col === 'status') {
    return <Badge variant={STATUS_VARIANT[value] || 'neutral'}>{value}</Badge>;
  }
  if (col === 'revisao') return formatDate(value);
  return value;
}

// Plain-text form for the `title` attribute, so a truncated cell stays readable.
function cellTitle(col, value) {
  if (col === 'status') return String(value ?? '');
  const formatted = formatCell(col, value);
  return typeof formatted === 'string' ? formatted : String(value ?? '');
}

export default function DataTable({ data = [], columns = [] }) {
  // O stagger é apresentação pura, então vive no CSS: um animation-delay por
  // linha. Antes era um setTimeout por linha alimentando state do React, que
  // acumulava índices sem dedupe e nunca resetava.
  if (!columns.length) return null;

  if (!data.length) {
    return (
      <div className={styles.wrap}>
        <p className={styles.empty}>Nenhum contrato ativo no período.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className={styles.caption}>Contratos ativos</caption>
        <colgroup>
          {columns.map(col => (
            <col key={col} style={{ width: COL_WIDTH[col] }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col}
                scope="col"
                className={`${styles.th} ${NUMERIC_COLS.has(col) ? styles.numeric : ''}`}
              >
                {COL_LABELS[col] || col.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={`${row.contrato ?? i}`}
              className={styles.tr}
              style={{ animationDelay: `${calcStaggerDelay(i, STAGGER.dense)}ms` }}
            >
              {columns.map(col => (
                <td
                  key={col}
                  className={`${styles.td} ${NUMERIC_COLS.has(col) ? styles.numeric : ''}`}
                  title={cellTitle(col, row[col])}
                >
                  {formatCell(col, row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
