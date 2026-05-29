import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import InteractivePoint from '../shared/InteractivePoint';
import styles from './ParticleStream.module.css';
import { useStream } from '../../data/DataProvider';
import { calcStaggerDelay } from '../../motion/constants';

// ─── constants ────────────────────────────────────────────────────────────────

const PARTICLE_COUNT   = 420;   // denser than before — fills the helix nicely
const CRIMSON_FRACTION = 0.08;  // ~34 fast/accent particles
const HELIX_RADIUS     = 0.72;  // XZ radius of the spiral
const HELIX_HEIGHT     = 2.2;   // total vertical travel (bottom → top)
const HELIX_TURNS      = 3.5;   // number of full rotations along the height
const BASE_SPEED       = 0.055; // parameter units per second (upward advance)

// Pre-computed seeded randoms — called once, outside render
function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}
const rand = seededRandom(42);

// ─── helix path ───────────────────────────────────────────────────────────────

// t ∈ [0, 1) maps linearly along the ascending helix
function helixPos(t) {
  const angle = t * Math.PI * 2 * HELIX_TURNS;
  const y     = (t - 0.5) * HELIX_HEIGHT;
  return [
    HELIX_RADIUS * Math.cos(angle),
    y,
    HELIX_RADIUS * Math.sin(angle),
  ];
}

// Tangent direction at t (normalized) — used for depth-fade direction
function helixTangent(t) {
  const dt  = 0.001;
  const [x0, y0, z0] = helixPos(t);
  const [x1, y1, z1] = helixPos((t + dt) % 1);
  const len = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
  return [(x1 - x0) / len, (y1 - y0) / len, (z1 - z0) / len];
}

// ─── anchor data ──────────────────────────────────────────────────────────────

// Distribute anchor points evenly along the helix
const ANCHOR_DATA = [
  { id: 'acme',    empresa: 'Acme Corp',       t: 0.08 },
  { id: 'beta',    empresa: 'Beta Industries',  t: 0.28 },
  { id: 'gamma',   empresa: 'Gamma SA',         t: 0.48 },
  { id: 'delta',   empresa: 'Delta Corp',       t: 0.68 },
  { id: 'epsilon', empresa: 'Epsilon Ltda',     t: 0.88 },
];

const MOUNT_DELAYS = ANCHOR_DATA.map((_, i) => calcStaggerDelay(i, 80));

// Pre-compute anchor world positions (static)
const ANCHOR_POSITIONS = ANCHOR_DATA.map(a => helixPos(a.t));

// ─── particle field ───────────────────────────────────────────────────────────

