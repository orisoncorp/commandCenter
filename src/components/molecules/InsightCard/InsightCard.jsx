import styles from './InsightCard.module.css';
import Badge from '../../atoms/Badge/Badge';

export default function InsightCard({ title, content, timestamp, type = 'auto' }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Badge variant={type === 'auto' ? 'crimson' : 'neutral'}>
          {type === 'auto' ? 'AI INSIGHT' : 'NOTA'}
        </Badge>
        {timestamp && <span className={styles.time}>{timestamp}</span>}
      </div>
      {title && <span className={styles.title}>{title}</span>}
      <p className={styles.content}>{content}</p>
    </div>
  );
}
