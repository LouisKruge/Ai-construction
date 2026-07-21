"use client";

import { useState } from "react";
import { loadCombination, designRcBeam, barSchedule } from "@/lib/engines";
import { Field } from "@/components/controls";
import { Card, CardHeader } from "@/components/ui";

export default function RebarDetail() {
  const [dead, setDead] = useState(6);
  const [live, setLive] = useState(4);
  const [span, setSpan] = useState(7);
  const [width, setWidth] = useState(300);
  const [depth, setDepth] = useState(600);

  const actions = loadCombination(dead, live, 3);
  const rc = designRcBeam(actions, span, 1, width, depth);
  const schedule = barSchedule(rc, span);
  const totalMass = schedule.reduce((s, b) => s + b.mass, 0);

  // draw the section: scale mm → svg units (section is width×depth mm)
  const pad = 34;
  const vw = 200;
  const vh = 220;
  const scale = Math.min((vw - pad * 2) / rc.b, (vh - pad * 2) / rc.h);
  const bw = rc.b * scale;
  const bh = rc.h * scale;
  const ox = (vw - bw) / 2;
  const oy = (vh - bh) / 2;
  const cov = 34 * scale; // cover visual
  // bottom bars positions
  const n = rc.bars.count;
  const innerW = bw - 2 * cov;
  const barR = Math.max(2, (rc.bars.dia / 25) * 3);

  return (
    <Card>
      <CardHeader
        title="Reinforcement detailing & bar bending schedule"
        right={<span className="text-xs text-fg-faint">Section + BBS generated from the RC design · BS 8666</span>}
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1.5fr]">
        {/* controls + section drawing */}
        <div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dead G" value={dead} min={2} max={15} step={0.5} unit="kPa" onChange={setDead} />
            <Field label="Live Q" value={live} min={1} max={12} step={0.5} unit="kPa" onChange={setLive} />
            <Field label="Span" value={span} min={3} max={12} step={0.5} unit="m" onChange={setSpan} />
            <Field label="Width b" value={width} min={200} max={600} step={25} unit="mm" onChange={setWidth} />
            <Field label="Depth h" value={depth} min={400} max={1000} step={25} unit="mm" onChange={setDepth} />
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-edge bg-base">
            <svg viewBox={`0 0 ${vw} ${vh}`} className="h-full w-full">
              {/* concrete outline */}
              <rect x={ox} y={oy} width={bw} height={bh} fill="none" stroke="var(--color-fg-muted)" strokeWidth="1.4" />
              {/* link */}
              <rect x={ox + cov * 0.6} y={oy + cov * 0.6} width={bw - cov * 1.2} height={bh - cov * 1.2} rx="3" fill="none" stroke="var(--color-accent)" strokeWidth="0.9" />
              {/* bottom main bars */}
              {Array.from({ length: n }).map((_, i) => {
                const x = ox + cov + (n === 1 ? innerW / 2 : (innerW / (n - 1)) * i);
                return <circle key={`b${i}`} cx={x} cy={oy + bh - cov} r={barR} fill="var(--color-accent)" />;
              })}
              {/* top hangers */}
              {[0, 1].map((i) => (
                <circle key={`t${i}`} cx={ox + cov + (i === 0 ? 0 : innerW)} cy={oy + cov} r={2.4} fill="var(--color-fg-muted)" />
              ))}
              {/* dimensions */}
              <text x={ox + bw / 2} y={oy + bh + 16} fill="var(--color-fg-faint)" fontSize="8" textAnchor="middle" fontFamily="monospace">{rc.b}</text>
              <text x={ox - 10} y={oy + bh / 2} fill="var(--color-fg-faint)" fontSize="8" textAnchor="middle" fontFamily="monospace" transform={`rotate(-90 ${ox - 10} ${oy + bh / 2})`}>{rc.h}</text>
              <text x={ox + bw / 2} y={oy + bh - cov + 14} fill="var(--color-accent)" fontSize="7" textAnchor="middle" fontFamily="monospace">{n}T{rc.bars.dia}</text>
              <text x={ox + bw / 2} y={oy - 6} fill="var(--color-fg-faint)" fontSize="7" textAnchor="middle" fontFamily="monospace">2T16 (hangers)</text>
            </svg>
          </div>
          <p className="mt-2 text-[11px] text-fg-faint">
            Section at midspan. Bottom steel sized for M_Ed {rc.moment.toFixed(0)} kNm; links R{rc.linkDia}@{rc.linkSpacing} for V_Ed {rc.shear.toFixed(0)} kN.
          </p>
        </div>

        {/* bar bending schedule */}
        <div>
          <div className="overflow-hidden rounded-lg border border-edge">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-raise/40 text-left text-[10px] uppercase tracking-wider text-fg-faint">
                  <th className="px-3 py-2 font-medium">Mark</th>
                  <th className="px-3 py-2 font-medium">Member</th>
                  <th className="px-3 py-2 font-medium">Bar</th>
                  <th className="px-3 py-2 font-medium">Shape</th>
                  <th className="px-3 py-2 font-medium">No.</th>
                  <th className="px-3 py-2 font-medium">Length</th>
                  <th className="px-3 py-2 font-medium">Mass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {schedule.map((b) => (
                  <tr key={b.mark} className="transition hover:bg-raise">
                    <td className="px-3 py-2.5 font-mono text-xs text-accent">{b.mark}</td>
                    <td className="px-3 py-2.5 text-fg-muted">{b.type}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-fg">T{b.dia}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-fg-faint">{b.shape}</td>
                    <td className="px-3 py-2.5 text-fg-muted">{b.count}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-fg-muted">{b.lengthEach} mm</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-fg-muted">{b.mass.toFixed(0)} kg</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-edge-strong bg-raise/30">
                  <td className="px-3 py-2.5 text-xs font-semibold text-fg" colSpan={6}>
                    Total steel — 1 beam
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-fg">{totalMass.toFixed(0)} kg</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-fg-faint">
            Bar mass 0.00617·Ø² kg/m; lengths include 40Ø anchorage each end. Schedule regenerates as the section changes.
          </p>
        </div>
      </div>
    </Card>
  );
}
