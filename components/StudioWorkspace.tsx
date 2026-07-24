"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useStudio, MATERIALS, metrics, fmtR, type StudioMode, type RenderMode } from "@/lib/studioStore";
import { exportSVG, exportPNG, exportPDF, exportDXF, exportCanvasPNG } from "@/lib/exporters";

const StudioViewport = dynamic(() => import("@/components/StudioViewport"), {
  ssr: false,
  loading: () => (
    <div className="blueprint flex h-full w-full items-center justify-center bg-base">
      <span className="animate-pulse text-xs text-fg-faint">Loading engine…</span>
    </div>
  ),
});

const ask = (q: string) => {
  window.dispatchEvent(new Event("atlas:assistant"));
  setTimeout(() => window.dispatchEvent(new CustomEvent("atlas:ask", { detail: q })), 80);
};

const tabs: { id: StudioMode; label: string; icon: React.ReactNode }[] = [
  { id: "3d", label: "3D Model", icon: <path d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z M4 7.5 L12 12 L20 7.5 M12 12 L12 21" /> },
  { id: "plans", label: "Plans", icon: <path d="M4 4 H20 V20 H4 Z M4 10 H20 M10 4 V20 M10 14 H15" /> },
  { id: "sections", label: "Sections", icon: <path d="M4 6 H20 M4 12 H20 M4 18 H20 M8 6 V18" /> },
  { id: "elevations", label: "Elevations", icon: <path d="M6 21 V7 L12 3 L18 7 V21 M9 12 H11 M13 12 H15" /> },
  { id: "materials", label: "Materials", icon: <path d="M4 4 H11 V11 H4 Z M13 4 H20 V11 H13 Z M4 13 H11 V20 H4 Z M13 13 H20 V20 H13 Z" /> },
  { id: "lighting", label: "Lighting", icon: <path d="M12 3 V5 M12 19 V21 M5 12 H3 M21 12 H19 M9 15 A4 4 0 1 1 15 15 Z" /> },
  { id: "analysis", label: "Analysis", icon: <path d="M4 20 V4 M4 20 H20 M8 16 V12 M12 16 V8 M16 16 V10" /> },
];

const hierarchy = ["Floors", "Columns", "Walls", "Beams", "Slabs", "Roof", "Doors", "Windows", "Façade", "Mechanical", "Electrical", "Plumbing"];
const renderModes: RenderMode[] = ["realistic", "shaded", "wireframe", "xray", "structural"];

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded border border-edge bg-base/60 px-1.5 py-0.5 text-[10px] text-fg-muted backdrop-blur">{children}</span>;
}

