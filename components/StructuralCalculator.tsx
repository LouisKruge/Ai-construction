"use client";

import { useState } from "react";
import {
  loadCombination,
  designSteelBeam,
  designSteelColumn,
  designRcBeam,
  type LimitCheck,
} from "@/lib/engines";
import { Field, Metric } from "@/components/controls";
import { Card, CardHeader } from "@/components/ui";

type Member = "Beam" | "Column";
type Material = "Steel" | "Reinforced concrete";

function UtilBar({ u }: { u: number }) {
  const pct = Math.min(u * 100, 120);
  const tone = u > 1 ? "bg-critical" : u > 0.9 ? "bg-caution" : "bg-positive";
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-edge">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      {/* 100% reference line */}
      <div className="absolute inset-y-0 right-0 w-px bg-fg-faint" style={{ right: `${100 - 100 / 1.2}%` }} />
    </div>
  );
}

function CheckRow({ c }: { c: LimitCheck }) {
  return (
    <tr className="border-t border-edge">
      <td className="px-4 py-2.5">
        <div className="text-sm font-medium text-fg">{c.name}</div>
        <div className="text-[11px] text-fg-faint">{c.code}</div>
      </td>
      <td className="px-4 py-2.5 font-mono text-xs text-fg-muted">{c.demand}</td>
      <td className="px-4 py-2.5 font-mono text-xs text-fg-muted">{c.capacity}</td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-24"><UtilBar u={c.utilisation} /></div>
          <span className={`w-10 text-right font-mono text-xs ${c.utilisation > 1 ? "text-critical" : "text-fg"}`}>
            {Math.round(c.utilisation * 100)}%
          </span>
        </div>
      </td>
      <td className="px-4 py-2.5">
        <span className={`text-xs font-semibold ${c.pass ? "text-positive" : "text-critical"}`}>
          {c.pass ? "PASS" : "FAIL"}
        </span>
      </td>
    </tr>
  );
}

