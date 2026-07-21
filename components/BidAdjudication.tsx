"use client";

import { useState } from "react";
import { adjudicate, type Bidder, type BidWeights, rands } from "@/lib/engines";
import { Field } from "@/components/controls";
import { Card, CardHeader } from "@/components/ui";

const bidders: Bidder[] = [
  { name: "Vulcan Steel Fabricators", price: 18_420_000, leadWeeks: 8, quality: 4.7, compliance: 96, bbbee: 2 },
  { name: "Karoo Fabrication", price: 17_000_000, leadWeeks: 11, quality: 4.2, compliance: 88, bbbee: 1 },
  { name: "Highveld Structural", price: 19_100_000, leadWeeks: 6, quality: 4.5, compliance: 92, bbbee: 3 },
  { name: "Meridian Façades", price: 18_900_000, leadWeeks: 10, quality: 4.1, compliance: 84, bbbee: 4 },
];

export default function BidAdjudication() {
  const [w, setW] = useState<BidWeights>({ price: 40, lead: 20, quality: 20, compliance: 10, bbbee: 10 });
  const ranked = adjudicate(bidders, w);
  const winner = ranked[0];
  const margin = winner.total - ranked[1].total;

  const set = (k: keyof BidWeights) => (v: number) => setW((prev) => ({ ...prev, [k]: v }));

  return (
    <Card className="mt-6">
      <CardHeader
        title="Tender adjudication matrix — curtain wall package"
        right={<span className="text-xs text-fg-faint">Weighted multi-criteria scoring · adjust weights, ranking recomputes</span>}
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[280px_1fr]">
        {/* weights */}
        <div className="space-y-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-fg-faint">Evaluation weights</div>
          <Field label="Price" value={w.price} min={0} max={60} step={5} unit="%" onChange={set("price")} />
          <Field label="Lead time" value={w.lead} min={0} max={40} step={5} unit="%" onChange={set("lead")} />
          <Field label="Quality" value={w.quality} min={0} max={40} step={5} unit="%" onChange={set("quality")} />
          <Field label="Compliance" value={w.compliance} min={0} max={30} step={5} unit="%" onChange={set("compliance")} />
          <Field label="B-BBEE" value={w.bbbee} min={0} max={30} step={5} unit="%" onChange={set("bbbee")} />
          <div className="rounded-lg border border-edge bg-base p-3">
            <div className="text-[10px] uppercase tracking-widest text-fg-faint">Recommended award</div>
            <div className="mt-1 text-sm font-semibold text-accent">{winner.name}</div>
            <div className="mt-0.5 text-xs text-fg-muted">
              Score {winner.total.toFixed(1)} · {margin > 3 ? "clear" : "narrow"} margin of {margin.toFixed(1)} over 2nd. Needs commercial sign-off.
            </div>
          </div>
        </div>

        {/* matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge text-left text-[10px] uppercase tracking-wider text-fg-faint">
                <th className="px-3 py-2.5 font-medium">Rank</th>
                <th className="px-3 py-2.5 font-medium">Bidder</th>
                <th className="px-3 py-2.5 font-medium">Price</th>
                <th className="px-3 py-2.5 font-medium" title="normalized 0–100">Price ●</th>
                <th className="px-3 py-2.5 font-medium">Lead ●</th>
                <th className="px-3 py-2.5 font-medium">Qual ●</th>
                <th className="px-3 py-2.5 font-medium">Comp ●</th>
                <th className="px-3 py-2.5 font-medium">BEE ●</th>
                <th className="px-3 py-2.5 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {ranked.map((b) => (
                <tr key={b.name} className={`transition hover:bg-raise ${b.rank === 1 ? "bg-accent/5" : ""}`}>
                  <td className="px-3 py-2.5 font-mono text-xs text-fg-faint">#{b.rank}</td>
                  <td className="px-3 py-2.5 font-medium text-fg">{b.name}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-fg-muted">{rands(b.price)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-fg-muted">{b.scores.price.toFixed(0)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-fg-muted">{b.scores.lead.toFixed(0)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-fg-muted">{b.scores.quality.toFixed(0)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-fg-muted">{b.scores.compliance.toFixed(0)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-fg-muted">{b.scores.bbbee.toFixed(0)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-edge">
                        <div className={`h-full rounded-full ${b.rank === 1 ? "bg-accent" : "bg-fg-muted"}`} style={{ width: `${b.total}%` }} />
                      </div>
                      <span className={`font-mono text-xs ${b.rank === 1 ? "font-semibold text-accent" : "text-fg"}`}>
                        {b.total.toFixed(1)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] text-fg-faint">
            Each criterion is normalised 0–100 (lowest price = 100, shortest lead = 100, quality/5, compliance %, B-BBEE level→score), then combined by the weights. This is a standard bid tabulation — the lowest price does not automatically win.
          </p>
        </div>
      </div>
    </Card>
  );
}
