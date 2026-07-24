"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { PARTS, STATUS_ORDER, statusIndex, methodColor, statusColor, totalMass, type Part } from "@/lib/fabrication";
import { exportSVG, exportPNG, exportDXF } from "@/lib/exporters";

const Part3D = dynamic(() => import("@/components/Part3D"), { ssr: false });

/* what's actually being manufactured — process narrative per method */
function manufactureNotes(part: Part): string[] {
  const n: string[] = [];
  const holes = part.holes.length;
  switch (part.method) {
    case "CNC Laser":
      n.push(`1. Laser-cut profile from ${part.thk} mm ${part.grade} plate.`);
      if (holes) n.push(`2. ${holes}× Ø${part.holes[0].d} holes cut in same operation.`);
      n.push(`${holes ? 3 : 2}. Deburr all edges, break sharp corners 0.5 mm.`);
      n.push(`${holes ? 4 : 3}. Finish: ${part.finish}.`);
      break;
    case "CNC Plasma":
      n.push(`1. CNC plasma-profile from ${part.thk} mm ${part.grade} plate.`);
      if (holes) n.push(`2. Drill ${holes}× Ø${part.holes[0].d} holes (plasma pierce + ream).`);
      n.push(`3. Grind dross, deburr. Finish: ${part.finish}.`);
      break;
    case "CNC Milling":
      n.push(`1. CNC-mill from ${part.material} ${part.grade} billet.`);
      n.push(`2. Machine all faces to ${part.tolerance}.`);
      if (holes) n.push(`3. Bore/ream ${holes}× Ø${part.holes[0].d} to H8.`);
      n.push(`${holes ? 4 : 3}. ${part.material.includes("Round") ? "Turn OD, cross-drill" : "Slot-mill features"}. Finish: ${part.finish}.`);
      break;
    case "Boilermaker / Weld":
      n.push(`1. Cut plate + components from ${part.grade}.`);
      n.push(`2. Fit-up per assembly; tack, then weld all-round 6 mm FW.`);
      n.push(`3. Weld headed studs to rear face (SD1, drawn-arc).`);
      n.push(`4. Visual + MPI weld inspection. Finish: ${part.finish}.`);
      break;
    default:
      n.push(`1. Fabricate from ${part.material} ${part.grade}, t = ${part.thk} mm.`);
      if (holes) n.push(`2. Form ${holes}× Ø${part.holes[0].d} holes.`);
      n.push(`${holes ? 3 : 2}. Tolerance ${part.tolerance}. Finish: ${part.finish}.`);
  }
  return n;
}

