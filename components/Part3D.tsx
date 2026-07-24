"use client";

import { useEffect, useMemo, useRef, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Edges } from "@react-three/drei";
import * as THREE from "three";
import { methodColor, type Part } from "@/lib/fabrication";

/* PBR material params derived from the part's finish / material / grade. */
function matParams(part: Part): { color: string; metalness: number; roughness: number } {
  const f = part.finish.toLowerCase();
  const alu = part.material.toLowerCase().includes("alumin");
  if (f.includes("galvan")) return { color: "#aeb8c6", metalness: 0.92, roughness: 0.36 }; // spangled zinc
  if (f.includes("primer")) return { color: "#8a4b3a", metalness: 0.45, roughness: 0.72 }; // red-oxide primer
  if (f.includes("anod")) return { color: "#8f9aa6", metalness: 0.86, roughness: 0.3 };
  if (f.includes("powder")) return { color: "#2f3a4a", metalness: 0.25, roughness: 0.62 };
  if (f.includes("zinc")) return { color: "#c2c8d0", metalness: 0.9, roughness: 0.26 };
  if (f.includes("bright")) return { color: "#c8ccd2", metalness: 0.95, roughness: 0.2 };
  if (alu) return { color: "#9aa3ad", metalness: 0.85, roughness: 0.34 };
  return { color: "#889", metalness: 0.85, roughness: 0.44 }; // bare structural steel
}

/* Extruded plate with real drilled holes (mm units), centred on the origin. */
function plateGeometry(part: Part) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(part.w, 0);
  shape.lineTo(part.w, part.h);
  shape.lineTo(0, part.h);
  shape.closePath();
  for (const hole of part.holes) {
    const path = new THREE.Path();
    path.absarc(hole.x, hole.y, hole.d / 2, 0, Math.PI * 2, true);
    shape.holes.push(path);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: part.thk, bevelEnabled: false, curveSegments: 28 });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

/* Headed shear studs for the cast-in embed plate. */
function studGrid(part: Part) {
  const cols = 4, rows = 3, m = 55, len = 110, dia = 19;
  const studs: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      studs.push({ x: m + (c * (part.w - 2 * m)) / (cols - 1), y: m + (r * (part.h - 2 * m)) / (rows - 1) });
  return { studs, len, dia };
}

function PartMesh({ part }: { part: Part }) {
  const mp = matParams(part);
  const isPin = part.material.toLowerCase().includes("round bar");
  const isEmbed = part.id === "EP-012";
  const maxDim = Math.max(part.w, part.h, part.thk);
  const S = 3.4 / maxDim; // fit to view

  const plateGeo = useMemo(() => (isPin ? null : plateGeometry(part)), [part, isPin]);
  const embed = useMemo(() => (isEmbed ? studGrid(part) : null), [part, isEmbed]);
  useEffect(() => () => plateGeo?.dispose(), [plateGeo]);

  const mat = () => <meshStandardMaterial color={mp.color} metalness={mp.metalness} roughness={mp.roughness} envMapIntensity={1.1} />;

  /* Machined round bar (clevis pin) with cross-bores. */
  if (isPin) {
    const R = part.thk / 2, L = part.w;
    return (
      <group scale={S} rotation={[0, 0, Math.PI / 2]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[R, R, L, 48]} />
          {mat()}
        </mesh>
        {/* chamfered head collar */}
        <mesh position={[0, L / 2, 0]} castShadow>
          <cylinderGeometry args={[R * 1.18, R, R * 0.4, 48]} />
          {mat()}
        </mesh>
        {/* cross-bores */}
        {part.holes.map((h, i) => (
          <mesh key={i} position={[0, h.x - L / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[h.d / 2, h.d / 2, R * 2.2, 24]} />
            <meshStandardMaterial color="#0a0f1a" metalness={0.3} roughness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group scale={S} rotation={[-Math.PI / 2, 0, 0]}>
      {/* plate laid flat on the fab table, thickness pointing up */}
      <mesh geometry={plateGeo!} castShadow receiveShadow>
        {mat()}
        <Edges threshold={22} color="#3a4a78" />
      </mesh>
      {/* headed shear studs on the embed plate's top face */}
      {embed?.studs.map((s, i) => {
        const px = s.x - part.w / 2, py = s.y - part.h / 2, z0 = part.thk / 2;
        return (
          <group key={i} position={[px, py, z0]}>
            {/* shaft — cylinder axis rotated from Y to +Z so studs stand upright */}
            <mesh position={[0, 0, embed.len / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[embed.dia / 2, embed.dia / 2, embed.len, 20]} />
              <meshStandardMaterial color="#b9c0cc" metalness={0.85} roughness={0.4} />
            </mesh>
            {/* forged head */}
            <mesh position={[0, 0, embed.len]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[embed.dia * 0.85, embed.dia * 0.85, embed.dia * 0.6, 20]} />
              <meshStandardMaterial color="#b9c0cc" metalness={0.85} roughness={0.4} />
            </mesh>
          </group>
        );
      })}
      {/* cylinders sit along local +Z; rotate group already lays them upright */}
    </group>
  );
}

// Paint a few frames after the HDRI + geometry load, then idle (on-demand).
function Warmup({ dep }: { dep: unknown }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => { invalidate(); if (++n > 20) clearInterval(id); }, 90);
    return () => clearInterval(id);
  }, [invalidate, dep]);
  return null;
}

export default function Part3D({ part }: { part: Part }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ position: [3.2, 2.6, 4.2], fov: 32 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
      className="h-full w-full"
    >
      <color attach="background" args={["#0a1020"]} />
      <hemisphereLight args={["#9fb0d8", "#0e1730", 0.6]} />
      <directionalLight position={[5, 8, 4]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} />
      <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#7f9bff" />
      <Suspense fallback={null}>
        <PartMesh part={part} />
        <ContactShadows position={[0, -0.02, 0]} scale={8} far={6} blur={2.6} opacity={0.5} />
        <Environment files="/hdri/venice_sunset_1k.hdr" environmentIntensity={0.9} />
        <Warmup dep={part.id} />
        <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={2.6} maxDistance={9} target={[0, 0.4, 0]} />
      </Suspense>
    </Canvas>
  );
}
