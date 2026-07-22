"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Selection } from "@/components/BuildingModel3D";

const Model3D = dynamic(() => import("@/components/BuildingModel3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="animate-pulse text-sm text-fg-faint">Loading engine…</span>
    </div>
  ),
});

// Contextual data shown in the inspector when an element is picked.
const elementData: Record<string, { levels: string; area: string; use: string; structure: string; cost: string; carbon: string; status: string }> = {
  Tower: { levels: "L08 – L32", area: "18 400 m²", use: "Office / Residential", structure: "RC core + perimeter steel", cost: "R184.2M", carbon: "A", status: "Schematic Design" },
  "Mid-Block": { levels: "L03 – L07", area: "4 120 m²", use: "Amenities / Sky lobby", structure: "Post-tensioned RC", cost: "R38.6M", carbon: "A+", status: "Schematic Design" },
  Podium: { levels: "B2 – L02", area: "6 040 m²", use: "Retail / Parking", structure: "RC flat slab", cost: "R45.6M", carbon: "B+", status: "Design Development" },
};

const tree = [
  { name: "Tower", meta: "24 storeys" },
  { name: "Mid-Block", meta: "4 storeys" },
  { name: "Podium", meta: "podium + basement" },
];

function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`glass glow rounded-2xl ${className}`}>{children}</div>;
}

export default function ImmersiveStudio({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<Selection>("Tower");
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => () => { if (modelUrl) URL.revokeObjectURL(modelUrl); }, [modelUrl]);

  if (!open) return null;

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (modelUrl) URL.revokeObjectURL(modelUrl);
    setModelUrl(URL.createObjectURL(f));
    setFileName(f.name);
    setSelected(null);
  };

  const data = selected ? elementData[selected] : null;

  return (
    <div className="fixed inset-0 z-[90] animate-in bg-base" style={{ background: "radial-gradient(120% 90% at 50% -10%, #10193a 0%, #070a12 60%)" }}>
      {/* full-bleed 3D canvas */}
      <div className="absolute inset-0">
        <Model3D modelUrl={modelUrl} selected={selected} onSelect={setSelected} />
      </div>

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-4">
        <Panel className="flex items-center gap-3 px-4 py-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-xs text-white">▲</span>
          <div>
            <div className="text-[13px] font-semibold text-fg">Sandton Gate Mixed-Use Tower</div>
            <div className="text-[10px] text-fg-faint">Immersive Workspace · {modelUrl ? fileName : "parametric massing"}</div>
          </div>
          <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-positive/30 bg-positive/10 px-2 py-0.5 text-[10px] font-medium text-positive">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" /> Live
          </span>
        </Panel>

        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".glb,.gltf" className="hidden" onChange={onUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            className="shine glass glow flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-fg transition hover:brightness-110"
          >
            ⇪ Import model <span className="text-fg-faint">(.glb / .gltf)</span>
          </button>
          <button onClick={onClose} className="glass glow flex h-10 w-10 items-center justify-center rounded-xl text-fg-muted transition hover:text-fg" title="Exit workspace (Esc)">
            ✕
          </button>
        </div>
      </div>

      {/* left — model tree */}
      <div className="absolute bottom-4 left-4 top-24 w-64">
        <Panel className="flex h-full flex-col p-4">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Model Tree</h3>
          <div className="space-y-1">
            {tree.map((t) => {
              const active = selected === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setSelected(active ? null : t.name)}
                  disabled={!!modelUrl}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-[13px] transition disabled:opacity-40 ${
                    active ? "border-accent bg-accent/10 text-fg" : "border-edge text-fg-muted hover:border-edge-strong hover:text-fg"
                  }`}
                >
                  <span className="font-medium">{t.name}</span>
                  <span className="text-[10px] text-fg-faint">{t.meta}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-auto rounded-lg border border-edge bg-base/40 p-3 text-[11px] text-fg-faint">
            {modelUrl ? "Imported model loaded — element data reflects the source file." : "Click a mass in the scene or the tree to inspect it."}
          </div>
        </Panel>
      </div>

      {/* right — inspector */}
      <div className="absolute bottom-4 right-4 top-24 w-72">
        <Panel className="flex h-full flex-col p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Inspector</h3>
            {selected && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">{selected}</span>}
          </div>
          {data ? (
            <div className="space-y-2.5">
              {[
                ["Levels", data.levels],
                ["Gross area", data.area],
                ["Primary use", data.use],
                ["Structure", data.structure],
                ["Est. cost", data.cost],
                ["Carbon rating", data.carbon],
                ["Status", data.status],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-3 border-b border-edge/60 pb-2 text-[12px] last:border-0">
                  <span className="text-fg-faint">{k}</span>
                  <span className="text-right font-medium text-fg">{v}</span>
                </div>
              ))}
              <button className="shine mt-2 w-full rounded-lg bg-gradient-to-r from-accent to-accent-2 py-2 text-[12px] font-medium text-white">
                Open in Engineering Studio →
              </button>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-center text-[12px] text-fg-faint">
              {modelUrl ? "Imported model — pick geometry to inspect." : "Nothing selected.\nClick a mass to inspect its data."}
            </div>
          )}
        </Panel>
      </div>

      {/* bottom — controls / stats */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center">
        <Panel className="flex items-center gap-5 px-5 py-2.5 text-[11px] text-fg-muted">
          <span className="flex items-center gap-1.5"><span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" /> WebGL · PBR · SSAO · Bloom</span>
          <span className="text-edge-strong">|</span>
          <span>Orbit · drag</span>
          <span>Zoom · scroll</span>
          <span>Deselect · click empty space</span>
          <span className="text-edge-strong">|</span>
          <span className="font-mono text-fg-faint">60 fps · LOD 350</span>
        </Panel>
      </div>
    </div>
  );
}
