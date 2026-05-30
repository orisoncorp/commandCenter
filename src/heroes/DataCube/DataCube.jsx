import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import InteractivePoint from '../shared/InteractivePoint';
import styles from './DataCube.module.css';
import { useStream } from '../../data/DataProvider';
import { calcStaggerDelay } from '../../motion/constants';

// ─── voxel grid config ────────────────────────────────────────────────────────

const GRID  = 5;          // 5×5×5 = 125 voxels
const HALF  = (GRID - 1) / 2;
const STEP  = 0.46;       // spacing between voxels (airy, not solid block)
const VOXEL_SIZE = 0.055; // visual half-size of each voxel box

// Total voxels
const TOTAL = GRID * GRID * GRID; // 125

// Flat index from (x,y,z)
function idx(x, y, z) { return x * GRID * GRID + y * GRID + z; }

// World position of voxel at grid coord (x,y,z)
function voxelPos(x, y, z) {
  return [(x - HALF) * STEP, (y - HALF) * STEP, (z - HALF) * STEP];
}

// ─── anchor configs (5 interactive voxels — hotspots) ────────────────────────
// Placed at varied grid positions so they're spread through the volume

const ANCHOR_CONFIGS = [
  { empresa: 'Acme Corp',       gridPos: [0, 4, 0] },
  { empresa: 'Beta Industries', gridPos: [4, 4, 4] },
  { empresa: 'Gamma SA',        gridPos: [4, 0, 0] },
  { empresa: 'Delta Corp',      gridPos: [0, 0, 4] },
  { empresa: 'Epsilon Ltda',    gridPos: [2, 2, 2] },
];

const ANCHOR_IDX_SET = new Set(
  ANCHOR_CONFIGS.map(a => idx(...a.gridPos))
);

const MOUNT_DELAYS = ANCHOR_CONFIGS.map((_, i) => calcStaggerDelay(i, 60));

// ─── per-voxel static data (computed once) ────────────────────────────────────

const VOXEL_META = (() => {
  // Seeded random for deterministic layout
  let s = 17;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  const baseOpacity   = new Float32Array(TOTAL); // rest opacity [0.05..0.32]
  const phase         = new Float32Array(TOTAL); // oscillation phase offset
  const period        = new Float32Array(TOTAL); // oscillation period 3..5s
  const isCrimsonHot  = new Uint8Array(TOTAL);   // ~15% crimson hotspots

  for (let i = 0; i < TOTAL; i++) {
    const isAnchor     = ANCHOR_IDX_SET.has(i);
    isCrimsonHot[i]    = isAnchor ? 1 : (r() < 0.15 ? 1 : 0);
    baseOpacity[i]     = isAnchor ? 0.82 : (isCrimsonHot[i] ? 0.28 + r() * 0.20 : 0.06 + r() * 0.24);
    phase[i]           = r() * Math.PI * 2;
    period[i]          = 3.0 + r() * 2.0;
  }

  return { baseOpacity, phase, period, isCrimsonHot };
})();

// ─── cascade wave state ───────────────────────────────────────────────────────

function makeCascadeState() {
  return {
    active:    false,
    axis:      0,    // 0=X, 1=Y, 2=Z
    slicePos:  0,    // current slice position 0..GRID-1 (float)
    nextTimer: 2.5,  // seconds until next wave
  };
}

// ─── voxel InstancedMesh ──────────────────────────────────────────────────────

