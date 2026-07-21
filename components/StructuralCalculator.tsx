"use client";

import { useState } from "react";
import { designBeam } from "@/lib/engines";
import { Field, Metric } from "@/components/controls";
import { Card, CardHeader } from "@/components/ui";

export default function StructuralCalculator() {
  const [load, setLoad] = useState(20);
  const [span, setSpan] = useState(8);
  const [count, setCount] = useState(24);
  const [deflRatio, setDeflRatio] = useState(360);

  const r = designBeam(load, span, count, deflRatio);
  const utilPct = Math.round(r.utilisation * 100);

  return (
    <Card>
      <CardHeader
        title="Structural Engineering AI — beam design"
        right={<span className="text-xs text-fg-faint">Eurocode-style, S355 · recommendation, engineer signs off</span>}
      />
      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="Design load (UDL)" value={load} min={5} max={80} step={1} unit="kN/m" onChange={setLoad} />
          <Field label="Span" value={span} min={3} max={16} step={0.5} unit="m" onChange={setSpan} />
          <Field label="Number of beams" value={count} min={1} max={120} step={1} onChange={setCount} />
          <Field label="Deflection limit (span /)" value={deflRatio} min={200} max={500} step={10} onChange={setDeflRatio} />
          <p className="text-xs leading-relaxed text-fg-faint">
            The agent computes the bending moment, required plastic modulus, then selects the
            lightest universal beam that passes both bending and deflection — and estimates total
            steel tonnage. It never issues the design; a licensed engineer signs off.
          </p>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Max moment" value={`${r.moment.toFixed(0)} kNm`} sub={`shear ${r.shear.toFixed(0)} kN`} />
            <Metric label="Required Z" value={`${r.zReq.toFixed(0)} cm³`} sub="plastic modulus" />
            <Metric
              label="Selected section"
              value={r.section ? r.section.name.replace(" UB", "") : "— none —"}
              sub={r.section ? `${r.section.mass} kg/m` : "exceeds catalogue"}
              tone={r.section ? "accent" : "critical"}
            />
            <Metric
              label="Utilisation"
              value={`${utilPct}%`}
              sub={`governed by ${r.governedBy.toLowerCase()}`}
              tone={utilPct > 95 ? "critical" : utilPct > 85 ? "caution" : "positive"}
            />
            <Metric
              label="Deflection"
              value={`${r.deflection.toFixed(1)} mm`}
              sub={`limit ${r.deflLimit.toFixed(1)} mm`}
              tone={r.deflection > r.deflLimit ? "critical" : "positive"}
            />
            <Metric label="Total steel" value={`${r.tonnage.toFixed(2)} t`} sub={`${count} × ${span} m`} tone="neutral" />
          </div>
          <div className="mt-3 rounded-lg border border-edge bg-base p-3 text-xs leading-relaxed text-fg-muted">
            <span className="font-medium text-fg">Result:</span>{" "}
            {r.section ? (
              <>
                Adopt <span className="font-medium text-accent">{r.section.name}</span> — {utilPct}% utilised,{" "}
                {r.governedBy === "Deflection" ? "deflection-governed" : "bending-governed"}. Estimated{" "}
                <span className="font-medium text-fg">{r.tonnage.toFixed(2)} tonnes</span> across {count} beams. Routed to
                Procurement AI and Estimation AI.
              </>
            ) : (
              <>Load/span exceeds the standard UB catalogue — escalate to the engineer for a fabricated or composite section.</>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
