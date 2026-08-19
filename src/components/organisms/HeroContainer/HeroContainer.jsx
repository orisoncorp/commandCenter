import { useState, useCallback } from 'react';
import styles from './HeroContainer.module.css';
import DetailPanel from '../../../heroes/shared/DetailPanel';
import { useStream } from '../../../data/contexts';
import { formatBRL, formatDate } from '../../../data/format';

export default function HeroContainer({ hero: HeroComponent }) {
  const [hoverState, setHoverState] = useState(null);
  const { table } = useStream();

  const handleHover = useCallback((contract, anchor = null) => {
    setHoverState(contract ? { contract, anchor } : null);
  }, []);

  // Trocar de hero destrói os nós que possuíam o hover, então o pointer-out
  // que limparia o painel nunca dispara — ele ficava preso na tela, sobre a
  // visualização nova, nas coordenadas antigas. Ajuste durante o render é o
  // padrão recomendado para reset de estado derivado.
  const [prevHero, setPrevHero] = useState(HeroComponent);
  if (prevHero !== HeroComponent) {
    setPrevHero(HeroComponent);
    setHoverState(null);
  }

  const hoveredContract = hoverState?.contract || null;

  return (
    <div className={styles.hero}>
      {/* O canvas não tinha role, nem aria-label, nem alternativa textual —
          para um leitor de tela era um elemento vazio, e os dados dos
          contratos só existiam via hover de mouse. */}
      <div
        className={styles.canvasRegion}
        role="img"
        aria-label="Visualização 3D dos contratos ativos. A mesma informação está na tabela abaixo."
      >
        {HeroComponent && (
          <HeroComponent onHoverContract={handleHover} hoveredContract={hoveredContract} />
        )}
      </div>

      {/* Alternativa textual: mesma informação que o hover revela. */}
      {table?.length > 0 && (
        <ul className={styles.srOnly}>
          {table.map(row => (
            <li key={row.contrato}>
              {row.empresa}, contrato {row.contrato}, {formatBRL(row.mrr)} de MRR, status{' '}
              {row.status}, revisão em {formatDate(row.revisao)}.
            </li>
          ))}
        </ul>
      )}

      {hoverState && <DetailPanel contract={hoverState.contract} anchor={hoverState.anchor} />}
    </div>
  );
}
