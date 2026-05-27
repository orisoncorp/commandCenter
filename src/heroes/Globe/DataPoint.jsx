import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './Globe.module.css';

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
    if (reducedMotion) return;
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

  useFrame(({ clock }) => {
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

    const effectiveMountScale = reducedMotion ? 1 : mountScale;
    visualRef.current.scale.setScalar(effectiveMountScale * hoverScaleRef.current * pulseMultiplier * heartbeat);

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

  const handleEnter = (event) => {
    if (!isFrontRef.current) return;
    event.stopPropagation();
    if (data) {
      document.body.style.cursor = 'pointer';
      onHover(data, getAnchor(event));
    }
  };

  const handleMove = (event) => {
    if (!isFrontRef.current || !data) return;
    event.stopPropagation();
    onHover(data, getAnchor(event));
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
      <mesh ref={haloRef} position={position}>
        <ringGeometry args={[VISUAL_RADIUS * 1.8, VISUAL_RADIUS * 2.2, 24]} />
        <meshBasicMaterial color="#8B1A1A" transparent opacity={0.15} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Visual dot */}
      <mesh ref={visualRef} position={position}>
        <sphereGeometry args={[VISUAL_RADIUS, 8, 8]} />
        <meshBasicMaterial color={hovered ? '#F06070' : '#8B1A1A'} transparent opacity={0.95} />
      </mesh>

      <mesh
        position={position}
        onPointerOver={handleEnter}
        onPointerMove={handleMove}
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
