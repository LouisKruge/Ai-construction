"use client";

// Architectural glass tower built from real curtain-wall geometry — floor
// slabs, aluminium mullions (instanced), reflective glazing that mirrors the
// HDRI, a podium, corner columns and a rooftop mechanical crown. Reads as a
// real building under image-based lighting, not a textured box.

import { useLayoutEffect, useMemo, useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
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

// Tower crane parked beside the building, reaching just above the top pour.
function Crane({ v, topH }: { v: TowerVariant; topH: number }) {
  const mastX = -(v.w / 2 + 3.6);
  const mastZ = -(v.d / 2 + 0.5);
  const jibLen = v.w + 7;
  const counterLen = 4.5;
  const hookX = mastX + jibLen * 0.42;
  const metal = <meshStandardMaterial color="#e6b34a" metalness={0.5} roughness={0.55} />;
  const dark = <meshStandardMaterial color="#3b4250" metalness={0.6} roughness={0.6} />;
  return (
    <group>
      <mesh position={[mastX, topH / 2, mastZ]} castShadow>
        <boxGeometry args={[0.55, topH, 0.55]} />
        {metal}
      </mesh>
      {/* operator cab */}
      <mesh position={[mastX + 0.6, topH - 0.4, mastZ]} castShadow>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        {dark}
      </mesh>
      {/* jib */}
      <mesh position={[mastX + jibLen / 2 - counterLen / 2, topH + 0.4, mastZ]} castShadow>
        <boxGeometry args={[jibLen, 0.3, 0.3]} />
        {metal}
      </mesh>
      {/* counter-jib + ballast */}
      <mesh position={[mastX - counterLen, topH + 0.4, mastZ]} castShadow>
        <boxGeometry args={[1.4, 1.0, 1.0]} />
        {dark}
      </mesh>
      {/* hoist cable + hook block */}
      <mesh position={[hookX, topH - 1.6, mastZ]}>
        <cylinderGeometry args={[0.03, 0.03, 4, 6]} />
        <meshBasicMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[hookX, topH - 3.7, mastZ]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        {dark}
      </mesh>
    </group>
  );
}

export interface ServiceRiser {
  color: string;
  done: number; // floors installed
}

export function RealisticTower({
  v,
  simple = false,
  structTo,
  facadeTo,
  risers,
  ghostGlass = false,
}: {
  v: TowerVariant;
  simple?: boolean;
  structTo?: number; // construction: floors with frame complete (undefined = finished building)
  facadeTo?: number; // construction: floors glazed / fitted-out (≤ structTo)
  risers?: ServiceRiser[]; // toggled building-system layers to visualise
  ghostGlass?: boolean; // make the envelope semi-transparent (services cutaway)
}) {
  const glassMat = useMemo(
    () =>
      ghostGlass ? (
        <meshPhysicalMaterial color={v.glass} metalness={0} roughness={0.12} transparent opacity={0.12} envMapIntensity={1.0} />
      ) : (
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
    [v.glass, ghostGlass],
  );
  const concrete = <meshStandardMaterial color="#8b95a3" metalness={0.1} roughness={0.85} />;
  const metal = <meshStandardMaterial color="#aeb8c6" metalness={0.92} roughness={0.4} />;
  const frameMat = <meshStandardMaterial color="#9aa2ac" metalness={0.15} roughness={0.92} />; // raw concrete frame

  // ── construction progress ────────────────────────────────────────────────
  const construction = structTo !== undefined;
  const clampN = (x: number) => Math.max(0, Math.min(v.floors, x));
  const sTo = construction ? clampN(structTo!) : v.floors; // structure height
  const fTo = construction ? Math.max(0, Math.min(sTo, facadeTo ?? sTo)) : v.floors; // glazing height
  const complete = sTo >= v.floors;

  const podiumH = v.podiumFloors * FLOOR_H;
  const shaftH = v.floors * FLOOR_H; // full — used for stage normalization
  const glazedH = fTo * FLOOR_H;
  const structH = sTo * FLOOR_H;
  const pw = v.w + 8;
  const pd = v.d + 6;
  // normalize every variant to a consistent ~16-unit stage height
  const totalH = podiumH + shaftH + 6;
  const S = 16 / totalH;

  return (
    <group scale={S}>
      {/* ── podium (foundations + podium built first) ── */}
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

      {/* ── tower shaft glazing — only the fitted-out floors ── */}
      {fTo > 0 && (
        <mesh position={[0, podiumH + glazedH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[v.w - 0.3, glazedH, v.d - 0.3]} />
          {glassMat}
        </mesh>
      )}
      {/* floor slabs up to structure; lit interiors only where fitted-out */}
      {Array.from({ length: sTo + 1 }).map((_, i) => {
        const y = podiumH + i * FLOOR_H;
        const glazed = i <= fTo;
        const lit = glazed && (i * 5 + 3) % 7 < 3; // interior lighting on ~40% of fitted floors
        const balcony = !construction && i > 3 && i < v.floors - 1 && (i * 3 + 1) % 4 === 0;
        return (
          <group key={`fl${i}`}>
            <mesh position={[0, y, 0]} castShadow>
              <boxGeometry args={[v.w + 0.15, 0.22, v.d + 0.15]} />
              {concrete}
            </mesh>
            {glazed && !ghostGlass && (
              <mesh position={[0, y - FLOOR_H * 0.32, 0]}>
                <boxGeometry args={[v.w + 0.05, 0.7, v.d + 0.05]} />
                <meshStandardMaterial
                  color={lit ? "#ffdba0" : "#3b4658"}
                  emissive={lit ? "#ffcf8a" : "#000000"}
                  emissiveIntensity={lit ? 0.7 : 0}
                  metalness={0.5}
                  roughness={0.5}
                />
              </mesh>
            )}
            {balcony && !simple && (
              <group>
                <mesh position={[0, y - 0.4, v.d / 2 + 0.7]} castShadow>
                  <boxGeometry args={[v.w * 0.6, 0.14, 1.4]} />
                  {concrete}
                </mesh>
                <mesh position={[0, y - 0.05, v.d / 2 + 1.36]}>
                  <boxGeometry args={[v.w * 0.6, 0.7, 0.05]} />
                  <meshStandardMaterial color="#9fb2c8" metalness={0.3} roughness={0.2} transparent opacity={0.35} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
      {/* perimeter columns to structure height (bare frame above the glazing) */}
      {structH > 0 &&
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sz], i) => (
          <mesh key={`c${i}`} position={[(sx * v.w) / 2, podiumH + structH / 2, (sz * v.d) / 2]} castShadow>
            <boxGeometry args={[0.45, structH, 0.45]} />
            {metal}
          </mesh>
        ))}
      {/* interior frame columns exposed in the structure-only (un-glazed) zone */}
      {construction &&
        sTo > fTo &&
        [[-0.42, 0], [0.42, 0], [0, -0.42], [0, 0.42]].map(([fx, fz], i) => {
          const zoneH = (sTo - fTo) * FLOOR_H;
          return (
            <mesh key={`ic${i}`} position={[fx * v.w, podiumH + fTo * FLOOR_H + zoneH / 2, fz * v.d]} castShadow>
              <boxGeometry args={[0.32, zoneH, 0.32]} />
              {frameMat}
            </mesh>
          );
        })}
      {/* starter/rebar bars poking above the top pour */}
      {construction && !complete &&
        [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [0, 0]].map(([fx, fz], i) => (
          <mesh key={`rb${i}`} position={[fx * v.w * 0.7, podiumH + structH + 0.5, fz * v.d * 0.7]}>
            <cylinderGeometry args={[0.05, 0.05, 1.0, 6]} />
            <meshStandardMaterial color="#8a6a4a" roughness={0.95} />
          </mesh>
        ))}
      {/* mullions only where glazed */}
      {fTo > 0 && <Fins w={v.w} d={v.d} height={glazedH} yBase={podiumH} />}

      {/* ── crown / rooftop plant — only once topped out ── */}
      {complete && (
        <>
          <mesh position={[0, podiumH + shaftH + 0.2, 0]} castShadow>
            <boxGeometry args={[v.w + 0.2, 0.4, v.d + 0.2]} />
            {metal}
          </mesh>
          <mesh position={[0, podiumH + shaftH + 1.6, 0]} castShadow>
            <boxGeometry args={[v.w * 0.55, 2.6, v.d * 0.55]} />
            {v.greenRoof ? <meshStandardMaterial color="#2f6a4a" roughness={0.9} /> : glassMat}
          </mesh>
          {!simple && (
            <>
              {/* rooftop mechanical equipment */}
              {[[-0.26, 0.15], [0.24, -0.18], [0.05, 0.28]].map(([fx, fz], i) => (
                <mesh key={`eq${i}`} position={[fx * v.w, podiumH + shaftH + 1.0, fz * v.d]} castShadow>
                  <boxGeometry args={[1.5, 1.1, 1.7]} />
                  {metal}
                </mesh>
              ))}
              {[[-0.28, -0.2], [0.22, 0.24]].map(([fx, fz], i) => (
                <mesh key={`cu${i}`} position={[fx * v.w, podiumH + shaftH + 1.1, fz * v.d]} castShadow>
                  <cylinderGeometry args={[0.55, 0.55, 0.9, 14]} />
                  <meshStandardMaterial color="#8b95a3" metalness={0.7} roughness={0.5} />
                </mesh>
              ))}
              {/* rooftop parapet frame */}
              {[[0, 1, v.d / 2], [0, 1, -v.d / 2]].map(([, , z], i) => (
                <mesh key={`pa${i}`} position={[0, podiumH + shaftH + 0.7, z as number]}>
                  <boxGeometry args={[v.w + 0.2, 0.5, 0.1]} />
                  {metal}
                </mesh>
              ))}
            </>
          )}
          <mesh position={[0, podiumH + shaftH + 4.4, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
            <meshStandardMaterial color="#dfe6f2" emissive="#8ea2ff" emissiveIntensity={0.4} />
          </mesh>
        </>
      )}

      {/* ── toggled building-system service layers (risers) ── */}
      {risers &&
        risers.length > 0 &&
        risers.map((r, i) => {
          const cols = 3;
          const gx = (i % cols) - 1;
          const gz = Math.floor(i / cols) - 0.5;
          const x = gx * v.w * 0.16;
          const z = gz * v.d * 0.26;
          const hgt = Math.max(0.3, r.done * FLOOR_H);
          const topY = podiumH + r.done * FLOOR_H;
          return (
            <group key={`r${i}`} position={[x, 0, z]}>
              {/* vertical riser main */}
              <mesh position={[0, podiumH + hgt / 2, 0]}>
                <cylinderGeometry args={[0.14, 0.14, hgt, 10]} />
                <meshStandardMaterial color={r.color} emissive={r.color} emissiveIntensity={0.85} metalness={0.3} roughness={0.4} />
              </mesh>
              {/* floor-by-floor install nodes */}
              {Array.from({ length: r.done }).map((_, f) => (
                <mesh key={f} position={[0, podiumH + (f + 1) * FLOOR_H, 0]}>
                  <sphereGeometry args={[0.24, 8, 8]} />
                  <meshStandardMaterial color={r.color} emissive={r.color} emissiveIntensity={1.5} />
                </mesh>
              ))}
              {/* bright install front */}
              {r.done > 0 && (
                <mesh position={[0, topY, 0]}>
                  <sphereGeometry args={[0.36, 12, 12]} />
                  <meshStandardMaterial color="#ffffff" emissive={r.color} emissiveIntensity={2.4} />
                </mesh>
              )}
            </group>
          );
        })}

      {/* ── tower crane while still building ── */}
      {construction && !complete && <Crane v={v} topH={podiumH + structH + 6} />}

      {/* landscaping ring (finished building views only) */}
      {!simple &&
        !construction &&
        Array.from({ length: 8 }).map((_, i) => {
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

// Captures the rendered frame to a still image, then the parent unmounts the
// canvas — so the 4 option thumbnails cost nothing (and hold no WebGL context)
// after their first render.
function Freeze({ onReady, delay }: { onReady: (u: string) => void; delay: number }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        onReady(gl.domElement.toDataURL("image/png"));
      } catch {
        /* ignore */
      }
    }, delay);
    return () => clearTimeout(t);
  }, [gl, onReady, delay]);
  return null;
}

/* Small 3D thumbnail for the Design Options cards — renders once, then freezes
   to a static image to keep the dashboard smooth. */
export function TowerThumb({ v, className = "", delay = 1300 }: { v: TowerVariant; className?: string; delay?: number }) {
  const [img, setImg] = useState<string | null>(null);
  const dusk = "linear-gradient(160deg,#0d1836 0%,#1a2748 55%,#3a3256 82%,#5a4a60 100%)";
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ background: dusk }}>
      {img && <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {!img && (
        <Canvas
          dpr={1}
          camera={{ position: [20, 13, 26], fov: 30 }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}
        >
          <Suspense fallback={null}>
            <hemisphereLight args={["#9fb0d8", "#0e1730", 0.75]} />
            <directionalLight position={[14, 20, 10]} intensity={2.5} color="#ffe0b8" />
            <directionalLight position={[-12, 10, -8]} intensity={1.1} color="#9fb2ff" />
            <group position={[0, -8, 0]}>
              <RealisticTower v={v} />
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[24, 48]} />
                <meshStandardMaterial color="#0a1020" metalness={0.5} roughness={0.7} />
              </mesh>
            </group>
            <ContactShadows position={[0, -8, 0]} scale={26} far={20} blur={2.2} opacity={0.5} />
            <Environment files="/hdri/venice_sunset_1k.hdr" environmentIntensity={1.0} />
            <Freeze onReady={setImg} delay={delay} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
