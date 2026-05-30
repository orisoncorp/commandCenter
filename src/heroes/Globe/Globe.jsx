import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import GlobeMesh from './GlobeMesh';
import DataPoint from './DataPoint';
import ConnectionLines from './ConnectionLines';
import styles from './Globe.module.css';
import { useStream } from '../../data/DataProvider';
import { calcStaggerDelay } from '../../motion/constants';

const LOCATIONS = [
  { empresa: 'Acme Corp',       lat: -23.55, lng: -46.63 },
  { empresa: 'Beta Industries', lat: -22.91, lng: -43.17 },
  { empresa: 'Gamma SA',        lat: -19.92, lng: -43.94 },
  { empresa: 'Delta Corp',      lat: -30.03, lng: -51.23 },
  { empresa: 'Epsilon Ltda',    lat: -15.78, lng: -47.93 },
];

const MOUNT_DELAYS = LOCATIONS.map((_, i) => calcStaggerDelay(i, 60));

// ─── radar sweep ──────────────────────────────────────────────────────────────
// A thin arc that sweeps around the globe in Y, pauses, then repeats.
// sweepAngleRef.current is written each frame so DataPoints can read it.

const SWEEP_DURATION = 7.0;  // seconds for one full 2π sweep
const SWEEP_PAUSE    = 3.0;  // seconds pause after sweep completes

// Meridian arc: N points along the great circle at a fixed longitude (XZ=0, sweeping in Y).
// depthTest=false so it's always visible regardless of globe occlusion.
const SWEEP_SEGMENTS = 48;
function buildMeridianGeo() {
  const pts = [];
  for (let i = 0; i <= SWEEP_SEGMENTS; i++) {
    const phi = (i / SWEEP_SEGMENTS) * Math.PI; // 0 → π (north to south pole)
    // At longitude 0 (Z axis): x=sin(phi)*0, y=cos(phi), z=sin(phi)
    // We place the meridian along the Z+ axis initially; the group rotates around Y.
    pts.push(new THREE.Vector3(0, Math.cos(phi) * 1.04, Math.sin(phi) * 1.04));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, SWEEP_SEGMENTS, 0.008, 6, false);
  return geo;
}

function RadarSweep({ sweepAngleRef, reducedMotion }) {
  const groupRef = useRef();
  const matRef   = useRef();
  const state    = useRef({ phase: 'sweep', timer: 0 });

  // TubeGeometry along the meridian arc — always visible via depthTest=false
  const geo = useMemo(() => buildMeridianGeo(), []);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return;
    const s = state.current;

    if (s.phase === 'pause') {
      s.timer += delta;
      if (s.timer >= SWEEP_PAUSE) {
        s.phase = 'sweep';
        s.timer = 0;
        groupRef.current.rotation.y = 0;
      }
      sweepAngleRef.current = -999;
      if (matRef.current) matRef.current.opacity = 0;
      return;
    }

    s.timer += delta;
    const progress = s.timer / SWEEP_DURATION;
    groupRef.current.rotation.y = progress * Math.PI * 2;
    sweepAngleRef.current = groupRef.current.rotation.y;

    const fade = Math.min(progress * 4, 1) * Math.min((1 - progress) * 4, 1);
    if (matRef.current) matRef.current.opacity = 0.70 * fade;

    if (s.timer >= SWEEP_DURATION) {
      s.phase = 'pause';
      s.timer = 0;
      sweepAngleRef.current = -999;
    }
  });

  return (
    <group ref={groupRef} raycast={() => null}>
      <mesh geometry={geo} raycast={() => null}>
        <meshBasicMaterial
          ref={matRef}
          color="#C0282A"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─── globe scene ──────────────────────────────────────────────────────────────

function GlobeScene({ points, hoveredContract, onHoverContract, reducedMotion, rotating, sweepAngleRef }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    if (!reducedMotion && rotating) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <>
      {/* RadarSweep is OUTSIDE the rotating group so it spins independently */}
      <RadarSweep sweepAngleRef={sweepAngleRef} reducedMotion={reducedMotion} />

      <group ref={groupRef}>
        <GlobeMesh radius={1} autoRotate={false} rotating={false} />
        <ConnectionLines />

        {points.map((pt) => (
          <DataPoint
            key={pt.empresa}
            lat={pt.lat}
            lng={pt.lng}
            empresa={pt.empresa}
            data={pt.contract}
            onHover={onHoverContract}
            hovered={hoveredContract?.empresa === pt.empresa}
            reducedMotion={reducedMotion}
            mountDelay={pt.mountDelay}
            pulseSignal={pt.pulseSignal}
            sweepAngleRef={sweepAngleRef}
          />
        ))}
      </group>
    </>
  );
}

// ─── root ─────────────────────────────────────────────────────────────────────

export default function Globe({ onHoverContract, hoveredContract }) {
  const { table, events } = useStream();
  const [rotating, setRotating] = useState(true);
  const [pulseSignals, setPulseSignals] = useState({});
  const prevEventCountRef = useRef(0);
  const rotateResumeRef   = useRef(null);
  const sweepAngleRef     = useRef(-999); // shared radar angle, -999 = inactive
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!events?.length || events.length <= prevEventCountRef.current) return;
    const newest = events[0];
    prevEventCountRef.current = events.length;
    const target = LOCATIONS.find(l => l.empresa === newest.empresa);
    const key = target ? target.empresa : LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)].empresa;
    setPulseSignals(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  }, [events]);

  const points = LOCATIONS.map((loc, i) => {
    const contract = table?.find(r => r.empresa === loc.empresa) || null;
    return {
      ...loc,
      contract,
      mountDelay: MOUNT_DELAYS[i],
      pulseSignal: pulseSignals[loc.empresa] || 0,
    };
  });

  const pauseRotation = useCallback(() => {
    if (rotateResumeRef.current) clearTimeout(rotateResumeRef.current);
    setRotating(false);
  }, []);

  const resumeRotation = useCallback(() => {
    if (rotateResumeRef.current) clearTimeout(rotateResumeRef.current);
    if (reducedMotion) return;
    rotateResumeRef.current = setTimeout(() => setRotating(true), 900);
  }, [reducedMotion]);

  const handlePointHover = useCallback((contract, anchor) => {
    if (contract) {
      pauseRotation();
      onHoverContract(contract, anchor);
      return;
    }
    onHoverContract(null);
    resumeRotation();
  }, [onHoverContract, pauseRotation, resumeRotation]);

  const handleDragStart = useCallback(() => pauseRotation(), [pauseRotation]);
  const handleDragEnd   = useCallback(() => resumeRotation(), [resumeRotation]);

  useEffect(() => {
    return () => { if (rotateResumeRef.current) clearTimeout(rotateResumeRef.current); };
  }, []);

  return (
    <Canvas
      className={styles.canvas}
      camera={{ position: [0, 0, 2.7], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#0a0a0a', 1)}
    >
      <ambientLight intensity={0.03} />
      <pointLight position={[3, 3, 3]} intensity={0.5} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={0.12} color="#8B1A1A" />
      <directionalLight position={[-3, 2, -5]} intensity={0.3} color="#e8e6e1" />

      <GlobeScene
        points={points}
        hoveredContract={hoveredContract}
        onHoverContract={handlePointHover}
        reducedMotion={reducedMotion}
        rotating={rotating}
        sweepAngleRef={sweepAngleRef}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        onStart={handleDragStart}
        onEnd={handleDragEnd}
        makeDefault
      />
    </Canvas>
  );
}
