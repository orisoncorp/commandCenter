import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Top 2 MRR pairs: Acme Corp SP ↔ Delta Corp POA, Acme Corp ↔ Beta Industries
const CONNECTIONS = [
  { a: { lat: -23.55, lng: -46.63 }, b: { lat: -30.03, lng: -51.23 } },
  { a: { lat: -23.55, lng: -46.63 }, b: { lat: -22.91, lng: -43.17 } },
];

function latLngToVec3(lat, lng, r) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function buildArc(latA, lngA, latB, lngB, segments = 48) {
  const a = latLngToVec3(latA, lngA, 1.02);
  const b = latLngToVec3(latB, lngB, 1.02);
  // Control point: midpoint elevated above surface
  const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(1.35);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  return curve.getPoints(segments);
}

function ArcLine({ conn, phaseOffset }) {
  const ref = useRef();
  const points = useMemo(
    () => buildArc(conn.a.lat, conn.a.lng, conn.b.lat, conn.b.lng),
    [conn]
  );
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  // Animate dash offset for "flow" effect
  useFrame(({ clock }) => {
    if (!ref.current) return;
    // dashOffset cycles 0→1 over 6s, offset per arc to desync
    const t = ((clock.getElapsedTime() * 0.167) + phaseOffset) % 1;
    ref.current.material.dashOffset = -t;
  });

  return (
    <line_ ref={ref} geometry={geometry}>
      <lineDashedMaterial
        color="#8B1A1A"
        transparent
        opacity={0.12}
        linewidth={1}
        dashSize={0.04}
        gapSize={0.06}
        depthWrite={false}
      />
    </line_>
  );
}

export default function ConnectionLines() {
  return (
    <>
      {CONNECTIONS.map((conn, i) => (
        <ArcLine key={i} conn={conn} phaseOffset={i * 0.5} />
      ))}
    </>
  );
}
