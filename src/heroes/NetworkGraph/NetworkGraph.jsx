import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import styles from './NetworkGraph.module.css';
import { useStream } from '../../data/contexts';
import { calcStaggerDelay } from '../../motion/constants';
import { usePrefersReducedMotion } from '../../motion/usePrefersReducedMotion';
import { CANVAS_GL, CANVAS_DPR, applyClearColor, HERO_COLORS, HERO_THREE_COLORS } from '../palette';

const ROTATION_SPEED = 0.108; // rad/s

// ─── topology: Hub Radial ─────────────────────────────────────────────────────
// Index 0 = hub (center). Indices 1-5 = satellites in true 3D volume.
// Satellite positions use spherical coords to avoid planar projection collapse.

const ORBITAL_R = 0.82;

function spherical(theta, phi) {
  return [
    ORBITAL_R * Math.sin(phi) * Math.cos(theta),
    ORBITAL_R * Math.cos(phi),
    ORBITAL_R * Math.sin(phi) * Math.sin(theta),
  ];
}

// Hub first, then 5 satellites — spread across elevation angles
const HUB_IDX = 0;
const NODE_DATA = [
  { id: 'hub',     empresa: 'Orison Core',     position: [0, 0, 0],                        isHub: true  },
  { id: 'acme',    empresa: 'Acme Corp',        position: spherical(0.40, 1.05),             isHub: false },
  { id: 'beta',    empresa: 'Beta Industries',  position: spherical(1.80, 0.72),             isHub: false },
  { id: 'gamma',   empresa: 'Gamma SA',         position: spherical(3.30, 1.30),             isHub: false },
  { id: 'delta',   empresa: 'Delta Corp',       position: spherical(4.70, 0.55),             isHub: false },
  { id: 'epsilon', empresa: 'Epsilon Ltda',     position: spherical(5.80, 1.55),             isHub: false },
];

// Radial edges: each satellite → hub
const SATELLITE_INDICES = [1, 2, 3, 4, 5];
const EDGES = SATELLITE_INDICES.map(si => [si, HUB_IDX]); // [satIdx, hubIdx]

const MOUNT_DELAYS = NODE_DATA.map((_, i) => calcStaggerDelay(i, 70));

// Bézier midpoint pulled outward from origin for curvature
function bezierMid(posA, posB, pull = 0.22) {
  const mx = (posA[0] + posB[0]) / 2;
  const my = (posA[1] + posB[1]) / 2;
  const mz = (posA[2] + posB[2]) / 2;
  const len = Math.hypot(mx, my, mz) || 1;
  return [mx + (mx / len) * pull, my + (my / len) * pull, mz + (mz / len) * pull];
}

const EDGE_MIDS = EDGES.map(([si]) => bezierMid(NODE_DATA[si].position, NODE_DATA[HUB_IDX].position));

// Drift params for satellites only (hub stays fixed)
const SAT_DRIFT = SATELLITE_INDICES.map((_, i) => ({
  phaseX: i * 1.41,  phaseY: i * 2.09,  phaseZ: i * 0.87,
  freqX:  0.25 + i * 0.06,
  freqY:  0.19 + i * 0.05,
  freqZ:  0.28 + i * 0.07,
  amp: 0.025,
}));

// ─── edge line (curved, no raycasting) ───────────────────────────────────────

const EDGE_SEGMENTS = 28;

function buildEdgeGeo(posA, posB, mid) {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...posA),
    new THREE.Vector3(...mid),
    new THREE.Vector3(...posB),
  );
  return new THREE.BufferGeometry().setFromPoints(curve.getPoints(EDGE_SEGMENTS));
}

