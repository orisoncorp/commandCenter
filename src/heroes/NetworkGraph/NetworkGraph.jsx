import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import styles from './NetworkGraph.module.css';
import { useStream } from '../../data/DataProvider';
import { calcStaggerDelay } from '../../motion/constants';

// ─── node layout ──────────────────────────────────────────────────────────────
// Organic 3D distribution — no two nodes share a plane, avoids projection overlap.

const NODE_DATA = [
  { id: 'acme',    empresa: 'Acme Corp',      position: [ 0.80,  0.48,  0.30] },
  { id: 'beta',    empresa: 'Beta Industries', position: [-0.72,  0.60, -0.22] },
  { id: 'gamma',   empresa: 'Gamma SA',        position: [ 0.10, -0.68,  0.58] },
  { id: 'delta',   empresa: 'Delta Corp',      position: [-0.52, -0.30, -0.78] },
  { id: 'epsilon', empresa: 'Epsilon Ltda',    position: [ 0.28,  0.76, -0.58] },
];

const EDGES = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [0, 4],
];

// Which edges connect to each node (for hover highlight lookup)
const NODE_EDGE_MAP = NODE_DATA.map((_, ni) =>
  EDGES.reduce((acc, [a, b], ei) => { if (a === ni || b === ni) acc.push(ei); return acc; }, [])
);

const MOUNT_DELAYS = NODE_DATA.map((_, i) => calcStaggerDelay(i, 60));

// Drift: each node oscillates with a unique phase/freq/amp so the graph "breathes"
const DRIFT_PARAMS = NODE_DATA.map((_, i) => ({
  phaseX: i * 1.37,
  phaseY: i * 2.11,
  phaseZ: i * 0.83,
  freqX: 0.28 + i * 0.07,
  freqY: 0.22 + i * 0.05,
  freqZ: 0.31 + i * 0.06,
  amp: 0.022,
}));

// Pre-computed Bézier control points for each edge (stored once)
function bezierMid(posA, posB) {
  const mx = (posA[0] + posB[0]) / 2;
  const my = (posA[1] + posB[1]) / 2;
  const mz = (posA[2] + posB[2]) / 2;
  // Deflect midpoint outward from origin slightly for curvature
  const len = Math.hypot(mx, my, mz) || 1;
  const pull = 0.28;
  return [mx + (mx / len) * pull, my + (my / len) * pull, mz + (mz / len) * pull];
}

const EDGE_MIDS = EDGES.map(([ai, bi]) => bezierMid(NODE_DATA[ai].position, NODE_DATA[bi].position));

// ─── edge data particle ───────────────────────────────────────────────────────
// One particle travels along a random edge at a time. Pre-allocated state.

const EDGE_PARTICLE = {
  edgeIdx:   0,
  t:         0,
  speed:     0.32,  // travels 0→1 along edge in ~3s
  nextDelay: 2.8,   // seconds before next particle departs
  nextTimer: 2.8,
};

// ─── curved edge component ────────────────────────────────────────────────────

const EDGE_SEGMENTS = 24; // Bézier resolution

function buildEdgeGeo(posA, posB, mid) {
  const curve  = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...posA),
    new THREE.Vector3(...mid),
    new THREE.Vector3(...posB),
  );
  const points = curve.getPoints(EDGE_SEGMENTS);
  return new THREE.BufferGeometry().setFromPoints(points);
}

