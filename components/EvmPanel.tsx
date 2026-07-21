"use client";

import { evm, rands } from "@/lib/engines";
import { evmBasis, projects } from "@/lib/data";
import { Card, CardHeader } from "@/components/ui";

export default function EvmPanel() {
  const rows = evmBasis.map((b) => ({
    project: projects.find((p) => p.id === b.project),
    id: b.project,
    e: evm({ bac: b.bac, plannedPct: b.plannedPct, actualPct: b.actualPct, actualCost: b.actualCost }),
  }));

  const idx = (v: number) =>
    v >= 1.0 ? "text-positive" : v >= 0.95 ? "text-caution" : "text-critical";

  return (
    <Card>
      <CardHeader
        title="Earned Value Management — portfolio"
        right={<span className="text-xs text-fg-faint">CPI/SPI, forecast at completion (EAC = BAC ÷ CPI)</span>}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-edge text-left text-[10px] uppercase tracking-wider text-fg-faint">
              <th className="px-4 py-2.5 font-medium">Project</th>
              <th className="px-4 py-2.5 font-medium">PV</th>
              <th className="px-4 py-2.5 font-medium">EV</th>
              <th className="px-4 py-2.5 font-medium">AC</th>
              <th className="px-4 py-2.5 font-medium">CPI</th>
              <th className="px-4 py-2.5 font-medium">SPI</th>
              <th className="px-4 py-2.5 font-medium">EAC</th>
              <th className="px-4 py-2.5 font-medium">VAC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {rows.map((r) => (
              <tr key={r.id} className="transition hover:bg-raise">
                <td className="px-4 py-3">
                  <div className="font-medium text-fg">{r.project?.name}</div>
                  <div className="text-[11px] text-fg-faint">{r.id}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-fg-muted">{rands(r.e.pv)}</td>
                <td className="px-4 py-3 font-mono text-xs text-fg-muted">{rands(r.e.ev)}</td>
                <td className="px-4 py-3 font-mono text-xs text-fg-muted">{rands(r.e.ac)}</td>
                <td className={`px-4 py-3 font-mono text-xs font-semibold ${idx(r.e.cpi)}`}>{r.e.cpi.toFixed(2)}</td>
                <td className={`px-4 py-3 font-mono text-xs font-semibold ${idx(r.e.spi)}`}>{r.e.spi.toFixed(2)}</td>
                <td className="px-4 py-3 font-mono text-xs text-fg">{rands(r.e.eac)}</td>
                <td className={`px-4 py-3 font-mono text-xs ${r.e.vac < 0 ? "text-critical" : "text-positive"}`}>
                  {rands(r.e.vac)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-edge px-4 py-2.5 text-[11px] text-fg-faint">
        CPI &lt; 1 = over budget · SPI &lt; 1 = behind schedule · VAC negative = forecast overrun. CV = EV−AC, SV = EV−PV,
        EAC = BAC ÷ CPI, TCPI = (BAC−EV) ÷ (BAC−AC).
      </div>
    </Card>
  );
}
