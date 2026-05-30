import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import InteractivePoint from '../shared/InteractivePoint';
import styles from './ParticleStream.module.css';
import { useStream } from '../../data/DataProvider';
import { calcStaggerDelay } from '../../motion/constants';

// ─── ribbon definitions ───────────────────────────────────────────────────────
// Each ribbon is a horizontal streamline at a fixed (y_base, z) with sine undulation.
// depth: 0=front, 1=back — drives opacity and size scaling.

const RIBBONS = [
  { y: -0.70, z:  0.30, phase: 0.00, freq: 0.55, amp: 0.10, speed: 1.00, density: 1.3, depth: 0.15 },
  { y: -0.28, z:  0.10, phase: 1.10, freq: 0.42, amp: 0.12, speed: 0.88, density: 1.6, depth: 0.05 },
  { y:  0.08, z: -0.20, phase: 2.30, freq: 0.60, amp: 0.09, speed: 1.12, density: 1.4, depth: 0.30 },
  { y:  0.40, z:  0.40, phase: 0.70, freq: 0.38, amp: 0.14, speed: 0.75, density: 1.0, depth: 0.10 },
  { y:  0.68, z: -0.40, phase: 1.80, freq: 0.50, amp: 0.08, speed: 0.95, density: 0.8, depth: 0.45 },
  { y: -0.50, z: -0.55, phase: 3.00, freq: 0.65, amp: 0.11, speed: 1.20, density: 0.6, depth: 0.60 },
];

const STREAM_WIDTH  = 5.2;  // X extent: -2.6 to +2.6
const EDGE_FADE_W   = 0.6;  // fade region at each edge
const BASE_SPEED    = 0.95; // X units per second for base ribbon

// Fraction of particles per ribbon based on density weight
const TOTAL_DENSITY = RIBBONS.reduce((s, r) => s + r.density, 0);

// ─── particle config ──────────────────────────────────────────────────────────

const PARTICLE_COUNT   = 480;
const CRIMSON_FRACTION = 0.09;  // ~43 crimson particles
const TRAIL_STEPS      = 4;

// ─── anchor data ──────────────────────────────────────────────────────────────
// Anchors sit on specific ribbons at specific X positions.
// Spread across ribbons and horizontal positions for legibility.

const ANCHOR_DATA = [
  { id: 'acme',    empresa: 'Acme Corp',      ribbonIdx: 1, xPos: -1.4 },
  { id: 'beta',    empresa: 'Beta Industries', ribbonIdx: 4, xPos:  0.2 },
  { id: 'gamma',   empresa: 'Gamma SA',        ribbonIdx: 0, xPos:  1.0 },
  { id: 'delta',   empresa: 'Delta Corp',      ribbonIdx: 3, xPos: -0.4 },
  { id: 'epsilon', empresa: 'Epsilon Ltda',    ribbonIdx: 2, xPos:  1.8 },
];

const MOUNT_DELAYS = ANCHOR_DATA.map((_, i) => calcStaggerDelay(i, 80));

// Anchor world position: y/z interpolated from ribbon + sine at t=0
function anchorWorldPos(anchor) {
  const r = RIBBONS[anchor.ribbonIdx];
  // Use the ribbon's sine at their specific X mapped to t
  const x = anchor.xPos;
  const t = (x + STREAM_WIDTH / 2) / STREAM_WIDTH; // 0..1 across stream
  const y = r.y + r.amp * Math.sin(t * Math.PI * 4 + r.phase);
  return [x, y, r.z];
}

const ANCHOR_POSITIONS = ANCHOR_DATA.map(anchorWorldPos);

