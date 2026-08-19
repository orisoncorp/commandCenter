import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './Globe.module.css';
import { HERO_COLORS } from '../palette';

const NO_RAYCAST = () => null;

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

// Longitude → angle in the same convention as the radar sweep's Y-rotation
function lngToSweepAngle(lng) {
  // Three.js rotates Y CCW looking down; lng maps to theta = (lng+180)*deg2rad
  // We compare against the sweep's group.rotation.y offset
  return (lng + 180) * (Math.PI / 180);
}

export default function DataPoint({
  lat, lng, empresa, data, onHover, hovered,
  reducedMotion, mountDelay = 0, pulseSignal,
  sweepAngleRef, // { current: number } — shared radar sweep angle
}) {
  const visualRef = useRef();
  const haloRef = useRef();
  // Ref, não state: era setState a cada frame de rAF por 400ms e por ponto —
  // ~150-350 renders do React nos primeiros 600ms depois do mount.
  const mountScaleRef = useRef(reducedMotion ? 1 : 0);
  const mountElapsedRef = useRef(0);
  const { camera } = useThree();

  const position = useMemo(() => latLngToVec3(lat, lng, 1.02), [lat, lng]);
  const labelPos = useMemo(() => latLngToVec3(lat, lng, LABEL_RADIUS), [lat, lng]);
  const posNormal = useMemo(() => latLngToVec3(lat, lng, 1).normalize(), [lat, lng]);

  // Point's longitude in sweep-angle space
  const pointSweepAngle = useMemo(() => lngToSweepAngle(lng), [lng]);
  const lastSweepCrossRef = useRef(false); // was sweep overlapping last frame?

  useEffect(() => {
    if (reducedMotion) mountScaleRef.current = 1;
  }, [reducedMotion]);

  const pulseProgressRef = useRef(-1);
  useEffect(() => {
    if (reducedMotion || !pulseSignal) return;
    pulseProgressRef.current = 0;
  }, [pulseSignal, reducedMotion]);

  const heartbeatOffsetRef = useRef((lat + lng + 100) * 0.01);
  const hoverScaleRef = useRef(1);
  const hoveredRef = useRef(false);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  const isFrontRef = useRef(true);
  const lastFrontRef = useRef(true);
  const worldPositionRef = useRef(new THREE.Vector3());
  const worldNormalRef = useRef(new THREE.Vector3());
  const viewDirectionRef = useRef(new THREE.Vector3());
  const normalMatrixRef = useRef(new THREE.Matrix3());

  const getAnchor = useCallback((event) => {
    const source = event?.sourceEvent || event?.nativeEvent || event;
    if (source?.clientX != null && source?.clientY != null) {
      return { x: source.clientX, y: source.clientY };
    }
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    if (rect) {
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    return null;
  }, []);

  useFrame(({ clock }, delta) => {
    if (!visualRef.current) return;

    visualRef.current.getWorldPosition(worldPositionRef.current);
    normalMatrixRef.current.getNormalMatrix(visualRef.current.matrixWorld);
    worldNormalRef.current.copy(posNormal).applyMatrix3(normalMatrixRef.current).normalize();
    viewDirectionRef.current.copy(camera.position).sub(worldPositionRef.current).normalize();

    const facing = worldNormalRef.current.dot(viewDirectionRef.current);
    const frontFacing = facing > 0.05;
    isFrontRef.current = frontFacing;

    if (frontFacing !== lastFrontRef.current) {
      lastFrontRef.current = frontFacing;
      if (!frontFacing && hoveredRef.current) {
        document.body.style.cursor = '';
        onHover(null);
      }
    }

    const depthOpacity = reducedMotion ? 0.95 : THREE.MathUtils.lerp(0.2, 0.95, Math.max(0, facing));

    const dt = Math.min(delta, 0.1);

    if (!reducedMotion && mountScaleRef.current < 1) {
      mountElapsedRef.current += dt;
      const mt = Math.max(0, mountElapsedRef.current - mountDelay / 1000) / 0.4;
      mountScaleRef.current = mt >= 1 ? 1 : 1 - Math.pow(1 - mt, 3);
    }

    const hoverTarget = hoveredRef.current ? 1.8 : 1.0;
    hoverScaleRef.current += (hoverTarget - hoverScaleRef.current) * (1 - Math.exp(-9 * dt));

    // ── radar sweep flash detection ──
    if (!reducedMotion && sweepAngleRef?.current !== undefined) {
      const sw = sweepAngleRef.current;
      // Normalise diff to [-π, π]
      let diff = ((pointSweepAngle - sw) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      if (diff > Math.PI) diff -= Math.PI * 2;
      const sweepHit = Math.abs(diff) < 0.18; // ~10° window
      if (sweepHit && !lastSweepCrossRef.current) {
        pulseProgressRef.current = 0; // trigger flash
      }
      lastSweepCrossRef.current = sweepHit;
    }

    let pulseMultiplier = 1;
    if (pulseProgressRef.current >= 0) {
      // 0.016 era um frame time cravado: o pulso durava 0.3s a 60Hz e
      // 0.125s a 144Hz.
      pulseProgressRef.current = Math.min(pulseProgressRef.current + dt / 0.3, 1);
      pulseMultiplier = 1 + 0.3 * Math.sin(pulseProgressRef.current * Math.PI);
      if (pulseProgressRef.current >= 1) pulseProgressRef.current = -1;
    }

    const t = clock.getElapsedTime() + heartbeatOffsetRef.current;
    const heartbeat = reducedMotion ? 1 : 1 + 0.08 * (0.5 + 0.5 * Math.sin((t / 2) * Math.PI * 2));

    const effectiveMountScale = reducedMotion ? 1 : mountScaleRef.current;
    visualRef.current.scale.setScalar(effectiveMountScale * hoverScaleRef.current * pulseMultiplier * heartbeat);

    const dotMat = visualRef.current.material;
    if (dotMat) dotMat.opacity = depthOpacity * 0.95;
    const haloMat = haloRef.current?.material;
    if (haloMat) haloMat.opacity = depthOpacity * 0.15;
  });

  const handleEnter = (event) => {
    if (!isFrontRef.current) return;
    event.stopPropagation();
    if (data) {
      document.body.style.cursor = 'pointer';
      onHover(data, getAnchor(event));
    }
  };


  const handleLeave = (event) => {
    event.stopPropagation();
    document.body.style.cursor = '';
    onHover(null);
  };

  useEffect(() => {
    return () => {
      if (hoveredRef.current) document.body.style.cursor = '';
    };
  }, []);

  return (
    <>
      {/* Halo ring */}
      <mesh ref={haloRef} position={position} raycast={NO_RAYCAST}>
        <ringGeometry args={[VISUAL_RADIUS * 1.8, VISUAL_RADIUS * 2.2, 24]} />
        <meshBasicMaterial color={HERO_COLORS.crimson} transparent opacity={0.15} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>

      {/* Visual dot */}
      <mesh ref={visualRef} position={position} raycast={NO_RAYCAST}>
        <sphereGeometry args={[VISUAL_RADIUS, 8, 8]} />
        <meshBasicMaterial color={hovered ? HERO_COLORS.crimsonBright : HERO_COLORS.dataPoint} transparent opacity={0.95} toneMapped={false} />
      </mesh>

      <mesh
        position={position}
        onPointerOver={handleEnter}
        onPointerOut={handleLeave}
      >
        <sphereGeometry args={[VISUAL_RADIUS * 4.2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hovered && (
        <Html position={labelPos.toArray()} zIndexRange={[10, 0]} center>
          <div className={styles.pointLabel}>{empresa}</div>
        </Html>
      )}
    </>
  );
}
