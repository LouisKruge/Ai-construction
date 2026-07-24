"use client";

// Digital-twin district around the hero tower: surrounding context massing
// (concrete + glass), a road / sidewalk grid, plaza, street trees, street
// lights and a couple of site cranes. Context blocks are deliberately clean
// massing — the way real archviz (Forma / Twinmotion) shows surroundings —
// and everything is instanced so the whole block is only a handful of draws.

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Item {
  pos: [number, number, number];
  scale: [number, number, number];
  rot?: number;
  color?: THREE.Color;
}

function useInstanced(ref: React.RefObject<THREE.InstancedMesh | null>, items: Item[]) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    items.forEach((it, i) => {
      e.set(0, it.rot ?? 0, 0);
      q.setFromEuler(e);
      p.set(it.pos[0], it.pos[1], it.pos[2]);
      s.set(it.scale[0], it.scale[1], it.scale[2]);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
      if (it.color) mesh.setColorAt(i, it.color);
    });
    mesh.count = items.length;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [ref, items]);
}

interface District {
  concrete: Item[];
  glass: Item[];
  caps: Item[];
  trees: Item[];
  trunks: Item[];
  poles: Item[];
  lamps: Item[];
  roads: Item[];
}

function useDistrict(night: boolean): District {
  return useMemo(() => {
    const rnd = mulberry32(20240724);
    const concrete: Item[] = [];
    const glass: Item[] = [];
    const caps: Item[] = [];
    const trees: Item[] = [];
    const trunks: Item[] = [];
    const poles: Item[] = [];
    const lamps: Item[] = [];
    const roads: Item[] = [];

    const step = 15;
    const cGrey = new THREE.Color("#6a727e");
    const cGrey2 = new THREE.Color("#565d68");
    const cGlass = new THREE.Color("#38506a");
    const cGlass2 = new THREE.Color("#2c4560");

    for (let gx = -4; gx <= 4; gx++) {
      for (let gz = -4; gz <= 4; gz++) {
        const x = gx * step + (rnd() - 0.5) * 5;
        const z = gz * step + (rnd() - 0.5) * 5;
        const r = Math.hypot(x, z);
        if (r < 21) continue; // keep the hero plaza clear
        if (r > 66) continue;
        if (rnd() < 0.2) continue; // gaps = parks / intersections
        const w = 6 + rnd() * 8;
        const d = 6 + rnd() * 8;
        const near = 1 - Math.min(1, r / 80);
        const h = Math.max(5, 5 + Math.pow(rnd(), 1.5) * 46 * (0.4 + near));
        const isGlass = rnd() < 0.42;
        const rot = (rnd() - 0.5) * 0.25;
        const item: Item = { pos: [x, h / 2, z], scale: [w, h, d], rot, color: isGlass ? (rnd() < 0.5 ? cGlass : cGlass2) : rnd() < 0.5 ? cGrey : cGrey2 };
        (isGlass ? glass : concrete).push(item);
        // rooftop plant / parapet cap
        caps.push({ pos: [x, h + 0.6, z], scale: [w * 0.5, 1.2, d * 0.5], rot });
        // street trees + a lamp on some plots
        if (rnd() < 0.5) {
          const tx = x + (w / 2 + 2) * (rnd() < 0.5 ? 1 : -1);
          const tz = z + (d / 2 + 2) * (rnd() < 0.5 ? 1 : -1);
          trees.push({ pos: [tx, 1.6, tz], scale: [1.3, 1.5, 1.3] });
          trunks.push({ pos: [tx, 0.6, tz], scale: [1, 1, 1] });
        }
        if (rnd() < 0.4) {
          const lx = x + (w / 2 + 1.4) * (rnd() < 0.5 ? 1 : -1);
          const lz = z + (d / 2 + 1.4);
          poles.push({ pos: [lx, 2, lz], scale: [1, 1, 1] });
          lamps.push({ pos: [lx, 4, lz], scale: [1, 1, 1] });
        }
      }
    }

    // road grid — light asphalt strips at ground
    const roadCol = new THREE.Color("#161b24");
    for (let g = -4; g <= 4; g++) {
      const p = g * step + step / 2;
      if (Math.abs(p) > 70) continue;
      roads.push({ pos: [p, 0.02, 0], scale: [6, 1, 150], color: roadCol });
      roads.push({ pos: [0, 0.02, p], scale: [150, 1, 6], color: roadCol });
    }

    return { concrete, glass, caps, trees, trunks, poles, lamps, roads };
  }, []);
}

