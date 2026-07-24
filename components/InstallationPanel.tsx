"use client";

import { PARTS, statusIndex, statusColor } from "@/lib/fabrication";

export default function InstallationPanel() {
  const installed = PARTS.filter((p) => p.status === "Installed").length;
  const onSite = PARTS.filter((p) => p.status === "Dispatched").length;
  const inFab = PARTS.length - installed - onSite;
  const zones = [
    { z: "Basement / Podium", pct: 100 },
    { z: "Transfer L4", pct: 92 },
    { z: "Superstructure L5–L17", pct: 74 },
    { z: "Superstructure L18–L24", pct: 41 },
    { z: "Crown L25–L32", pct: 6 },
  ];
  return (
    <div className="glass elev rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Site Installation</h3>
        <div className="flex gap-2 text-[11px]">
          <span className="rounded-full bg-positive/10 px-2 py-0.5 text-positive">{installed} installed</span>
          <span className="rounded-full bg-info/10 px-2 py-0.5 text-info">{onSite} on site</span>
          <span className="rounded-full bg-caution/10 px-2 py-0.5 text-caution">{inFab} in fab</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* install progress by zone */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-fg-faint">Install progress by zone</div>
          {zones.map((z) => (
            <div key={z.z} className="text-[12px]">
              <div className="mb-0.5 flex justify-between"><span className="text-fg-muted">{z.z}</span><span className="font-mono text-fg-faint">{z.pct}%</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-edge"><div className={`h-full rounded-full ${z.pct === 100 ? "bg-positive" : "bg-gradient-to-r from-accent to-accent-2"}`} style={{ width: `${z.pct}%` }} /></div>
            </div>
          ))}
        </div>

        {/* part install register */}
        <div>
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-fg-faint">Part delivery → install</div>
          <div className="space-y-1.5">
            {PARTS.map((p) => {
              const idx = statusIndex(p.status);
              return (
                <div key={p.id} className="flex items-center gap-2 rounded-lg border border-edge bg-base/40 px-2.5 py-1.5 text-[11px]">
                  <span className="font-mono text-fg">{p.id}</span>
                  <span className="min-w-0 flex-1 truncate text-fg-muted">{p.site}</span>
                  <div className="hidden w-24 sm:block">
                    <div className="h-1.5 overflow-hidden rounded-full bg-edge"><div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${(idx / 6) * 100}%` }} /></div>
                  </div>
                  <span className={`shrink-0 text-[10px] font-medium ${statusColor(p.status)}`}>{p.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