/* ── 2D PLAN ──────────────────────────────────────────────────────────────*/
function PlanDrawing() {
  const { width, depth, activeFloor } = useStudio();
  const pad = 40, scale = Math.min((520 - pad * 2) / width, (360 - pad * 2) / depth);
  const w = width * scale, d = depth * scale, ox = (520 - w) / 2, oy = (360 - d) / 2;
  const cols = Math.round(width / 8), rows = Math.round(depth / 8);
  return (
    <svg viewBox="0 0 520 360" className="h-full w-full">
      <rect x="0" y="0" width="520" height="360" className="fill-transparent" />
      {/* grid lines */}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line key={`gx${i}`} x1={ox + (i * w) / cols} y1={oy - 14} x2={ox + (i * w) / cols} y2={oy + d + 14} stroke="#2a3550" strokeWidth="0.6" strokeDasharray="3 4" />
      ))}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line key={`gy${i}`} x1={ox - 14} y1={oy + (i * d) / rows} x2={ox + w + 14} y2={oy + (i * d) / rows} stroke="#2a3550" strokeWidth="0.6" strokeDasharray="3 4" />
      ))}
      {/* grid bubbles */}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <g key={`gb${i}`}>
          <circle cx={ox + (i * w) / cols} cy={oy - 20} r="7" fill="#0e1526" stroke="#3a4660" />
          <text x={ox + (i * w) / cols} y={oy - 17} textAnchor="middle" fontSize="7" fill="#97a3bd">{String.fromCharCode(65 + i)}</text>
        </g>
      ))}
      {/* slab outline */}
      <rect x={ox} y={oy} width={w} height={d} fill="#141d33" stroke="#6d7cff" strokeWidth="1.4" />
      {/* core */}
      <rect x={ox + w * 0.4} y={oy + d * 0.36} width={w * 0.2} height={d * 0.28} fill="#1c2740" stroke="#8ea2ff" strokeWidth="1" />
      <text x={ox + w * 0.5} y={oy + d * 0.52} textAnchor="middle" fontSize="8" fill="#97a3bd">CORE</text>
      {/* columns */}
      {Array.from({ length: cols + 1 }).flatMap((_, i) =>
        Array.from({ length: rows + 1 }).map((_, j) => (
          <rect key={`c${i}-${j}`} x={ox + (i * w) / cols - 2.5} y={oy + (j * d) / rows - 2.5} width="5" height="5" fill="#aeb8c6" />
        )),
      )}
      {/* rooms */}
      <text x={ox + w * 0.2} y={oy + d * 0.2} textAnchor="middle" fontSize="8" fill="#6d7cff">OFFICE</text>
      <text x={ox + w * 0.8} y={oy + d * 0.2} textAnchor="middle" fontSize="8" fill="#a855f7">MEETING</text>
      <text x={ox + w * 0.2} y={oy + d * 0.82} textAnchor="middle" fontSize="8" fill="#38bdf8">BREAKOUT</text>
      <text x={ox + w * 0.8} y={oy + d * 0.82} textAnchor="middle" fontSize="8" fill="#34d399">SERVICES</text>
      {/* dimensions */}
      <line x1={ox} y1={oy + d + 24} x2={ox + w} y2={oy + d + 24} stroke="#97a3bd" strokeWidth="0.8" />
      <text x={ox + w / 2} y={oy + d + 34} textAnchor="middle" fontSize="9" fill="#eef2fb">{width.toFixed(1)} m</text>
      <line x1={ox + w + 24} y1={oy} x2={ox + w + 24} y2={oy + d} stroke="#97a3bd" strokeWidth="0.8" />
      <text x={ox + w + 34} y={oy + d / 2} textAnchor="middle" fontSize="9" fill="#eef2fb" transform={`rotate(90 ${ox + w + 34} ${oy + d / 2})`}>{depth.toFixed(1)} m</text>
      <text x={14} y={22} fontSize="11" fill="#eef2fb" fontWeight="600">LEVEL {activeFloor} — GA PLAN</text>
    </svg>
  );
}

/* ── SECTION ──────────────────────────────────────────────────────────────*/
function SectionDrawing() {
  const { floors, floorHeight, width } = useStudio();
  const height = floors * floorHeight;
  const pad = 46, scale = Math.min((520 - pad * 2) / width, (330 - 30) / height);
  const w = width * scale, h = height * scale, ox = (520 - w) / 2, oy = 320 - h;
  return (
    <svg viewBox="0 0 520 360" className="h-full w-full">
      <text x={14} y={22} fontSize="11" fill="#eef2fb" fontWeight="600">SECTION A–A</text>
      {/* ground */}
      <line x1="20" y1="320" x2="500" y2="320" stroke="#5c6884" strokeWidth="1.4" />
      {/* envelope */}
      <rect x={ox} y={oy} width={w} height={h} fill="#141d33" stroke="#6d7cff" strokeWidth="1.4" />
      {/* core */}
      <rect x={ox + w * 0.42} y={oy} width={w * 0.16} height={h} fill="#1c2740" stroke="#8ea2ff" strokeWidth="0.8" />
      {/* floor slabs */}
      {Array.from({ length: floors + 1 }).map((_, i) => {
        const y = 320 - (i * h) / floors;
        return (
          <g key={i}>
            <line x1={ox} y1={y} x2={ox + w} y2={y} stroke="#aeb8c6" strokeWidth={i === 0 || i === floors ? 1.4 : 0.7} />
            {i < floors && i % 4 === 0 && <text x={ox - 6} y={y - 2} textAnchor="end" fontSize="6.5" fill="#97a3bd">L{i}</text>}
          </g>
        );
      })}
      {/* foundation */}
      <rect x={ox - 6} y={320} width={w + 12} height="16" fill="#2a3550" />
      {/* height dim */}
      <line x1={ox + w + 22} y1={oy} x2={ox + w + 22} y2="320" stroke="#97a3bd" strokeWidth="0.8" />
      <text x={ox + w + 32} y={(oy + 320) / 2} textAnchor="middle" fontSize="9" fill="#eef2fb" transform={`rotate(90 ${ox + w + 32} ${(oy + 320) / 2})`}>{height.toFixed(1)} m</text>
      <text x={ox + 4} y={oy + 12} fontSize="7" fill="#34d399">floor-to-floor {floorHeight.toFixed(2)} m</text>
    </svg>
  );
}