export default function CityContext({ night }: { night: boolean }) {
  const concreteRef = useRef<THREE.InstancedMesh>(null);
  const glassRef = useRef<THREE.InstancedMesh>(null);
  const capsRef = useRef<THREE.InstancedMesh>(null);
  const treesRef = useRef<THREE.InstancedMesh>(null);
  const trunksRef = useRef<THREE.InstancedMesh>(null);
  const polesRef = useRef<THREE.InstancedMesh>(null);
  const lampsRef = useRef<THREE.InstancedMesh>(null);
  const roadsRef = useRef<THREE.InstancedMesh>(null);
  const d = useDistrict(night);

  useInstanced(concreteRef, d.concrete);
  useInstanced(glassRef, d.glass);
  useInstanced(capsRef, d.caps);
  useInstanced(treesRef, d.trees);
  useInstanced(trunksRef, d.trunks);
  useInstanced(polesRef, d.poles);
  useInstanced(lampsRef, d.lamps);
  useInstanced(roadsRef, d.roads);

  return (
    <group>
      {/* district ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#0a1018" metalness={0.3} roughness={0.82} />
      </mesh>
      {/* plaza around the hero */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <circleGeometry args={[19, 48]} />
        <meshStandardMaterial color="#1a2230" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* roads */}
      <instancedMesh ref={roadsRef} args={[undefined, undefined, d.roads.length]} receiveShadow>
        <boxGeometry args={[1, 0.04, 1]} />
        <meshStandardMaterial color="#161b24" metalness={0.2} roughness={0.6} vertexColors />
      </instancedMesh>

      {/* concrete context massing */}
      <instancedMesh ref={concreteRef} args={[undefined, undefined, Math.max(1, d.concrete.length)]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors metalness={0.1} roughness={0.86} />
      </instancedMesh>
      {/* glass context towers */}
      <instancedMesh ref={glassRef} args={[undefined, undefined, Math.max(1, d.glass.length)]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors metalness={0.2} roughness={0.16} envMapIntensity={1.3} />
      </instancedMesh>
      {/* rooftop plant caps */}
      <instancedMesh ref={capsRef} args={[undefined, undefined, Math.max(1, d.caps.length)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a515c" metalness={0.4} roughness={0.6} />
      </instancedMesh>

      {/* street trees */}
      <instancedMesh ref={treesRef} args={[undefined, undefined, Math.max(1, d.trees.length)]} castShadow>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#2c5a3f" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={trunksRef} args={[undefined, undefined, Math.max(1, d.trunks.length)]}>
        <cylinderGeometry args={[0.14, 0.18, 1.2, 6]} />
        <meshStandardMaterial color="#3a2c22" roughness={1} />
      </instancedMesh>

      {/* street lights */}
      <instancedMesh ref={polesRef} args={[undefined, undefined, Math.max(1, d.poles.length)]}>
        <cylinderGeometry args={[0.08, 0.1, 4, 6]} />
        <meshStandardMaterial color="#2b323d" metalness={0.6} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={lampsRef} args={[undefined, undefined, Math.max(1, d.lamps.length)]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color="#ffe6b8" emissive="#ffcf8a" emissiveIntensity={night ? 3 : 0.6} />
      </instancedMesh>

      {/* two site cranes in the district */}
      {[[38, -30, 34], [-42, 22, 28]].map(([cx, cz, ch], i) => (
        <group key={i} position={[cx, 0, cz]}>
          <mesh position={[0, ch / 2, 0]} castShadow>
            <boxGeometry args={[0.7, ch, 0.7]} />
            <meshStandardMaterial color="#e6b34a" metalness={0.5} roughness={0.55} />
          </mesh>
          <mesh position={[10, ch + 0.5, 0]} castShadow>
            <boxGeometry args={[26, 0.4, 0.4]} />
            <meshStandardMaterial color="#e6b34a" metalness={0.5} roughness={0.55} />
          </mesh>
          <mesh position={[-4, ch + 0.5, 0]} castShadow>
            <boxGeometry args={[1.6, 1.2, 1.2]} />
            <meshStandardMaterial color="#3b4250" metalness={0.6} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
