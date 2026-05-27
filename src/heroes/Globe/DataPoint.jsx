import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './Globe.module.css';
import { useThree } from '@react-three/fiber';

const VISUAL_RADIUS = 0.022;
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

export default function DataPoint({ lat, lng, empresa, data, onHover, hovered, reducedMotion, mountDelay = 0, pulseSignal }) {
  const visualRef = useRef();
  const haloRef = useRef();
  const [mountScale, setMountScale] = useState(reducedMotion ? 1 : 0);
  const { camera } = useThree();

  const position = useMemo(() => latLngToVec3(lat, lng, 1.02), [lat, lng]);
  const labelPos = useMemo(() => latLngToVec3(lat, lng, LABEL_RADIUS), [lat, lng]);
  const posNormal = useMemo(() => latLngToVec3(lat, lng, 1).normalize(), [lat, lng]);

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

  const pulseProgressRef = useRef(-1);
  useEffect(() => {
    if (reducedMotion || !pulseSignal) return;
    pulseProgressRef.current = 0;
  }, [pulseSignal]);

  const heartbeatOffsetRef = useRef((lat + lng + 100) * 0.01);
  const hoverScaleRef = useRef(1);
  const hoveredRef = useRef(false);
  hoveredRef.current = hovered;

  // Track whether point is facing camera — used to suppress hover on back face
  const isFrontRef = useRef(true);

  useFrame(({ clock }) => {
    if (!visualRef.current) return;

    const dot = posNormal.dot(camera.position) / camera.position.length();
    isFrontRef.current = dot > 0;
    const depthOpacity = reducedMotion ? 0.95 : THREE.MathUtils.lerp(0.2, 0.95, Math.max(0, dot));

    const hoverTarget = hoveredRef.current ? 1.8 : 1.0;
    hoverScaleRef.current += (hoverTarget - hoverScaleRef.current) * 0.14;

    let pulseMultiplier = 1;
    if (pulseProgressRef.current >= 0) {
      pulseProgressRef.current = Math.min(pulseProgressRef.current + 0.016 / 0.3, 1);
      pulseMultiplier = 1 + 0.3 * Math.sin(pulseProgressRef.current * Math.PI);
      if (pulseProgressRef.current >= 1) pulseProgressRef.current = -1;
    }

    const t = clock.getElapsedTime() + heartbeatOffsetRef.current;
    const heartbeat = reducedMotion ? 1 : 1 + 0.08 * (0.5 + 0.5 * Math.sin((t / 2) * Math.PI * 2));

    visualRef.current.scale.setScalar(mountScale * hoverScaleRef.current * pulseMultiplier * heartbeat);

    const dotMat = visualRef.current.material;
    if (dotMat) {
      const next = depthOpacity * 0.95;
      if (Math.abs(dotMat.opacity - next) > 0.001) { dotMat.opacity = next; dotMat.needsUpdate = true; }
    }
    const haloMat = haloRef.current?.material;
    if (haloMat) {
      const next = depthOpacity * 0.15;
      if (Math.abs(haloMat.opacity - next) > 0.001) { haloMat.opacity = next; haloMat.needsUpdate = true; }
    }
  });

  const handleEnter = () => {
    // Suppress hover when point is on the back face of the globe
    if (!isFrontRef.current) return;
    if (data) onHover(data);
  };

  const handleLeave = () => onHover(null);

  return (
    <>
      {/* Halo ring */}
      <mesh ref={haloRef} position={position}>
        <ringGeometry args={[VISUAL_RADIUS * 1.8, VISUAL_RADIUS * 2.2, 24]} />
        <meshBasicMaterial color="#8B1A1A" transparent opacity={0.15} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Visual dot */}
      <mesh ref={visualRef} position={position}>
        <sphereGeometry args={[VISUAL_RADIUS, 8, 8]} />
        <meshBasicMaterial color={hovered ? '#F06070' : '#8B1A1A'} transparent opacity={0.95} />
      </mesh>

      {/* HTML button — bypasses Three.js raycaster, hover activates panel */}
      <Html position={position.toArray()} zIndexRange={[5, 0]} center>
        <button
          className={styles.pointHitbox}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          aria-label={empresa}
        />
      </Html>

      {hovered && (
        <Html position={labelPos.toArray()} zIndexRange={[10, 0]} center>
          <div className={styles.pointLabel}>{empresa}</div>
        </Html>
      )}
    </>
  );
}
