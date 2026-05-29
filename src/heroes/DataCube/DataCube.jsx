import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import InteractivePoint from '../shared/InteractivePoint';
import styles from './DataCube.module.css';
import { useStream } from '../../data/DataProvider';
import { calcStaggerDelay } from '../../motion/constants';

const GRID_SIZE = 3;
const HALF = (GRID_SIZE - 1) / 2;
const CELL_SPACING = 0.55;

function makeCells() {
  const cells = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        cells.push({
          key: `${x}-${y}-${z}`,
          position: [
            (x - HALF) * CELL_SPACING,
            (y - HALF) * CELL_SPACING,
            (z - HALF) * CELL_SPACING,
          ],
        });
      }
    }
  }
  return cells;
}

const ALL_CELLS = makeCells();

const ANCHOR_CONFIGS = [
  { empresa: 'Acme Corp',       gridPos: [0, 0, 0] },
  { empresa: 'Beta Industries', gridPos: [2, 2, 2] },
  { empresa: 'Gamma SA',        gridPos: [2, 0, 0] },
  { empresa: 'Delta Corp',      gridPos: [0, 2, 2] },
  { empresa: 'Epsilon Ltda',    gridPos: [1, 1, 1] },
];

const MOUNT_DELAYS = ANCHOR_CONFIGS.map((_, i) => calcStaggerDelay(i, 60));

function gridToWorld(gx, gy, gz) {
  return [
    (gx - HALF) * CELL_SPACING,
    (gy - HALF) * CELL_SPACING,
    (gz - HALF) * CELL_SPACING,
  ];
}

function CubeEdges() {
  const edgesGeo = useMemo(() => {
    const side = (GRID_SIZE - 1) * CELL_SPACING + CELL_SPACING;
    const geo = new THREE.BoxGeometry(side, side, side);
    const edges = new THREE.EdgesGeometry(geo);
    geo.dispose();
    return edges;
  }, []);

  useEffect(() => () => edgesGeo.dispose(), [edgesGeo]);

  return (
    <lineSegments geometry={edgesGeo}>
      <lineBasicMaterial color="#e8e6e1" transparent opacity={0.12} depthWrite={false} />
    </lineSegments>
  );
}

function DataCubeScene({ anchors, hoveredEmpresa, onHover, reducedMotion, rotating }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current || !rotating || reducedMotion) return;
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x += 0.0006;
  });

  return (
    <group ref={groupRef}>
      <CubeEdges />

      {ALL_CELLS.map(cell => (
        <mesh key={cell.key} position={cell.position}>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshBasicMaterial color="#e8e6e1" transparent opacity={0.07} />
        </mesh>
      ))}

      {anchors.map((anchor, i) => {
        const pos = gridToWorld(...anchor.gridPos);
        const labelPos = [pos[0], pos[1] + 0.14, pos[2]];
        return (
          <InteractivePoint
            key={anchor.empresa}
            position={pos}
            posNormal={null}
            labelPosition={labelPos}
            label={anchor.empresa}
            data={anchor.contract}
            onHover={onHover}
            hovered={hoveredEmpresa === anchor.empresa}
            reducedMotion={reducedMotion}
            mountDelay={MOUNT_DELAYS[i]}
            radius={0.034}
          />
        );
      })}
    </group>
  );
}

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

  return (
    <Canvas
      className={styles.canvas}
      camera={{ position: [0, 0, 3.2], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#0a0a0a', 1)}
    >
      <ambientLight intensity={0.04} />
      <pointLight position={[3, 3, 3]} intensity={0.35} color="#ffffff" />
      <pointLight position={[-3, -2, -2]} intensity={0.08} color="#8B1A1A" />

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