function ParticleField({ reducedMotion, anchors, hoveredId }) {
  const pointsRef       = useRef();
  const trailPointsRef  = useRef();

  // Pre-allocate all buffers — never reallocated
  const bufs = useMemo(() => {
    const positions   = new Float32Array(PARTICLE_COUNT * 3);
    const colors      = new Float32Array(PARTICLE_COUNT * 3);
    const sizes       = new Float32Array(PARTICLE_COUNT);
    const offsets     = new Float32Array(PARTICLE_COUNT);
    const speeds      = new Float32Array(PARTICLE_COUNT);
    const radii       = new Float32Array(PARTICLE_COUNT); // per-particle radius variation
    const isCrimsonBuf = new Uint8Array(PARTICLE_COUNT);

    const crimsonColor  = new THREE.Color('#8B1A1A');
    const accentColor   = new THREE.Color('#F06070');
    const offwhiteColor = new THREE.Color('#e8e6e1');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      offsets[i]     = i / PARTICLE_COUNT;           // evenly distributed around helix
      const isCrimson = i < PARTICLE_COUNT * CRIMSON_FRACTION;
      isCrimsonBuf[i] = isCrimson ? 1 : 0;

      // Crimson particles are brighter/redder
      const c = isCrimson ? accentColor : offwhiteColor;
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      // Crimson particles are larger and faster
      sizes[i]  = isCrimson ? 4.2 : (1.2 + rand() * 2.0);
      speeds[i] = isCrimson ? BASE_SPEED * 1.65 : BASE_SPEED * (0.75 + rand() * 0.5);

      // Radial jitter: slight scatter off the exact helix path
      radii[i]  = HELIX_RADIUS + (rand() - 0.5) * 0.22;

      const [x, y, z] = helixPos(offsets[i]);
      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return { positions, colors, sizes, offsets, speeds, radii, isCrimsonBuf };
  }, []);

  // Trail layer: copies of crimson particle positions slightly behind in t
  const CRIMSON_COUNT = Math.floor(PARTICLE_COUNT * CRIMSON_FRACTION);
  const trailBufs = useMemo(() => {
    const TRAIL_STEPS = 4;
    const count = CRIMSON_COUNT * TRAIL_STEPS;
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const sizes     = new Float32Array(count);
    return { positions, colors, sizes, TRAIL_STEPS };
  }, [CRIMSON_COUNT]);

  const geoMain = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(bufs.positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(bufs.colors, 3));
    g.setAttribute('size',     new THREE.BufferAttribute(bufs.sizes, 1));
    return g;
  }, [bufs]);

  const geoTrail = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(trailBufs.positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(trailBufs.colors, 3));
    g.setAttribute('size',     new THREE.BufferAttribute(trailBufs.sizes, 1));
    return g;
  }, [trailBufs]);

  useEffect(() => () => { geoMain.dispose(); geoTrail.dispose(); }, [geoMain, geoTrail]);

  // Scratch vectors — allocated once, reused every frame (zero GC)
  const _camPos  = useRef(new THREE.Vector3());
  const _partPos = useRef(new THREE.Vector3());

  useFrame(({ clock, camera }) => {
    if (reducedMotion || !pointsRef.current) return;

    const elapsed  = clock.getElapsedTime();
    const posAttr  = geoMain.attributes.position;
    const sizeAttr = geoMain.attributes.size;
    const colAttr  = geoMain.attributes.color;

    _camPos.current.copy(camera.position);

    // ── find any hovered anchor position for glow ──
    let hoverX = 0, hoverY = 0, hoverZ = 0, hasHover = false;
    if (hoveredId) {
      const hi = ANCHOR_DATA.findIndex(a => a.id === hoveredId);
      if (hi >= 0) {
        [hoverX, hoverY, hoverZ] = ANCHOR_POSITIONS[hi];
        hasHover = true;
      }
    }

    let trailIdx = 0;
    const { TRAIL_STEPS } = trailBufs;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isCrimson = bufs.isCrimsonBuf[i] === 1;
      const phase     = (bufs.offsets[i] + elapsed * bufs.speeds[i]) % 1;
      const angle     = phase * Math.PI * 2 * HELIX_TURNS;
      const y         = (phase - 0.5) * HELIX_HEIGHT;
      const r         = bufs.radii[i];

      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);

      posAttr.array[i * 3]     = x;
      posAttr.array[i * 3 + 1] = y;
      posAttr.array[i * 3 + 2] = z;

      // Depth fade: particles closer to camera are brighter/larger
      _partPos.current.set(x, y, z);
      const dist  = _partPos.current.distanceTo(_camPos.current);
      const depthFade = THREE.MathUtils.clamp(1 - (dist - 1.5) / 3.0, 0.25, 1.0);

      // Glow when near hovered anchor
      let glowBoost = 1.0;
      if (hasHover && isCrimson) {
        const dx = x - hoverX, dy = y - hoverY, dz = z - hoverZ;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 0.4) glowBoost = 1 + (1 - d2 / 0.4) * 1.2;
      }

      const baseSize = bufs.sizes[i];
      sizeAttr.array[i] = baseSize * depthFade * glowBoost;

      // Color: depth-fade offwhite dims to slightly warm gray; crimson dims to dark red
      if (isCrimson) {
        colAttr.array[i * 3]     = THREE.MathUtils.lerp(0.35, 0.94, depthFade * glowBoost);
        colAttr.array[i * 3 + 1] = THREE.MathUtils.lerp(0.03, 0.38, depthFade);
        colAttr.array[i * 3 + 2] = THREE.MathUtils.lerp(0.03, 0.44, depthFade);
      } else {
        const v = 0.55 + depthFade * 0.35;
        colAttr.array[i * 3]     = v * 0.91;
        colAttr.array[i * 3 + 1] = v * 0.90;
        colAttr.array[i * 3 + 2] = v * 0.88;
      }

      // Trail: write TRAIL_STEPS ghost positions behind crimson particles
      if (isCrimson) {
        for (let s = 1; s <= TRAIL_STEPS; s++) {
          const tp     = ((phase - s * 0.008) + 1) % 1;
          const tAngle = tp * Math.PI * 2 * HELIX_TURNS;
          const ty     = (tp - 0.5) * HELIX_HEIGHT;
          const tx     = r * Math.cos(tAngle);
          const tz     = r * Math.sin(tAngle);
          const fade   = (1 - s / (TRAIL_STEPS + 1)) * depthFade;

          trailBufs.positions[trailIdx * 3]     = tx;
          trailBufs.positions[trailIdx * 3 + 1] = ty;
          trailBufs.positions[trailIdx * 3 + 2] = tz;
          trailBufs.colors[trailIdx * 3]         = 0.55 * fade;
          trailBufs.colors[trailIdx * 3 + 1]     = 0.1  * fade;
          trailBufs.colors[trailIdx * 3 + 2]     = 0.1  * fade;
          trailBufs.sizes[trailIdx]              = 1.8  * fade;
          trailIdx++;
        }
      }
    }

    posAttr.needsUpdate  = true;
    sizeAttr.needsUpdate = true;
    colAttr.needsUpdate  = true;

    const tp = geoTrail.attributes.position;
    const ts = geoTrail.attributes.size;
    const tc = geoTrail.attributes.color;
    tp.array.set(trailBufs.positions);
    ts.array.set(trailBufs.sizes);
    tc.array.set(trailBufs.colors);
    tp.needsUpdate = true;
    ts.needsUpdate = true;
    tc.needsUpdate = true;
  });

  return (
    <>
      {/* Main particle stream */}
      <points ref={pointsRef} geometry={geoMain}>
        <pointsMaterial
          vertexColors
          size={0.028}
          sizeAttenuation
          transparent
          opacity={0.62}
          depthWrite={false}
        />
      </points>

      {/* Crimson trail layer */}
      <points ref={trailPointsRef} geometry={geoTrail}>
        <pointsMaterial
          vertexColors
          size={0.018}
          sizeAttenuation
          transparent
          opacity={0.38}
          depthWrite={false}
        />
      </points>
    </>
  );
}