/* ── multi-view fabrication shop drawing ──────────────────────────────────*/
export function ShopDrawing({ part, svgId }: { part: Part; svgId?: string }) {
  const VW = 840, VH = 560;
  const isPin = part.material.toLowerCase().includes("round bar");
  const isEmbed = part.id === "EP-012";

  // plan view area
  const px0 = 78, planW = 340, planH = 250, planTop = 62;
  const scale = Math.min(planW / part.w, planH / part.h);
  const w = part.w * scale, h = part.h * scale;
  const ox = px0, oy = planTop + (planH - h) / 2;

  // hole grid → pitches & edge distances
  const xs = [...new Set(part.holes.map((hh) => hh.x))].sort((a, b) => a - b);
  const ys = [...new Set(part.holes.map((hh) => hh.y))].sort((a, b) => a - b);
  const pitchX = xs.length > 1 ? xs[1] - xs[0] : null;
  const pitchY = ys.length > 1 ? ys[1] - ys[0] : null;

  const hdim = (x1: number, x2: number, yy: number, label: string) => (
    <g stroke="#8ea2ff" strokeWidth="0.6" fill="none">
      <line x1={x1} y1={yy} x2={x2} y2={yy} />
      <line x1={x1} y1={yy - 3} x2={x1} y2={yy + 3} />
      <line x1={x2} y1={yy - 3} x2={x2} y2={yy + 3} />
      <text x={(x1 + x2) / 2} y={yy + 12} fill="#cfe0ff" fontSize="10" textAnchor="middle" stroke="none">{label}</text>
    </g>
  );
  const vdim = (y1: number, y2: number, xx: number, label: string) => (
    <g stroke="#8ea2ff" strokeWidth="0.6" fill="none">
      <line x1={xx} y1={y1} x2={xx} y2={y2} />
      <line x1={xx - 3} y1={y1} x2={xx + 3} y2={y1} />
      <line x1={xx - 3} y1={y2} x2={xx + 3} y2={y2} />
      <text x={xx - 6} y={(y1 + y2) / 2} fill="#cfe0ff" fontSize="10" textAnchor="middle" stroke="none" transform={`rotate(-90 ${xx - 6} ${(y1 + y2) / 2})`}>{label}</text>
    </g>
  );

  // section view (thickness) geometry
  const secX = 486;
  const thkPx = Math.max(14, part.thk * scale);
  const notes = manufactureNotes(part);

  return (
    <svg id={svgId} viewBox={`0 0 ${VW} ${VH}`} className="h-full w-full" fontFamily="ui-sans-serif, system-ui">
      <rect x="8" y="8" width={VW - 16} height={VH - 16} fill="none" stroke="#2a3550" strokeWidth="1.2" />

      {/* ── PLAN VIEW ── */}
      <text x={ox} y={planTop - 14} fill="#eef2fb" fontSize="11" fontWeight="700">{isPin ? "SIDE ELEVATION" : "PLAN — 1:" + Math.max(2, Math.round(2 / scale))}</text>
      <text x={ox} y={planTop - 2} fill="#8ea2ff" fontSize="9">{isPin ? `Round bar Ø${part.thk}` : `Plate t = ${part.thk} · ${part.grade}`}</text>
      <rect x={ox} y={oy} width={w} height={h} rx={isPin ? Math.min(h, 8) : 0} fill="#12203a" stroke="#6d7cff" strokeWidth="1.6" />
      {/* holes with centre-lines */}
      {part.holes.map((hole, i) => {
        const cx = ox + hole.x * scale, cy = oy + (part.h - hole.y) * scale, r = Math.max(2.5, (hole.d / 2) * scale);
        return (
          <g key={i} stroke="#38bdf8" fill="none">
            <circle cx={cx} cy={cy} r={r} strokeWidth="1.1" />
            <line x1={cx - r - 5} y1={cy} x2={cx + r + 5} y2={cy} strokeWidth="0.4" strokeDasharray="4 2" />
            <line x1={cx} y1={cy - r - 5} x2={cx} y2={cy + r + 5} strokeWidth="0.4" strokeDasharray="4 2" />
          </g>
        );
      })}
      {/* embed plate: show welded stud positions as crosses */}
      {isEmbed &&
        Array.from({ length: 12 }).map((_, i) => {
          const c = i % 4, r = Math.floor(i / 4);
          const cx = ox + (55 + (c * (part.w - 110)) / 3) * scale;
          const cy = oy + (part.h - (55 + (r * (part.h - 110)) / 2)) * scale;
          return (
            <g key={i} stroke="#fbbf24" strokeWidth="1">
              <circle cx={cx} cy={cy} r="4" fill="none" />
              <line x1={cx - 6} y1={cy} x2={cx + 6} y2={cy} />
              <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} />
            </g>
          );
        })}
      {/* dimensions */}
      {hdim(ox, ox + w, oy + h + 22, `${part.w}`)}
      {vdim(oy, oy + h, ox - 24, `${part.h}`)}
      {pitchX && xs.length > 1 && hdim(ox + xs[0] * scale, ox + xs[1] * scale, oy - 14, `${pitchX}`)}
      {pitchY && ys.length > 1 && vdim(oy + (part.h - ys[0]) * scale, oy + (part.h - ys[1]) * scale, ox + w + 20, `${pitchY}`)}
      {xs.length > 0 && hdim(ox, ox + xs[0] * scale, oy + h + 40, `${xs[0]}`)}
      {part.holes[0] && (
        <text x={ox + 4} y={oy - 2} fill="#38bdf8" fontSize="10" fontWeight="600">{part.holes.length}× Ø{part.holes[0].d}</text>
      )}

      {/* ── SECTION A–A (thickness) ── */}
      <text x={secX} y={planTop - 14} fill="#eef2fb" fontSize="11" fontWeight="700">{isPin ? "END VIEW" : "SECTION A–A"}</text>
      {isPin ? (
        <g>
          <circle cx={secX + 40} cy={oy + h / 2} r={Math.max(16, (part.thk / 2) * scale)} fill="#12203a" stroke="#6d7cff" strokeWidth="1.6" />
          <line x1={secX + 40 - 26} y1={oy + h / 2} x2={secX + 40 + 26} y2={oy + h / 2} stroke="#38bdf8" strokeWidth="0.4" strokeDasharray="4 2" />
          <line x1={secX + 40} y1={oy + h / 2 - 26} x2={secX + 40} y2={oy + h / 2 + 26} stroke="#38bdf8" strokeWidth="0.4" strokeDasharray="4 2" />
          <text x={secX} y={oy + h + 30} fill="#97a3bd" fontSize="9">Ø{part.thk} {part.grade}</text>
        </g>
      ) : (
        <g>
          <rect x={secX} y={oy} width={thkPx} height={h} fill="#1a2740" stroke="#6d7cff" strokeWidth="1.4" />
          {/* hole rows as hidden lines through the section */}
          {ys.map((yy, i) => {
            const cy = oy + (part.h - yy) * scale;
            return <line key={i} x1={secX - 2} y1={cy} x2={secX + thkPx + 2} y2={cy} stroke="#38bdf8" strokeWidth="0.5" strokeDasharray="3 2" />;
          })}
          {/* embed studs in section */}
          {isEmbed &&
            [0.2, 0.5, 0.8].map((f, i) => (
              <g key={i} stroke="#e6b34a" strokeWidth="2" fill="none">
                <line x1={secX + thkPx} y1={oy + h * f} x2={secX + thkPx + 46} y2={oy + h * f} />
                <line x1={secX + thkPx + 46} y1={oy + h * f - 5} x2={secX + thkPx + 46} y2={oy + h * f + 5} strokeWidth="3" />
              </g>
            ))}
          {hdim(secX, secX + thkPx, oy + h + 16, `t${part.thk}`)}
          {isEmbed && <text x={secX + thkPx + 6} y={oy - 4} fill="#e6b34a" fontSize="9">12× stud Ø19×110</text>}
        </g>
      )}

      {/* ── HOLE / FEATURE SCHEDULE ── */}
      <g>
        <text x={648} y={72} fill="#eef2fb" fontSize="11" fontWeight="700">SCHEDULE</text>
        <rect x={648} y={80} width={176} height={16} fill="#141d33" stroke="#303c54" />
        {["MK", "X", "Y", "Ø"].map((t, i) => (
          <text key={t} x={654 + i * 42} y={92} fill="#8ea2ff" fontSize="8.5" fontWeight="600">{t}</text>
        ))}
        {part.holes.slice(0, 6).map((hh, i) => (
          <g key={i}>
            <rect x={648} y={96 + i * 15} width={176} height={15} fill={i % 2 ? "#0e1626" : "#0b1220"} stroke="#233049" strokeWidth="0.4" />
            <text x={654} y={106 + i * 15} fill="#cdd6ea" fontSize="8">h{i + 1}</text>
            <text x={696} y={106 + i * 15} fill="#cdd6ea" fontSize="8">{hh.x}</text>
            <text x={738} y={106 + i * 15} fill="#cdd6ea" fontSize="8">{hh.y}</text>
            <text x={780} y={106 + i * 15} fill="#38bdf8" fontSize="8">{hh.d}</text>
          </g>
        ))}
        {part.holes.length === 0 && (
          <text x={654} y={106} fill="#5c6884" fontSize="8">No holes — welded / cast feature</text>
        )}
        {/* quantity callout */}
        <rect x={648} y={200} width={176} height={54} fill="#0b1220" stroke="#303c54" />
        <text x={654} y={216} fill="#5c6884" fontSize="7.5">FABRICATE</text>
        <text x={654} y={230} fill="#eef2fb" fontSize="14" fontWeight="700">{part.qty} off</text>
        <text x={654} y={246} fill="#97a3bd" fontSize="8">{totalMass(part).toFixed(0)} kg total · {part.unitMass} kg/ea</text>
      </g>

      {/* ── MANUFACTURING NOTES (what's being made) ── */}
      <g>
        <rect x={20} y={352} width={438} height={186} fill="#0b1220" stroke="#303c54" />
        <text x={30} y={372} fill="#eef2fb" fontSize="11" fontWeight="700">MANUFACTURE · {part.method}</text>
        <line x1={20} y1={380} x2={458} y2={380} stroke="#233049" />
        <text x={30} y={398} fill="#cdd6ea" fontSize="10">{part.name} — {part.category}</text>
        {notes.map((ln, i) => (
          <text key={i} x={30} y={418 + i * 18} fill="#9fb2c8" fontSize="9.5">{ln}</text>
        ))}
        <text x={30} y={522} fill="#5c6884" fontSize="8.5">TOL {part.tolerance} · WELD to SANS 10162 · edges to EXC2 · {part.factory}</text>
      </g>

      {/* ── TITLE BLOCK ── */}
      <g>
        <rect x={474} y={352} width={350} height={186} fill="#0b1220" stroke="#303c54" />
        <line x1={474} y1={392} x2={824} y2={392} stroke="#303c54" />
        <line x1={474} y1={430} x2={824} y2={430} stroke="#303c54" />
        <line x1={474} y1={468} x2={824} y2={468} stroke="#303c54" />
        <line x1={474} y1={504} x2={824} y2={504} stroke="#303c54" />
        <line x1={649} y1={430} x2={649} y2={538} stroke="#303c54" />
        <text x={484} y={372} fill="#eef2fb" fontSize="16" fontWeight="700">{part.id}</text>
        <text x={484} y={386} fill="#97a3bd" fontSize="9">{part.name}</text>
        <text x={700} y={372} fill="#8ea2ff" fontSize="11" fontWeight="600">Rev {part.rev}</text>
        <text x={700} y={386} fill="#97a3bd" fontSize="9">1:{Math.max(2, Math.round(2 / scale))}</text>
        {([
          ["MATERIAL", `${part.material} ${part.grade}`],
          ["FINISH", part.finish],
        ] as const).map((r, i) => (
          <g key={i}>
            <text x={484} y={412 + i * 38} fill="#5c6884" fontSize="8">{r[0]}</text>
            <text x={484} y={425 + i * 38} fill="#cdd6ea" fontSize="10">{r[1]}</text>
          </g>
        ))}
        {([
          ["THK / SIZE", `${part.w}×${part.h}×${part.thk}`],
          ["TOLERANCE", part.tolerance],
        ] as const).map((r, i) => (
          <g key={i}>
            <text x={659} y={412 + i * 38} fill="#5c6884" fontSize="8">{r[0]}</text>
            <text x={659} y={425 + i * 38} fill="#cdd6ea" fontSize="10">{r[1]}</text>
          </g>
        ))}
        <text x={484} y={520} fill="#5c6884" fontSize="8">FABRICATOR</text>
        <text x={484} y={532} fill="#cdd6ea" fontSize="9.5">{part.factory}</text>
        <text x={659} y={520} fill="#5c6884" fontSize="8">FOR SITE</text>
        <text x={659} y={532} fill="#cdd6ea" fontSize="9">{part.site.split("·")[0]}</text>
      </g>
    </svg>
  );
}