function EdgeLine({ satIdx, highlighted }) {
  const matRef     = useRef();
  const opacityRef = useRef(0.12);

  const geometry = useMemo(
    () => buildEdgeGeo(NODE_DATA[satIdx].position, NODE_DATA[HUB_IDX].position, EDGE_MIDS[satIdx - 1]),
    [satIdx],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const wasHighlighted = useRef(null);
  useFrame((_, delta) => {
    if (!matRef.current) return;
    const dt = Math.min(delta, 0.1);
    const target = highlighted ? 0.42 : 0.12;
    opacityRef.current += (target - opacityRef.current) * (1 - Math.exp(-8 * dt));
    matRef.current.opacity = opacityRef.current;
    // Antes: color.set('<string>') a cada frame para as 5 arestas — 300
    // parses de string CSS por segundo, todos com resultado idêntico.
    if (wasHighlighted.current !== highlighted) {
      wasHighlighted.current = highlighted;
      matRef.current.color.copy(
        highlighted ? HERO_THREE_COLORS.crimson : HERO_THREE_COLORS.offwhite
      );
    }
  });

  return (
    <line geometry={geometry} raycast={() => null}>
      <lineBasicMaterial ref={matRef} color={HERO_COLORS.offwhite} transparent opacity={0.12} depthWrite={false} />
    </line>
  );
}

// ─── data particles (bidirectional, one per edge slot) ───────────────────────
// Each radial edge gets an independent particle slot. They depart hub→sat or
// sat→hub alternately, creating bidirectional data-flow feel.

const NUM_PARTICLES = SATELLITE_INDICES.length; // one slot per edge

function EdgeParticles({ driftedSatPositions }) {
  const meshRefs = useRef(Array.from({ length: NUM_PARTICLES }, () => null));

  // Per-particle state — stored in refs, zero React involvement
  const states = useRef(
    SATELLITE_INDICES.map((_, i) => ({
      t:          0,
      active:     false,
      direction:  1,           // 1 = hub→sat, -1 = sat→hub
      waitTimer:  1.2 + i * 0.9, // staggered initial departure
    }))
  );

  // Scratch vectors — allocated once
  const _a  = useRef(new THREE.Vector3());
  const _m  = useRef(new THREE.Vector3());
  const _b  = useRef(new THREE.Vector3());
  const _p  = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const s    = states.current[i];
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      if (!s.active) {
        s.waitTimer -= delta;
        mesh.visible = false;
        if (s.waitTimer <= 0) {
          s.active    = true;
          s.t         = 0;
          s.direction = Math.random() < 0.5 ? 1 : -1;
          s.speed = 0.30 + Math.random() * 0.05;
        }
        continue;
      }

      // A velocidade é sorteada uma vez na partida, não a cada frame.
      s.t += delta * s.speed;
      if (s.t >= 1) {
        s.active    = false;
        s.waitTimer = 1.8 + Math.random() * 2.8;
        mesh.visible = false;
        continue;
      }

      // Bézier endpoints depend on direction
      const satPos = driftedSatPositions.current[i]; // [x,y,z]
      const hubPos = [0, 0, 0];
      const mid    = EDGE_MIDS[i];

      if (s.direction === 1) {
        // hub → satellite
        _a.current.set(...hubPos);
        _m.current.set(...mid);
        _b.current.set(...satPos);
      } else {
        // satellite → hub
        _a.current.set(...satPos);
        _m.current.set(...mid);
        _b.current.set(...hubPos);
      }

      const t = s.t, it = 1 - t;
      _p.current.set(
        it * it * _a.current.x + 2 * it * t * _m.current.x + t * t * _b.current.x,
        it * it * _a.current.y + 2 * it * t * _m.current.y + t * t * _b.current.y,
        it * it * _a.current.z + 2 * it * t * _m.current.z + t * t * _b.current.z,
      );
      mesh.position.copy(_p.current);
      mesh.visible = true;
    }
  });

  return (
    <>
      {SATELLITE_INDICES.map((_, i) => (
        <mesh
          key={i}
          ref={el => { meshRefs.current[i] = el; }}
          visible={false}
          raycast={() => null}
        >
          <sphereGeometry args={[0.013, 6, 6]} />
          <meshBasicMaterial color={HERO_COLORS.crimsonBright} transparent opacity={0.88} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

// ─── network node ─────────────────────────────────────────────────────────────
// hitbox: depthTest=false + renderOrder=999 → hittable from ANY angle (360° fix)
// edges: raycast={() => null} → lines never intercept pointer events

function NetworkNode({
  nodeIdx, position, data,
  onHover, hovered, reducedMotion, mountDelay,
  mrrRadius, isHub,
}) {
  const visualRef = useRef();
  const haloRef   = useRef();

  const [mountScale, setMountScale] = useState(reducedMotion ? 1 : 0);
  const hoverScaleRef   = useRef(1);
  const hoveredRef      = useRef(false);
  const heartbeatOffRef = useRef(nodeIdx * 0.73 + 0.2);
  const worldPosRef     = useRef(new THREE.Vector3());

  useEffect(() => { hoveredRef.current = hovered; }, [hovered]);

  useEffect(() => {
    if (reducedMotion) return;
    let raf;
    const timer = setTimeout(() => {
      const start = performance.now();
      const animate = (now) => {
        const t = Math.min((now - start) / 400, 1);
        setMountScale(1 - Math.pow(1 - t, 3));
        if (t < 1) raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
    }, mountDelay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [reducedMotion, mountDelay]);

  useFrame(({ clock, camera }) => {
    if (!visualRef.current) return;

    visualRef.current.getWorldPosition(worldPosRef.current);
    const dist      = worldPosRef.current.distanceTo(camera.position);
    const depthFade = reducedMotion ? 0.95 : THREE.MathUtils.clamp(1.45 - dist * 0.22, 0.22, 0.95);

    const hoverTarget = hoveredRef.current ? 1.8 : 1.0;
    hoverScaleRef.current += (hoverTarget - hoverScaleRef.current) * 0.14;

    const t = clock.getElapsedTime() + heartbeatOffRef.current;
    const heartbeat = reducedMotion ? 1 : 1 + 0.08 * (0.5 + 0.5 * Math.sin((t / 2) * Math.PI * 2));

    const s = (reducedMotion ? 1 : mountScale) * hoverScaleRef.current * heartbeat;
    visualRef.current.scale.setScalar(s);

    const dotMat = visualRef.current.material;
    if (dotMat) {
      const next = depthFade * 0.95;
      dotMat.opacity = next;
    }
    const haloMat = haloRef.current?.material;
    if (haloMat) {
      const next = depthFade * (isHub ? 0.22 : 0.18);
      haloMat.opacity = next;
    }
  });

  const getAnchor = useCallback((event) => {
    const source = event?.sourceEvent || event?.nativeEvent || event;
    if (source?.clientX != null && source?.clientY != null) return { x: source.clientX, y: source.clientY };
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    if (rect) return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    return null;
  }, []);

  const handleEnter = useCallback((event) => {
    event.stopPropagation();
    if (!data) return;
    document.body.style.cursor = 'pointer';
    onHover(data, getAnchor(event));
  }, [data, onHover, getAnchor]);

  const handleLeave = useCallback((event) => {
    event.stopPropagation();
    document.body.style.cursor = '';
    onHover(null);
  }, [onHover]);

  useEffect(() => () => { if (hoveredRef.current) document.body.style.cursor = ''; }, []);

  const haloInner = mrrRadius * (isHub ? 1.6 : 1.8);
  const haloOuter = mrrRadius * (isHub ? 2.2 : 2.4);
  const hitboxR   = mrrRadius * 4.5;

  return (
    <>
      <mesh ref={haloRef} position={position} raycast={() => null}>
        <ringGeometry args={[haloInner, haloOuter, 28]} />
        <meshBasicMaterial color={HERO_COLORS.crimson} transparent opacity={isHub ? 0.22 : 0.18} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={visualRef} position={position} raycast={() => null}>
        <sphereGeometry args={[mrrRadius, 12, 12]} />
        <meshBasicMaterial color={hovered ? HERO_COLORS.crimsonBright : HERO_COLORS.dataPoint} transparent opacity={0.95} />
      </mesh>

      {/* depthTest=false + renderOrder=999: hitbox always on top of depth buffer */}
      <mesh position={position} onPointerOver={handleEnter} onPointerOut={handleLeave} renderOrder={999}>
        <sphereGeometry args={[hitboxR, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
      </mesh>
    </>
  );
}

// ─── central glow (hub presence) ─────────────────────────────────────────────

function HubGlow() {
  return (
    <>
      {/* Wide ambient glow */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.70, 32, 32]} />
        <meshBasicMaterial color={HERO_COLORS.crimson} transparent opacity={0.04} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Tighter core glow */}
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color={HERO_COLORS.crimson} transparent opacity={0.06} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </>
  );
}

// ─── network scene ────────────────────────────────────────────────────────────

function NetworkScene({ nodes, hoveredId, onHover, reducedMotion, rotating }) {
  const groupRef = useRef();

  // Içado para fora do corpo do .map(): antes era recalculado uma vez por
  // nó, a cada render.
  const maxMrr = useMemo(
    () => Math.max(...nodes.filter(n => !n.isHub).map(n => n.contract?.mrr || 0), 1),
    [nodes]
  );

  // Satellite world positions (drifted) — mutated in-place, read by EdgeParticles
  const driftedSatPositions = useRef(
    SATELLITE_INDICES.map(si => [...NODE_DATA[si].position])
  );

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    if (!reducedMotion && rotating) {
      groupRef.current.rotation.y += ROTATION_SPEED * Math.min(delta, 0.1);
    }

    if (!reducedMotion) {
      const t = clock.getElapsedTime();
      for (let i = 0; i < SATELLITE_INDICES.length; i++) {
        const si  = SATELLITE_INDICES[i];
        const d   = SAT_DRIFT[i];
        const p   = NODE_DATA[si].position;
        driftedSatPositions.current[i][0] = p[0] + d.amp * Math.sin(t * d.freqX + d.phaseX);
        driftedSatPositions.current[i][1] = p[1] + d.amp * Math.sin(t * d.freqY + d.phaseY);
        driftedSatPositions.current[i][2] = p[2] + d.amp * Math.sin(t * d.freqZ + d.phaseZ);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <HubGlow />

      {/* Radial edges */}
      {SATELLITE_INDICES.map((si) => (
        <EdgeLine
          key={si}
          satIdx={si}
          highlighted={hoveredId === NODE_DATA[si].id || hoveredId === NODE_DATA[HUB_IDX].id}
        />
      ))}

      {/* Bidirectional data particles */}
      <EdgeParticles driftedSatPositions={driftedSatPositions} />

      {/* All nodes (hub + satellites) */}
      {nodes.map((node, i) => {
        const mrr      = node.contract?.mrr || 0;
        const mrrRatio = node.isHub ? 1 : mrr / maxMrr;
        // Hub: fixed prominent size; satellites: 0.026→0.048 range
        const mrrRadius = node.isHub ? 0.058 : (0.026 + mrrRatio * 0.022);

        return (
          <NetworkNode
            key={node.id}
            nodeIdx={i}
            position={NODE_DATA[i].position}
            empresa={node.empresa}
            data={node.contract}
            onHover={onHover}
            hovered={hoveredId === node.id}
            reducedMotion={reducedMotion}
            mountDelay={MOUNT_DELAYS[i]}
            mrrRadius={mrrRadius}
            isHub={node.isHub}
          />
        );
      })}
    </group>
  );
}

// ─── root ─────────────────────────────────────────────────────────────────────

export default function NetworkGraph({ onHoverContract, hoveredContract }) {
  const { table } = useStream();
  const [rotating, setRotating] = useState(true);
  const rotateResumeRef = useRef(null);
  // A instrumentação já existia e estava ligada; só o interruptor
  // estava cravado em false.
  const reducedMotion = usePrefersReducedMotion();

  // Hub gets no contract — it's the system core, not a client
  const nodes = useMemo(() => NODE_DATA.map(node => ({
    ...node,
    contract: node.isHub ? null : (table?.find(r => r.empresa === node.empresa) || null),
  })), [table]);

  const hoveredId = useMemo(() => {
    if (!hoveredContract) return null;
    return NODE_DATA.find(n => n.empresa === hoveredContract.empresa)?.id || null;
  }, [hoveredContract]);

  const pauseRotation = useCallback(() => {
    if (rotateResumeRef.current) clearTimeout(rotateResumeRef.current);
    setRotating(false);
  }, []);

  const resumeRotation = useCallback(() => {
    if (rotateResumeRef.current) clearTimeout(rotateResumeRef.current);
    if (reducedMotion) return;
    rotateResumeRef.current = setTimeout(() => setRotating(true), 900);
  }, [reducedMotion]);

  const handleHover = useCallback((contract, anchor) => {
    if (contract) {
      pauseRotation();
      onHoverContract(contract, anchor);
    } else {
      onHoverContract(null);
      resumeRotation();
    }
  }, [onHoverContract, pauseRotation, resumeRotation]);

  useEffect(() => {
    return () => { if (rotateResumeRef.current) clearTimeout(rotateResumeRef.current); };
  }, []);

  return (
    <Canvas
      className={styles.canvas}
      camera={{ position: [0, 0, 2.8], fov: 40, near: 0.1, far: 100 }}
      gl={CANVAS_GL}
      dpr={CANVAS_DPR}
      /* `flat` desliga o ACES tone mapping default do R3F — sem ele a
         cor autorada em JS não bate com o mesmo token no CSS. */
      flat
      onCreated={({ gl }) => applyClearColor(gl)}
    >
      {/* Luzes removidas: todo material aqui é não-iluminado
          (MeshBasic/LineBasic/Points), então elas custavam travessia de
          grafo por frame para contribuir zero pixel. */}

      <NetworkScene
        nodes={nodes}
        hoveredId={hoveredId}
        onHover={handleHover}
        reducedMotion={reducedMotion}
        rotating={rotating}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        onStart={pauseRotation}
        onEnd={resumeRotation}
        makeDefault
      />
    </Canvas>
  );
}