// ─── helix guide line ─────────────────────────────────────────────────────────
// Subtle wireframe guide that reveals the path structure

function HelixGuide() {
  const geo = useMemo(() => {
    const STEPS = 200;
    const verts = new Float32Array(STEPS * 3);
    for (let i = 0; i < STEPS; i++) {
      const [x, y, z] = helixPos(i / STEPS);
      verts[i * 3]     = x;
      verts[i * 3 + 1] = y;
      verts[i * 3 + 2] = z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    return g;
  }, []);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <line geometry={geo}>
      <lineBasicMaterial color="#e8e6e1" transparent opacity={0.04} depthWrite={false} />
    </line>
  );
}

// ─── stream scene ─────────────────────────────────────────────────────────────

function StreamScene({ anchors, hoveredId, onHover, reducedMotion, rotating }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current || !rotating || reducedMotion) return;
    groupRef.current.rotation.y += 0.0012; // slow Y drift
  });

  return (
    <group ref={groupRef}>
      <HelixGuide />
      <ParticleField reducedMotion={reducedMotion} anchors={anchors} hoveredId={hoveredId} />

      {anchors.map((anchor, i) => {
        const [ax, ay, az] = ANCHOR_POSITIONS[i];
        // Label floats slightly outward from helix radius
        const labelPos = [ax * 1.22, ay + 0.12, az * 1.22];
        return (
          <InteractivePoint
            key={anchor.id}
            position={[ax, ay, az]}
            posNormal={null}
            labelPosition={labelPos}
            label={anchor.empresa}
            data={anchor.contract}
            onHover={onHover}
            hovered={hoveredId === anchor.id}
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

export default function ParticleStream({ onHoverContract, hoveredContract }) {
  const { table } = useStream();
  const [rotating, setRotating] = useState(true);
  const rotateResumeRef = useRef(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const anchors = useMemo(() => ANCHOR_DATA.map(a => ({
    ...a,
    contract: table?.find(r => r.empresa === a.empresa) || null,
  })), [table]);

  const hoveredId = useMemo(() => {
    if (!hoveredContract) return null;
    return ANCHOR_DATA.find(a => a.empresa === hoveredContract.empresa)?.id || null;
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
      camera={{ position: [0, 0, 3.6], fov: 38, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#0a0a0a', 1)}
    >
      <ambientLight intensity={0.02} />
      <pointLight position={[2, 3, 2]}   intensity={0.28} color="#ffffff" />
      <pointLight position={[-2, -3, -2]} intensity={0.10} color="#8B1A1A" />
      {/* Subtle rim from above to pick out top of helix */}
      <directionalLight position={[0, 4, 1]} intensity={0.12} color="#e8e6e1" />

      <StreamScene
        anchors={anchors}
        hoveredId={hoveredId}
        onHover={handleHover}
        reducedMotion={reducedMotion}
        rotating={rotating}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.45}
        onStart={pauseRotation}
        onEnd={resumeRotation}
        makeDefault
      />
    </Canvas>
  );
}
