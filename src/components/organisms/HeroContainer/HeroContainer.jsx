import { useState, useCallback } from 'react';
import styles from './HeroContainer.module.css';
import DetailPanel from '../../../heroes/Globe/DetailPanel';

export default function HeroContainer({ hero: HeroComponent }) {
  const [hoverState, setHoverState] = useState(null);

  const handleHover = useCallback((contract, anchor = null) => {
    setHoverState(contract ? { contract, anchor } : null);
  }, []);

  const hoveredContract = hoverState?.contract || null;

  return (
    <div className={styles.hero}>
      {HeroComponent ? (
        <HeroComponent onHoverContract={handleHover} hoveredContract={hoveredContract} />
      ) : (
        <div className={styles.placeholder}>
          <svg className={styles.wireframe} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="60" cy="60" r="35" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
            <circle cx="60" cy="60" r="20" stroke="currentColor" strokeWidth="0.5" />
            <line x1="10" y1="60" x2="110" y2="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
            <line x1="60" y1="10" x2="60" y2="110" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
            <ellipse cx="60" cy="60" rx="50" ry="18" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
          </svg>
          <span className={styles.placeholderLabel}>HERO 3D</span>
          <span className={styles.placeholderSub}>config.hero não definido</span>
        </div>
      )}

      {hoverState && <DetailPanel contract={hoverState.contract} anchor={hoverState.anchor} />}
    </div>
  );
}
