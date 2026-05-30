import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import InteractivePoint from '../shared/InteractivePoint';
import styles from './DataCube.module.css';
import { useStream } from '../../data/DataProvider';
import { calcStaggerDelay } from '../../motion/constants';

// ─── layer definitions ────────────────────────────────────────────────────────
// Three concentric wireframe cubes. Outer = macro view, core = analytical depth.

// Scale reduced ~30%: outer was 1.60 → 1.12, core was 1.00 → 0.70
const LAYERS = [
  { size: 1.12, opacity: 0.28, color: '#e8e6e1', speed: 0.0016, speedX: 0.0005 }, // outer (was mid)
  { size: 0.70, opacity: 0.55, color: '#8B1A1A', speed: 0.0036, speedX: 0.0011 }, // core crimson, faster
];

// ─── anchor configs — distributed across layers ───────────────────────────────
// Each anchor is placed at a corner of a specific layer cube.
// corners: 8 per cube, indexed 0-7 → (sign_x, sign_y, sign_z) combos.

const CORNERS = [
  [ 1,  1,  1], [-1,  1,  1], [ 1, -1,  1], [-1, -1,  1],
  [ 1,  1, -1], [-1,  1, -1], [ 1, -1, -1], [-1, -1, -1],
];

const ANCHOR_CONFIGS = [
  { empresa: 'Acme Corp',       layerIdx: 0, cornerIdx: 0 }, // outer: front-top-right
  { empresa: 'Beta Industries', layerIdx: 0, cornerIdx: 3 }, // outer: front-bottom-left
  { empresa: 'Gamma SA',        layerIdx: 0, cornerIdx: 5 }, // outer: back-top-left
  { empresa: 'Delta Corp',      layerIdx: 1, cornerIdx: 2 }, // core: front-bottom-right
  { empresa: 'Epsilon Ltda',    layerIdx: 1, cornerIdx: 0 }, // core: front-top-right
];

const MOUNT_DELAYS = ANCHOR_CONFIGS.map((_, i) => calcStaggerDelay(i, 80));

function anchorBasePos(cfg) {
  const half = LAYERS[cfg.layerIdx].size / 2;
  const [sx, sy, sz] = CORNERS[cfg.cornerIdx];
  return [sx * half, sy * half, sz * half];
}

// ─── cross-layer data particle ────────────────────────────────────────────────
// A single crimson particle that travels from core outward (or inward), reused.

function makeParticleState() {
  return { active: false, progress: 0, nextTimer: 3.0, direction: 1 }; // direction: 1=out, -1=in
}

// ─── layer wireframe cubes ────────────────────────────────────────────────────

function LayerCube({ size, color, opacity, layerRef }) {
  const geo = useMemo(() => {
    const box = new THREE.BoxGeometry(size, size, size);
    const e   = new THREE.EdgesGeometry(box);
    box.dispose();
    return e;
  }, [size]);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <lineSegments ref={layerRef} geometry={geo} raycast={() => null}>
      <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
}

// ─── cross-layer particle ─────────────────────────────────────────────────────

function CrossLayerParticle({ reducedMotion }) {
  const meshRef = useRef();
  const state   = useRef(makeParticleState());

  // Scratch vector — allocated once
  const _pos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (reducedMotion || !meshRef.current) return;
    const s = state.current;

    if (!s.active) {
      s.nextTimer -= delta;
      if (s.nextTimer <= 0) {
        s.active    = true;
        s.progress  = 0;
        s.direction = Math.random() < 0.5 ? 1 : -1;
        s.nextTimer = 4.0 + Math.random() * 3.0;
      }
      meshRef.current.visible = false;
      return;
    }

    s.progress += delta * 0.55; // ~1.8s to traverse

    if (s.progress >= 1) {
      s.active = false;
      meshRef.current.visible = false;
      return;
    }

    meshRef.current.visible = true;

    // Travel from core corner to outer corner (or reverse)
    const coreHalf  = LAYERS[1].size / 2;
    const outerHalf = LAYERS[0].size / 2;
    const t         = s.direction === 1 ? s.progress : 1 - s.progress;

    _pos.current.set(
      THREE.MathUtils.lerp(coreHalf, outerHalf, t),
      THREE.MathUtils.lerp(coreHalf, outerHalf, t),
      THREE.MathUtils.lerp(coreHalf, outerHalf, t),
    );
    meshRef.current.position.copy(_pos.current);

    // Fade in/out at ends
    const fade = Math.min(s.progress * 4, 1) * Math.min((1 - s.progress) * 4, 1);
    meshRef.current.material.opacity = fade * 0.9;
    const sc = 1 + fade * 0.6;
    meshRef.current.scale.setScalar(sc);
  });

  return (
    <mesh ref={meshRef} visible={false} raycast={() => null}>
      <sphereGeometry args={[0.025, 6, 6]} />
      <meshBasicMaterial color="#F06070" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

// ─── connection lines between corresponding corners across layers ──────────────

function CrossLayerLines() {
  // Connect 4 corners of outer layer to corresponding corners of core
  const geo = useMemo(() => {
    const pairs = [];
    const connCorners = [0, 2, 5, 7];
    for (const ci of connCorners) {
      const [sx, sy, sz] = CORNERS[ci];
      const hA = LAYERS[0].size / 2;
      const hB = LAYERS[1].size / 2;
      pairs.push(
        sx * hA, sy * hA, sz * hA,
        sx * hB, sy * hB, sz * hB,
      );
    }
    const buf = new Float32Array(pairs);
    const g   = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(buf, 3));
    return g;
  }, []);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <lineSegments geometry={geo} raycast={() => null}>
      <lineBasicMaterial color="#e8e6e1" transparent opacity={0.07} depthWrite={false} />
    </lineSegments>
  );
}

