import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './Globe.module.css';

const VISUAL_RADIUS = 0.022;
const HITBOX_RADIUS = 0.22;
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
  const haloRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [mountScale, setMountScale] = useState(reducedMotion ? 1 : 0);
  const { gl, camera } = useThree();

  // Pre-compute positions — stable references, never re-allocated
  const position = useMemo(() => latLngToVec3(lat, lng, 1.02), [lat, lng]);
  const labelPos = useMemo(() => latLngToVec3(lat, lng, LABEL_RADIUS), [lat, lng]);
  // Unit normal of the point on sphere surface — used for depth dot product
  const posNormal = useMemo(() => latLngToVec3(lat, lng, 1).normalize(), [lat, lng]);

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

  // Live data pulse
  const pulseProgressRef = useRef(-1);
  useEffect(() => {
    if (reducedMotion || !pulseSignal) return;
    pulseProgressRef.current = 0;
  }, [pulseSignal]);

  const heartbeatOffsetRef = useRef((lat + lng + 100) * 0.01);
  const hoverScaleRef = useRef(1);
  // Stable ref for hovered/selected — avoids stale closure in useFrame
  const hoveredRef = useRef(false);
  const selectedRef = useRef(false);
  hoveredRef.current = hovered;
  selectedRef.current = selected;

  useFrame(({ clock }) => {
    if (!visualRef.current) return;

    // Depth fade: dot product — no allocation, posNormal is pre-computed
    const dot = posNormal.dot(camera.position) / camera.position.length();
    const depthOpacity = reducedMotion ? 0.95 : THREE.MathUtils.lerp(0.2, 0.95, Math.max(0, dot));

    // Hover interpolation
    const hoverTarget = (hoveredRef.current || selectedRef.current) ? 1.8 : 1.0;
    hoverScaleRef.current += (hoverTarget - hoverScaleRef.current) * 0.14;

    // Event pulse: 0→1 over 300ms, scale 1→1.3→1
    let pulseMultiplier = 1;
    if (pulseProgressRef.current >= 0) {
      pulseProgressRef.current = Math.min(pulseProgressRef.current + 0.016 / 0.3, 1);
      pulseMultiplier = 1 + 0.3 * Math.sin(pulseProgressRef.current * Math.PI);
      if (pulseProgressRef.current >= 1) pulseProgressRef.current = -1;
    }

    // Heartbeat: 1.0 → 1.08 → 1.0 at 2000ms period
    const t = clock.getElapsedTime() + heartbeatOffsetRef.current;
    const heartbeat = reducedMotion ? 1 : 1 + 0.08 * (0.5 + 0.5 * Math.sin((t / 2) * Math.PI * 2));

    visualRef.current.scale.setScalar(mountScale * hoverScaleRef.current * pulseMultiplier * heartbeat);

    // Depth opacity — flag needsUpdate so Three.js re-uploads the material
    if (visualRef.current.material) {
      visualRef.current.material.opacity = depthOpacity * 0.95;
      visualRef.current.material.needsUpdate = true;
    }
    if (haloRef.current?.material) {
      haloRef.current.material.opacity = depthOpacity * 0.15;
      haloRef.current.material.needsUpdate = true;
    }
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
      {/* Transparent hitbox — visible:true so raycaster processes it */}
      <mesh
        position={position}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
        renderOrder={-1}
      >
        <sphereGeometry args={[HITBOX_RADIUS, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Halo ring */}
      <mesh ref={haloRef} position={position}>
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