// ─── seeded deterministic random (avoids Math.random drift on re-renders) ─────
function makeRand(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ─── particle field ───────────────────────────────────────────────────────────

// ─── intensity wave state ─────────────────────────────────────────────────────
// A region of high intensity travels L→R across the ribbons at flow speed.

function makeWaveState() {
  return {
    active:    false,
    xCenter:   -STREAM_WIDTH / 2 - 0.5, // starts off left edge
    nextTimer: 2.5,
  };
}

const WAVE_WIDTH    = 1.6;   // X half-width of the boost zone — wide band
const WAVE_BOOST    = 2.80;  // size/brightness multiplier at wave center — clearly visible
const WAVE_SPEED    = BASE_SPEED * 1.4; // slightly faster than average flow

function ParticleField({ reducedMotion, hoveredId }) {
  const mainRef    = useRef();
  const trailRef   = useRef();
  const mainMatRef = useRef(); // ref to pointsMaterial for size/opacity modulation
  const wave       = useRef(makeWaveState());

  // Assign ribbon index to each particle, respecting density weights
  const ribbonAssign = useMemo(() => {
    const r = new Uint8Array(PARTICLE_COUNT);
    let idx = 0;
    for (let ri = 0; ri < RIBBONS.length; ri++) {
      const count = ri < RIBBONS.length - 1
        ? Math.round(PARTICLE_COUNT * RIBBONS[ri].density / TOTAL_DENSITY)
        : PARTICLE_COUNT - idx;
      for (let j = 0; j < count && idx < PARTICLE_COUNT; j++, idx++) {
        r[idx] = ri;
      }
    }
    return r;
  }, []);

  // Pre-allocate all particle buffers — never reallocated
  const bufs = useMemo(() => {
    const rand = makeRand(7);

    const positions  = new Float32Array(PARTICLE_COUNT * 3);
    const colors     = new Float32Array(PARTICLE_COUNT * 3);
    const sizes      = new Float32Array(PARTICLE_COUNT);
    const xOffsets   = new Float32Array(PARTICLE_COUNT); // initial X position [0..STREAM_WIDTH)
    const isCrimson  = new Uint8Array(PARTICLE_COUNT);

    const offwhite = new THREE.Color('#e8e6e1');
    const crimson  = new THREE.Color('#F06070');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ci = i < PARTICLE_COUNT * CRIMSON_FRACTION;
      isCrimson[i] = ci ? 1 : 0;

      xOffsets[i] = rand() * STREAM_WIDTH;

      const c = ci ? crimson : offwhite;
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = ci ? 4.0 : (1.1 + rand() * 1.8);

      // Initial positions (will be overwritten first frame)
      const ri = ribbonAssign[i];
      const rb = RIBBONS[ri];
      const x  = xOffsets[i] - STREAM_WIDTH / 2;
      positions[i * 3]     = x;
      positions[i * 3 + 1] = rb.y;
      positions[i * 3 + 2] = rb.z;
    }

    return { positions, colors, sizes, xOffsets, isCrimson };
  }, [ribbonAssign]);

  // Trail buffers (only for crimson particles)
  const CRIMSON_COUNT = Math.ceil(PARTICLE_COUNT * CRIMSON_FRACTION);
  const trailBufs = useMemo(() => ({
    positions: new Float32Array(CRIMSON_COUNT * TRAIL_STEPS * 3),
    colors:    new Float32Array(CRIMSON_COUNT * TRAIL_STEPS * 3),
    sizes:     new Float32Array(CRIMSON_COUNT * TRAIL_STEPS),
  }), [CRIMSON_COUNT]);

  // BufferGeometry — created once, attributes point to pre-allocated arrays
  const geoMain = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(bufs.positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(bufs.colors,    3));
    g.setAttribute('size',     new THREE.BufferAttribute(bufs.sizes,     1));
    return g;
  }, [bufs]);

  const geoTrail = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(trailBufs.positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(trailBufs.colors,    3));
    g.setAttribute('size',     new THREE.BufferAttribute(trailBufs.sizes,     1));
    return g;
  }, [trailBufs]);

  useEffect(() => () => { geoMain.dispose(); geoTrail.dispose(); }, [geoMain, geoTrail]);

  // Scratch scalars — no object allocation in useFrame
  const halfW = STREAM_WIDTH / 2;

  useFrame(({ clock }, delta) => {
    if (reducedMotion || !mainRef.current) return;

    const elapsed = clock.getElapsedTime();
    const posAttr  = geoMain.attributes.position;
    const sizeAttr = geoMain.attributes.size;
    const colAttr  = geoMain.attributes.color;

    // Hovered anchor position for glow calc
    let hx = 0, hy = 0, hz = 0, hasHover = false;
    if (hoveredId) {
      const hi = ANCHOR_DATA.findIndex(a => a.id === hoveredId);
      if (hi >= 0) {
        hx = ANCHOR_POSITIONS[hi][0];
        hy = ANCHOR_POSITIONS[hi][1];
        hz = ANCHOR_POSITIONS[hi][2];
        hasHover = true;
      }
    }

    // ── intensity wave tick (uses real delta) ──
    const wv = wave.current;
    if (!wv.active) {
      wv.nextTimer -= delta;
      if (wv.nextTimer <= 0) {
        wv.active   = true;
        wv.xCenter  = -halfW - 0.5; // enter from left
        wv.nextTimer = 4.0 + Math.random() * 3.0;
      }
    } else {
      wv.xCenter += WAVE_SPEED * delta;
      if (wv.xCenter > halfW + 0.5) wv.active = false;
    }

    let crimsonTrailIdx = 0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ri  = ribbonAssign[i];
      const rb  = RIBBONS[ri];
      const ci  = bufs.isCrimson[i] === 1;
      const spd = BASE_SPEED * rb.speed * (ci ? 1.5 : 1.0);

      // X: advance right, wrap at +halfW back to -halfW
      const rawX = (bufs.xOffsets[i] + elapsed * spd) % STREAM_WIDTH;
      const x    = rawX - halfW;

      // Y: sine undulation — ribbon oscillates over time
      const tNorm = rawX / STREAM_WIDTH;          // 0..1 along ribbon
      const y     = rb.y + rb.amp * Math.sin(tNorm * Math.PI * 4 + rb.phase + elapsed * 0.35 * rb.freq);

      const z = rb.z;

      posAttr.array[i * 3]     = x;
      posAttr.array[i * 3 + 1] = y;
      posAttr.array[i * 3 + 2] = z;

      // ── depth fade (back ribbons dimmer/smaller) ──
      // rb.depth: 0=front, 1=back
      const depthScale = 1.0 - rb.depth * 0.55;

      // ── edge fade: fade in from left, fade out on right ──
      let edgeFade = 1.0;
      const absX = rawX; // 0..STREAM_WIDTH
      if (absX < EDGE_FADE_W)           edgeFade = absX / EDGE_FADE_W;
      else if (absX > STREAM_WIDTH - EDGE_FADE_W) edgeFade = (STREAM_WIDTH - absX) / EDGE_FADE_W;

      // ── glow when crimson particle is near a hovered anchor ──
      let glowBoost = 1.0;
      if (hasHover && ci) {
        const dx = x - hx, dy = y - hy, dz = z - hz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 0.36) glowBoost = 1.0 + (1.0 - d2 / 0.36) * 1.4;
      }

      const combinedAlpha = depthScale * edgeFade;

      // ── intensity wave boost ──
      let waveBoost = 1.0;
      if (wv.active) {
        const wdist = Math.abs(x - wv.xCenter);
        if (wdist < WAVE_WIDTH) {
          waveBoost = 1.0 + (1.0 - wdist / WAVE_WIDTH) * (WAVE_BOOST - 1.0);
        }
      }

      sizeAttr.array[i] = bufs.sizes[i] * combinedAlpha * glowBoost * waveBoost;

      // Colour modulation: depth dims brightness + wave brightens
      if (ci) {
        const bright = combinedAlpha * glowBoost * waveBoost;
        colAttr.array[i * 3]     = Math.min(THREE.MathUtils.lerp(0.28, 0.94, bright), 1.0);
        colAttr.array[i * 3 + 1] = Math.min(THREE.MathUtils.lerp(0.02, 0.38, combinedAlpha * waveBoost), 1.0);
        colAttr.array[i * 3 + 2] = Math.min(THREE.MathUtils.lerp(0.02, 0.44, combinedAlpha * waveBoost), 1.0);
      } else {
        // Wave boost makes offwhite particles visibly brighter (approaching white)
        const wv2 = wv.active ? Math.min(waveBoost, 2.5) : 1.0;
        const v = Math.min((0.50 + combinedAlpha * 0.40) * wv2, 1.0);
        colAttr.array[i * 3]     = v * 0.91;
        colAttr.array[i * 3 + 1] = v * 0.90;
        colAttr.array[i * 3 + 2] = v * 0.88;
      }

      // ── crimson trail (ghost positions behind in X) ──
      if (ci && crimsonTrailIdx < trailBufs.positions.length / 3) {
        for (let s = 1; s <= TRAIL_STEPS; s++) {
          const fade   = (1 - s / (TRAIL_STEPS + 1)) * combinedAlpha;
          const rawXt  = ((rawX - s * spd * 0.04) + STREAM_WIDTH) % STREAM_WIDTH;
          const xt     = rawXt - halfW;
          const tNormt = rawXt / STREAM_WIDTH;
          const yt     = rb.y + rb.amp * Math.sin(tNormt * Math.PI * 4 + rb.phase + elapsed * 0.35 * rb.freq);

          const ti = crimsonTrailIdx * 3;
          trailBufs.positions[ti]     = xt;
          trailBufs.positions[ti + 1] = yt;
          trailBufs.positions[ti + 2] = z;
          trailBufs.colors[ti]        = 0.55 * fade;
          trailBufs.colors[ti + 1]    = 0.08 * fade;
          trailBufs.colors[ti + 2]    = 0.08 * fade;
          trailBufs.sizes[crimsonTrailIdx] = 1.6 * fade;
          crimsonTrailIdx++;
        }
      }
    }

    posAttr.needsUpdate  = true;
    sizeAttr.needsUpdate = true;
    colAttr.needsUpdate  = true;

    // Modulate the material's global size and opacity based on wave peak
    // This makes the wave obvious even when vertex color is near-white (capped)
    if (mainMatRef.current) {
      const wavePeak = wv.active
        ? Math.max(0, 1 - Math.abs(wv.xCenter) / (halfW + 0.5)) // 0..1 based on wave position in view
        : 0;
      // During wave: size grows 1.8×, opacity hits 0.9
      mainMatRef.current.size    = 0.030 + wavePeak * 0.024;
      mainMatRef.current.opacity = 0.55  + wavePeak * 0.35;
      mainMatRef.current.needsUpdate = true;
    }

    const tp = geoTrail.attributes.position;
    const tc = geoTrail.attributes.color;
    const ts = geoTrail.attributes.size;
    tp.array.set(trailBufs.positions);
    tc.array.set(trailBufs.colors);
    ts.array.set(trailBufs.sizes);
    tp.needsUpdate = true;
    tc.needsUpdate = true;
    ts.needsUpdate = true;
  });

  return (
    <>
      <points ref={mainRef} geometry={geoMain}>
        <pointsMaterial
          ref={mainMatRef}
          vertexColors
          size={0.030}
          sizeAttenuation
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </points>
      <points ref={trailRef} geometry={geoTrail}>
        <pointsMaterial
          vertexColors
          size={0.020}
          sizeAttenuation
          transparent
          opacity={0.36}
          depthWrite={false}
        />
      </points>
    </>
  );
}

