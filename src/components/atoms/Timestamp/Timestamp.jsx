import { useState, useEffect } from 'react';
import styles from './Timestamp.module.css';

export default function Timestamp() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={styles.timestamp}>
      {time.toLocaleDateString('pt-BR')} · {time.toLocaleTimeString('pt-BR')}
    </span>
  );
}
