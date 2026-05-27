import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import GlobeMesh from './GlobeMesh';
import DataPoint from './DataPoint';
import DetailPanel from './DetailPanel';
import styles from './Globe.module.css';
import { useData } from '../../data/DataProvider';
import { calcStaggerDelay } from '../../motion/constants';

const LOCATIONS = [
  { empresa: 'Acme Corp',       lat: -23.55, lng: -46.63 },
  { empresa: 'Beta Industries', lat: -22.91, lng: -43.17 },
  { empresa: 'Gamma SA',        lat: -19.92, lng: -43.94 },
  { empresa: 'Delta Corp',      lat: -30.03, lng: -51.23 },
  { empresa: 'Epsilon Ltda',    lat: -15.78, lng: -47.93 },
];

// Pre-compute mount delays once
const MOUNT_DELAYS = LOCATIONS.map((_, i) => calcStaggerDelay(i, 60));

export default function Globe() {
  const { table, events } = useData();
  const [rotating, setRotating] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  // pulseSignals: map of empresa → counter (increments trigger pulse)
  const [pulseSignals, setPulseSignals] = useState({});
  const prevEventCountRef = useRef(0);
  const rotateResumeRef = useRef(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // When a new event arrives, pulse the matching data point
  useEffect(() => {
    if (!events?.length || events.length <= prevEventCountRef.current) return;
    const newest = events[0];
    prevEventCountRef.current = events.length;
    // Pulse the point matching the event empresa, or a random one
    const target = LOCATIONS.find(l => l.empresa === newest.empresa);
    const key = target ? target.empresa : LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)].empresa;
    setPulseSignals(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  }, [events]);

  const points = LOCATIONS.map((loc, i) => {
    const contract = table?.find(r => r.empresa === loc.empresa) || null;
    return { ...loc, contract, mountDelay: MOUNT_DELAYS[i] };
  });

  const handleDragStart = useCallback(() => {
    if (rotateResumeRef.current) clearTimeout(rotateResumeRef.current);
    setRotating(false);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (reducedMotion) return;
    rotateResumeRef.current = setTimeout(() => setRotating(true), 1200);
  }, [reducedMotion]);

  const handleSelect = useCallback((contract) => {
    setSelectedContract(prev =>
      prev?.contrato === contract?.contrato ? null : contract
    );
  }, []);

  const handleClosePanel = useCallback(() => setSelectedContract(null), []);

  useEffect(() => {
    return () => { if (rotateResumeRef.current) clearTimeout(rotateResumeRef.current); };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        className={styles.canvas}
        camera={{ position: [0, 0, 2.7], fov: 40, near: 0.1, far: 100 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.03} />
        <pointLight position={[3, 3, 3]} intensity={0.5} color="#ffffff" />
        <pointLight position={[-3, -2, -3]} intensity={0.12} color="#8B1A1A" />

        <GlobeMesh radius={1} autoRotate={!reducedMotion} rotating={rotating} />

        {points.map((pt) => (
          <DataPoint
            key={pt.empresa}
            lat={pt.lat}
            lng={pt.lng}
            empresa={pt.empresa}
            data={pt.contract}
            onSelect={handleSelect}
            selected={selectedContract?.empresa === pt.empresa}
            reducedMotion={reducedMotion}
            mountDelay={pt.mountDelay}
            pulseSignal={pulseSignals[pt.empresa] || 0}
          />
        ))}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          onStart={handleDragStart}
          onEnd={handleDragEnd}
          makeDefault
        />
      </Canvas>

      {selectedContract && (
        <DetailPanel contract={selectedContract} onClose={handleClosePanel} />
      )}
    </div>
  );
}
