"use client";

import { useState } from "react";
import { floorPlan, structuralGrid } from "@/lib/engines";
import { Field, Metric } from "@/components/controls";
import { Card, CardHeader } from "@/components/ui";

type Mode = "Floor plan" | "Structural grid";

export default function DrawingGenerator() {
  const [mode, setMode] = useState<Mode>("Floor plan");
  const [width, setWidth] = useState(24);
  const [length, setLength] = useState(36);
  const [rooms, setRooms] = useState(8);
  const [baysX, setBaysX] = useState(4);
  const [baysY, setBaysY] = useState(6);

  // Fit the plan into a 320×220 viewbox with margin.
  const vw = 320;
  const vh = 220;
  const pad = 24;
  const scale = Math.min((vw - pad * 2) / width, (vh - pad * 2) / length);
  const ox = (vw - width * scale) / 2;
  const oy = (vh - length * scale) / 2;

  const plan = floorPlan(width, length, rooms);
  const grid = structuralGrid(width, length, baysX, baysY);

  return (
    <Card>
      <CardHeader
        title="Generative drawing engine"
        right={
          <div className="flex gap-1 text-xs">
            {(["Floor plan", "Structural grid"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md px-2.5 py-1 transition ${
                  mode === m ? "bg-raise font-medium text-fg" : "text-fg-faint hover:text-fg"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        }
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1.3fr]">
        {/* controls + metrics */}
        <div className="space-y-4">
          <Field label="Building width" value={width} min={8} max={60} step={1} unit="m" onChange={setWidth} />
          <Field label="Building length" value={length} min={8} max={80} step={1} unit="m" onChange={setLength} />
          {mode === "Floor plan" ? (
            <Field label="Rooms" value={rooms} min={2} max={16} step={1} onChange={setRooms} />
          ) : (
            <>
              <Field label="Bays across" value={baysX} min={1} max={10} step={1} onChange={setBaysX} />
              <Field label="Bays deep" value={baysY} min={1} max={12} step={1} onChange={setBaysY} />
            </>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Metric label="Gross floor area" value={`${(width * length).toFixed(0)} m²`} />
            {mode === "Floor plan" ? (
              <Metric label="Space efficiency" value={`${Math.round(plan.efficiency * 100)}%`} tone="positive" />
            ) : (
              <>
                <Metric label="Columns" value={String(grid.columns)} tone="accent" />
                <Metric label="Bay size" value={`${grid.baySpanX.toFixed(1)}×${grid.baySpanY.toFixed(1)} m`} />
                <Metric label="Trib. area" value={`${grid.tributary.toFixed(0)} m²`} sub={`axial ≈ ${grid.axialLoad.toFixed(0)} kN`} />
              </>
            )}
          </div>
          <p className="text-xs leading-relaxed text-fg-faint">
            Output is computed from your inputs — geometry, grid, areas and loads all recalculate live.
            Generated drawings route to engineer review before issue.
          </p>
        </div>

        {/* live SVG */}
        <div className="overflow-hidden rounded-lg border border-edge bg-base">
          <svg viewBox={`0 0 ${vw} ${vh}`} className="h-full w-full">
            {/* title block */}
            <rect x="0" y="0" width={vw} height={vh} fill="var(--color-base)" />
            {mode === "Floor plan"
              ? plan.rooms.map((rm, i) => (
                  <g key={i}>
                    <rect
                      x={ox + rm.x * scale}
                      y={oy + rm.y * scale}
                      width={rm.w * scale}
                      height={rm.h * scale}
                      fill="none"
                      stroke="var(--color-fg-muted)"
                      strokeWidth="1.2"
                    />
                    <text
                      x={ox + (rm.x + rm.w / 2) * scale}
                      y={oy + (rm.y + rm.h / 2) * scale - 2}
                      fill="var(--color-fg-faint)"
                      fontSize="7"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {rm.name}
                    </text>
                    <text
                      x={ox + (rm.x + rm.w / 2) * scale}
                      y={oy + (rm.y + rm.h / 2) * scale + 7}
                      fill="var(--color-accent)"
                      fontSize="6"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {rm.area.toFixed(0)}m²
                    </text>
                  </g>
                ))
              : (() => {
                  const gx = baysX + 1;
                  const gy = baysY + 1;
                  const els: React.ReactElement[] = [];
                  // grid lines
                  for (let i = 0; i < gx; i++) {
                    const x = ox + (width / baysX) * i * scale;
                    els.push(
                      <line key={`vx${i}`} x1={x} y1={oy} x2={x} y2={oy + length * scale} stroke="var(--color-edge-strong)" strokeWidth="0.75" />,
                    );
                  }
                  for (let j = 0; j < gy; j++) {
                    const y = oy + (length / baysY) * j * scale;
                    els.push(
                      <line key={`hz${j}`} x1={ox} y1={y} x2={ox + width * scale} y2={y} stroke="var(--color-edge-strong)" strokeWidth="0.75" />,
                    );
                  }
                  // columns at intersections
                  for (let i = 0; i < gx; i++) {
                    for (let j = 0; j < gy; j++) {
                      const x = ox + (width / baysX) * i * scale;
                      const y = oy + (length / baysY) * j * scale;
                      els.push(
                        <rect key={`c${i}-${j}`} x={x - 2.2} y={y - 2.2} width="4.4" height="4.4" fill="var(--color-accent)" />,
                      );
                    }
                  }
                  // grid refs
                  for (let i = 0; i < gx; i++) {
                    const x = ox + (width / baysX) * i * scale;
                    els.push(
                      <text key={`gl${i}`} x={x} y={oy - 6} fill="var(--color-fg-faint)" fontSize="6" textAnchor="middle" fontFamily="monospace">{i + 1}</text>,
                    );
                  }
                  for (let j = 0; j < gy; j++) {
                    const y = oy + (length / baysY) * j * scale;
                    els.push(
                      <text key={`glr${j}`} x={ox - 8} y={y + 2} fill="var(--color-fg-faint)" fontSize="6" textAnchor="middle" fontFamily="monospace">{String.fromCharCode(65 + j)}</text>,
                    );
                  }
                  return els;
                })()}
            {/* dimension line */}
            <line x1={ox} y1={oy + length * scale + 10} x2={ox + width * scale} y2={oy + length * scale + 10} stroke="var(--color-accent)" strokeWidth="0.75" />
            <text x={ox + (width * scale) / 2} y={oy + length * scale + 20} fill="var(--color-accent)" fontSize="7" textAnchor="middle" fontFamily="monospace">{width.toFixed(0)} m</text>
          </svg>
        </div>
      </div>
    </Card>
  );
}
