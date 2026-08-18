import { lazy } from 'react';

// Registro dos heroes fora do componente para que CommandCenter.jsx exporte
// só componentes — requisito do fast refresh.
export const HERO_MAP = {
  globe: lazy(() => import('./Globe/Globe')),
  network: lazy(() => import('./NetworkGraph/NetworkGraph')),
  particles: lazy(() => import('./ParticleStream/ParticleStream')),
  cube: lazy(() => import('./DataCube/DataCube')),
};

export const HERO_KEYS = Object.keys(HERO_MAP);
