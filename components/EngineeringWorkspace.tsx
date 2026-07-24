"use client";

import DisciplineWorkspace, { Row, type WsTab } from "@/components/DisciplineWorkspace";
import StructuralCalculator from "@/components/StructuralCalculator";
import RebarDetail from "@/components/RebarDetail";
import { useStudio, metrics } from "@/lib/studioStore";

function MemberInspector() {
  const s = useStudio();
  const m = metrics(s);
  const col = m.height > 70 ? "500×500 RC" : "450×450 RC";
  return (
    <div>
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Primary Members</h4>
      <div className="rounded-lg border border-edge bg-base/40 p-2">
        <Row k="Perimeter columns" v={col} />
        <Row k="Core walls" v="350 mm RC" />
        <Row k="Typ. floor beam" v="533×210 UB" />
        <Row k="Slab" v="275 mm PT" />
        <Row k="Stability" v="RC core + outrigger" />
        <Row k="Max drift" v="H/520 ✓" tone="text-positive" />
        <Row k="Col. utilisation" v="0.78" tone="text-positive" />
      </div>
    </div>
  );
}

function LoadsPanel() {
  const s = useStudio();
  const m = metrics(s);
  const deadPsf = 6.5, livePsf = 3.0; // kN/m²
  const dead = m.gfaPerFloor * deadPsf;
  const live = m.gfaPerFloor * livePsf;
  const wind = 0.9 * m.facadeArea * 0.6; // kN lateral (rough qp·A)
  const uls = 1.2 * dead + 1.6 * live;
  const foundation = (dead + live) * s.floors;
  return (
    <div className="glass elev rounded-2xl p-5">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Load Take-Down · per floor</h3>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-edge text-left text-fg-faint">
            <th className="py-1.5">Load case</th><th>Unit</th><th className="text-right">Value</th>
          </tr>
        </thead>
        <tbody className="text-fg">
          {[
            ["Dead (Gk)", `${deadPsf} kN/m²`, `${Math.round(dead).toLocaleString()} kN`],
            ["Live (Qk)", `${livePsf} kN/m²`, `${Math.round(live).toLocaleString()} kN`],
            ["Wind (Wk)", "qp · A", `${Math.round(wind).toLocaleString()} kN`],
            ["ULS 1.2G+1.6Q", "—", `${Math.round(uls).toLocaleString()} kN`],
          ].map((r) => (
            <tr key={r[0]} className="border-b border-edge/40">
              <td className="py-1.5">{r[0]}</td><td className="text-fg-faint">{r[1]}</td><td className="text-right font-medium">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex items-center justify-between rounded-lg border border-edge bg-base/40 px-3 py-2 text-[12px]">
        <span className="text-fg-faint">Total axial to foundation ({s.floors} floors)</span>
        <span className="font-semibold text-accent">{Math.round(foundation).toLocaleString()} kN</span>
      </div>
      <p className="mt-2 text-[11px] text-fg-faint">Recomputes live from the shared model — change floors or footprint in Design Studio and these update.</p>
    </div>
  );
}

function CompliancePanel() {
  const checks: [string, string, "pass" | "warn"][] = [
    ["SANS 10160 — Actions & load combinations", "Verified", "pass"],
    ["SANS 10162-1 — Steel limit-state design", "Verified", "pass"],
    ["EN 1993-1-1 — Column buckling (curve b)", "χ = 0.59 ✓", "pass"],
    ["SANS 10100 / EN 1992 — RC design", "Verified", "pass"],
    ["SANS 10400-T — Fire (R60 to core)", "Detailing pending", "warn"],
    ["SANS 10400-S — Accessibility", "Verified", "pass"],
    ["Deflection L/360 (SLS)", "L/412 ✓", "pass"],
  ];
  return (
    <div className="glass elev rounded-2xl p-5">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Code Compliance</h3>
      <div className="space-y-1.5">
        {checks.map(([c, r, st]) => (
          <div key={c} className="flex items-center justify-between rounded-lg border border-edge bg-base/40 px-3 py-2 text-[12px]">
            <span className="text-fg-muted">{c}</span>
            <span className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${st === "pass" ? "bg-positive/10 text-positive" : "bg-caution/10 text-caution"}`}>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const I = {
  structure: <path d="M4 20 V4 M12 20 V4 M20 20 V4 M4 8 H20 M4 14 H20" />,
  checks: <path d="M4 12 l4 4 l8 -10 M4 20 h16" />,
  rebar: <path d="M4 6 h16 M4 12 h16 M4 18 h16 M8 4 v16 M16 4 v16" />,
  loads: <path d="M12 3 v10 M8 9 l4 4 l4 -4 M5 20 h14" />,
  compliance: <path d="M12 3 l7 3 v5 c0 4 -3 7 -7 9 c-4 -2 -7 -5 -7 -9 V6 z M9 12 l2 2 l4 -4" />,
};

const tabs: WsTab[] = [
  { id: "structure", label: "Structure", icon: I.structure, is3D: true, renderMode: "structural", ai: "Explain this structural frame and suggest a more efficient column grid and stability system.", inspector: <MemberInspector /> },
  { id: "checks", label: "Design Checks", icon: I.checks, ai: "Review the structural design checks and flag any members close to their limit-state capacity.", content: <StructuralCalculator /> },
  { id: "rebar", label: "Reinforcement", icon: I.rebar, ai: "Optimise the reinforcement detailing and bar bending schedule to reduce steel tonnage.", content: <RebarDetail /> },
  { id: "loads", label: "Loads", icon: I.loads, ai: "Check the load take-down and combinations against SANS 10160.", content: <LoadsPanel /> },
  { id: "compliance", label: "Compliance", icon: I.compliance, ai: "Summarise outstanding code-compliance items and what's needed to close them.", content: <CompliancePanel /> },
];

export default function EngineeringWorkspace() {
  return <DisciplineWorkspace title="ENGINEERING STUDIO" subtitle="Structural &amp; MEP engineering · one model, every check" status="Analysing" tabs={tabs} />;
}
