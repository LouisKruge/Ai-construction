"use client";

// Real WebGL architectural model — an orbitable mixed-use tower rendered with
// glass materials, emissive lit windows, dusk lighting, image-based reflections
// (built from in-scene light shapes, no external HDR) and a reflective plaza.

import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
  MeshReflectorMaterial,
  useGLTF,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SSAO, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";

// Drop a real project model in /public/models/*.glb and point MODEL_URL at it
// (e.g. "/models/sandton-gate.glb") to render the actual BIM/GLTF geometry in
// this same viewport instead of the parametric massing below.
const MODEL_URL: string | null = null;

function ImportedModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

// Cinematic sun that slowly arcs across the scene (animated lighting).
function AnimatedSun() {
  const ref = useRef<THREE.DirectionalLight>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.06;
    if (ref.current) {
      ref.current.position.set(Math.cos(t) * 15, 15 + Math.sin(t) * 3, Math.sin(t) * 11 - 2);
    }
  });
  return (
    <directionalLight
      ref={ref}
      position={[12, 18, 9]}
      intensity={2.8}
      color="#ffe0b8"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-near={1}
      shadow-camera-far={60}
      shadow-camera-left={-20}
      shadow-camera-right={20}
      shadow-camera-top={24}
      shadow-camera-bottom={-6}
      shadow-bias={-0.0004}
    />
  );
}

/* ── procedural curtain-wall / lit-window texture ─────────────────────────── */
function useWindowTexture(cols: number, rows: number, seed: number) {
  return useMemo(() => {
    const cell = 16;
    const c = document.createElement("canvas");
    c.width = cols * cell;
    c.height = rows * cell;
    const ctx = c.getContext("2d")!;
    // dark glass base + faint vertical sheen
    const g = ctx.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0, "#0b1730");
    g.addColorStop(0.5, "#070f22");
    g.addColorStop(1, "#050a16");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
    // deterministic PRNG
    let s = seed >>> 0;
    const rand = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cell;
        const y = r * cell;
        const v = rand();
        let color = "#0c1730"; // dark glass (default)
        if (v < 0.09) color = "#ffcf8a"; // warm interior
        else if (v < 0.16) color = "#cfe0ff"; // cool interior
        ctx.fillStyle = color;
        ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4); // inset → mullion gaps
      }
      // darker structural floor-slab band every 2 storeys
      if (r % 2 === 0) {
        ctx.fillStyle = "#060b18";
        ctx.fillRect(0, r * cell, c.width, 2);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, [cols, rows, seed]);
}

/* ── a glazed volume (box) with lit-window material on every face ─────────── */
function GlassVolume({
  size,
  position,
  cols,
  rows,
  seed,
}: {
  size: [number, number, number];
  position: [number, number, number];
  cols: number;
  rows: number;
  seed: number;
}) {
  const tex = useWindowTexture(cols, rows, seed);
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        map={tex}
        emissive={"#ffffff"}
        emissiveMap={tex}
        emissiveIntensity={0.85}
        color={"#10203c"}
        metalness={0.35}
        roughness={0.14}
        clearcoat={1}
        clearcoatRoughness={0.18}
        envMapIntensity={1.7}
      />
    </mesh>
  );
}

