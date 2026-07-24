"use client";

// Digital-twin district around the hero tower: a downtown block of varied
// context buildings (concrete / glass / residential), asphalt roads with lane
// markings, curbs and sidewalks, layered street trees (trunk + faceted
// canopy), parked + moving cars, pedestrians, street lights and site cranes.
// Everything is instanced — the whole block is ~20 draw calls — and lit by the
// HDRI + post pipeline. Context massing is intentionally clean, the way real
// archviz (Forma / Twinmotion) renders surroundings so the hero reads.

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
  trunks: Item[];
  canopyLo: Item[];
  canopyHi: Item[];
  poles: Item[];
  lamps: Item[];
  roads: Item[];
  marks: Item[];
  curbs: Item[];
  walks: Item[];
  carBody: Item[];
  carCab: Item[];
  people: Item[];
  heads: Item[];
}

const STEP = 16;
const HALF = 70;

function useDistrict(): District {
  return useMemo(() => {
    const rnd = mulberry32(20240724);
    const d: District = { concrete: [], glass: [], caps: [], trunks: [], canopyLo: [], canopyHi: [], poles: [], lamps: [], roads: [], marks: [], curbs: [], walks: [], carBody: [], carCab: [], people: [], heads: [] };

    const concreteCols = ["#828a94", "#727a85", "#6a7079", "#8b929b"].map((c) => new THREE.Color(c));
    const glassCols = ["#3c586f", "#324f68", "#46647c", "#2c4560"].map((c) => new THREE.Color(c));
    const resiCols = ["#7d7566", "#877c69", "#6f6a5e"].map((c) => new THREE.Color(c));
    const canopyCols = ["#2f5a3f", "#356446", "#2a5138", "#3d6b4a"].map((c) => new THREE.Color(c));
    const carCols = ["#c9ccd2", "#39434f", "#7a2530", "#20303f", "#d7d0c2", "#2c3b2e", "#4a5560"].map((c) => new THREE.Color(c));
    const peepCols = ["#3a4250", "#5a4a42", "#46586a", "#6a5a48", "#4a4a52"].map((c) => new THREE.Color(c));

    const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

    // ── plots / buildings ──
    for (let gx = -4; gx <= 4; gx++) {
      for (let gz = -4; gz <= 4; gz++) {
        const x = gx * STEP + (rnd() - 0.5) * 4;
        const z = gz * STEP + (rnd() - 0.5) * 4;
        const r = Math.hypot(x, z);
        if (r < 21 || r > 66) continue;
        if (rnd() < 0.18) {
          // green plot — cluster of trees
          for (let t = 0; t < 3; t++) {
            const tx = x + (rnd() - 0.5) * 8;
            const tz = z + (rnd() - 0.5) * 8;
            d.trunks.push({ pos: [tx, 0.7, tz], scale: [1, 1, 1] });
            d.canopyLo.push({ pos: [tx, 1.7, tz], scale: [1.5, 1.3, 1.5], color: pick(canopyCols) });
            d.canopyHi.push({ pos: [tx, 2.7, tz], scale: [1.0, 1.1, 1.0], color: pick(canopyCols) });
          }
          continue;
        }
        const w = 6 + rnd() * 8;
        const dp = 6 + rnd() * 8;
        const near = 1 - Math.min(1, r / 80);
        const kind = rnd();
        const isGlass = kind < 0.4;
        const isResi = kind >= 0.4 && kind < 0.62;
        const h = Math.max(6, 6 + Math.pow(rnd(), 1.5) * 48 * (0.4 + near) * (isResi ? 0.55 : 1));
        const rot = (rnd() - 0.5) * 0.22;
        const col = isGlass ? pick(glassCols) : isResi ? pick(resiCols) : pick(concreteCols);
        const item: Item = { pos: [x, h / 2, z], scale: [w, h, dp], rot, color: col };
        (isGlass ? d.glass : d.concrete).push(item);
        // stepped setback for some tall towers
        if (h > 30 && rnd() < 0.5) (isGlass ? d.glass : d.concrete).push({ pos: [x, h + h * 0.12, z], scale: [w * 0.7, h * 0.24, dp * 0.7], rot, color: col });
        // rooftop plant
        d.caps.push({ pos: [x, h + 0.7, z], scale: [w * 0.5, 1.4, dp * 0.5], rot });

        // street tree on the plot frontage
        if (rnd() < 0.7) {
          const tx = x + (w / 2 + 2.4) * (rnd() < 0.5 ? 1 : -1);
          const tz = z + (dp / 2 + 2.4) * (rnd() < 0.5 ? 1 : -1);
          d.trunks.push({ pos: [tx, 0.7, tz], scale: [1, 1, 1] });
          d.canopyLo.push({ pos: [tx, 1.7, tz], scale: [1.4, 1.25, 1.4], color: pick(canopyCols) });
          d.canopyHi.push({ pos: [tx, 2.6, tz], scale: [0.95, 1.05, 0.95], color: pick(canopyCols) });
        }
        // pedestrians near the entrance
        const nped = rnd() < 0.5 ? (rnd() < 0.4 ? 2 : 1) : 0;
        for (let k = 0; k < nped; k++) {
          const px = x + (w / 2 + 1.6 + rnd() * 2) * (rnd() < 0.5 ? 1 : -1);
          const pz = z + (dp / 2 + 1.6 + rnd() * 2) * (rnd() < 0.5 ? 1 : -1);
          const pc = pick(peepCols);
          d.people.push({ pos: [px, 0.55, pz], scale: [1, 1, 1], color: pc });
          d.heads.push({ pos: [px, 1.02, pz], scale: [1, 1, 1], color: new THREE.Color("#b98a6a") });
        }
      }
    }

    // ── streets: asphalt + centre-line + curbs + sidewalks ──
    const asphalt = new THREE.Color("#191e27");
    for (let g = -4; g <= 4; g++) {
      const p = g * STEP + STEP / 2;
      if (Math.abs(p) > HALF) continue;
      // Z-running road at x=p
      d.roads.push({ pos: [p, 0.02, 0], scale: [6.4, 0.04, 150], color: asphalt });
      d.curbs.push({ pos: [p - 3.4, 0.06, 0], scale: [0.5, 0.12, 150] });
      d.curbs.push({ pos: [p + 3.4, 0.06, 0], scale: [0.5, 0.12, 150] });
      d.walks.push({ pos: [p - 4.8, 0.03, 0], scale: [2.4, 0.06, 150] });
      d.walks.push({ pos: [p + 4.8, 0.03, 0], scale: [2.4, 0.06, 150] });
      for (let z = -HALF; z <= HALF; z += 6) d.marks.push({ pos: [p, 0.06, z], scale: [0.32, 0.02, 2.4] });
      // X-running road at z=p
      d.roads.push({ pos: [0, 0.02, p], scale: [150, 0.04, 6.4], color: asphalt });
      d.curbs.push({ pos: [0, 0.06, p - 3.4], scale: [150, 0.12, 0.5] });
      d.curbs.push({ pos: [0, 0.06, p + 3.4], scale: [150, 0.12, 0.5] });
      d.walks.push({ pos: [0, 0.03, p - 4.8], scale: [150, 0.06, 2.4] });
      d.walks.push({ pos: [0, 0.03, p + 4.8], scale: [150, 0.06, 2.4] });
      for (let x = -HALF; x <= HALF; x += 6) d.marks.push({ pos: [x, 0.06, p], scale: [2.4, 0.02, 0.32] });

      // vehicles in the lanes
      for (let c = 0; c < 3; c++) {
        const t = -46 + rnd() * 92;
        if (Math.abs(t) < 20 && Math.abs(p) < 20) continue;
        const lane = (rnd() < 0.5 ? 1 : -1) * 1.5;
        const cc = pick(carCols);
        // on Z road
        d.carBody.push({ pos: [p + lane, 0.32, t], scale: [1.1, 0.6, 2.4], color: cc });
        d.carCab.push({ pos: [p + lane, 0.68, t + (rnd() - 0.5) * 0.2], scale: [0.92, 0.44, 1.1], color: cc });
        // on X road
        const cc2 = pick(carCols);
        d.carBody.push({ pos: [t, 0.32, p + lane], scale: [2.4, 0.6, 1.1], rot: Math.PI / 2, color: cc2 });
        d.carCab.push({ pos: [t + (rnd() - 0.5) * 0.2, 0.68, p + lane], scale: [1.1, 0.44, 0.92], rot: Math.PI / 2, color: cc2 });
      }
      // street lamps along the road
      for (let z = -HALF + 8; z <= HALF; z += 22) {
        d.poles.push({ pos: [p + 4.2, 2, z], scale: [1, 1, 1] });
        d.lamps.push({ pos: [p + 4.2, 4, z], scale: [1, 1, 1] });
      }
    }

    return d;
  }, []);
}