/* ── ELEVATION ────────────────────────────────────────────────────────────*/
function ElevationDrawing({ face }: { face: string }) {
  const { floors, floorHeight, width, depth, facadeGlassPct } = useStudio();
  const wide = face === "North" || face === "South" ? width : depth;
  const height = floors * floorHeight;
  const pad = 46, scale = Math.min((520 - pad * 2) / wide, (330 - 30) / height);
  const w = wide * scale, h = height * scale, ox = (520 - w) / 2, oy = 320 - h;
  const bays = Math.max(3, Math.round(wide / 3));
  return (
    <svg viewBox="0 0 520 360" className="h-full w-full">
      <text x={14} y={22} fontSize="11" fill="#eef2fb" fontWeight="600">{face.toUpperCase()} ELEVATION</text>
      <line x1="20" y1="320" x2="500" y2="320" stroke="#5c6884" strokeWidth="1.4" />
      <rect x={ox} y={oy} width={w} height={h} fill="#12203a" stroke="#8ea2ff" strokeWidth="1.2" />
      {/* curtain-wall grid — glazed vs spandrel by glass % */}
      {Array.from({ length: floors }).map((_, r) =>
        Array.from({ length: bays }).map((_, c) => {
          const x = ox + (c * w) / bays, y = oy + (r * h) / floors;
          const cw = w / bays, ch = h / floors;
          const glazed = (r * 7 + c * 3) % 10 < facadeGlassPct / 10;
          return <rect key={`${r}-${c}`} x={x + 0.6} y={y + 0.6} width={cw - 1.2} height={ch - 1.2} fill={glazed ? "#3a6a8c" : "#26324a"} fillOpacity={glazed ? 0.7 : 1} stroke="#0b1424" strokeWidth="0.5" />;
        }),
      )}
      <line x1={ox + w + 22} y1={oy} x2={ox + w + 22} y2="320" stroke="#97a3bd" strokeWidth="0.8" />
      <text x={ox + w + 32} y={(oy + 320) / 2} textAnchor="middle" fontSize="9" fill="#eef2fb" transform={`rotate(90 ${ox + w + 32} ${(oy + 320) / 2})`}>{height.toFixed(1)} m</text>
      <text x={ox} y={oy - 8} fontSize="8" fill="#38bdf8">Glazing ratio {facadeGlassPct}%</text>
    </svg>
  );
}

