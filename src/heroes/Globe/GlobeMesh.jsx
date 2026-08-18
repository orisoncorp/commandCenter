import * as THREE from 'three';
import { HERO_COLORS } from '../palette';

// Toda a geometria aqui é decorativa. Sem opt-out, o R3F testava
// 4096 + 1024 + 8192 + 1280 ≈ 14.600 triângulos por pointermove.
const NO_RAYCAST = () => null;

export default function GlobeMesh({ radius = 1 }) {
  return (
    <group>
      {/* Wireframe denso — 64 segmentos para uma grade lat/lng mais rica */}
      <mesh raycast={NO_RAYCAST}>
        <sphereGeometry args={[radius, 64, 32]} />
        <meshBasicMaterial
          color={HERO_COLORS.offwhite}
          wireframe
          transparent
          opacity={0.07}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Preenchimento interno que oculta o wireframe da face traseira */}
      <mesh raycast={NO_RAYCAST}>
        <sphereGeometry args={[radius * 0.995, 32, 16]} />
        <meshBasicMaterial
          color={HERO_COLORS.background}
          transparent
          opacity={0.6}
          side={THREE.BackSide}
          toneMapped={false}
        />
      </mesh>

      {/* Halo atmosférico */}
      <mesh raycast={NO_RAYCAST}>
        <sphereGeometry args={[radius * 1.08, 48, 32]} />
        <meshBasicMaterial
          color={HERO_COLORS.crimson}
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Anel do equador */}
      <mesh rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <torusGeometry args={[radius, radius * 0.012, 8, 80]} />
        <meshBasicMaterial
          color={HERO_COLORS.crimson}
          transparent
          opacity={0.04}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
