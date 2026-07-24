"use client";

import { useMemo, useState } from "react";
import { cpm } from "@/lib/engines";
import { programmeNetwork } from "@/lib/data";

export default function EditableProgramme() {
  const [durations, setDurations] = useState<Record<string, number>>(
    Object.fromEntries(programmeNetwork.map((a) => [a.id, a.duration])),
  );
  const net = useMemo(() => programmeNetwork.map((a) => ({ ...a, duration: Math.max(1, durations[a.id]) })), [durations]);
  const res = useMemo(() => cpm(net), [net]);
  const total = res.projectDuration;
  const weeks = (total / 5).toFixed(1);

  const set = (id: string, d: number) => setDurations((p) => ({ ...p, [id]: d }));

  return (
    <div className="glass elev rounded-2xl p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Programme · editable CPM</h3>
        <div className="flex items-center gap-3 text-[12px]">
          <span className="text-fg-faint">Project finish</span>
          <span className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-accent">Day {total} · {weeks} wks</span>
          <span className="text-fg-faint">Critical: <span className="font-mono text-critical">{res.criticalPath.join("→")}</span></span>
        </div>
      </div>

      <div className="space-y-1.5">
        {res.activities.map((a) => (
          <div key={a.id} className="grid grid-cols-[1.6fr_92px_1fr] items-center gap-3 text-[12px]">
            <div className="flex items-center gap-2">
              <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-semibold ${a.critical ? "bg-critical/15 text-critical" : "bg-raise text-fg-muted"}`}>{a.id}</span>
              <span className="truncate text-fg">{a.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => set(a.id, Math.max(1, durations[a.id] - 1))} className="rounded border border-edge px-1.5 text-accent">−</button>
              <input
                type="number"
                value={durations[a.id]}
                onChange={(e) => set(a.id, Number(e.target.value) || 1)}
                className="w-9 rounded border border-edge bg-base/60 px-1 py-0.5 text-center text-[11px] text-fg outline-none focus:border-accent"
              />
              <button onClick={() => set(a.id, durations[a.id] + 1)} className="rounded border border-edge px-1.5 text-accent">+</button>
            </div>
            {/* gantt bar */}
            <div className="relative h-4 rounded bg-base/60">
              <div
                className={`absolute top-0.5 h-3 rounded ${a.critical ? "bg-gradient-to-r from-critical to-rose-400" : "bg-gradient-to-r from-accent to-accent-2"}`}
                style={{ left: `${(a.es / total) * 100}%`, width: `${(a.duration / total) * 100}%` }}
                title={`ES ${a.es} · EF ${a.ef} · float ${a.totalFloat}d`}
              />
              {a.totalFloat > 0 && (
                <div className="absolute top-1.5 h-1 rounded bg-fg-faint/40" style={{ left: `${(a.ef / total) * 100}%`, width: `${(a.totalFloat / total) * 100}%` }} />
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-fg-faint">Adjust any duration and the critical path, floats and project finish recompute instantly (forward/backward pass). Grey tails show total float.</p>
    </div>
  );
}
