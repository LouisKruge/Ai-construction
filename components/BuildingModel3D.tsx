"use client";

// Real WebGL architectural model — an orbitable mixed-use tower rendered with
// glass materials, emissive lit windows, dusk lighting, image-based reflections
// (built from in-scene light shapes, no external HDR) and a reflective plaza.

import { useMemo, useRef, useEffect, Suspense, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  MeshReflectorMaterial,
  Edges,
  useGLTF,
  useAnimations,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, SMAA } from "@react-three/postprocessing";
import * as THREE from "three";
import { RealisticTower, towerVariants } from "@/components/RealisticTower";

const DRACO = "/draco/gltf/";

export type Selection = string | null;

interface ModelProps {
  modelUrl?: string | null;
  selected?: Selection;
  onSelect?: (name: Selection) => void;
  background?: boolean;
}

// A real GLB/GLTF asset: DRACO-decoded, auto-centered + scaled to fit, shadowed,
// with its embedded animation (if any) playing.
function ImportedModel({ url }: { url: string }) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(url, DRACO);
  const { actions } = useAnimations(gltf.animations, group);
  useEffect(() => {
    const first = Object.values(actions)[0];
    first?.reset().fadeIn(0.4).play();
    return () => { first?.fadeOut(0.2); };
  }, [actions]);
  const fitted = useMemo(() => {
    const obj = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = 12 / maxDim;
    obj.scale.setScalar(s);
    obj.position.set(-center.x * s, -box.min.y * s, -center.z * s);
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    return obj;
  }, [gltf.scene]);
  return <group ref={group}><primitive object={fitted} /></group>;
}

useGLTF.preload("/models/littlest-tokyo.glb", DRACO);

// Falls back to the parametric massing if an uploaded model fails to parse.
class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
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
      shadow-mapSize={[1024, 1024]}
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
  name,
  size,
  position,
  cols,
  rows,
  seed,
  selected,
  onSelect,
}: {
  name?: string;
  size: [number, number, number];
  position: [number, number, number];
  cols: number;
  rows: number;
  seed: number;
  selected?: Selection;
  onSelect?: (name: Selection) => void;
}) {
  const tex = useWindowTexture(cols, rows, seed);
  const isSel = !!name && selected === name;
  return (
    <mesh
      position={position}
      castShadow
      receiveShadow
      onClick={name ? (e) => { e.stopPropagation(); onSelect?.(name); } : undefined}
      onPointerOver={name ? (e) => { e.stopPropagation(); document.body.style.cursor = "pointer"; } : undefined}
      onPointerOut={name ? () => { document.body.style.cursor = "default"; } : undefined}
    >
      <boxGeometry args={size} />
      <meshPhysicalMaterial
        map={tex}
        emissive={"#ffffff"}
        emissiveMap={tex}
        emissiveIntensity={isSel ? 1.5 : 0.85}
        color={isSel ? "#1c3566" : "#10203c"}
        metalness={0.35}
        roughness={0.14}
        clearcoat={1}
        clearcoatRoughness={0.18}
        envMapIntensity={1.7}
      />
      {isSel && <Edges scale={1.015} threshold={12} color="#8ea2ff" />}
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

function ProceduralBuilding({ selected, onSelect }: { selected?: Selection; onSelect?: (n: Selection) => void }) {
  return (
    <>
      {/* podium */}
      <GlassVolume name="Podium" size={[7, 2.2, 5]} position={[0, 1.1, 0]} cols={26} rows={6} seed={11} selected={selected} onSelect={onSelect} />
      {/* mid block (setback) */}
      <GlassVolume name="Mid-Block" size={[5.4, 2.6, 4.2]} position={[-0.35, 3.5, -0.2]} cols={18} rows={7} seed={29} selected={selected} onSelect={onSelect} />
      {/* tower */}
      <GlassVolume name="Tower" size={[3.2, 9, 2.6]} position={[0.45, 9.3, 0.1]} cols={12} rows={24} seed={47} selected={selected} onSelect={onSelect} />
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

function Building({ modelUrl, selected, onSelect }: ModelProps) {
  return (
    <group position={[0, 0, 0]}>
      {modelUrl ? (
        // real asset — no procedural context boxes
        <Suspense fallback={null}>
          <ModelBoundary fallback={<RealisticTower v={towerVariants[0]} />}>
            <ImportedModel url={modelUrl} />
          </ModelBoundary>
        </Suspense>
      ) : (
        <RealisticTower v={towerVariants[0]} />
      )}
    </group>
  );
}

function Scene({ modelUrl, selected, onSelect, background }: ModelProps) {
  return (
    <>
      <fog attach="fog" args={["#141d38", 30, 80]} />

      {/* lighting */}
      <hemisphereLight args={["#9fb0d8", "#0e1730", 0.85]} />
      <AnimatedSun />
      <directionalLight position={[-14, 9, -8]} intensity={1.1} color="#7d8cff" />
      {/* cool rim from behind for edge separation */}
      <directionalLight position={[-4, 10, -14]} intensity={1.4} color="#9fb2ff" />
      <pointLight position={[4, 2.5, 5]} intensity={26} distance={18} color="#ffb060" />

      <Building modelUrl={modelUrl} selected={selected} onSelect={onSelect} background={background} />

      {/* reflective plaza (lower-res for perf) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[46, 48]} />
        <MeshReflectorMaterial
          resolution={512}
          mirror={0.5}
          mixBlur={8}
          mixStrength={3}
          blur={[300, 80]}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.2}
          depthScale={1}
          color="#080d1a"
          metalness={0.6}
          roughness={0.9}
        />
      </mesh>

      <ContactShadows position={[0, 0.02, 0]} scale={44} far={22} blur={2.6} opacity={0.55} />

      {/* real HDRI image-based lighting (dusk) — reflections + sky */}
      <Environment
        files="/hdri/venice_sunset_1k.hdr"
        environmentIntensity={1.05}
        background={!!background}
        backgroundBlurriness={0.5}
        backgroundIntensity={0.6}
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.55}
        minDistance={12}
        maxDistance={30}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.15}
        enableDamping
        dampingFactor={0.06}
        target={[0, 5.5, 0]}
      />

      {/* cinematic post — bloom + vignette + AA (SSAO dropped for smoothness) */}
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={0.65} luminanceThreshold={0.6} luminanceSmoothing={0.2} radius={0.6} />
        <Vignette eskil={false} offset={0.28} darkness={0.6} />
        <SMAA />
      </EffectComposer>
    </>
  );
}

export default function BuildingModel3D({ modelUrl, selected, onSelect, background }: ModelProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [15, 9, 17], fov: 32 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      className="h-full w-full"
      onPointerMissed={() => onSelect?.(null)}
    >
      <Suspense fallback={null}>
        <Scene modelUrl={modelUrl} selected={selected} onSelect={onSelect} background={background} />
      </Suspense>
    </Canvas>
  );
}
