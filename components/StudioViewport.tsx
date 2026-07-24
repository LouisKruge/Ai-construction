"use client";

import { useEffect, useMemo, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, useGLTF, Html, AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";
import { RealisticTower, type TowerVariant } from "@/components/RealisticTower";
import { useStudio, MATERIALS, CLASHES, type RenderMode } from "@/lib/studioStore";
import { buildingSystems } from "@/lib/systems";
import { fitToStage } from "@/lib/threeFit";
import CityContext from "@/components/CityContext";

const DRACO = "/draco/gltf/";

// FBX / OBJ loaders are heavier and rarely used — load them on demand.
const FbxModel = dynamic(() => import("@/components/loaders/FbxModel"), { ssr: false });
const ObjModel = dynamic(() => import("@/components/loaders/ObjModel"), { ssr: false });

// ── Asset Manager — loads GLB / GLTF (Draco) / FBX / OBJ by extension ──
function extOf(url: string): "glb" | "gltf" | "fbx" | "obj" {
  const hash = url.split("#")[1];
  if (hash === "fbx" || hash === "obj" || hash === "gltf" || hash === "glb") return hash;
  const clean = url.split("#")[0].split("?")[0].toLowerCase();
  if (clean.endsWith(".fbx")) return "fbx";
  if (clean.endsWith(".obj")) return "obj";
  if (clean.endsWith(".gltf")) return "gltf";
  return "glb";
}

function GlbModel({ url }: { url: string }) {
  const { scene } = useGLTF(url, DRACO);
  const fitted = useMemo(() => fitToStage(scene), [scene]);
  return <primitive object={fitted} />;
}
function AssetModel({ url }: { url: string }) {
  const ext = extOf(url);
  const src = url.split("#")[0];
  if (ext === "fbx") return <FbxModel url={src} />;
  if (ext === "obj") return <ObjModel url={src} />;
  return <GlbModel url={src} />;
}
useGLTF.preload("/models/littlest-tokyo.glb", DRACO);

// Clash markers floating in the model volume.
function ClashMarkers() {
  const col = { high: "#fb7185", med: "#fbbf24", low: "#38bdf8" } as const;
  return (
    <group>
      {CLASHES.filter((c) => c.status !== "Resolved").map((c) => (
        <group key={c.id} position={c.pos}>
          <mesh>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color={col[c.severity]} emissive={col[c.severity]} emissiveIntensity={1.4} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshBasicMaterial color={col[c.severity]} transparent opacity={0.18} />
          </mesh>
          <Html center distanceFactor={26} className="pointer-events-none">
            <span className="whitespace-nowrap rounded border border-edge bg-base/85 px-1.5 py-0.5 font-mono text-[9px] text-fg backdrop-blur">{c.id}</span>
          </Html>
        </group>
      ))}
    </group>
  );
}

// Applies the active render mode to every mesh in the building group.
function ModeOverride({ groupRef, mode }: { groupRef: React.RefObject<THREE.Group | null>; mode: RenderMode }) {
  useEffect(() => {
    const g = groupRef.current;
    if (!g) return;
    g.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (!mat) return;
      mat.wireframe = mode === "wireframe" || mode === "structural";
      mat.transparent = mode === "xray";
      mat.opacity = mode === "xray" ? 0.22 : 1;
      mat.needsUpdate = true;
    });
  }, [groupRef, mode]);
  return null;
}

function Sun({ hour }: { hour: number }) {
  const ref = useRef<THREE.DirectionalLight>(null);
  const t = Math.max(0, Math.min(1, (hour - 5) / 15)); // 05:00 → 20:00
  const az = t * Math.PI; // east → west
  const elev = Math.sin(t * Math.PI); // 0 at dawn/dusk, 1 at noon
  const warm = 1 - elev; // warmer near horizon
  const color = new THREE.Color().setHSL(0.09 + warm * 0.02, 0.6, 0.55 + elev * 0.25);
  useEffect(() => {
    if (ref.current) ref.current.position.set(Math.cos(az - Math.PI / 2) * 26, 3 + elev * 34, Math.sin(az - Math.PI / 2) * 22 + 6);
  });
  return (
    <directionalLight
      ref={ref}
      intensity={0.8 + elev * 2.2}
      color={color}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-camera-near={1}
      shadow-camera-far={80}
      shadow-camera-left={-24}
      shadow-camera-right={24}
      shadow-camera-top={30}
      shadow-camera-bottom={-6}
      shadow-bias={-0.0004}
    />
  );
}

