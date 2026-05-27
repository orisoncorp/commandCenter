import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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
  const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(1.35);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  return curve.getPoints(segments);
}

function ArcLine({ conn, phaseOffset }) {
  const matRef = useRef();
  const lineRef = useRef();

  const geometry = useMemo(() => {
    const points = buildArc(conn.a.lat, conn.a.lng, conn.b.lat, conn.b.lng);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [conn]);

  useLayoutEffect(() => {
    lineRef.current?.computeLineDistances();
  }, [geometry]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = ((clock.getElapsedTime() * 0.167) + phaseOffset) % 1;
    matRef.current.dashOffset = -t;
  });

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineDashedMaterial
        ref={matRef}
        color="#8B1A1A"
        transparent
        opacity={0.25}
        linewidth={1.5}
        dashSize={0.04}
        gapSize={0.06}
        depthWrite={false}
      />
    </line>
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
