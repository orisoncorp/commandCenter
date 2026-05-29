import { useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import InteractivePoint from '../shared/InteractivePoint';
import styles from './NetworkGraph.module.css';
import { useStream } from '../../data/DataProvider';
import { calcStaggerDelay } from '../../motion/constants';

const NODE_DATA = [
  { id: 'acme',    empresa: 'Acme Corp',       position: [ 0.8,  0.5,  0.3] },
  { id: 'beta',    empresa: 'Beta Industries',  position: [-0.7,  0.6, -0.2] },
  { id: 'gamma',   empresa: 'Gamma SA',         position: [ 0.1, -0.7,  0.6] },
  { id: 'delta',   empresa: 'Delta Corp',       position: [-0.5, -0.3, -0.8] },
  { id: 'epsilon', empresa: 'Epsilon Ltda',     position: [ 0.3,  0.8, -0.6] },
];

const EDGES = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [0, 4],
];

const MOUNT_DELAYS = NODE_DATA.map((_, i) => calcStaggerDelay(i, 60));

function EdgeLine({ posA, posB, highlighted }) {
  const matRef = useRef();
  const lineRef = useRef();

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...posA),
      new THREE.Vector3(...posB),
    ]);
    return g;
  }, [posA, posB]);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const target = highlighted ? 0.25 : 0.10;
    matRef.current.opacity += (target - matRef.current.opacity) * 0.1;
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        ref={matRef}
        color={highlighted ? '#8B1A1A' : '#e8e6e1'}
        transparent
        opacity={0.10}
        depthWrite={false}
      />
    </line>
  );
}

function NetworkScene({ nodes, hoveredId, onHover, reducedMotion, rotating }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current || !rotating || reducedMotion) return;
    groupRef.current.rotation.y += 0.002;
  });

  return (
    <group ref={groupRef}>
      {EDGES.map(([ai, bi], i) => (
        <EdgeLine
          key={i}
          posA={NODE_DATA[ai].position}
          posB={NODE_DATA[bi].position}
          highlighted={hoveredId === NODE_DATA[ai].id || hoveredId === NODE_DATA[bi].id}
        />
      ))}

      {nodes.map((node, i) => (
        <InteractivePoint
          key={node.id}
          position={node.position}
          posNormal={null}
          labelPosition={[node.position[0], node.position[1] + 0.12, node.position[2]]}
          label={node.empresa}
          data={node.contract}
          onHover={onHover}
          hovered={hoveredId === node.id}
          reducedMotion={reducedMotion}
          mountDelay={MOUNT_DELAYS[i]}
          radius={0.032}
        />
      ))}
    </group>
  );
}

export default function NetworkGraph({ onHoverContract, hoveredContract }) {
  const { table } = useStream();
  const [rotating, setRotating] = useState(true);
  const rotateResumeRef = useRef(null);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  return (
    <Canvas
      className={styles.canvas}
      camera={{ position: [0, 0, 2.8], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#0a0a0a', 1)}
    >
      <ambientLight intensity={0.04} />
      <pointLight position={[3, 3, 3]} intensity={0.4} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={0.10} color="#8B1A1A" />

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