function Building() {
  const { floors, width, depth, facadeMaterialId, renderMode, timeOfDay, modelSource, showClashes, constructionMode, structFloors, facadeFloors, visibleSystems } = useStudio();
  const groupRef = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const risers = constructionMode
    ? buildingSystems(floors, structFloors, facadeFloors)
        .filter((s) => s.riser && visibleSystems[s.id])
        .map((s) => ({ color: s.color, done: s.done }))
    : [];
  const systemsKey = risers.map((r) => r.color).join();
  // re-render the on-demand canvas whenever the model changes
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => { invalidate(); if (++n > 12) clearInterval(id); }, 90);
    return () => clearInterval(id);
  }, [invalidate, floors, width, depth, facadeMaterialId, renderMode, timeOfDay, modelSource, showClashes, constructionMode, structFloors, facadeFloors, systemsKey]);
  const mat = MATERIALS.find((m) => m.id === facadeMaterialId)!;
  const v: TowerVariant = {
    id: "studio",
    label: "Studio",
    floors,
    w: width / 2.4,
    d: depth / 2.4,
    glass: renderMode === "structural" ? "#8b95a3" : mat.color,
    podiumFloors: 3,
  };
  const night = timeOfDay < 6.5 || timeOfDay > 18.5;
  const glbUrl = modelSource === "parametric" ? null : modelSource === "reference" ? "/models/littlest-tokyo.glb" : modelSource;
  return (
    <>
      <Sun hour={timeOfDay} />
      <hemisphereLight args={["#9fb0d8", "#0e1730", night ? 0.35 : 0.7]} />
      <group ref={groupRef}>
        {glbUrl ? (
          <Suspense fallback={null}>
            <AssetModel url={glbUrl} />
          </Suspense>
        ) : (
          <RealisticTower
            v={v}
            simple
            structTo={constructionMode ? structFloors : undefined}
            facadeTo={constructionMode ? facadeFloors : undefined}
            risers={risers}
            ghostGlass={risers.length > 0}
          />
        )}
      </group>
      <ModeOverride groupRef={groupRef} mode={renderMode} />
      {showClashes && <ClashMarkers />}
      {/* ground — full digital-twin district around the hero, or a plain pad under an imported asset */}
      {glbUrl ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[60, 64]} />
          <meshStandardMaterial color="#0a1020" metalness={0.4} roughness={0.85} />
        </mesh>
      ) : (
        <CityContext night={night} />
      )}
      <ContactShadows position={[0, 0.02, 0]} scale={44} far={30} blur={2.4} opacity={0.5} />
      <Environment files="/hdri/venice_sunset_1k.hdr" environmentIntensity={night ? 0.5 : 1.05} background backgroundBlurriness={0.6} backgroundIntensity={night ? 0.25 : 0.6} />
    </>
  );
}

// After the scene + HDRI load, request a few frames so the on-demand canvas
// paints the loaded model, then let it idle (no continuous rendering).
function Warmup() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      invalidate();
      if (++n > 24) clearInterval(id);
    }, 90);
    return () => clearInterval(id);
  }, [invalidate]);
  return null;
}

export default function StudioViewport() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      frameloop="demand"
      camera={{ position: [22, 14, 26], fov: 32 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      className="h-full w-full"
    >
      <Suspense fallback={null}>
        <Building />
        <Warmup />
        <OrbitControls makeDefault enablePan enableDamping dampingFactor={0.08} minDistance={14} maxDistance={95} maxPolarAngle={Math.PI / 2.05} target={[0, 7, 0]} />
        {/* cinematic post — subtle bloom on glass/lights, crisp AA, gentle vignette */}
        <EffectComposer enableNormalPass={false} multisampling={0}>
          <Bloom intensity={0.5} luminanceThreshold={0.72} luminanceSmoothing={0.22} mipmapBlur radius={0.7} />
          <Vignette offset={0.22} darkness={0.62} eskil={false} />
          <SMAA />
        </EffectComposer>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Suspense>
    </Canvas>
  );
}
