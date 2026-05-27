import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './Globe.module.css';

const VISUAL_RADIUS = 0.022;
const HITBOX_RADIUS = 0.15;
const LABEL_RADIUS = 1.14;

function latLngToVec3(lat, lng, r) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

export default function DataPoint({ lat, lng, empresa, data, onSelect, selected, reducedMotion, mountDelay = 0, pulseSignal }) {
  const visualRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [mountScale, setMountScale] = useState(reducedMotion ? 1 : 0);
  const { gl } = useThree();

  const position = latLngToVec3(lat, lng, 1.02);
  const labelPos = latLngToVec3(lat, lng, LABEL_RADIUS);

  // Mount animation: scale 0 → 1 with stagger delay
  useEffect(() => {
    if (reducedMotion) { setMountScale(1); return; }
    let raf;
    const timer = setTimeout(() => {
      const start = performance.now();
      const duration = 400;
      const animate = (now) => {
        const t = Math.min((now - start) / duration, 1);
        setMountScale(1 - Math.pow(1 - t, 3));
        if (t < 1) raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
    }, mountDelay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [reducedMotion, mountDelay]);

  // Pulse animation when live data arrives (pulseSignal increments)
  const pulseRef = useRef(0);
  const pulseProgressRef = useRef(-1); // -1 = idle
  useEffect(() => {
    if (reducedMotion || !pulseSignal) return;
    pulseProgressRef.current = 0;
  }, [pulseSignal]);

  // Smooth hover scale + pulse via useFrame
  const hoverScaleRef = useRef(1);
  useFrame(() => {
    if (!visualRef.current) return;

    // Hover interpolation
    const hoverTarget = (hovered || selected) ? 1.8 : 1.0;
    hoverScaleRef.current += (hoverTarget - hoverScaleRef.current) * 0.14;

    // Pulse: 0→1 over 300ms, drives scale 1→1.3→1
    let pulseMultiplier = 1;
    if (pulseProgressRef.current >= 0) {
      pulseProgressRef.current = Math.min(pulseProgressRef.current + 0.016 / 0.3, 1);
      // sine curve: 0→1→0 over full duration → scale peaks at 0.5
      pulseMultiplier = 1 + 0.3 * Math.sin(pulseProgressRef.current * Math.PI);
      if (pulseProgressRef.current >= 1) pulseProgressRef.current = -1;
    }

    const s = mountScale * hoverScaleRef.current * pulseMultiplier;
    visualRef.current.scale.setScalar(s);
  });

  const handleOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    gl.domElement.style.cursor = 'pointer';
  };

  const handleOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    gl.domElement.style.cursor = 'auto';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (data) onSelect(data);
  };

  const showLabel = hovered || selected;

  return (
    <>
      {/* Invisible hitbox — large sphere capturing pointer events */}
      <mesh
        position={position}
        visible={false}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[HITBOX_RADIUS, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Halo ring around data point */}
      <mesh position={position}>
        <ringGeometry args={[VISUAL_RADIUS * 1.8, VISUAL_RADIUS * 2.2, 24]} />
        <meshBasicMaterial
          color="#8B1A1A"
          transparent
          opacity={0.15}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Visual dot */}
      <mesh ref={visualRef} position={position}>
        <sphereGeometry args={[VISUAL_RADIUS, 8, 8]} />
        <meshBasicMaterial
          color={showLabel ? '#F06070' : '#8B1A1A'}
          transparent
          opacity={0.95}
        />
      </mesh>

      {showLabel && (
        <Html position={labelPos.toArray()} zIndexRange={[10, 0]} center>
          <div
            className={styles.pointLabel}
            style={{ opacity: 1, transition: 'opacity 150ms cubic-bezier(0.25, 0.1, 0.25, 1)' }}
          >
            {empresa}
          </div>
        </Html>
      )}
    </>
  );
}