// ─── guide lines (ribbon structure at opacity 0.06) ───────────────────────────

function RibbonGuides() {
  const geos = useMemo(() => {
    const STEPS = 80;
    return RIBBONS.map(rb => {
      const verts = new Float32Array(STEPS * 3);
      for (let i = 0; i < STEPS; i++) {
        const t = i / (STEPS - 1);
        const x = t * STREAM_WIDTH - STREAM_WIDTH / 2;
        const y = rb.y + rb.amp * Math.sin(t * Math.PI * 4 + rb.phase);
        verts[i * 3]     = x;
        verts[i * 3 + 1] = y;
        verts[i * 3 + 2] = rb.z;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      return g;
    });
  }, []);

  // Animate guide lines with the same ribbon phase drift
  const linesRef = useRef([]);

  useEffect(() => () => geos.forEach(g => g.dispose()), [geos]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    for (let ri = 0; ri < RIBBONS.length; ri++) {
      const rb   = RIBBONS[ri];
      const geo  = geos[ri];
      const attr = geo.attributes.position;
      const STEPS = attr.count;
      for (let i = 0; i < STEPS; i++) {
        const t = i / (STEPS - 1);
        const y = rb.y + rb.amp * Math.sin(t * Math.PI * 4 + rb.phase + elapsed * 0.35 * rb.freq);
        attr.array[i * 3 + 1] = y;
      }
      attr.needsUpdate = true;
    }
  });

  return (
    <>
      {geos.map((geo, ri) => (
        <line key={ri} ref={el => { linesRef.current[ri] = el; }} geometry={geo}>
          <lineBasicMaterial
            color="#e8e6e1"
            transparent
            opacity={0.06 - RIBBONS[ri].depth * 0.04}
            depthWrite={false}
          />
        </line>
      ))}
    </>
  );
}

