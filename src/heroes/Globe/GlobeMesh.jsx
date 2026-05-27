import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GlobeMesh({ radius = 1, autoRotate = true, rotating }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (autoRotate && rotating) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Wireframe sphere — lat/lng lines */}
      <mesh>
        <sphereGeometry args={[radius, 36, 18]} />
        <meshBasicMaterial
          color="#e8e6e1"
          wireframe
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
      {/* Subtle inner glow sphere */}
      <mesh>
        <sphereGeometry args={[radius * 0.995, 32, 16]} />
        <meshBasicMaterial
          color="#0a0a0a"
          transparent
          opacity={0.6}
          side={THREE.BackSide}
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
