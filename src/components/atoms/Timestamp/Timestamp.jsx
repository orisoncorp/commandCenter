import { useState, useEffect } from 'react';
import styles from './Timestamp.module.css';

const DATE_FMT = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const TIME_FMT = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export default function Timestamp() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <time className={styles.timestamp} dateTime={time.toISOString()}>
      {DATE_FMT.format(time)} · {TIME_FMT.format(time)}
    </time>
  );
}
