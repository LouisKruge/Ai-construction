"use client";

import { useState } from "react";
import DisciplineWorkspace, { Row, type WsTab } from "@/components/DisciplineWorkspace";
import EditableProgramme from "@/components/EditableProgramme";
import EvmPanel from "@/components/EvmPanel";
import InstallationPanel from "@/components/InstallationPanel";
import { useStudio } from "@/lib/studioStore";
import { buildingSystems } from "@/lib/systems";

function SiteProgress() {
  const floors = useStudio((s) => s.floors);
  const structFloors = useStudio((s) => s.structFloors);
  const facadeFloors = useStudio((s) => s.facadeFloors);
  const setStructFloors = useStudio((s) => s.setStructFloors);
  const setFacadeFloors = useStudio((s) => s.setFacadeFloors);
  const overall = Math.round(((structFloors * 0.6 + facadeFloors * 0.4) / floors) * 100);
  const phase =
    structFloors >= floors ? "Topping out / fit-out" : structFloors > floors * 0.35 ? "Superstructure" : structFloors > 0 ? "Substructure → podium" : "Enabling works";
  const presets: [string, number, number][] = [
    ["Groundworks", 1, 0],
    ["Podium done", 4, 3],
    ["Mid-rise", 13, 9],
    ["Topped out", floors, Math.round(floors * 0.7)],
    ["Handover", floors, floors],
  ];
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Construction Progress</h4>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">{overall}% complete</span>
      </div>

      {/* live-driven sliders — the 3D model builds up to these floors */}
      <div className="space-y-3 rounded-lg border border-edge bg-base/40 p-3">
        <div>
          <div className="mb-1 flex justify-between text-[11px]"><span className="text-fg-muted">Structure / frame</span><span className="font-mono text-accent">L{structFloors} / {floors}</span></div>
          <input type="range" min={0} max={floors} value={structFloors} onChange={(e) => setStructFloors(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[11px]"><span className="text-fg-muted">Façade / fit-out</span><span className="font-mono text-accent-2">L{facadeFloors} / {floors}</span></div>
          <input type="range" min={0} max={structFloors} value={facadeFloors} onChange={(e) => setFacadeFloors(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" />
          <p className="mt-1 text-[10px] text-fg-faint">Glazed &amp; serviced floors light up; frame-only floors show bare structure above, with the tower crane at the top pour.</p>
        </div>
        <div className="flex flex-wrap gap-1">
          {presets.map(([label, s, f]) => (
            <button key={label} onClick={() => { setStructFloors(s); setFacadeFloors(f); }} className="rounded-md border border-edge px-2 py-0.5 text-[10px] text-fg-muted transition hover:border-accent hover:text-fg">{label}</button>
          ))}
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-edge bg-base/40 p-2">
        <Row k="Phase" v={phase} tone="text-accent" />
        <Row k="Floors framed" v={`${structFloors} / ${floors}`} />
        <Row k="Floors fitted-out" v={`${facadeFloors} / ${floors}`} />
        <Row k="Tower cranes" v={structFloors >= floors ? "Dismantling" : "2 × luffing"} />
        <Row k="Workforce on site" v="1,384" />
        <Row k="Incidents (30d)" v="0" tone="text-positive" />
      </div>

      <SystemLayers />
    </div>
  );
}

function SystemLayers() {
  const floors = useStudio((s) => s.floors);
  const structFloors = useStudio((s) => s.structFloors);
  const facadeFloors = useStudio((s) => s.facadeFloors);
  const visibleSystems = useStudio((s) => s.visibleSystems);
  const toggleSystem = useStudio((s) => s.toggleSystem);
  const layers = buildingSystems(floors, structFloors, facadeFloors).filter((s) => s.riser);
  const anyOn = layers.some((l) => visibleSystems[l.id]);
  return (
    <div className="mt-2 rounded-lg border border-edge bg-base/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Service Layers · 3D</h4>
        {anyOn && <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">cutaway on</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {layers.map((l) => {
          const on = !!visibleSystems[l.id];
          return (
            <button
              key={l.id}
              onClick={() => toggleSystem(l.id)}
              title={`${l.name} · ${l.done}/${floors} floors`}
              className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition ${on ? "border-transparent text-fg" : "border-edge text-fg-muted hover:text-fg"}`}
              style={on ? { background: `${l.color}22`, borderColor: l.color } : undefined}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color, boxShadow: on ? `0 0 8px ${l.color}` : "none" }} />
              {l.name.split(" — ")[0].split(" & ")[0].split(",")[0]}
              <span className="font-mono text-[10px] text-fg-faint">{l.done}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-fg-faint">Toggle a discipline to light its risers floor-by-floor in the model; the envelope turns to a cutaway so you can see inside.</p>
    </div>
  );
}

function FourD() {
  const floors = useStudio((s) => s.floors);
  const [pct, setPct] = useState(64);
  const done = Math.round((floors * pct) / 100);
  const H = 300, w = 120, x = 90, base = 320;
  const fh = (H - 20) / floors;
  return (
    <div className="glass elev rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">4D Construction Sequence</h3>
        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">{pct}% · {done}/{floors} floors</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
        <svg viewBox="0 0 300 340" className="h-56 w-full">
          <line x1="30" y1={base} x2="270" y2={base} stroke="#5c6884" strokeWidth="1.4" />
          {Array.from({ length: floors }).map((_, i) => {
            const y = base - (i + 1) * fh;
            const built = i < done;
            return <rect key={i} x={x} y={y} width={w} height={fh - 2} rx="1.5" fill={built ? "#6d7cff" : "#1a2440"} fillOpacity={built ? 0.85 : 0.5} stroke={built ? "#8ea2ff" : "#2a3550"} strokeWidth="0.6" />;
          })}
          {/* crane */}
          <line x1={x + w + 24} y1={base} x2={x + w + 24} y2={base - H - 10} stroke="#aeb8c6" strokeWidth="2" />
          <line x1={x + w + 24} y1={base - H - 10} x2={x - 10} y2={base - H - 10} stroke="#aeb8c6" strokeWidth="2" />
          <line x1={x + w + 24} y1={base - H - 10} x2={x + w + 40} y2={base - H} stroke="#aeb8c6" strokeWidth="1" />
        </svg>
        <div>
          <input type="range" min={0} max={100} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="w-full accent-[var(--color-accent)]" />
          <div className="mt-3 space-y-1.5">
            {[["Substructure", 100], ["Superstructure", Math.min(100, pct * 1.4)], ["Façade", Math.max(0, pct - 20)], ["MEP fit-out", Math.max(0, pct - 45)], ["Finishes", Math.max(0, pct - 70)]].map(([n, p]) => (
              <div key={n as string} className="text-[11px]">
                <div className="mb-0.5 flex justify-between text-fg-muted"><span>{n}</span><span className="font-mono text-fg-faint">{Math.round(p as number)}%</span></div>
                <div className="h-1.5 overflow-hidden rounded-full bg-edge"><div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${p}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SafetyPanel() {
  return (
    <div className="glass elev rounded-2xl p-5">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Health &amp; Safety</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["LTIFR", "0.00", "text-positive"], ["Observations", "128", "text-fg"], ["Inductions", "1,562", "text-fg"], ["Open actions", "3", "text-caution"], ["Days LTI-free", "412", "text-positive"], ["Near-misses (30d)", "6", "text-caution"], ["Toolbox talks", "44", "text-fg"], ["Audits passed", "98%", "text-positive"]].map(([k, v, t]) => (
          <div key={k} className="rounded-lg border border-edge bg-base/40 p-3">
            <div className="text-[10px] uppercase tracking-widest text-fg-faint">{k}</div>
            <div className={`mt-1 text-xl font-semibold ${t}`}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemsPanel() {
  const floors = useStudio((s) => s.floors);
  const S = useStudio((s) => s.structFloors);
  const F = useStudio((s) => s.facadeFloors);
  const visibleSystems = useStudio((s) => s.visibleSystems);
  const toggleSystem = useStudio((s) => s.toggleSystem);
  const systems = buildingSystems(floors, S, F);
  const overall = Math.round((systems.reduce((s, x) => s + x.done / floors, 0) / systems.length) * 100);
  const statusOf = (d: number): [string, string] => (d >= floors ? ["Complete", "text-positive"] : d <= 0 ? ["Not started", "text-fg-faint"] : ["In progress", "text-caution"]);
  return (
    <div className="glass elev rounded-2xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Building Systems</h3>
          <p className="text-[11px] text-fg-faint">Every discipline a complete building needs — installed floor by floor, live from the model</p>
        </div>
        <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[12px] font-medium text-accent">{overall}% installed</span>
      </div>
      <div className="hidden items-center gap-3 px-2.5 pb-1 text-[9px] uppercase tracking-widest text-fg-faint sm:flex">
        <span className="w-56 shrink-0">System · contractor</span>
        <span className="flex-1">Ground → Roof (L1–L{floors})</span>
        <span className="w-14 shrink-0 text-right">Floors</span>
        <span className="w-20 shrink-0 text-right">Status</span>
      </div>
      <div className="space-y-1.5">
        {systems.map((sy) => {
          const [st, tone] = statusOf(sy.done);
          const on = !!visibleSystems[sy.id];
          return (
            <div key={sy.name} className={`flex flex-col gap-1.5 rounded-lg border bg-base/40 p-2.5 sm:flex-row sm:items-center sm:gap-3 ${on ? "border-edge-strong" : "border-edge"}`}>
              <div className="w-56 shrink-0">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-fg">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: sy.color, boxShadow: on ? `0 0 8px ${sy.color}` : "none" }} />
                  {sy.name}
                  {sy.riser && (
                    <button onClick={() => toggleSystem(sy.id)} title="Toggle this layer in the 3D model" className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium transition ${on ? "text-fg" : "border border-edge text-fg-faint hover:text-fg"}`} style={on ? { background: `${sy.color}22`, border: `1px solid ${sy.color}` } : undefined}>{on ? "◉ 3D" : "○ 3D"}</button>
                  )}
                </div>
                <div className="truncate pl-4 text-[10px] text-fg-faint">{sy.note} · {sy.contractor}</div>
              </div>
              <div className="flex flex-1 gap-[2px]">
                {Array.from({ length: floors }).map((_, i) => (
                  <div key={i} className="h-4 flex-1 rounded-[2px]" style={{ background: i < sy.done ? sy.color : "var(--color-edge)", opacity: i < sy.done ? 0.9 : 0.4 }} title={`L${i + 1}`} />
                ))}
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-[11px] text-fg-muted">{sy.done}/{floors}</span>
              <span className={`w-20 shrink-0 text-right text-[11px] font-medium ${tone}`}>{st}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-fg-faint">Structure &amp; façade track the Site progress sliders; services (electrical, fire, HVAC, plumbing, ICT) follow the fit-out with realistic trade lags — drag the Site progress and every system advances with it.</p>
    </div>
  );
}

const I = {
  site: <path d="M3 20 h18 M5 20 V10 l7 -5 l7 5 v10 M9 20 v-6 h6 v6" />,
  systems: <path d="M12 3 l9 5 l-9 5 l-9 -5 z M3 12 l9 5 l9 -5 M3 16 l9 5 l9 -5" />,
  programme: <path d="M4 6 h10 M4 12 h14 M4 18 h7 M20 4 v16" />,
  fourd: <path d="M4 20 V8 l8 -4 l8 4 v12 M4 8 l8 4 l8 -4 M12 12 v8" />,
  evm: <path d="M4 20 V4 M4 20 h16 M7 16 l4 -5 l3 3 l5 -8" />,
  safety: <path d="M12 3 l7 3 v5 c0 4 -3 7 -7 9 c-4 -2 -7 -5 -7 -9 V6 z M12 9 v4 M12 16 h.01" />,
  install: <path d="M3 21 h18 M6 21 V11 h4 v10 M14 21 V7 h4 v14 M8 8 l2 -2 M16 4 l2 -2" />,
};

const tabs: WsTab[] = [
  { id: "site", label: "Site", icon: I.site, is3D: true, renderMode: "shaded", construction: true, ai: "Assess site logistics and crane coverage for this tower and suggest an optimal sequence.", inspector: <SiteProgress /> },
  { id: "systems", label: "Systems", icon: I.systems, ai: "Which building systems are behind the fit-out and on the critical path to handover?", content: <SystemsPanel /> },
  { id: "programme", label: "Programme", icon: I.programme, ai: "Explain the critical path and where the programme is most at risk of slipping.", content: <EditableProgramme /> },
  { id: "4d", label: "4D Sequence", icon: I.fourd, ai: "Review the construction sequence and identify opportunities to compress the programme.", content: <FourD /> },
  { id: "install", label: "Installation", icon: I.install, ai: "Track part delivery-to-install and flag which zones are waiting on fabricated parts.", content: <InstallationPanel /> },
  { id: "evm", label: "Earned Value", icon: I.evm, ai: "Interpret the earned-value metrics (CPI/SPI/EAC) and recommend corrective action.", content: <EvmPanel /> },
  { id: "safety", label: "Safety", icon: I.safety, ai: "Summarise the safety performance and the top risks to address this week.", content: <SafetyPanel /> },
];

export default function ConstructionWorkspace() {
  return <DisciplineWorkspace title="CONSTRUCTION STUDIO" subtitle="Site, programme &amp; delivery · real-time project controls" status="4 sites live" tabs={tabs} />;
}
