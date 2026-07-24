"use client";

import { useMemo, useState } from "react";
import { PARTS, methodColor, type Part } from "@/lib/fabrication";

// Simple shelf-packing nest of a part's plates onto a stock sheet.
function nest(part: Part, sheetW = 3000, sheetH = 1500, gap = 12) {
  const placed: { x: number; y: number; w: number; h: number; n: number }[] = [];
  let x = gap, y = gap, rowH = 0, n = 0;
  for (let i = 0; i < part.qty && y + part.h + gap <= sheetH; i++) {
    if (x + part.w + gap > sheetW) { x = gap; y += rowH + gap; rowH = 0; }
    if (y + part.h + gap > sheetH) break;
    placed.push({ x, y, w: part.w, h: part.h, n: ++n });
    x += part.w + gap;
    rowH = Math.max(rowH, part.h);
  }
  const used = placed.length * part.w * part.h;
  const util = (used / (sheetW * sheetH)) * 100;
  const perimeter = placed.length * 2 * (part.w + part.h);
  return { placed, util, perimeter, sheetsNeeded: Math.ceil(part.qty / Math.max(1, placed.length)) };
}

const machineFor: Record<string, { machine: string; feed: string; pierce: string; kerf: string }> = {
  "CNC Laser": { machine: "Bystronic BySmart 6 kW", feed: "3.2 m/min", pierce: "0.4 s", kerf: "0.2 mm" },
  "CNC Plasma": { machine: "Hypertherm XPR300", feed: "2.1 m/min", pierce: "0.8 s", kerf: "1.8 mm" },
  "CNC Milling": { machine: "DMG MORI DMU 50", feed: "1.4 m/min", pierce: "—", kerf: "8 mm cutter" },
  "Press Brake": { machine: "Amada HG 1003", feed: "—", pierce: "—", kerf: "V-die 12" },
};

export default function MachiningPanel() {
  const cuttable = PARTS.filter((p) => p.method.startsWith("CNC") || p.method === "Press Brake");
  const [id, setId] = useState(cuttable[0].id);
  const part = cuttable.find((p) => p.id === id)!;
  const { placed, util, perimeter, sheetsNeeded } = useMemo(() => nest(part), [part]);
  const mach = machineFor[part.method] ?? machineFor["CNC Laser"];
  const sw = 3000, sh = 1500, s = 520 / sw;

  return (
    <div className="glass elev rounded-2xl p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Machining · Nesting &amp; Cut List</h3>
        <div className="flex flex-wrap gap-1.5">
          {cuttable.map((p) => (
            <button key={p.id} onClick={() => setId(p.id)} className={`rounded-md border px-2 py-0.5 font-mono text-[11px] transition ${p.id === id ? "border-accent bg-accent/10 text-fg" : "border-edge text-fg-muted hover:text-fg"}`}>{p.id}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        {/* nesting sheet */}
        <div>
          <svg viewBox={`0 0 ${sw * s} ${sh * s}`} className="w-full rounded-lg border border-edge bg-base">
            <rect x="0" y="0" width={sw * s} height={sh * s} fill="#0b1220" />
            {placed.map((r) => (
              <g key={r.n}>
                <rect x={r.x * s} y={r.y * s} width={r.w * s} height={r.h * s} fill={methodColor[part.method]} fillOpacity="0.18" stroke={methodColor[part.method]} strokeWidth="0.8" />
                {part.holes.map((h, i) => (
                  <circle key={i} cx={(r.x + h.x) * s} cy={(r.y + part.h - h.y) * s} r={Math.max(1, (h.d / 2) * s)} fill="none" stroke="#38bdf8" strokeWidth="0.5" />
                ))}
                <text x={(r.x + r.w / 2) * s} y={(r.y + r.h / 2) * s} fill="#cdd6ea" fontSize="6" textAnchor="middle">{part.id}·{r.n}</text>
              </g>
            ))}
          </svg>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-fg-faint">
            <span>Stock sheet 3000 × 1500 × {part.thk} mm · {part.grade}</span>
            <span>{placed.length} parts / sheet · <span className={util > 60 ? "text-positive" : "text-caution"}>{util.toFixed(0)}% utilisation</span></span>
          </div>
        </div>

        {/* machine + cut params */}
        <div className="space-y-2 text-[12px]">
          <div className="rounded-lg border border-edge bg-base/40 p-2.5">
            {[["Machine", mach.machine], ["Feed rate", mach.feed], ["Pierce", mach.pierce], ["Kerf / tool", mach.kerf], ["Cut length", `${(perimeter / 1000).toFixed(1)} m/sheet`], ["Sheets needed", `${sheetsNeeded}`], ["Nesting eff.", `${util.toFixed(0)}%`]].map((r) => (
              <div key={r[0]} className="flex items-center justify-between border-b border-edge/40 py-1 last:border-0">
                <span className="text-fg-faint">{r[0]}</span><span className="font-medium text-fg">{r[1]}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border-l-2 border-caution bg-base/40 px-2.5 py-2 text-[11px]">
            <span className="font-medium text-caution">Outstanding · </span><span className="text-fg-muted">{part.outstanding}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