export default function StructuralCalculator() {
  const [member, setMember] = useState<Member>("Beam");
  const [material, setMaterial] = useState<Material>("Steel");
  const [dead, setDead] = useState(5);
  const [live, setLive] = useState(3);
  const [span, setSpan] = useState(8);
  const [spacing, setSpacing] = useState(3);
  const [count, setCount] = useState(24);
  const [floors, setFloors] = useState(6);

  const actions = loadCombination(dead, live, spacing);

  const steelBeam = designSteelBeam(actions, span, count);
  const rcBeam = designRcBeam(actions, span, count);
  // column axial from tributary area × floors
  const nEd = actions.nUlsPerFloor * (span * spacing) * floors;
  const column = designSteelColumn(nEd, 4.0);

  const Toggle = <T extends string>({
    value,
    options,
    onChange,
  }: {
    value: T;
    options: T[];
    onChange: (v: T) => void;
  }) => (
    <div className="flex gap-1 rounded-md border border-edge bg-base p-0.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`rounded px-2.5 py-1 text-xs transition ${
            value === o ? "bg-raise font-medium text-fg" : "text-fg-faint hover:text-fg"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader
        title="Structural Engineering AI — design verification"
        right={
          <div className="flex gap-2">
            <Toggle value={member} options={["Beam", "Column"]} onChange={setMember} />
            {member === "Beam" && (
              <Toggle value={material} options={["Steel", "Reinforced concrete"]} onChange={setMaterial} />
            )}
          </div>
        }
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[300px_1fr]">
        {/* inputs */}
        <div className="space-y-3.5">
          <Field label="Dead load G" value={dead} min={1} max={15} step={0.5} unit="kPa" onChange={setDead} />
          <Field label="Live load Q" value={live} min={1} max={15} step={0.5} unit="kPa" onChange={setLive} />
          <Field label="Member spacing" value={spacing} min={1} max={9} step={0.5} unit="m" onChange={setSpacing} />
          {member === "Beam" ? (
            <>
              <Field label="Span" value={span} min={3} max={16} step={0.5} unit="m" onChange={setSpan} />
              <Field label="Number of members" value={count} min={1} max={120} step={1} onChange={setCount} />
            </>
          ) : (
            <Field label="Floors supported" value={floors} min={1} max={40} step={1} onChange={setFloors} />
          )}
          <div className="rounded-lg border border-edge bg-base p-3 text-xs leading-relaxed text-fg-muted">
            <div className="font-medium text-fg">Load combinations</div>
            <div className="mt-1 font-mono text-[11px]">
              ULS 1.2G + 1.6Q = {actions.wUls.toFixed(1)} kN/m
              <br />
              SLS 1.0G + 1.0Q = {actions.wSls.toFixed(1)} kN/m
            </div>
            <div className="mt-1.5 text-[11px] text-fg-faint">
              Recommendation only — a registered engineer signs off before issue.
            </div>
          </div>
        </div>

        {/* results */}
        <div>
          {member === "Beam" && material === "Steel" && (
            <>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-fg-faint">Adopt section</span>
                  <div className="text-lg font-semibold text-accent">
                    {steelBeam.section ? steelBeam.section.name : "— exceeds catalogue —"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-fg-faint">Governing: {steelBeam.governing}</div>
                  <div className="text-sm font-medium text-fg">{steelBeam.tonnage.toFixed(2)} t total</div>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-edge">
                <table className="w-full">
                  <thead>
                    <tr className="bg-raise/40 text-left text-[10px] uppercase tracking-wider text-fg-faint">
                      <th className="px-4 py-2 font-medium">Limit state</th>
                      <th className="px-4 py-2 font-medium">Demand</th>
                      <th className="px-4 py-2 font-medium">Capacity</th>
                      <th className="px-4 py-2 font-medium">Utilisation</th>
                      <th className="px-4 py-2 font-medium">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {steelBeam.checks.map((c) => (
                      <CheckRow key={c.name} c={c} />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {member === "Beam" && material === "Reinforced concrete" && (
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-fg-faint">Section {rcBeam.b}×{rcBeam.h}</span>
                  <div className="text-lg font-semibold text-accent">
                    {rcBeam.bars.count}T{rcBeam.bars.dia} bottom · R{rcBeam.linkDia}@{rcBeam.linkSpacing} links
                  </div>
                </div>
                <div className="text-right text-xs text-fg-faint">
                  {rcBeam.singlyReinforced ? "Singly reinforced" : "Doubly reinforced"} · K={rcBeam.k.toFixed(3)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Metric label="M_Ed" value={`${rcBeam.moment.toFixed(0)} kNm`} sub={`V_Ed ${rcBeam.shear.toFixed(0)} kN`} />
                <Metric label="Lever arm z" value={`${rcBeam.leverArm.toFixed(0)} mm`} sub={`d ${rcBeam.d.toFixed(0)} mm`} />
                <Metric label="As required" value={`${rcBeam.asReq.toFixed(0)} mm²`} sub={`prov ${rcBeam.bars.asProv.toFixed(0)} mm²`} tone="accent" />
                <Metric label="Steel util." value={`${Math.round(rcBeam.utilisation * 100)}%`} tone={rcBeam.utilisation > 1 ? "critical" : "positive"} />
                <Metric label="Concrete" value={`${rcBeam.concreteVol.toFixed(1)} m³`} sub={`${count} members`} />
                <Metric label="Reinforcement" value={`${(rcBeam.rebarMass / 1000).toFixed(2)} t`} sub={`${(rcBeam.rebarMass / rcBeam.concreteVol).toFixed(0)} kg/m³`} />
                <Metric label="Concrete grade" value="C30/37" sub="fck 30 MPa" />
                <Metric label="Rebar grade" value="B450" sub="fyk 450 MPa" />
              </div>
              <p className="mt-3 text-[11px] text-fg-faint">
                EN 1992-1-1 / SANS 10100 · K = M/(bd²f_ck), z = d[0.5+√(0.25−K/1.134)] ≤ 0.95d, A_s = M/(0.87f_yk·z). Full detailing on the Design studio.
              </p>
            </div>
          )}

          {member === "Column" && (
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-fg-faint">Adopt section</span>
                  <div className="text-lg font-semibold text-accent">
                    {column.section ? column.section.name : "— exceeds catalogue —"}
                  </div>
                </div>
                <div className="text-right text-xs text-fg-faint">
                  Flexural buckling · EN 1993 curve b
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Metric label="Axial N_Ed" value={`${column.nEd.toFixed(0)} kN`} sub={`${floors} floors × ${(span * spacing).toFixed(0)} m²`} />
                <Metric label="Eff. length" value={`${column.effLength.toFixed(1)} m`} sub="L_cr = 1.0L" />
                <Metric label="Slenderness λ̄" value={column.slenderness.toFixed(2)} sub="non-dimensional" />
                <Metric label="Reduction χ" value={column.chi.toFixed(2)} sub="buckling factor" />
                <Metric label="Buckling res. N_b,Rd" value={`${column.nbRd.toFixed(0)} kN`} tone="accent" />
                <Metric label="Utilisation" value={`${Math.round(column.utilisation * 100)}%`} tone={column.utilisation > 1 ? "critical" : column.utilisation > 0.9 ? "caution" : "positive"} />
                <Metric label="Verdict" value={column.pass ? "PASS" : "FAIL"} tone={column.pass ? "positive" : "critical"} />
                <Metric label="Grade" value="S355" sub="f_y 355 MPa" />
              </div>
              <p className="mt-3 text-[11px] text-fg-faint">
                N_b,Rd = χ·A·f_y/γ_M1, χ = 1/[φ+√(φ²−λ̄²)], φ = 0.5[1+α(λ̄−0.2)+λ̄²], α=0.34. Axial derived from the tributary area × floors above.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