function EdgeLine({ edgeIdx, posA, posB, mid, highlighted }) {
  const matRef   = useRef();
  const opacityRef = useRef(0.10);

  // Static geometry — built once, never rebuilt (nodes drift but edges don't follow;
  // drift amplitude is tiny so the visual discrepancy is imperceptible)
  const geometry = useMemo(() => buildEdgeGeo(posA, posB, mid), [posA, posB, mid]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(() => {
    if (!matRef.current) return;
    const target = highlighted ? 0.40 : 0.10;
    opacityRef.current += (target - opacityRef.current) * 0.12;
    matRef.current.opacity = opacityRef.current;
    matRef.current.color.set(highlighted ? '#8B1A1A' : '#e8e6e1');
  });

  return (
    // raycast={() => null} — edges MUST NOT intercept pointer events
    <line geometry={geometry} raycast={() => null}>
      <lineBasicMaterial
        ref={matRef}
        color="#e8e6e1"
        transparent
        opacity={0.10}
        depthWrite={false}
      />
    </line>
  );
}

// ─── edge data particle (travels along Bézier curve) ─────────────────────────

function EdgeParticle({ nodePositions }) {
  const meshRef = useRef();
  const state   = useRef({ ...EDGE_PARTICLE, nextTimer: 1.5 }); // first particle soon

  // Scratch vec — allocated once
  const _vec = useRef(new THREE.Vector3());
  const _a   = useRef(new THREE.Vector3());
  const _m   = useRef(new THREE.Vector3());
  const _b   = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const s = state.current;
    const mesh = meshRef.current;
    if (!mesh) return;

    if (s.t >= 1) {
      // Particle finished — wait for next departure
      s.t         = 0;
      s.nextTimer -= delta;
      mesh.visible = false;
      if (s.nextTimer <= 0) {
        s.edgeIdx   = Math.floor(Math.random() * EDGES.length);
        s.nextTimer = 2.0 + Math.random() * 3.0;
        s.t         = 0.001; // start travelling
        mesh.visible = true;
      }
      return;
    }

    s.t = Math.min(s.t + delta * s.speed, 1);

    const [ai, bi] = EDGES[s.edgeIdx];
    const mid      = EDGE_MIDS[s.edgeIdx];

    _a.current.set(...nodePositions[ai]);
    _m.current.set(...mid);
    _b.current.set(...nodePositions[bi]);

    // Quadratic Bézier: P = (1-t)²A + 2(1-t)tM + t²B
    const t  = s.t;
    const it = 1 - t;
    _vec.current.set(
      it * it * _a.current.x + 2 * it * t * _m.current.x + t * t * _b.current.x,
      it * it * _a.current.y + 2 * it * t * _m.current.y + t * t * _b.current.y,
      it * it * _a.current.z + 2 * it * t * _m.current.z + t * t * _b.current.z,
    );
    mesh.position.copy(_vec.current);
    mesh.visible = true;
  });

  return (
    <mesh ref={meshRef} visible={false} raycast={() => null}>
      <sphereGeometry args={[0.014, 6, 6]} />
      <meshBasicMaterial color="#F06070" transparent opacity={0.85} depthWrite={false} />
    </mesh>
  );
}

// ─── single network node ──────────────────────────────────────────────────────
// Self-contained: manages own heartbeat, halo, depth fade, hover.
// posNormal=null → isFrontRef always true → hover works from ANY angle.
// hitbox uses depthTest=false + renderOrder=999 so it's never depth-occluded.