/* low-rise city context ringing the hero building */
function City() {
  const blocks = useMemo(() => {
    let s = 7;
    const rand = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    return Array.from({ length: 40 }, () => {
      const ang = rand() * Math.PI * 2;
      const rad = 24 + rand() * 24;
      const h = 2 + rand() * 6.5;
      const w = 1.6 + rand() * 2.2;
      const d = 1.6 + rand() * 2.2;
      return { x: Math.cos(ang) * rad, z: Math.sin(ang) * rad, h, w, d, lit: rand() };
    });
  }, []);
  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            color="#0b1428"
            metalness={0.4}
            roughness={0.6}
            emissive={b.lit > 0.55 ? "#ffcf8a" : "#1a2440"}
            emissiveIntensity={b.lit > 0.55 ? 0.25 : 0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

function ProceduralBuilding() {
  return (
    <>
      {/* podium */}
      <GlassVolume size={[7, 2.2, 5]} position={[0, 1.1, 0]} cols={26} rows={6} seed={11} />
      {/* mid block (setback) */}
      <GlassVolume size={[5.4, 2.6, 4.2]} position={[-0.35, 3.5, -0.2]} cols={18} rows={7} seed={29} />
      {/* tower */}
      <GlassVolume size={[3.2, 9, 2.6]} position={[0.45, 9.3, 0.1]} cols={12} rows={24} seed={47} />
      {/* crown */}
      <mesh position={[0.45, 14.15, 0.1]} castShadow>
        <boxGeometry args={[2, 0.9, 1.5]} />
        <meshStandardMaterial color="#1b2740" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* mast */}
      <mesh position={[0.45, 15.2, 0.1]}>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 8]} />
        <meshStandardMaterial color="#8ea2ff" emissive="#8ea2ff" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.45, 16.0, 0.1]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
      </mesh>
      {/* podium canopy lip */}
      <mesh position={[0, 2.25, 2.55]} castShadow>
        <boxGeometry args={[7.2, 0.12, 0.5]} />
        <meshStandardMaterial color="#223257" metalness={0.5} roughness={0.5} />
      </mesh>
    </>
  );
}

function Building() {
  return (
    <group position={[0, 0, 0]}>
      <City />
      {MODEL_URL ? (
        <Suspense fallback={null}>
          <ImportedModel url={MODEL_URL} />
        </Suspense>
      ) : (
        <ProceduralBuilding />
      )}
    </group>
  );
}

function Scene() {
  return (
    <>
      <fog attach="fog" args={["#141d38", 26, 70]} />

      {/* lighting */}
      <hemisphereLight args={["#9fb0d8", "#0e1730", 0.85]} />
      <AnimatedSun />
      <directionalLight position={[-14, 9, -8]} intensity={1.1} color="#7d8cff" />
      {/* cool rim from behind for edge separation */}
      <directionalLight position={[-4, 10, -14]} intensity={1.4} color="#9fb2ff" />
      <pointLight position={[4, 2.5, 5]} intensity={26} distance={18} color="#ffb060" />

      <Building />

      {/* reflective plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[46, 64]} />
        <MeshReflectorMaterial
          resolution={1024}
          mirror={0.55}
          mixBlur={7}
          mixStrength={4}
          blur={[420, 110]}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.2}
          depthScale={1.1}
          color="#080d1a"
          metalness={0.6}
          roughness={0.85}
        />
      </mesh>

      <ContactShadows position={[0, 0.02, 0]} scale={44} far={22} blur={2.6} opacity={0.55} />

      {/* image-based lighting built from soft light panels (no external HDR) */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#0a1226"]} />
        <Lightformer form="rect" intensity={2.2} color="#9fb2ff" position={[0, 12, -8]} scale={[20, 8, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffd9a8" position={[10, 6, 6]} scale={[10, 12, 1]} rotation={[0, -Math.PI / 3, 0]} />
        <Lightformer form="rect" intensity={1.1} color="#6d7cff" position={[-12, 5, 2]} scale={[10, 12, 1]} rotation={[0, Math.PI / 2.4, 0]} />
        <Lightformer form="ring" intensity={1.6} color="#ffb27a" position={[8, 3, -10]} scale={[8, 8, 1]} />
      </Environment>

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.55}
        minDistance={12}
        maxDistance={30}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 5.5, 0]}
      />

      {/* cinematic post: ambient occlusion + bloom + vignette + AA */}
      <EffectComposer enableNormalPass multisampling={4}>
        <SSAO samples={21} radius={0.12} intensity={20} luminanceInfluence={0.5} color={new THREE.Color("black")} worldDistanceThreshold={40} worldDistanceFalloff={6} worldProximityThreshold={6} worldProximityFalloff={1} />
        <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.55} luminanceSmoothing={0.2} radius={0.7} />
        <Vignette eskil={false} offset={0.28} darkness={0.62} />
        <SMAA />
      </EffectComposer>
    </>
  );
}

export default function BuildingModel3D() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [15, 9, 17], fov: 32 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      className="h-full w-full"
    >
      <Scene />
    </Canvas>
  );
}
