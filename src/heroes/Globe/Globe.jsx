import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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

function GlobeScene({ points, hoveredContract, onHoverContract, reducedMotion, rotating }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    if (!reducedMotion && rotating) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
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
        />
      ))}
    </group>
  );
}

export default function Globe({ onHoverContract, hoveredContract }) {
  const { table, events } = useStream();
  const [rotating, setRotating] = useState(true);
  const [pulseSignals, setPulseSignals] = useState({});
  const prevEventCountRef = useRef(0);
  const rotateResumeRef = useRef(null);
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

  const handleDragStart = useCallback(() => {
    pauseRotation();
  }, [pauseRotation]);

  const handleDragEnd = useCallback(() => {
    resumeRotation();
  }, [resumeRotation]);

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
