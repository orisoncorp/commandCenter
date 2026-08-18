import styles from './Skeleton.module.css';

/**
 * Placeholder de carregamento com a forma do conteúdo que vai chegar.
 *
 * Antes, no primeiro paint todos os widgets retornavam null e os dois
 * painéis apareciam como retângulos de vidro vazios — depois tudo surgia
 * de uma vez. Skeleton no lugar de spinner: preserva o layout e não
 * introduz um segundo salto quando o dado chega.
 */
export function KpiSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <span className={`${styles.bar} ${styles.label}`} />
      <span className={`${styles.bar} ${styles.value}`} />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <span className={styles.orb} />
    </div>
  );
}

export default function Skeleton({ width = '100%', height = '1em' }) {
  return <span className={styles.bar} style={{ width, height }} aria-hidden="true" />;
}