function NetworkNode({ nodeIdx, position, empresa, data, onHover, hovered, reducedMotion, mountDelay, mrrRadius }) {
  const visualRef  = useRef();
  const haloRef    = useRef();
  const hitboxRef  = useRef();

  const [mountScale, setMountScale] = useState(reducedMotion ? 1 : 0);

  const hoverScaleRef     = useRef(1);
  const hoveredRef        = useRef(false);
  const heartbeatOffRef   = useRef(nodeIdx * 0.73 + 0.2);
  const worldPositionRef  = useRef(new THREE.Vector3());

  useEffect(() => { hoveredRef.current = hovered; }, [hovered]);

  useEffect(() => {
    if (reducedMotion) return;
    let raf;
    const timer = setTimeout(() => {
      const start    = performance.now();
      const duration = 400;
      const animate  = (now) => {
        const t = Math.min((now - start) / duration, 1);
        setMountScale(1 - Math.pow(1 - t, 3));
        if (t < 1) raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
    }, mountDelay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [reducedMotion, mountDelay]);

  useFrame(({ clock, camera: cam }) => {
    if (!visualRef.current) return;

    // Depth fade: how far is node from camera relative to scene scale?
    visualRef.current.getWorldPosition(worldPositionRef.current);
    const dist       = worldPositionRef.current.distanceTo(cam.position);
    const depthFade  = reducedMotion ? 0.95 : THREE.MathUtils.clamp(1.4 - dist * 0.22, 0.22, 0.95);

    // Hover scale
    const hoverTarget = hoveredRef.current ? 1.8 : 1.0;
    hoverScaleRef.current += (hoverTarget - hoverScaleRef.current) * 0.14;

    // Heartbeat
    const t         = clock.getElapsedTime() + heartbeatOffRef.current;
    const heartbeat = reducedMotion ? 1 : 1 + 0.08 * (0.5 + 0.5 * Math.sin((t / 2) * Math.PI * 2));

    const s = (reducedMotion ? 1 : mountScale) * hoverScaleRef.current * heartbeat;
    visualRef.current.scale.setScalar(s);

    // Visual opacity
    const dotMat = visualRef.current.material;
    if (dotMat) {
      const next = depthFade * 0.95;
      if (Math.abs(dotMat.opacity - next) > 0.001) { dotMat.opacity = next; dotMat.needsUpdate = true; }
    }
    // Halo opacity
    const haloMat = haloRef.current?.material;
    if (haloMat) {
      const next = depthFade * 0.18;
      if (Math.abs(haloMat.opacity - next) > 0.001) { haloMat.opacity = next; haloMat.needsUpdate = true; }
    }
  });

  const getAnchor = useCallback((event) => {
    const source = event?.sourceEvent || event?.nativeEvent || event;
    if (source?.clientX != null && source?.clientY != null) {
      return { x: source.clientX, y: source.clientY };
    }
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

  useEffect(() => {
    return () => { if (hoveredRef.current) document.body.style.cursor = ''; };
  }, []);

  const HITBOX_R = mrrRadius * 4.5;

  return (
    <>
      {/* Halo ring — visual only, no raycasting */}
      <mesh ref={haloRef} position={position} raycast={() => null}>
        <ringGeometry args={[mrrRadius * 1.8, mrrRadius * 2.4, 24]} />
        <meshBasicMaterial color="#8B1A1A" transparent opacity={0.18} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Visual node sphere */}
      <mesh ref={visualRef} position={position} raycast={() => null}>
        <sphereGeometry args={[mrrRadius, 10, 10]} />
        <meshBasicMaterial color={hovered ? '#F06070' : '#8B1A1A'} transparent opacity={0.95} />
      </mesh>

      {/* Hitbox: invisible, depthTest=false, renderOrder=999 so depth occlusion
          never blocks it — nodes are hittable from ANY rotation angle */}
      <mesh
        ref={hitboxRef}
        position={position}
        onPointerOver={handleEnter}
        onPointerOut={handleLeave}
        renderOrder={999}
      >
        <sphereGeometry args={[HITBOX_R, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
      </mesh>
    </>
  );
}

// ─── central glow ─────────────────────────────────────────────────────────────

function CentralGlow() {
  return (
    <mesh raycast={() => null}>
      <sphereGeometry args={[0.55, 32, 32]} />
      <meshBasicMaterial color="#8B1A1A" transparent opacity={0.045} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

// ─── top-MRR connection arc ───────────────────────────────────────────────────
// Dashed line between the 2 nodes with highest MRR, similar to Globe's ConnectionLines.

function TopMrrArc({ topPairIdx }) {
  const matRef  = useRef();
  const lineRef = useRef();

  const geometry = useMemo(() => {
    if (!topPairIdx) return null;
    const [ai, bi]   = topPairIdx;
    const mid        = bezierMid(NODE_DATA[ai].position, NODE_DATA[bi].position);
    const curve      = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...NODE_DATA[ai].position),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...NODE_DATA[bi].position),
    );
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    g.computeBoundingSphere();
    return g;
  }, [topPairIdx]);

  useEffect(() => {
    lineRef.current?.computeLineDistances?.();
  }, [geometry]);

  useEffect(() => () => { geometry?.dispose(); }, [geometry]);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = (clock.getElapsedTime() * 0.18) % 1;
    matRef.current.dashOffset = -t;
  });

  if (!geometry) return null;

  return (
    <line ref={lineRef} geometry={geometry} raycast={() => null}>
      <lineDashedMaterial
        ref={matRef}
        color="#8B1A1A"
        transparent
        opacity={0.30}
        dashSize={0.05}
        gapSize={0.07}
        depthWrite={false}
      />
    </line>
  );
}

// ─── network scene ────────────────────────────────────────────────────────────

function NetworkScene({ nodes, hoveredId, onHover, reducedMotion, rotating }) {
  const groupRef = useRef();

  // Current drifted positions (mutated in-place each frame)
  const driftedPositions = useRef(NODE_DATA.map(n => [...n.position]));

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    // Auto-rotate
    if (!reducedMotion && rotating) groupRef.current.rotation.y += 0.002;

    // Node drift: update driftedPositions in-place (used by EdgeParticle)
    if (!reducedMotion) {
      const t = clock.getElapsedTime();
      for (let i = 0; i < NODE_DATA.length; i++) {
        const d  = DRIFT_PARAMS[i];
        const p  = NODE_DATA[i].position;
        driftedPositions.current[i][0] = p[0] + d.amp * Math.sin(t * d.freqX + d.phaseX);
        driftedPositions.current[i][1] = p[1] + d.amp * Math.sin(t * d.freqY + d.phaseY);
        driftedPositions.current[i][2] = p[2] + d.amp * Math.sin(t * d.freqZ + d.phaseZ);
      }
    }
  });

  // Top-MRR pair for the connection arc
  const topPairIdx = useMemo(() => {
    const ranked = nodes
      .map((n, i) => ({ i, mrr: n.contract?.mrr || 0 }))
      .sort((a, b) => b.mrr - a.mrr);
    if (ranked.length < 2) return null;
    return [ranked[0].i, ranked[1].i];
  }, [nodes]);

  return (
    <group ref={groupRef}>
      <CentralGlow />

      {EDGES.map(([ai, bi], ei) => (
        <EdgeLine
          key={ei}
          edgeIdx={ei}
          posA={NODE_DATA[ai].position}
          posB={NODE_DATA[bi].position}
          mid={EDGE_MIDS[ei]}
          highlighted={
            hoveredId === NODE_DATA[ai].id || hoveredId === NODE_DATA[bi].id
          }
        />
      ))}

      <TopMrrArc topPairIdx={topPairIdx} />

      <EdgeParticle nodePositions={driftedPositions.current} />

      {nodes.map((node, i) => {
        // MRR-proportional radius: clamp between 0.024 and 0.052
        const mrr      = node.contract?.mrr || 0;
        const maxMrr   = Math.max(...nodes.map(n => n.contract?.mrr || 0), 1);
        const mrrRatio = mrr / maxMrr;
        const mrrRadius = 0.024 + mrrRatio * 0.028;

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
  const reducedMotion   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nodes = useMemo(() => NODE_DATA.map(node => ({
    ...node,
    contract: table?.find(r => r.empresa === node.empresa) || null,
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
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#0a0a0a', 1)}
    >
      <ambientLight intensity={0.03} />
      <pointLight position={[3, 3, 3]}   intensity={0.45} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={0.12} color="#8B1A1A" />
      <directionalLight position={[-3, 2, -5]} intensity={0.15} color="#e8e6e1" />

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