function VoxelGrid({ reducedMotion, anchors, hoveredEmpresa, onHover }) {
  const meshRef  = useRef();
  const cascade  = useRef(makeCascadeState());

  // Dummy object for matrix mutation (allocated once)
  const _obj = useMemo(() => new THREE.Object3D(), []);
  const _col = useMemo(() => new THREE.Color(), []);

  // Build initial matrices (positions never change — only color/brightness)
  const { geo, mat, positions } = useMemo(() => {
    const geo = new THREE.BoxGeometry(VOXEL_SIZE * 2, VOXEL_SIZE * 2, VOXEL_SIZE * 2);
    const mat = new THREE.MeshBasicMaterial({ vertexColors: false, transparent: true });
    const positions = [];

    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        for (let z = 0; z < GRID; z++) {
          positions.push(voxelPos(x, y, z));
        }
      }
    }
    return { geo, mat, positions };
  }, []);

  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  // Set initial matrices once
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < TOTAL; i++) {
      const [px, py, pz] = positions[i];
      _obj.position.set(px, py, pz);
      _obj.scale.setScalar(1);
      _obj.updateMatrix();
      meshRef.current.setMatrixAt(i, _obj.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions, _obj]);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const cs = cascade.current;

    // ── cascade wave timing ──
    if (!reducedMotion) {
      if (!cs.active) {
        cs.nextTimer -= delta;
        if (cs.nextTimer <= 0) {
          cs.active   = true;
          cs.axis     = Math.floor(Math.random() * 3);
          cs.slicePos = 0;
          cs.nextTimer = 4.0 + Math.random() * 4.5;
        }
      } else {
        cs.slicePos += delta * 2.8; // ~1.8s to traverse GRID=5 slices
        if (cs.slicePos > GRID + 1) cs.active = false;
      }
    }

    // ── per-voxel color update ──
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        for (let z = 0; z < GRID; z++) {
          const i        = idx(x, y, z);
          const isCrimson = VOXEL_META.isCrimsonHot[i] === 1;
          const isAnchor  = ANCHOR_IDX_SET.has(i);

          // Base breathing oscillation (anchors skip — always bright)
          let opacity = VOXEL_META.baseOpacity[i];
          if (!isAnchor && !reducedMotion) {
            const wave = 0.5 + 0.5 * Math.sin(
              (t / VOXEL_META.period[i]) * Math.PI * 2 + VOXEL_META.phase[i]
            );
            const range = isCrimson ? 0.18 : 0.22;
            opacity = VOXEL_META.baseOpacity[i] * (1 - range) + VOXEL_META.baseOpacity[i] * range * wave * 2;
            opacity = Math.min(opacity, isCrimson ? 0.55 : 0.35);
          }

          // ── cascade wave boost ──
          if (!reducedMotion && cs.active) {
            const coord = cs.axis === 0 ? x : cs.axis === 1 ? y : z;
            const dist  = Math.abs(coord - cs.slicePos);
            if (dist < 1.2) {
              const boost = (1 - dist / 1.2) * 0.45;
              opacity = Math.min(opacity + boost, 0.90);
            }
          }

          // ── colour: crimson hotspots red, others offwhite ──
          if (isCrimson) {
            _col.setRGB(opacity * 0.94, opacity * 0.10, opacity * 0.10);
          } else {
            _col.setRGB(opacity * 0.91, opacity * 0.90, opacity * 0.88);
          }

          meshRef.current.setColorAt(i, _col);
        }
      }
    }

    meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geo, mat, TOTAL]}
      raycast={() => null}
    >
      <meshBasicMaterial vertexColors transparent opacity={1} depthWrite={false} />
    </instancedMesh>
  );
}

// ─── cube wireframe edges ─────────────────────────────────────────────────────

function CubeEdges() {
  const edgesGeo = useMemo(() => {
    const side = (GRID - 1) * STEP + STEP;
    const box  = new THREE.BoxGeometry(side, side, side);
    const e    = new THREE.EdgesGeometry(box);
    box.dispose();
    return e;
  }, []);

  useEffect(() => () => edgesGeo.dispose(), [edgesGeo]);

  return (
    <lineSegments geometry={edgesGeo} raycast={() => null}>
      <lineBasicMaterial color="#e8e6e1" transparent opacity={0.12} depthWrite={false} />
    </lineSegments>
  );
}

// ─── central glow ─────────────────────────────────────────────────────────────

function CoreGlow() {
  return (
    <mesh raycast={() => null}>
      <sphereGeometry args={[0.30, 24, 24]} />
      <meshBasicMaterial color="#8B1A1A" transparent opacity={0.05} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

// ─── data cube scene ──────────────────────────────────────────────────────────

function DataCubeScene({ anchors, hoveredEmpresa, onHover, reducedMotion, rotating }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current || !rotating || reducedMotion) return;
    groupRef.current.rotation.y += 0.0018;
    groupRef.current.rotation.x += 0.0006;
  });

  return (
    <group ref={groupRef}>
      <CubeEdges />
      <CoreGlow />

      <VoxelGrid
        reducedMotion={reducedMotion}
        anchors={anchors}
        hoveredEmpresa={hoveredEmpresa}
        onHover={onHover}
      />

      {anchors.map((anchor, i) => {
        const [px, py, pz] = voxelPos(...anchor.gridPos);
        const labelPos = [px, py + 0.18, pz];
        return (
          <InteractivePoint
            key={anchor.empresa}
            position={[px, py, pz]}
            posNormal={null}
            labelPosition={labelPos}
            label={anchor.empresa}
            data={anchor.contract}
            onHover={onHover}
            hovered={hoveredEmpresa === anchor.empresa}
            reducedMotion={reducedMotion}
            mountDelay={MOUNT_DELAYS[i]}
            radius={0.038}
          />
        );
      })}
    </group>
  );
}

// ─── root ─────────────────────────────────────────────────────────────────────

export default function DataCube({ onHoverContract, hoveredContract }) {
  const { table } = useStream();
  const [rotating, setRotating] = useState(true);
  const rotateResumeRef = useRef(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      camera={{ position: [0, 0, 3.4], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#0a0a0a', 1)}
    >
      <ambientLight intensity={0.03} />
      <pointLight position={[3, 3, 3]}   intensity={0.35} color="#ffffff" />
      <pointLight position={[-3, -2, -2]} intensity={0.10} color="#8B1A1A" />

      <DataCubeScene
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