function ToolButton({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-md border px-2.5 py-1 text-[11px] transition ${active ? "border-accent bg-accent/15 text-fg" : "border-edge text-fg-muted hover:border-edge-strong hover:text-fg"}`}>
      {children}
    </button>
  );
}

export default function StudioWorkspace() {
  const s = useStudio();
  const m = useMemo(() => metrics(s), [s]);
  const is3D = s.mode === "3d" || s.mode === "materials" || s.mode === "lighting" || s.mode === "analysis";

  const elevFaces = ["North", "South", "East", "West"];
  useEffect(() => { useStudio.getState().setShowClashes(false); useStudio.getState().setConstructionMode(false); }, []);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const drawingName = s.mode === "plans" ? `L${s.activeFloor}-GA-plan` : s.mode === "sections" ? "section-AA" : `${elevFaces[s.activeFloor % 4]}-elevation`;
  const svg = () => stageRef.current?.querySelector("svg") as SVGSVGElement | null;
  const doExport = (kind: "svg" | "png" | "pdf" | "dxf") => {
    if (kind === "dxf") return exportDXF({ width: s.width, depth: s.depth, name: drawingName });
    const el = svg();
    if (!el) return;
    if (kind === "svg") exportSVG(el, drawingName);
    if (kind === "png") exportPNG(el, drawingName);
    if (kind === "pdf") exportPDF(el, drawingName);
  };
  const snapshot3D = () => {
    const c = stageRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (c) exportCanvasPNG(c, "view-3d");
  };
  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) s.setModelSource(URL.createObjectURL(f));
  };

  return (
    <div className="glass glow sheen relative overflow-hidden rounded-2xl">
      {/* header */}
      <div className="flex items-start justify-between px-5 pt-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-fg">DESIGN STUDIO</h2>
          <p className="text-[13px] text-fg-faint">Live BIM workspace · one model, every view</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-base/50 px-2.5 py-0.5 text-[11px] text-fg-muted">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" /> Synced
        </span>
      </div>

      {/* tab bar */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto px-5">
        {tabs.map((t) => {
          const active = s.mode === t.id;
          return (
            <button key={t.id} onClick={() => s.setMode(t.id)} className={`flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-[12px] transition ${active ? "border-accent text-fg" : "border-transparent text-fg-faint hover:text-fg-muted"}`}>
              <svg viewBox="0 0 24 24" className={`h-4 w-4 ${active ? "text-accent" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* stage + inspector */}
      <div className="space-y-3 border-t border-edge p-3">
        <div ref={stageRef} className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-edge bg-base">
          {/* stage content */}
          {is3D ? (
            <StudioViewport />
          ) : (
            <div className="blueprint h-full w-full">
              {s.mode === "plans" && <PlanDrawing />}
              {s.mode === "sections" && <SectionDrawing />}
              {s.mode === "elevations" && <ElevationDrawing face={elevFaces[(s.activeFloor % 4)]} />}
            </div>
          )}

          {/* floating toolbar (top-left) */}
          <div className="pointer-events-auto absolute left-3 top-3 flex flex-wrap gap-1.5">
            {s.mode === "3d" && renderModes.map((r) => <ToolButton key={r} active={s.renderMode === r} onClick={() => s.setRenderMode(r)}>{r}</ToolButton>)}
            {s.mode === "3d" && (
              <>
                <span className="mx-1 w-px self-stretch bg-edge" />
                <ToolButton active={s.modelSource === "parametric"} onClick={() => s.setModelSource("parametric")}>Parametric</ToolButton>
                <ToolButton active={s.modelSource === "reference"} onClick={() => s.setModelSource("reference")}>Reference GLB</ToolButton>
                <ToolButton active={s.modelSource !== "parametric" && s.modelSource !== "reference"} onClick={() => fileRef.current?.click()}>⇪ Import</ToolButton>
              </>
            )}
            {s.mode === "plans" && (
              <div className="flex items-center gap-1.5">
                <ToolButton onClick={() => s.setActiveFloor(Math.max(0, s.activeFloor - 1))}>▼</ToolButton>
                <Chip>Level {s.activeFloor} / {s.floors}</Chip>
                <ToolButton onClick={() => s.setActiveFloor(Math.min(s.floors, s.activeFloor + 1))}>▲</ToolButton>
              </div>
            )}
            {s.mode === "elevations" && elevFaces.map((f, i) => <ToolButton key={f} active={s.activeFloor % 4 === i} onClick={() => s.setActiveFloor(i)}>{f}</ToolButton>)}
            {s.mode === "lighting" && <Chip>☀ {String(Math.floor(s.timeOfDay)).padStart(2, "0")}:{s.timeOfDay % 1 >= 0.5 ? "30" : "00"}</Chip>}
          </div>

          {/* HUD */}
          <div className="pointer-events-none absolute bottom-3 left-3 flex gap-1.5">
            <Chip>BIM · Rev D</Chip>
            <Chip>{is3D ? "WebGL · PBR · HDRI" : "orthographic · 1:200"}</Chip>
          </div>

          {/* lighting time slider */}
          {s.mode === "lighting" && (
            <div className="absolute inset-x-3 bottom-10">
              <input type="range" min={5} max={20} step={0.5} value={s.timeOfDay} onChange={(e) => s.setTimeOfDay(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" />
            </div>
          )}

          {/* AI copilot */}
          <button
            onClick={() => ask(copilotPrompt(s.mode))}
            className="shine absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-fg backdrop-blur transition hover:bg-accent/25"
          >
            ✦ AI Copilot
          </button>
        </div>

        {/* export bar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] uppercase tracking-widest text-fg-faint">Export</span>
          {(s.mode === "plans" || s.mode === "sections" || s.mode === "elevations") ? (
            <>
              <ExportBtn onClick={() => doExport("pdf")}>PDF</ExportBtn>
              <ExportBtn onClick={() => doExport("png")}>PNG</ExportBtn>
              <ExportBtn onClick={() => doExport("svg")}>SVG</ExportBtn>
              {s.mode === "plans" && <ExportBtn onClick={() => doExport("dxf")}>DXF · CAD</ExportBtn>}
            </>
          ) : is3D ? (
            <ExportBtn onClick={snapshot3D}>PNG snapshot</ExportBtn>
          ) : null}
          <input ref={fileRef} type="file" accept=".glb,.gltf" className="hidden" onChange={onImport} />
        </div>

        {/* inspector */}
        <div className="rounded-xl border border-edge bg-base/40 p-3">
          <Inspector />
        </div>
      </div>
    </div>
  );
}

function ExportBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 rounded-md border border-edge px-2 py-0.5 text-[11px] text-fg-muted transition hover:border-edge-strong hover:text-fg">
      ↧ {children}
    </button>
  );
}

