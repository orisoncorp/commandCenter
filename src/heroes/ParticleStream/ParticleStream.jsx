import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import InteractivePoint from '../shared/InteractivePoint';
import styles from './ParticleStream.module.css';
import { useStream } from '../../data/DataProvider';
import { calcStaggerDelay } from '../../motion/constants';

const PARTICLE_COUNT = 300;
const CRIMSON_FRACTION = 0.08;

// Toroidal path — pre-compute parameter positions
function toroidalPos(t, R = 1.1, r = 0.35, twist = 3) {
  const angle = t * Math.PI * 2;
  const tubeAngle = angle * twist;
  const x = (R + r * Math.cos(tubeAngle)) * Math.cos(angle);
  const y = r * Math.sin(tubeAngle) * 0.6;
  const z = (R + r * Math.cos(tubeAngle)) * Math.sin(angle);
  return [x, y, z];
}

// Anchor points (interactive nodes on the stream path)
const ANCHOR_DATA = [
  { id: 'acme',    empresa: 'Acme Corp',      t: 0.05  },
  { id: 'beta',    empresa: 'Beta Industries', t: 0.25  },
  { id: 'gamma',   empresa: 'Gamma SA',        t: 0.45  },
  { id: 'delta',   empresa: 'Delta Corp',      t: 0.65  },
  { id: 'epsilon', empresa: 'Epsilon Ltda',    t: 0.85  },
];

const MOUNT_DELAYS = ANCHOR_DATA.map((_, i) => calcStaggerDelay(i, 80));

function ParticleField({ reducedMotion }) {
  const pointsRef = useRef();

  // Pre-allocate all buffers once — never reallocate in useFrame
  const { positions, colors, sizes, offsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const offsets = new Float32Array(PARTICLE_COUNT);

    const crimsonColor = new THREE.Color('#8B1A1A');
    const offwhiteColor = new THREE.Color('#e8e6e1');

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      offsets[i] = i / PARTICLE_COUNT;
      const isCrimson = i < PARTICLE_COUNT * CRIMSON_FRACTION;
      const c = isCrimson ? crimsonColor : offwhiteColor;
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = isCrimson ? 3.5 : (1.5 + Math.random() * 1.5);

      const [x, y, z] = toroidalPos(offsets[i]);
      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return { positions, colors, sizes, offsets };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return g;
  }, [positions, colors, sizes]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    if (reducedMotion || !pointsRef.current) return;
    const t = clock.getElapsedTime() * 0.06;
    const posAttr = geometry.attributes.position;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phase = (offsets[i] + t) % 1;
      const [x, y, z] = toroidalPos(phase);
      posAttr.array[i * 3]     = x;
      posAttr.array[i * 3 + 1] = y;
      posAttr.array[i * 3 + 2] = z;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </points>
  );
}

function StreamScene({ anchors, hoveredId, onHover, reducedMotion, rotating }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current || !rotating || reducedMotion) return;
    groupRef.current.rotation.y += 0.0015;
  });

  return (
    <group ref={groupRef}>
      <ParticleField reducedMotion={reducedMotion} />

      {anchors.map((anchor, i) => {
        const [ax, ay, az] = toroidalPos(anchor.t);
        const labelPos = [ax, ay + 0.14, az];
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

  return (
    <Canvas
      className={styles.canvas}
      camera={{ position: [0, 0.4, 3.2], fov: 40, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#0a0a0a', 1)}
    >
      <ambientLight intensity={0.02} />
      <pointLight position={[3, 2, 3]} intensity={0.3} color="#ffffff" />
      <pointLight position={[-2, -2, -2]} intensity={0.08} color="#8B1A1A" />

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
        rotateSpeed={0.5}
        onStart={pauseRotation}
        onEnd={resumeRotation}
        makeDefault
      />
    </Canvas>
  );
}