function StatusStepper({ part }: { part: Part }) {
  const idx = statusIndex(part.status);
  return (
    <div className="flex flex-wrap items-center gap-1">
      {STATUS_ORDER.map((st, i) => (
        <span key={st} className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${i < idx ? "bg-positive/10 text-positive" : i === idx ? "bg-accent/15 text-accent" : "border border-edge text-fg-faint"}`}>{st}</span>
      ))}
    </div>
  );
}

function QA({ part }: { part: Part }) {
  // deterministic "measured" values vs nominal
  const rows = [
    { d: "Overall width", nom: part.w, meas: part.w + ((part.id.charCodeAt(3) % 5) - 2) * 0.2, tol: 1.0 },
    { d: "Overall height", nom: part.h, meas: part.h + ((part.id.charCodeAt(4) % 5) - 2) * 0.2, tol: 1.0 },
    ...(part.holes[0] ? [{ d: "Hole Ø", nom: part.holes[0].d, meas: part.holes[0].d + ((part.id.charCodeAt(1) % 3) - 1) * 0.1, tol: 0.3 }] : []),
  ];
  return (
    <div className="mt-3 rounded-lg border border-edge bg-base/40 p-2.5">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-fg-faint">CMM Measurement</div>
      {rows.map((r) => {
        const dev = r.meas - r.nom;
        const ok = Math.abs(dev) <= r.tol;
        return (
          <div key={r.d} className="flex items-center justify-between border-b border-edge/40 py-1 text-[11px] last:border-0">
            <span className="text-fg-muted">{r.d}</span>
            <span className="flex items-center gap-2 font-mono">
              <span className="text-fg-faint">{r.nom}</span>
              <span className="text-fg">{r.meas.toFixed(1)}</span>
              <span className={ok ? "text-positive" : "text-critical"}>{dev >= 0 ? "+" : ""}{dev.toFixed(1)} {ok ? "✓" : "✗"}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function PartsPanel({ mode }: { mode: "design" | "production" }) {
  const [id, setId] = useState(PARTS[0].id);
  const [view, setView] = useState<"split" | "3d" | "2d">("split");
  const part = PARTS.find((p) => p.id === id)!;
  const svgId = "shopdrawing";
  const getSvg = () => document.getElementById(svgId) as unknown as SVGSVGElement | null;
  const show3D = view !== "2d";
  const show2D = view !== "3d";

  return (
    <div className="grid gap-3 lg:grid-cols-[240px_1fr]">
      {/* parts list */}
      <div className="glass elev max-h-[520px] overflow-y-auto rounded-2xl p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Parts · {PARTS.length}</div>
        <div className="space-y-1">
          {PARTS.map((p) => (
            <button key={p.id} onClick={() => setId(p.id)} className={`w-full rounded-lg border px-2.5 py-2 text-left transition ${p.id === id ? "border-accent bg-accent/10" : "border-edge hover:border-edge-strong"}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-fg">{p.id}</span>
                <span className="h-2 w-2 rounded-full" style={{ background: methodColor[p.method] }} title={p.method} />
              </div>
              <div className="truncate text-[11px] text-fg-muted">{p.name}</div>
              <div className={`text-[10px] ${statusColor(p.status)}`}>{p.status} · {p.progress}%</div>
            </button>
          ))}
        </div>
      </div>

      {/* detail */}
      <div className="glass elev rounded-2xl p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold text-fg">{part.name}</h3>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ background: methodColor[part.method] }}>{part.method}</span>
            </div>
            <div className="text-[11px] text-fg-faint">{part.id} · Rev {part.rev} · {part.category} · {part.factory}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-edge p-0.5">
              {(["split", "3d", "2d"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize transition ${view === v ? "bg-accent/15 text-accent" : "text-fg-faint hover:text-fg"}`}>{v === "split" ? "2D + 3D" : v.toUpperCase()}</button>
              ))}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => { const s = getSvg(); if (s) exportPNG(s, part.id); }} className="rounded-md border border-edge px-2 py-0.5 text-[11px] text-fg-muted hover:text-fg">↧ PNG</button>
              <button onClick={() => { const s = getSvg(); if (s) exportSVG(s, part.id); }} className="rounded-md border border-edge px-2 py-0.5 text-[11px] text-fg-muted hover:text-fg">↧ SVG</button>
              <button onClick={() => exportDXF({ width: part.w, depth: part.h, name: part.id })} className="rounded-md border border-edge px-2 py-0.5 text-[11px] text-fg-muted hover:text-fg">↧ DXF · CAD</button>
            </div>
          </div>
        </div>

        <div className={`grid gap-3 ${view === "split" ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          {show3D && (
            <div className="relative h-[380px] overflow-hidden rounded-xl border border-edge bg-base">
              <div className="pointer-events-none absolute left-3 top-2.5 z-10">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-fg-faint">3D Model · material</div>
                <div className="text-[11px] text-fg-muted">{part.material} {part.grade} · t{part.thk} · {part.finish}</div>
              </div>
              <span className="pointer-events-none absolute right-3 top-2.5 z-10 rounded px-1.5 py-0.5 text-[9px] font-medium text-white" style={{ background: methodColor[part.method] }}>{part.method}</span>
              <div className="pointer-events-none absolute bottom-2 left-3 z-10 text-[10px] text-fg-faint">drag to orbit · scroll to zoom</div>
              <Part3D part={part} />
            </div>
          )}
          {show2D && (
            <div className="blueprint relative h-[380px] overflow-hidden rounded-xl border border-edge bg-base">
              <div className="pointer-events-none absolute left-3 top-2.5 z-10 text-[10px] font-semibold uppercase tracking-widest text-fg-faint">2D Shop Drawing</div>
              <ShopDrawing part={part} svgId={svgId} />
            </div>
          )}
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-edge bg-base/40 p-2.5 text-[12px]">
            {[["Qty", `${part.qty} off`], ["Unit mass", `${part.unitMass} kg`], ["Total mass", `${totalMass(part).toFixed(0)} kg`], ["Thickness", `${part.thk} mm`], ["Tolerance", part.tolerance], ["Finish", part.finish], ["Site", part.site], ["Due", part.due]].map((r) => (
              <div key={r[0]} className="flex items-center justify-between border-b border-edge/40 py-1 last:border-0">
                <span className="text-fg-faint">{r[0]}</span><span className="font-medium text-fg">{r[1]}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-fg-faint">Fabrication status</div>
            <StatusStepper part={part} />
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-edge"><div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${part.progress}%` }} /></div>
            <div className="mt-2 rounded-lg border-l-2 border-caution bg-base/40 px-2.5 py-2 text-[11px]">
              <span className="font-medium text-caution">Outstanding · </span>
              <span className="text-fg-muted">{part.outstanding}</span>
            </div>
            {mode === "production" && <QA part={part} />}
          </div>
        </div>
      </div>
    </div>
  );
}
