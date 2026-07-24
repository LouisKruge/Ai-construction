"use client";

import { useState } from "react";
import { cascade, rands } from "@/lib/engines";
import { Field } from "@/components/controls";
import { Card, CardHeader } from "@/components/ui";

const deptTone: Record<string, string> = {
  Engineering: "text-info",
  Procurement: "text-accent",
  Manufacturing: "text-caution",
  Construction: "text-caution",
  Finance: "text-positive",
  Executive: "text-fg",
};

export default function CascadePanel() {
  const [delta, setDelta] = useState(120);

  const r = cascade({
    steelDelta: delta,
    steelRate: 28_000,
    fabThroughput: 15,
    projectBudget: 486_000_000,
    tenderMargin: 12,
  });

  return (
    <Card>
      <CardHeader
        title="Live collaboration cascade"
        right={<span className="text-xs text-fg-faint">One change, every department — propagated in real time</span>}
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-4">
          <Field
            label="Structural revision: steel quantity change"
            value={delta}
            min={-80}
            max={300}
            step={5}
            unit="t"
            onChange={setDelta}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-edge bg-base p-3">
              <div className="text-[10px] font-medium uppercase tracking-widest text-fg-faint">Cost impact</div>
              <div className={`mt-1 text-lg font-semibold tabular-nums ${r.cashImpact < 0 ? "text-critical" : "text-positive"}`}>
                {rands(r.cashImpact)}
              </div>
            </div>
            <div className="rounded-lg border border-edge bg-base p-3">
              <div className="text-[10px] font-medium uppercase tracking-widest text-fg-faint">Margin move</div>
              <div className={`mt-1 text-lg font-semibold tabular-nums ${r.marginImpactPts < 0 ? "text-critical" : "text-positive"}`}>
                {r.marginImpactPts >= 0 ? "+" : ""}{r.marginImpactPts.toFixed(2)} pts
              </div>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-fg-faint">
            Drag the slider. A single structural revision propagates through procurement, manufacturing,
            the schedule, and finance — each number is computed, not narrated. This is the shared
            project model doing the work no single tool can.
          </p>
        </div>

        {/* propagation chain */}
        <div className="relative">
          <div className="absolute bottom-4 left-[15px] top-4 w-px bg-edge" />
          <div className="space-y-2.5">
            {r.nodes.map((n, i) => (
              <div key={n.agent} className="relative flex gap-4">
                <div className="relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-edge bg-surface font-mono text-xs text-fg-faint">
                  {i + 1}
                </div>
                <div className="flex-1 rounded-lg border border-edge bg-base px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-fg">{n.agent}</span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${deptTone[n.dept]}`}>
                      {n.dept}
                    </span>
                  </div>
                  <div className="mt-0.5 text-sm text-fg-muted">{n.effect}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