export default function CityContext({ night }: { night: boolean }) {
  const concreteRef = useRef<THREE.InstancedMesh>(null);
  const glassRef = useRef<THREE.InstancedMesh>(null);
  const capsRef = useRef<THREE.InstancedMesh>(null);
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canLoRef = useRef<THREE.InstancedMesh>(null);
  const canHiRef = useRef<THREE.InstancedMesh>(null);
  const polesRef = useRef<THREE.InstancedMesh>(null);
  const lampsRef = useRef<THREE.InstancedMesh>(null);
  const roadsRef = useRef<THREE.InstancedMesh>(null);
  const marksRef = useRef<THREE.InstancedMesh>(null);
  const curbsRef = useRef<THREE.InstancedMesh>(null);
  const walksRef = useRef<THREE.InstancedMesh>(null);
  const carBodyRef = useRef<THREE.InstancedMesh>(null);
  const carCabRef = useRef<THREE.InstancedMesh>(null);
  const peopleRef = useRef<THREE.InstancedMesh>(null);
  const headsRef = useRef<THREE.InstancedMesh>(null);
  const d = useDistrict();

  useInstanced(concreteRef, d.concrete);
  useInstanced(glassRef, d.glass);
  useInstanced(capsRef, d.caps);
  useInstanced(trunkRef, d.trunks);
  useInstanced(canLoRef, d.canopyLo);
  useInstanced(canHiRef, d.canopyHi);
  useInstanced(polesRef, d.poles);
  useInstanced(lampsRef, d.lamps);
  useInstanced(roadsRef, d.roads);
  useInstanced(marksRef, d.marks);
  useInstanced(curbsRef, d.curbs);
  useInstanced(walksRef, d.walks);
  useInstanced(carBodyRef, d.carBody);
  useInstanced(carCabRef, d.carCab);
  useInstanced(peopleRef, d.people);
  useInstanced(headsRef, d.heads);

  const n = (a: unknown[]) => Math.max(1, a.length);

  return (
    <group>
      {/* district ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[230, 230]} />
        <meshStandardMaterial color="#0c121b" metalness={0.2} roughness={0.9} />
      </mesh>
      {/* plaza around the hero */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <circleGeometry args={[19, 48]} />
        <meshStandardMaterial color="#20293a" metalness={0.15} roughness={0.75} />
      </mesh>

      {/* sidewalks + roads + markings + curbs */}
      <instancedMesh ref={walksRef} args={[undefined, undefined, n(d.walks)]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#39424f" metalness={0.05} roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={roadsRef} args={[undefined, undefined, n(d.roads)]} receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors metalness={0.15} roughness={0.75} />
      </instancedMesh>
      <instancedMesh ref={curbsRef} args={[undefined, undefined, n(d.curbs)]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#525a66" metalness={0.05} roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={marksRef} args={[undefined, undefined, n(d.marks)]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#c9c2ac" metalness={0} roughness={0.6} />
      </instancedMesh>

      {/* buildings */}
      <instancedMesh ref={concreteRef} args={[undefined, undefined, n(d.concrete)]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors metalness={0.08} roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={glassRef} args={[undefined, undefined, n(d.glass)]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors metalness={0.25} roughness={0.18} envMapIntensity={0.9} />
      </instancedMesh>
      <instancedMesh ref={capsRef} args={[undefined, undefined, n(d.caps)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#464d58" metalness={0.4} roughness={0.6} />
      </instancedMesh>

      {/* trees — trunk + faceted canopy tiers */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, n(d.trunks)]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 1.4, 6]} />
        <meshStandardMaterial color="#3f2f24" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={canLoRef} args={[undefined, undefined, n(d.canopyLo)]} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial vertexColors flatShading roughness={0.95} />
      </instancedMesh>
      <instancedMesh ref={canHiRef} args={[undefined, undefined, n(d.canopyHi)]} castShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial vertexColors flatShading roughness={0.95} />
      </instancedMesh>

      {/* vehicles */}
      <instancedMesh ref={carBodyRef} args={[undefined, undefined, n(d.carBody)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors metalness={0.55} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={carCabRef} args={[undefined, undefined, n(d.carCab)]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial vertexColors metalness={0.3} roughness={0.2} />
      </instancedMesh>

      {/* pedestrians */}
      <instancedMesh ref={peopleRef} args={[undefined, undefined, n(d.people)]} castShadow>
        <capsuleGeometry args={[0.16, 0.6, 3, 6]} />
        <meshStandardMaterial vertexColors roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={headsRef} args={[undefined, undefined, n(d.heads)]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial vertexColors roughness={0.7} />
      </instancedMesh>

      {/* street lights */}
      <instancedMesh ref={polesRef} args={[undefined, undefined, n(d.poles)]}>
        <cylinderGeometry args={[0.08, 0.1, 4, 6]} />
        <meshStandardMaterial color="#2b323d" metalness={0.6} roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={lampsRef} args={[undefined, undefined, n(d.lamps)]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#ffe6b8" emissive="#ffcf8a" emissiveIntensity={night ? 1.8 : 0.4} />
      </instancedMesh>

      {/* two site cranes */}
      {[[38, -30, 34], [-42, 22, 28]].map(([cx, cz, ch], i) => (
        <group key={i} position={[cx, 0, cz]}>
          <mesh position={[0, ch / 2, 0]} castShadow>
            <boxGeometry args={[0.7, ch, 0.7]} />
            <meshStandardMaterial color="#d8a840" metalness={0.5} roughness={0.55} />
          </mesh>
          <mesh position={[10, ch + 0.5, 0]} castShadow>
            <boxGeometry args={[26, 0.4, 0.4]} />
            <meshStandardMaterial color="#d8a840" metalness={0.5} roughness={0.55} />
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
