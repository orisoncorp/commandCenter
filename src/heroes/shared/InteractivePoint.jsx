import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import styles from './shared.module.css';
import { HERO_COLORS } from '../palette';

const HITBOX_MULTIPLIER = 4.2;
const MOUNT_DURATION = 0.4; // segundos
const PULSE_DURATION = 0.3;
const NO_RAYCAST = () => null;

export default function InteractivePoint({
  position,
  posNormal,
  labelPosition,
  label,
  data,
  onHover,
  hovered,
  reducedMotion,
  mountDelay = 0,
  pulseSignal = 0,
  radius = 0.022,
  color = HERO_COLORS.dataPoint,
  colorHovered = HERO_COLORS.crimsonBright,
}) {
  const visualRef = useRef();
  const haloRef = useRef();
  const { camera } = useThree();

  // mountScale como ref, não state: antes era setState a cada frame de rAF
  // por 400ms e por ponto — ~150-350 renders do React concentrados nos
  // primeiros 600ms, exatamente quando o contexto WebGL está aquecendo.
  const mountScaleRef = useRef(reducedMotion ? 1 : 0);
  const mountElapsedRef = useRef(0);
  const mountDelayRef = useRef(mountDelay / 1000);

  const posVec = useRef(new THREE.Vector3(...position));
  const normalVec = useRef(posNormal ? new THREE.Vector3(...posNormal) : null);

  useEffect(() => {
    posVec.current.set(...position);
    if (posNormal) normalVec.current = new THREE.Vector3(...posNormal);
  }, [position, posNormal]);

  useEffect(() => {
    if (reducedMotion) mountScaleRef.current = 1;
  }, [reducedMotion]);

  const pulseProgressRef = useRef(-1);
  useEffect(() => {
    if (reducedMotion || !pulseSignal) return;
    pulseProgressRef.current = 0;
  }, [pulseSignal, reducedMotion]);

  // Offset derivado da posição em vez de Math.random(): estável entre
  // renders e puro na fase de render.
  const heartbeatOffsetRef = useRef((position[0] * 12.9898 + position[1] * 78.233) % (Math.PI * 2));
  const hoverScaleRef = useRef(1);
  const hoveredRef = useRef(false);
  const isFrontRef = useRef(true);
  const lastFrontRef = useRef(true);

  const worldPositionRef = useRef(new THREE.Vector3());
  const worldNormalRef = useRef(new THREE.Vector3());
  const viewDirectionRef = useRef(new THREE.Vector3());
  const normalMatrixRef = useRef(new THREE.Matrix3());

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  const getAnchor = useCallback(event => {
    const source = event?.sourceEvent || event?.nativeEvent || event;
    if (source?.clientX != null && source?.clientY != null) {
      return { x: source.clientX, y: source.clientY };
    }
    return null;
  }, []);

  useFrame(({ clock }, delta) => {
    if (!visualRef.current) return;
    // Em 144Hz o delta é ~0.007; clampar evita saltos quando a aba volta do
    // background com um delta acumulado enorme.
    const dt = Math.min(delta, 0.1);

    visualRef.current.getWorldPosition(worldPositionRef.current);
    normalMatrixRef.current.getNormalMatrix(visualRef.current.matrixWorld);

    let facing = 1;
    if (normalVec.current) {
      worldNormalRef.current
        .copy(normalVec.current)
        .applyMatrix3(normalMatrixRef.current)
        .normalize();
      viewDirectionRef.current.copy(camera.position).sub(worldPositionRef.current).normalize();
      facing = worldNormalRef.current.dot(viewDirectionRef.current);
    }

    const frontFacing = facing > 0.05;
    isFrontRef.current = frontFacing;

    if (frontFacing !== lastFrontRef.current) {
      lastFrontRef.current = frontFacing;
      if (!frontFacing && hoveredRef.current) {
        document.body.style.cursor = '';
        onHover(null);
      }
    }

    // Mount easing dentro do próprio useFrame — sem rAF paralelo, sem state.
    if (!reducedMotion && mountScaleRef.current < 1) {
      mountElapsedRef.current += dt;
      const t = Math.max(0, mountElapsedRef.current - mountDelayRef.current) / MOUNT_DURATION;
      mountScaleRef.current = t >= 1 ? 1 : 1 - Math.pow(1 - t, 3);
    }

    const depthOpacity = reducedMotion
      ? 0.95
      : THREE.MathUtils.lerp(0.2, 0.95, Math.max(0, facing));

    // Suavização independente de frame rate.
    const hoverTarget = hoveredRef.current ? 1.8 : 1.0;
    hoverScaleRef.current += (hoverTarget - hoverScaleRef.current) * (1 - Math.exp(-9 * dt));

    let pulseMultiplier = 1;
    if (pulseProgressRef.current >= 0) {
      // Antes: `+ 0.016 / 0.3` — 0.016 era um frame time cravado, então o
      // pulso durava 0.3s a 60Hz e 0.125s a 144Hz.
      pulseProgressRef.current = Math.min(pulseProgressRef.current + dt / PULSE_DURATION, 1);
      pulseMultiplier = 1 + 0.3 * Math.sin(pulseProgressRef.current * Math.PI);
      if (pulseProgressRef.current >= 1) pulseProgressRef.current = -1;
    }

    const t = clock.getElapsedTime() + heartbeatOffsetRef.current;
    const heartbeat = reducedMotion ? 1 : 1 + 0.08 * (0.5 + 0.5 * Math.sin((t / 2) * Math.PI * 2));

    const effectiveMountScale = reducedMotion ? 1 : mountScaleRef.current;
    visualRef.current.scale.setScalar(
      effectiveMountScale * hoverScaleRef.current * pulseMultiplier * heartbeat
    );

    // opacity é uniform simples — não precisa de needsUpdate. Setar a flag
    // versiona o material e força o three.js pelo caminho de re-resolução de
    // programa a cada frame.
    const dotMat = visualRef.current.material;
    if (dotMat) dotMat.opacity = depthOpacity * 0.95;
    const haloMat = haloRef.current?.material;
    if (haloMat) haloMat.opacity = depthOpacity * 0.15;
  });

  const open = useCallback(
    event => {
      if (!isFrontRef.current || !data) return;
      event.stopPropagation();
      document.body.style.cursor = 'pointer';
      onHover(data, getAnchor(event));
    },
    [data, onHover, getAnchor]
  );

  const close = useCallback(
    event => {
      event?.stopPropagation?.();
      document.body.style.cursor = '';
      onHover(null);
    },
    [onHover]
  );

  useEffect(() => {
    return () => {
      if (hoveredRef.current) document.body.style.cursor = '';
    };
  }, []);

  const pos = position;
  const labelPos = labelPosition || position;

  return (
    <>
      {/* raycast desligado na geometria decorativa: o R3F testa a cena
          inteira a cada pointermove. */}
      <mesh ref={haloRef} position={pos} raycast={NO_RAYCAST}>
        <ringGeometry args={[radius * 1.8, radius * 2.2, 24]} />
        <meshBasicMaterial
          color={HERO_COLORS.crimson}
          transparent
          opacity={0.15}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={visualRef} position={pos} raycast={NO_RAYCAST}>
        <sphereGeometry args={[radius, 8, 8]} />
        <meshBasicMaterial
          color={hovered ? colorHovered : color}
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </mesh>

      <mesh
        position={pos}
        onPointerOver={open}
        onPointerOut={close}
        /* onClick para touch: um tap não produz hover sustentado, então sem
           isto o DetailPanel era inalcançável em qualquer dispositivo de
           toque. onPointerMove foi removido — disparava dois passes de
           render mais um reflow síncrono por evento de ponteiro. */
        onClick={open}
      >
        <sphereGeometry args={[radius * HITBOX_MULTIPLIER, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {hovered && label && !data && (
        <Html position={labelPos} zIndexRange={[10, 0]} center>
          <div className={styles.pointLabel}>{label}</div>
        </Html>
      )}
    </>
  );
}
