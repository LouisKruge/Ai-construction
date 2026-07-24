"use client";

import DisciplineWorkspace, { Row, type WsTab } from "@/components/DisciplineWorkspace";
import ManufacturingSim from "@/components/ManufacturingSim";
import PartsPanel from "@/components/PartsPanel";
import MachiningPanel from "@/components/MachiningPanel";
import { workOrders, projects } from "@/lib/data";

function FabInspector() {
  return (
    <div>
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">Fabrication</h4>
      <div className="rounded-lg border border-edge bg-base/40 p-2">
        <Row k="Active packages" v={String(workOrders.length)} />
        <Row k="Factory utilisation" v="82%" tone="text-accent" />
        <Row k="QA pass rate" v="97.4%" tone="text-positive" />
        <Row k="Material waste" v="3.1%" tone="text-positive" />
        <Row k="On-time dispatch" v="94%" />
        <Row k="Nesting efficiency" v="88%" />
      </div>
    </div>
  );
}

function WorkOrdersPanel() {
  return (
    <div className="glass elev overflow-hidden rounded-2xl">
      <div className="px-5 pt-5"><h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Work Orders</h3></div>
      <table className="mt-3 w-full text-[12px]">
        <thead>
          <tr className="border-b border-edge text-left text-fg-faint">
            <th className="px-5 py-2">Item</th><th>Factory</th><th>Qty</th><th>Due</th><th className="pr-5 text-right">Progress</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((w) => (
            <tr key={w.id} className="border-b border-edge/40 transition hover:bg-raise">
              <td className="px-5 py-2.5">
                <div className="font-medium text-fg">{w.item}</div>
                <div className="text-[10px] text-fg-faint">{w.id} · {projects.find((p) => p.id === w.project)?.name}</div>
              </td>
              <td className="text-fg-muted">{w.factory}</td>
              <td className="text-fg-muted">{w.qty}</td>
              <td className="text-fg-muted">{w.due}</td>
              <td className="pr-5">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-edge"><div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${w.progress}%` }} /></div>
                  <span className="font-mono text-[11px] text-fg-faint">{w.progress}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QualityPanel() {
  const checks = [
    ["Dimensional (CMM)", 99.1], ["Weld inspection (NDT)", 97.8], ["Surface / coating", 98.4], ["Bolt torque audit", 100], ["Fit-up trial assembly", 96.2],
  ];
  return (
    <div className="glass elev rounded-2xl p-5">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Quality Assurance</h3>
      <div className="space-y-2">
        {checks.map(([n, p]) => (
          <div key={n as string} className="text-[12px]">
            <div className="mb-0.5 flex justify-between"><span className="text-fg-muted">{n}</span><span className={`font-mono ${(p as number) >= 98 ? "text-positive" : "text-caution"}`}>{p}%</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-edge"><div className={`h-full rounded-full ${(p as number) >= 98 ? "bg-positive" : "bg-caution"}`} style={{ width: `${p}%` }} /></div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg border border-edge bg-base/40 px-3 py-2 text-[12px]">
        <span className="text-fg-faint">Overall first-pass yield</span><span className="font-semibold text-positive">97.4%</span>
      </div>
    </div>
  );
}

function LogisticsPanel() {
  const rows = [
    ["Curtain-wall units", "Meridian Façades", "Cape Town → Sandton", "In transit", "text-info"],
    ["Steel primary frame", "ArcelorMittal SA", "Vanderbijlpark → Site", "Delivered", "text-positive"],
    ["Precast cores", "AfriSam", "Midrand → Site", "Loading", "text-caution"],
    ["MEP modules", "Ingérop", "Germiston → Site", "Scheduled", "text-fg-muted"],
  ];
  return (
    <div className="glass elev rounded-2xl p-5">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">Dispatch &amp; Logistics</h3>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r[0]} className="flex items-center justify-between rounded-lg border border-edge bg-base/40 px-3 py-2 text-[12px]">
            <div><div className="font-medium text-fg">{r[0]}</div><div className="text-[10px] text-fg-faint">{r[1]} · {r[2]}</div></div>
            <span className={`shrink-0 text-[11px] font-medium ${r[4]}`}>{r[3]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const I = {
  fab: <path d="M4 20 V9 l5 3 V9 l5 3 V9 l6 3 v8 z M4 20 h16" />,
  orders: <path d="M6 3 h9 l3 3 v15 H6 z M9 8 h6 M9 12 h6 M9 16 h4" />,
  sim: <path d="M12 3 a9 9 0 1 0 9 9 h-9 z" />,
  quality: <path d="M4 12 l4 4 l8 -10 M4 19 h16" />,
  logistics: <path d="M3 7 h11 v8 H3 z M14 10 h4 l3 3 v2 h-7 z M7 18 a1.5 1.5 0 1 0 .01 0 M17 18 a1.5 1.5 0 1 0 .01 0" />,
  parts: <path d="M12 3 l8 4.5 v9 L12 21 l-8 -4.5 v-9 z M4 7.5 L12 12 l8 -4.5 M12 12 V21" />,
  machining: <path d="M12 8 a4 4 0 1 0 .01 0 M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3 M5 5 l2 2 M17 17 l2 2 M5 19 l2 -2 M17 7 l2 -2" />,
};

const tabs: WsTab[] = [
  { id: "fab", label: "Fabrication", icon: I.fab, is3D: true, renderMode: "shaded", ai: "Review the fabrication model and suggest how to improve nesting efficiency and reduce waste.", inspector: <FabInspector /> },
  { id: "parts", label: "Parts", icon: I.parts, ai: "Which fabricated parts are behind, and what QA issues are driving rework?", content: <PartsPanel mode="production" /> },
  { id: "machining", label: "Machining", icon: I.machining, ai: "Optimise the nesting and cut sequence for this part to reduce material waste and cycle time.", content: <MachiningPanel /> },
  { id: "orders", label: "Work Orders", icon: I.orders, ai: "Which work orders are most at risk of missing their due dates, and why?", content: <WorkOrdersPanel /> },
  { id: "sim", label: "Production Sim", icon: I.sim, ai: "Run the production simulation and recommend a schedule that maximises throughput.", content: <ManufacturingSim /> },
  { id: "quality", label: "Quality", icon: I.quality, ai: "Summarise QA performance and the top drivers of any first-pass yield loss.", content: <QualityPanel /> },
  { id: "dispatch", label: "Dispatch", icon: I.logistics, ai: "Optimise dispatch sequencing to match the site's just-in-time installation programme.", content: <LogisticsPanel /> },
];

export default function ManufacturingWorkspace() {
  return <DisciplineWorkspace title="MANUFACTURING STUDIO" subtitle="Digital factory · fabrication, production &amp; dispatch" status="3 factories" tabs={tabs} />;
}
