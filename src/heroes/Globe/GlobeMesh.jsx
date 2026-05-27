import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GlobeMesh({ radius = 1, autoRotate = true, rotating }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    if (autoRotate && rotating) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Dense wireframe — 64 segments for richer lat/lng grid */}
      <mesh>
        <sphereGeometry args={[radius, 64, 32]} />
        <meshBasicMaterial
          color="#e8e6e1"
          wireframe
          transparent
          opacity={0.07}
          depthWrite={false}
        />
      </mesh>
      {/* Inner dark fill to occlude back-face wireframe */}
      <mesh>
        <sphereGeometry args={[radius * 0.995, 32, 16]} />
        <meshBasicMaterial
          color="#0a0a0a"
          transparent
          opacity={0.6}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Atmospheric halo — BackSide glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.08, 64, 64]} />
        <meshBasicMaterial
          color="#8B1A1A"
          transparent
          opacity={0.015}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Equator glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, radius * 0.012, 8, 80]} />
        <meshBasicMaterial
          color="#8B1A1A"
          transparent
          opacity={0.04}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