// ─── core glow ────────────────────────────────────────────────────────────────

function CoreGlow({ reducedMotion }) {
  const matRef  = useRef();
  const baseOp  = 0.06;

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    if (reducedMotion) { matRef.current.opacity = baseOp; return; }
    const t  = clock.getElapsedTime();
    const p  = 0.5 + 0.5 * Math.sin((t / 2.5) * Math.PI * 2);
    matRef.current.opacity = baseOp * (0.7 + 0.6 * p);
  });

  return (
    <mesh raycast={() => null}>
      <sphereGeometry args={[0.20, 20, 20]} />
      <meshBasicMaterial ref={matRef} color="#8B1A1A" transparent opacity={baseOp} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

// ─── nested cube scene ────────────────────────────────────────────────────────

function NestedCubeScene({ anchors, hoveredEmpresa, onHover, reducedMotion, rotating }) {
  const groupRef  = useRef();
  const layerRefs = useRef(LAYERS.map(() => ({ current: null })));

  // Base rotation state (written in useFrame — no state update)
  const rotState = useRef({ y: 0, x: 0 });

  // Per-anchor world positions — recomputed when layers rotate (needs ref to groups)
  // Anchor positions are computed in world space by the layer group's rotation.
  // We store 3 group refs (one per layer) to read their current matrix.
  const layerGroupRefs = useRef([null, null]);

  // Scratch vector for anchor position calc
  const _anchorScratch = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!reducedMotion && rotating) {
      // Global slow rotation of the whole structure
      groupRef.current.rotation.y += 0.0012;
      groupRef.current.rotation.x += 0.0003;

      // Differential per-layer rotation
      for (let li = 0; li < layerGroupRefs.current.length; li++) {
        const gr = layerGroupRefs.current[li];
        if (!gr) continue;
        gr.rotation.y += LAYERS[li].speed;
        gr.rotation.x += LAYERS[li].speedX;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <CoreGlow reducedMotion={reducedMotion} />
      <CrossLayerLines />
      <CrossLayerParticle reducedMotion={reducedMotion} />

      {LAYERS.map((layer, li) => (
        <group key={li} ref={el => { layerGroupRefs.current[li] = el; }}>
          <LayerCube
            size={layer.size}
            color={layer.color}
            opacity={layer.opacity}
          />

          {/* Anchors belonging to this layer */}
          {anchors
            .map((anchor, i) => ({ anchor, i }))
            .filter(({ anchor }) => anchor.layerIdx === li)
            .map(({ anchor, i }) => {
              const [bx, by, bz] = anchorBasePos(anchor);
              const labelPos = [bx * 1.08, by * 1.08 + 0.10, bz * 1.08];
              return (
                <InteractivePoint
                  key={anchor.empresa}
                  position={[bx, by, bz]}
                  posNormal={null}
                  labelPosition={labelPos}
                  label={anchor.empresa}
                  data={anchor.contract}
                  onHover={onHover}
                  hovered={hoveredEmpresa === anchor.empresa}
                  reducedMotion={reducedMotion}
                  mountDelay={MOUNT_DELAYS[i]}
                  radius={li === 1 ? 0.044 : 0.036}
                />
              );
            })
          }
        </group>
      ))}
    </group>
  );
}

// ─── root ─────────────────────────────────────────────────────────────────────

export default function DataCube({ onHoverContract, hoveredContract }) {
  const { table } = useStream();
  const [rotating, setRotating] = useState(true);
  const rotateResumeRef = useRef(null);
  const reducedMotion = false; // live monitoring display — animations are core

  const anchors = useMemo(() => ANCHOR_CONFIGS.map(cfg => ({
    ...cfg,
    contract: table?.find(r => r.empresa === cfg.empresa) || null,
  })), [table]);

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
      camera={{ position: [0, 0, 2.6], fov: 38, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#0a0a0a', 1)}
    >
      <ambientLight intensity={0.03} />
      <pointLight position={[3, 3, 3]}   intensity={0.35} color="#ffffff" />
      <pointLight position={[-3, -2, -2]} intensity={0.10} color="#8B1A1A" />

      <NestedCubeScene
        anchors={anchors}
        hoveredEmpresa={hoveredContract?.empresa || null}
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