function copilotPrompt(mode: StudioMode) {
  const map: Record<StudioMode, string> = {
    "3d": "Explain the selected model elements and suggest improvements to this tower's structure and layout.",
    plans: "Optimise this floor plan for circulation, room efficiency and accessibility.",
    sections: "Review the section for structural behaviour and identify any weak areas.",
    elevations: "Suggest façade improvements to increase energy efficiency and reduce cost.",
    materials: "Recommend greener, cheaper alternative façade materials with similar performance.",
    lighting: "Optimise daylight and reduce electricity use for this orientation and glazing ratio.",
    analysis: "Summarise the structural, energy, carbon and cost analysis and the top optimisation opportunities.",
  };
  return map[mode];
}

function Row({ k, v, tone = "text-fg" }: { k: string; v: React.ReactNode; tone?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-edge/50 py-1.5 text-[12px] last:border-0">
      <span className="text-fg-faint">{k}</span>
      <span className={`font-medium ${tone}`}>{v}</span>
    </div>
  );
}

function Inspector() {
  const s = useStudio();
  const m = metrics(s);

  if (s.mode === "3d") {
    return (
      <div>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Model Tree</h4>
        <div className="mb-3 max-h-40 space-y-0.5 overflow-y-auto">
          {hierarchy.map((h) => (
            <button key={h} onClick={() => s.setSelected(h)} className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-[12px] ${s.selected === h ? "bg-accent/15 text-fg" : "text-fg-muted hover:bg-raise"}`}>
              {h} <span className="text-fg-faint" onClick={(e) => { e.stopPropagation(); s.toggleHidden(h); }}>{s.hidden[h] ? "◌" : "◉"}</span>
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-edge bg-base/40 p-2">
          <Row k="Floors" v={<span className="flex items-center gap-1"><button onClick={() => s.setFloors(s.floors - 1)} className="px-1 text-accent">−</button>{s.floors}<button onClick={() => s.setFloors(s.floors + 1)} className="px-1 text-accent">+</button></span>} />
          <Row k="Height" v={`${m.height.toFixed(1)} m`} />
          <Row k="GFA" v={`${Math.round(m.gfa).toLocaleString()} m²`} />
          <Row k="Selected" v={s.selected ?? "—"} tone="text-accent" />
        </div>
      </div>
    );
  }

  if (s.mode === "materials") {
    const mat = MATERIALS.find((x) => x.id === s.facadeMaterialId)!;
    return (
      <div>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Material Library</h4>
        <div className="mb-3 grid max-h-36 grid-cols-2 gap-1.5 overflow-y-auto">
          {MATERIALS.map((x) => (
            <button key={x.id} onClick={() => s.setFacadeMaterial(x.id)} className={`rounded-lg border p-1.5 text-left ${s.facadeMaterialId === x.id ? "border-accent" : "border-edge hover:border-edge-strong"}`}>
              <span className="block h-6 w-full rounded" style={{ background: x.color }} />
              <span className="mt-1 block truncate text-[10px] text-fg-muted">{x.name}</span>
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-edge bg-base/40 p-2">
          <Row k="Roughness" v={mat.roughness.toFixed(2)} />
          <Row k="Metalness" v={mat.metalness.toFixed(2)} />
          <Row k="Embodied C" v={`${mat.carbon} kg/kg`} tone={mat.carbon < 0 ? "text-positive" : "text-fg"} />
          <Row k="Cost" v={`R${mat.cost}/m²`} />
          <Row k="Fire" v={mat.fire} />
          <Row k="Supplier" v={mat.supplier} />
        </div>
      </div>
    );
  }

  if (s.mode === "lighting") {
    return (
      <div>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Daylight Analysis</h4>
        <div className="rounded-lg border border-edge bg-base/40 p-2">
          <Row k="Time" v={`${String(Math.floor(s.timeOfDay)).padStart(2, "0")}:${s.timeOfDay % 1 >= 0.5 ? "30" : "00"}`} />
          <Row k="Daylight factor" v={`${m.daylightFactor.toFixed(1)}%`} tone={m.daylightFactor > 2 ? "text-positive" : "text-caution"} />
          <Row k="Glazing" v={`${s.facadeGlassPct}%`} />
          <Row k="Est. EUI" v={`${m.eui.toFixed(0)} kWh/m²·yr`} />
          <Row k="Solar gain" v={s.timeOfDay > 11 && s.timeOfDay < 16 ? "High" : "Moderate"} tone="text-caution" />
        </div>
        <label className="mt-3 block text-[11px] text-fg-faint">Glazing ratio
          <input type="range" min={30} max={95} value={s.facadeGlassPct} onChange={(e) => s.setGlassPct(Number(e.target.value))} className="mt-1 w-full accent-[var(--color-accent)]" />
        </label>
      </div>
    );
  }

  if (s.mode === "analysis") {
    return (
      <div>
        <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Engineering Analysis</h4>
        <div className="rounded-lg border border-edge bg-base/40 p-2">
          <Row k="Structure" v="RC core + steel" />
          <Row k="Max drift" v="H/520 ✓" tone="text-positive" />
          <Row k="EUI" v={`${m.eui.toFixed(0)} kWh/m²·yr`} />
          <Row k="Embodied C" v={`${m.embodiedCarbon.toFixed(0)} tCO₂e`} tone="text-caution" />
          <Row k="Clashes" v="3 open" tone="text-critical" />
          <Row k="Est. cost" v={fmtR(m.totalCost)} />
        </div>
        <button onClick={() => ask(copilotPrompt("analysis"))} className="shine mt-3 w-full rounded-lg bg-gradient-to-r from-accent to-accent-2 py-2 text-[12px] font-medium text-white">Run AI optimisation</button>
      </div>
    );
  }

  // plans / sections / elevations
  return (
    <div>
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Drawing Properties</h4>
      <div className="rounded-lg border border-edge bg-base/40 p-2">
        <Row k="Scale" v="1 : 200" />
        <Row k="Footprint" v={`${Math.round(m.footprint)} m²`} />
        <Row k="Levels" v={s.floors} />
        <Row k="Floor-to-floor" v={`${s.floorHeight.toFixed(2)} m`} />
        <Row k="Glazing" v={`${s.facadeGlassPct}%`} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["DWG", "DXF", "PDF", "SVG"].map((x) => (
          <span key={x} className="rounded border border-edge px-2 py-0.5 text-[10px] text-fg-muted">↧ {x}</span>
        ))}
      </div>
    </div>
  );
}
