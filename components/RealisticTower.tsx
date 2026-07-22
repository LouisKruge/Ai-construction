"use client";

// Architectural glass tower built from real curtain-wall geometry — floor
// slabs, aluminium mullions (instanced), reflective glazing that mirrors the
// HDRI, a podium, corner columns and a rooftop mechanical crown. Reads as a
// real building under image-based lighting, not a textured box.

import { useLayoutEffect, useMemo, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

export interface TowerVariant {
  id: string;
  label: string;
  floors: number;
  w: number;
  d: number;
  glass: string;
  podiumFloors: number;
  greenRoof?: boolean;
}

export const towerVariants: TowerVariant[] = [
  { id: "A", label: "Balanced", floors: 22, w: 14, d: 10, glass: "#2b4a5e", podiumFloors: 3 },
  { id: "B", label: "Cost Optimized", floors: 18, w: 13, d: 12, glass: "#33475a", podiumFloors: 2 },
  { id: "C", label: "Performance", floors: 27, w: 11.5, d: 9, glass: "#22414f", podiumFloors: 3 },
  { id: "D", label: "Sustainable", floors: 20, w: 16, d: 11, glass: "#26493f", podiumFloors: 3, greenRoof: true },
];

const FLOOR_H = 3.4;

function Fins({ w, d, height, yBase }: { w: number; h?: number; d: number; height: number; yBase: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mats = useMemo(() => {
    const out: { x: number; z: number; ry: number }[] = [];
    const stepX = 1.6, stepZ = 1.6;
    const nx = Math.max(2, Math.round(w / stepX));
    const nz = Math.max(2, Math.round(d / stepZ));
    for (let i = 0; i <= nx; i++) {
      const x = -w / 2 + (i * w) / nx;
      out.push({ x, z: d / 2, ry: 0 });
      out.push({ x, z: -d / 2, ry: 0 });
    }
    for (let j = 0; j <= nz; j++) {
      const z = -d / 2 + (j * d) / nz;
      out.push({ x: w / 2, z, ry: Math.PI / 2 });
      out.push({ x: -w / 2, z, ry: Math.PI / 2 });
    }
    return out;
  }, [w, d]);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    mats.forEach((p, i) => {
      q.setFromEuler(new THREE.Euler(0, p.ry, 0));
      m.compose(new THREE.Vector3(p.x, yBase + height / 2, p.z), q, s);
      ref.current!.setMatrixAt(i, m);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [mats, height, yBase]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, mats.length]} castShadow>
      <boxGeometry args={[0.12, height, 0.28]} />
      <meshStandardMaterial color="#b6c0cf" metalness={0.9} roughness={0.42} />
    </instancedMesh>
  );
}

export function RealisticTower({ v }: { v: TowerVariant }) {
  const glassMat = useMemo(
    () => (
      <meshPhysicalMaterial
        color={v.glass}
        metalness={0}
        roughness={0.07}
        envMapIntensity={1.5}
        clearcoat={1}
        clearcoatRoughness={0.06}
        reflectivity={0.9}
        ior={1.45}
      />
    ),
    [v.glass],
  );
  const concrete = <meshStandardMaterial color="#8b95a3" metalness={0.1} roughness={0.85} />;
  const metal = <meshStandardMaterial color="#aeb8c6" metalness={0.92} roughness={0.4} />;

  const podiumH = v.podiumFloors * FLOOR_H;
  const shaftH = v.floors * FLOOR_H;
  const pw = v.w + 8;
  const pd = v.d + 6;
  // normalize every variant to a consistent ~16-unit stage height
  const totalH = podiumH + shaftH + 6;
  const S = 16 / totalH;

  return (
    <group scale={S}>
      {/* ── podium ── */}
      <mesh position={[0, podiumH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[pw - 0.5, podiumH, pd - 0.5]} />
        {glassMat}
      </mesh>
      {Array.from({ length: v.podiumFloors + 1 }).map((_, i) => (
        <mesh key={`ps${i}`} position={[0, i * FLOOR_H, 0]} castShadow>
          <boxGeometry args={[pw, 0.3, pd]} />
          {concrete}
        </mesh>
      ))}
      {/* entrance canopy */}
      <mesh position={[0, podiumH * 0.34, pd / 2 + 1]} castShadow>
        <boxGeometry args={[pw * 0.5, 0.25, 3]} />
        {metal}
      </mesh>

      {/* ── tower shaft glass ── */}
      <mesh position={[0, podiumH + shaftH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[v.w - 0.3, shaftH, v.d - 0.3]} />
        {glassMat}
      </mesh>
      {/* floor slabs + spandrels */}
      {Array.from({ length: v.floors + 1 }).map((_, i) => {
        const y = podiumH + i * FLOOR_H;
        return (
          <group key={`fl${i}`}>
            <mesh position={[0, y, 0]} castShadow>
              <boxGeometry args={[v.w + 0.15, 0.22, v.d + 0.15]} />
              {concrete}
            </mesh>
            <mesh position={[0, y - FLOOR_H * 0.32, 0]}>
              <boxGeometry args={[v.w + 0.05, 0.7, v.d + 0.05]} />
              <meshStandardMaterial color="#3b4658" metalness={0.6} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
      {/* corner columns */}
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
        <mesh key={`c${i}`} position={[(sx * v.w) / 2, podiumH + shaftH / 2, (sz * v.d) / 2]} castShadow>
          <boxGeometry args={[0.45, shaftH, 0.45]} />
          {metal}
        </mesh>
      ))}
      {/* mullions */}
      <Fins w={v.w} d={v.d} height={shaftH} yBase={podiumH} />

      {/* ── crown / rooftop plant ── */}
      <mesh position={[0, podiumH + shaftH + 0.2, 0]} castShadow>
        <boxGeometry args={[v.w + 0.2, 0.4, v.d + 0.2]} />
        {metal}
      </mesh>
      <mesh position={[0, podiumH + shaftH + 1.6, 0]} castShadow>
        <boxGeometry args={[v.w * 0.55, 2.6, v.d * 0.55]} />
        {v.greenRoof ? <meshStandardMaterial color="#2f6a4a" roughness={0.9} /> : glassMat}
      </mesh>
      {[-1, 1].map((s, i) => (
        <mesh key={`pl${i}`} position={[s * v.w * 0.22, podiumH + shaftH + 1.1, 0]} castShadow>
          <boxGeometry args={[1.3, 1.3, 1.6]} />
          {metal}
        </mesh>
      ))}
      <mesh position={[0, podiumH + shaftH + 4.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
        <meshStandardMaterial color="#dfe6f2" emissive="#8ea2ff" emissiveIntensity={0.4} />
      </mesh>

      {/* landscaping ring */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const r = pw * 0.62;
        return (
          <group key={`t${i}`} position={[Math.cos(a) * r, 0, Math.sin(a) * r * 0.8]}>
            <mesh position={[0, 0.9, 0]} castShadow>
              <sphereGeometry args={[1.1, 10, 10]} />
              <meshStandardMaterial color="#2c5a3f" roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.12, 0.16, 0.9, 6]} />
              <meshStandardMaterial color="#3a2c22" roughness={1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* Small self-contained 3D thumbnail for the Design Options cards. */
export function TowerThumb({ v, className = "" }: { v: TowerVariant; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-lg ${className}`} style={{ background: "linear-gradient(160deg,#0d1836 0%,#1a2748 55%,#3a3256 82%,#5a4a60 100%)" }}>
      <Canvas
        shadows
        dpr={[1, 1.5]}
        frameloop="demand"
        camera={{ position: [20, 13, 26], fov: 30 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.02 }}
      >
        <Suspense fallback={null}>
          <hemisphereLight args={["#9fb0d8", "#0e1730", 0.7]} />
          <directionalLight position={[14, 20, 10]} intensity={2.3} color="#ffe0b8" castShadow shadow-mapSize={[1024, 1024]} />
          <group position={[0, -8, 0]}>
            <RealisticTower v={v} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <circleGeometry args={[24, 48]} />
              <meshStandardMaterial color="#0a1020" metalness={0.5} roughness={0.7} />
            </mesh>
          </group>
          <ContactShadows position={[0, -8, 0]} scale={26} far={20} blur={2.2} opacity={0.5} />
          <Environment files="/hdri/venice_sunset_1k.hdr" environmentIntensity={1.0} />
        </Suspense>
      </Canvas>
    </div>
  );
}
