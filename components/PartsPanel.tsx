"use client";

import { useState } from "react";
import { PARTS, STATUS_ORDER, statusIndex, methodColor, statusColor, totalMass, type Part } from "@/lib/fabrication";
import { exportSVG, exportPNG, exportDXF } from "@/lib/exporters";

/* ── dimensioned shop drawing ─────────────────────────────────────────────*/
export function ShopDrawing({ part, svgId }: { part: Part; svgId?: string }) {
  const pad = 70;
  const scale = Math.min((560 - pad * 2) / part.w, (330 - pad) / part.h);
  const w = part.w * scale, h = part.h * scale;
  const ox = pad, oy = 40;
  const dim = (x1: number, y1: number, x2: number, y2: number, label: string, off: number, vert = false) => (
    <g stroke="#8ea2ff" strokeWidth="0.6" fill="none">
      {vert ? (
        <>
          <line x1={x1 - off} y1={y1} x2={x2 - off} y2={y2} />
          <line x1={x1 - off - 3} y1={y1} x2={x1 - off + 3} y2={y1} />
          <line x1={x2 - off - 3} y1={y2} x2={x2 - off + 3} y2={y2} />
          <text x={x1 - off - 6} y={(y1 + y2) / 2} fill="#cfe0ff" fontSize="9" textAnchor="middle" stroke="none" transform={`rotate(-90 ${x1 - off - 6} ${(y1 + y2) / 2})`}>{label}</text>
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 + off} x2={x2} y2={y2 + off} />
          <line x1={x1} y1={y1 + off - 3} x2={x1} y2={y1 + off + 3} />
          <line x1={x2} y1={y2 + off - 3} x2={x2} y2={y2 + off + 3} />
          <text x={(x1 + x2) / 2} y={y1 + off + 12} fill="#cfe0ff" fontSize="9" textAnchor="middle" stroke="none">{label}</text>
        </>
      )}
    </g>
  );
  return (
    <svg id={svgId} viewBox="0 0 560 400" className="h-full w-full">
      <rect x="6" y="6" width="548" height="388" fill="none" stroke="#2a3550" strokeWidth="1" />
      {/* plate */}
      <rect x={ox} y={oy} width={w} height={h} fill="#12203a" stroke="#6d7cff" strokeWidth="1.4" />
      {/* holes */}
      {part.holes.map((hole, i) => {
        const cx = ox + hole.x * scale, cy = oy + (part.h - hole.y) * scale, r = (hole.d / 2) * scale;
        return (
          <g key={i} stroke="#38bdf8" fill="none" strokeWidth="1">
            <circle cx={cx} cy={cy} r={Math.max(2, r)} />
            <line x1={cx - r - 3} y1={cy} x2={cx + r + 3} y2={cy} strokeWidth="0.5" />
            <line x1={cx} y1={cy - r - 3} x2={cx} y2={cy + r + 3} strokeWidth="0.5" />
          </g>
        );
      })}
      {/* dimensions */}
      {dim(ox, oy + h, ox + w, oy + h, `${part.w}`, 20)}
      {dim(ox, oy, ox, oy + h, `${part.h}`, 22, true)}
      {part.holes[0] && (
        <text x={ox + part.holes[0].x * scale + 8} y={oy + (part.h - part.holes[0].y) * scale - 6} fill="#38bdf8" fontSize="8">{part.holes.length}× Ø{part.holes[0].d}</text>
      )}
      {/* thickness note */}
      <text x={ox} y={oy - 8} fill="#97a3bd" fontSize="8">PLATE t = {part.thk} mm · {part.grade}</text>
      {/* title block */}
      <g>
        <rect x="352" y="300" width="202" height="88" fill="#0b1220" stroke="#303c54" />
        <line x1="352" y1="322" x2="554" y2="322" stroke="#303c54" />
        <line x1="352" y1="344" x2="554" y2="344" stroke="#303c54" />
        <line x1="352" y1="366" x2="554" y2="366" stroke="#303c54" />
        <line x1="453" y1="300" x2="453" y2="388" stroke="#303c54" />
        <text x="358" y="315" fill="#eef2fb" fontSize="9" fontWeight="700">{part.id}</text>
        <text x="459" y="315" fill="#97a3bd" fontSize="8">Rev {part.rev} · 1:{Math.round(1 / scale * 5) * 2}</text>
        {[["Part", part.name.slice(0, 20)], ["Method", part.method], ["Material", `${part.material} ${part.grade}`], ["Tol / Finish", `${part.tolerance} · ${part.finish}`]].map((r, i) => (
          <g key={i}>
            <text x="358" y={337 + i * 22} fill="#5c6884" fontSize="7">{r[0]}</text>
            <text x="358" y={337 + i * 22 + 9} fill="#cdd6ea" fontSize="8">{r[1]}</text>
          </g>
        ))}
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
  const part = PARTS.find((p) => p.id === id)!;
  const svgId = "shopdrawing";
  const getSvg = () => document.getElementById(svgId) as unknown as SVGSVGElement | null;

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
          <div className="flex gap-1.5">
            <button onClick={() => { const s = getSvg(); if (s) exportPNG(s, part.id); }} className="rounded-md border border-edge px-2 py-0.5 text-[11px] text-fg-muted hover:text-fg">↧ PNG</button>
            <button onClick={() => { const s = getSvg(); if (s) exportSVG(s, part.id); }} className="rounded-md border border-edge px-2 py-0.5 text-[11px] text-fg-muted hover:text-fg">↧ SVG</button>
            <button onClick={() => exportDXF({ width: part.w, depth: part.h, name: part.id })} className="rounded-md border border-edge px-2 py-0.5 text-[11px] text-fg-muted hover:text-fg">↧ DXF · CAD</button>
          </div>
        </div>

        <div className="blueprint overflow-hidden rounded-xl border border-edge bg-base">
          <ShopDrawing part={part} svgId={svgId} />
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
