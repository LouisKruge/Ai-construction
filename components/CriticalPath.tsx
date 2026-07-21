"use client";

import { cpm } from "@/lib/engines";
import { programmeNetwork } from "@/lib/data";
import { Card, CardHeader } from "@/components/ui";

export default function CriticalPath() {
  const result = cpm(programmeNetwork);
  const max = result.projectDuration;

  return (
    <Card>
      <CardHeader
        title="Critical Path Method — superstructure programme"
        right={
          <span className="text-xs text-fg-faint">
            {result.projectDuration} working days · critical path {result.criticalPath.join(" → ")}
          </span>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-edge text-left text-[10px] uppercase tracking-wider text-fg-faint">
              <th className="px-4 py-2.5 font-medium">Activity</th>
              <th className="px-4 py-2.5 font-medium">Dur</th>
              <th className="px-4 py-2.5 font-medium">ES / EF</th>
              <th className="px-4 py-2.5 font-medium">LS / LF</th>
              <th className="px-4 py-2.5 font-medium">Float</th>
              <th className="w-[38%] px-4 py-2.5 font-medium">Timeline (days)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {result.activities.map((a) => (
              <tr key={a.id} className="transition hover:bg-raise">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {a.critical && <span className="h-1.5 w-1.5 rounded-full bg-critical" title="Critical" />}
                    <span className="font-mono text-xs text-fg-faint">{a.id}</span>
                    <span className="font-medium text-fg">{a.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-fg-muted">{a.duration}d</td>
                <td className="px-4 py-2.5 font-mono text-xs text-fg-muted">{a.es} / {a.ef}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-fg-muted">{a.ls} / {a.lf}</td>
                <td className="px-4 py-2.5">
                  <span className={`font-mono text-xs ${a.totalFloat === 0 ? "font-semibold text-critical" : "text-fg-muted"}`}>
                    {a.totalFloat}d
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="relative h-3.5 w-full rounded bg-edge/50">
                    {/* float extent (light) */}
                    <div
                      className="absolute top-0 h-full rounded bg-edge"
                      style={{ left: `${(a.es / max) * 100}%`, width: `${((a.lf - a.es) / max) * 100}%` }}
                    />
                    {/* actual bar */}
                    <div
                      className={`absolute top-0 h-full rounded ${a.critical ? "bg-critical" : "bg-fg-muted"}`}
                      style={{ left: `${(a.es / max) * 100}%`, width: `${(a.duration / max) * 100}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-5 border-t border-edge px-4 py-2.5 text-[11px] text-fg-faint">
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-critical" /> Critical (zero float)</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-fg-muted" /> Activity</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-edge" /> Available float</span>
        <span className="ml-auto">Forward/backward pass computed live from the precedence network</span>
      </div>
    </Card>
  );
}