// ─── stream scene ─────────────────────────────────────────────────────────────

function StreamScene({ anchors, hoveredId, onHover, reducedMotion }) {
  return (
    <group>
      <RibbonGuides />
      <ParticleField reducedMotion={reducedMotion} hoveredId={hoveredId} />

      {anchors.map((anchor, i) => {
        const [ax, ay, az] = ANCHOR_POSITIONS[i];
        // Label floats slightly above the anchor
        const labelPos = [ax, ay + 0.16, az + 0.1];
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
            radius={0.036}
          />
        );
      })}
    </group>
  );
}

// ─── root ─────────────────────────────────────────────────────────────────────

export default function ParticleStream({ onHoverContract, hoveredContract }) {
  const { table } = useStream();
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

  const handleHover = useCallback((contract, anchor) => {
    if (contract) {
      onHoverContract(contract, anchor);
    } else {
      onHoverContract(null);
    }
  }, [onHoverContract]);

  useEffect(() => {
    return () => { if (rotateResumeRef.current) clearTimeout(rotateResumeRef.current); };
  }, []);

  return (
    <Canvas
      className={styles.canvas}
      camera={{ position: [0, 0, 3.4], fov: 36, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#0a0a0a', 1)}
    >
      <ambientLight intensity={0.015} />
      <pointLight position={[0,  2.5, 2]}  intensity={0.20} color="#ffffff" />
      <pointLight position={[0, -2.0, -1]} intensity={0.08} color="#8B1A1A" />
      <directionalLight position={[3, 1, 2]} intensity={0.10} color="#e8e6e1" />

      <StreamScene
        anchors={anchors}
        hoveredId={hoveredId}
        onHover={handleHover}
        reducedMotion={reducedMotion}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.45}
        makeDefault
      />
    </Canvas>
  );
}
