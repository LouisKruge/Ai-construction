"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import BuildingRender from "@/components/BuildingRender";

// Real WebGL model — client-only (no SSR), lazy-loaded so three.js stays out of
// the initial payload.
const Model3D = dynamic(() => import("@/components/BuildingModel3D"), {
  ssr: false,
  loading: () => (
    <div className="blueprint flex h-full w-full items-center justify-center bg-base">
      <span className="animate-pulse text-xs text-fg-faint">Preparing 3D model…</span>
    </div>
  ),
});

/* ── view tabs with line icons ──────────────────────────────────────────── */
const tabIcon: Record<string, React.ReactNode> = {
  "3D Model": (
    <path d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z M4 7.5 L12 12 L20 7.5 M12 12 L12 21" />
  ),
  Plans: <path d="M4 4 H20 V20 H4 Z M4 10 H20 M10 4 V20 M10 14 H15" />,
  Sections: <path d="M4 6 H20 M4 12 H20 M4 18 H20 M8 6 V18" />,
  Elevations: <path d="M6 21 V7 L12 3 L18 7 V21 M9 12 H11 M13 12 H15 M9 16 H11 M13 16 H15" />,
  Materials: <path d="M4 4 H11 V11 H4 Z M13 4 H20 V11 H13 Z M4 13 H11 V20 H4 Z M13 13 H20 V20 H13 Z" />,
  Lighting: <path d="M12 3 V5 M12 19 V21 M5 12 H3 M21 12 H19 M6 6 L4.5 4.5 M18 6 L19.5 4.5 M9 15 A4 4 0 1 1 15 15 Z" />,
};
const viewTabs = Object.keys(tabIcon);

/* ── sparklines ─────────────────────────────────────────────────────────── */
function Area({ color, up = true }: { color: string; up?: boolean }) {
  const d = up
    ? "M0 26 L10 22 L20 24 L30 15 L40 17 L50 8 L60 4"
    : "M0 6 L10 10 L20 8 L30 15 L40 12 L50 20 L60 24";
  return (
    <svg viewBox="0 0 60 30" className="h-9 w-24" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`a-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.5" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L60 30 L0 30 Z`} fill={`url(#a-${color.slice(1)})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
function Bars({ color }: { color: string }) {
  const hs = [10, 16, 12, 20, 15, 24, 18];
  return (
    <svg viewBox="0 0 60 30" className="h-9 w-24">
      {hs.map((h, i) => (
        <rect key={i} x={i * 8.6 + 1} y={30 - h} width="5" height={h} rx="1" fill={color} opacity={0.4 + i * 0.08} />
      ))}
    </svg>
  );
}
function Line({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 30" className="h-9 w-24" preserveAspectRatio="none">
      <path d="M0 20 L10 14 L20 18 L30 8 L40 12 L50 6 L60 10" fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const kpis = [
  { label: "Design Progress", value: "78%", sub: "+12% this week", tone: "text-positive", icon: "◔", chart: <Area color="#6d7cff" /> },
  { label: "Spaces Optimized", value: "65", sub: "+8 new solutions", tone: "text-fg", icon: "▦", chart: <Bars color="#6d7cff" /> },
  { label: "Cost Impact", value: "R -4.8M", sub: "12% reduction", tone: "text-positive", icon: "▽", chart: <Area color="#34d399" /> },
  { label: "AI Suggestions", value: "14", sub: "High impact", tone: "text-accent", icon: "✦", chart: <Line color="#a855f7" /> },
];

const options = [
  { id: "A", label: "Balanced", score: 92, active: true },
  { id: "B", label: "Cost Optimized", score: 87, active: false },
  { id: "C", label: "Performance", score: 95, active: false },
  { id: "D", label: "Sustainable", score: 90, active: false },
];

const aiInsights = [
  { title: "Space efficiency improved", detail: "Compared to last version", delta: "+8%", tone: "text-positive", icon: "▦" },
  { title: "Structural efficiency", detail: "Optimized column layout", delta: "+12%", tone: "text-positive", icon: "⌖" },
  { title: "Energy performance", detail: "Excellent simulation model", delta: "A++", tone: "text-positive", icon: "⚡" },
  { title: "Cost saving opportunity", detail: "Through material optimization", delta: "R4.8M", tone: "text-accent", icon: "◇" },
];

const workflow = [
  { step: "Concept Design", state: "Completed", status: "done" },
  { step: "Schematic Design", state: "In Review", status: "active" },
  { step: "Design Development", state: "Pending", status: "pending" },
  { step: "Construction Documents", state: "Pending", status: "pending" },
  { step: "Handover", state: "Pending", status: "pending" },
];

const spaces = [
  { name: "Office", pct: 45, color: "#6d7cff" },
  { name: "Retail", pct: 20, color: "#a855f7" },
  { name: "Amenities", pct: 15, color: "#38bdf8" },
  { name: "Circulation", pct: 12, color: "#34d399" },
  { name: "Services", pct: 8, color: "#fbbf24" },
];

const materials = [
  { name: "Concrete Mix", saving: "R1.2M" },
  { name: "Glazing Type", saving: "R1.8M" },
  { name: "Steel Sections", saving: "R0.9M" },
  { name: "Façade System", saving: "R0.6M" },
  { name: "Finishes", saving: "R0.3M" },
];

const people = [
  { who: "Sarah M.", what: "updated the façade system", when: "5m ago", g: ["#f472b6", "#f43f5e"] },
  { who: "James T.", what: "added a new design option", when: "15m ago", g: ["#38bdf8", "#2563eb"] },
  { who: "AI Copilot", what: "generated 5 options", when: "20m ago", g: ["#a855f7", "#6d28d9"] },
  { who: "Michael R.", what: "approved level 10 layout", when: "1h ago", g: ["#fbbf24", "#f97316"] },
];

const stats = [
  { label: "Project Area", value: "24 560 m²" },
  { label: "Floors", value: "32" },
  { label: "Height", value: "128.4 m" },
  { label: "Est. Cost", value: "R 268.4M" },
  { label: "Est. Duration", value: "18 months" },
];

/* isometric floor plan — Space Analysis */
function IsoPlan() {
  const ox = 130, oy = 34, tw = 26, th = 13;
  const c = (gx: number, gy: number): [number, number] => [ox + (gx - gy) * tw, oy + (gx + gy) * th];
  // room fill per grid cell (4×4), roughly matching the space split
  const grid = [
    "#6d7cff", "#6d7cff", "#6d7cff", "#a855f7",
    "#6d7cff", "#6d7cff", "#a855f7", "#a855f7",
    "#6d7cff", "#38bdf8", "#38bdf8", "#34d399",
    "#6d7cff", "#6d7cff", "#34d399", "#fbbf24",
  ];
  const tiles: React.ReactNode[] = [];
  for (let gx = 0; gx < 4; gx++) {
    for (let gy = 0; gy < 4; gy++) {
      const col = grid[gx * 4 + gy];
      const a = c(gx, gy), b = c(gx + 1, gy), d = c(gx + 1, gy + 1), e = c(gx, gy + 1);
      tiles.push(
        <polygon key={`${gx}-${gy}`} points={`${a} ${b} ${d} ${e}`} fill={col} fillOpacity="0.22" stroke={col} strokeOpacity="0.55" strokeWidth="0.8" />,
      );
    }
  }
  // perimeter wall extrusion
  const wall = 12;
  const bl = c(0, 4), br = c(4, 4), rr = c(4, 0);
  return (
    <svg viewBox="0 0 260 176" className="h-full w-full">
      {/* extruded walls (left + right) */}
      <polygon points={`${c(0, 0)} ${bl} ${[bl[0], bl[1] + wall]} ${[c(0, 0)[0], c(0, 0)[1] + wall]}`} fill="#141d33" />
      <polygon points={`${bl} ${br} ${[br[0], br[1] + wall]} ${[bl[0], bl[1] + wall]}`} fill="#0e1526" />
      <polygon points={`${br} ${rr} ${[rr[0], rr[1] + wall]} ${[br[0], br[1] + wall]}`} fill="#0e1526" />
      {tiles}
      {/* corner posts */}
      {[c(0, 0), bl, br, rr].map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.6" fill="#8ea2ff" opacity="0.7" />
      ))}
    </svg>
  );
}

function Donut() {
  const total = spaces.reduce((s, x) => s + x.pct, 0);
  let acc = 0;
  const r = 30;
  const circ = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className="h-28 w-28 -rotate-90">
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-edge)" strokeWidth="10" />
      {spaces.map((s) => {
        const frac = s.pct / total;
        const el = (
          <circle key={s.name} cx="40" cy="40" r={r} fill="none" stroke={s.color} strokeWidth="10" strokeDasharray={`${frac * circ} ${circ}`} strokeDashoffset={-acc * circ} />
        );
        acc += frac;
        return el;
      })}
    </svg>
  );
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">{children}</h3>
      {right}
    </div>
  );
}

function Avatar({ g, label, size = 28 }: { g: string[]; label: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-surface"
      style={{ width: size, height: size, backgroundImage: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}
    >
      {label}
    </span>
  );
}

export default function DesignStudioHero() {
  const [tab, setTab] = useState("3D Model");

  return (
    <div className="space-y-4">
      {/* ── top row: viewport · kpis · ai assistant ─────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1.55fr_0.9fr_1.05fr]">
        {/* viewport */}
        <div className="glass elev-lg sheen relative overflow-hidden rounded-2xl p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-fg">DESIGN STUDIO</h2>
              <p className="text-[13px] text-fg-faint">Intelligent generative design &amp; visualization</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-base/50 px-2.5 py-0.5 text-[11px] text-fg-muted">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" /> Live
            </span>
          </div>

          <div
            className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-edge"
            style={{ background: "linear-gradient(160deg,#0b1330 0%,#152046 55%,#3a3457 80%,#5b4a63 100%)" }}
          >
            <Model3D />
            {/* HUD overlay */}
            <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 text-[10px]">
              <span className="rounded border border-edge bg-base/70 px-2 py-0.5 font-mono text-fg-muted backdrop-blur">BIM · Rev D</span>
              <span className="rounded border border-edge bg-base/70 px-2 py-0.5 font-mono text-accent-cyan backdrop-blur">LOD 350</span>
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 rounded border border-edge bg-base/70 px-2 py-0.5 text-[10px] text-fg-faint backdrop-blur">
              drag to orbit · scroll to zoom
            </div>
            <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded border border-edge bg-base/70 px-2 py-0.5 text-[10px] backdrop-blur">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" />
              <span className="font-mono text-fg-muted">Rendering · 60fps</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-6 gap-2">
            {viewTabs.map((t) => {
              const active = t === tab;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-2.5 text-[11px] transition ${
                    active ? "border-accent bg-accent/10 text-fg" : "border-edge text-fg-faint hover:border-edge-strong hover:text-fg-muted"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className={`h-5 w-5 ${active ? "text-accent" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {tabIcon[t]}
                  </svg>
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* kpi column */}
        <div className="flex flex-col gap-3">
          {kpis.map((k) => (
            <div key={k.label} className="glass elev lift flex-1 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge bg-base/50 text-sm text-accent">{k.icon}</span>
                  <span className="text-[11px] uppercase tracking-widest text-fg-faint">{k.label}</span>
                </div>
                <span className="text-fg-faint">⋮</span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <div className={`text-2xl font-semibold ${k.tone}`}>{k.value}</div>
                  <div className="text-[12px] text-fg-faint">{k.sub}</div>
                </div>
                {k.chart}
              </div>
            </div>
          ))}
        </div>

        {/* ai assistant */}
        <div className="glass elev-lg sheen relative overflow-hidden rounded-2xl p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-2/20 blur-3xl" />
          <div className="relative flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm text-white shadow-lg shadow-accent/30">✦</span>
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-fg">AI Design Assistant</h3>
          </div>
          <p className="relative mt-3 text-[13px] font-medium text-fg">Good morning, Stefan.</p>
          <p className="relative text-[12px] text-fg-faint">Here are today&apos;s design insights.</p>

          <div className="relative mt-4 space-y-2">
            {aiInsights.map((i) => (
              <div key={i.title} className="flex items-center gap-3 rounded-lg border border-edge bg-base/40 px-3 py-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-[13px] text-accent">{i.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium text-fg">{i.title}</div>
                  <div className="truncate text-[11px] text-fg-faint">{i.detail}</div>
                </div>
                <span className={`shrink-0 text-[13px] font-semibold ${i.tone}`}>{i.delta}</span>
              </div>
            ))}
          </div>

          <button className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 py-2.5 text-[13px] font-medium text-white shadow-lg shadow-accent/25 transition hover:brightness-110">
            ⟳ Generate new options
          </button>
          <div className="relative mt-2 flex items-center gap-2 rounded-lg border border-edge bg-base/40 px-3 py-2.5 text-[12px] text-fg-faint">
            Ask anything about this project…
            <span className="ml-auto text-accent">➤</span>
          </div>
        </div>
      </div>

      {/* ── options generator · review workflow ─────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass elev rounded-2xl p-5">
          <SectionTitle right={<span className="text-[11px] text-fg-faint">AI-generated · scored 0–100</span>}>Design Options Generator</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {options.map((o) => (
              <div key={o.id} className={`lift rounded-xl border bg-base/40 p-3 ${o.active ? "border-accent shadow-lg shadow-accent/10" : "border-edge"}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-fg">Option {o.id}</span>
                  <span className="text-[11px] text-fg-faint">{o.label}</span>
                </div>
                <BuildingRender className="aspect-[4/3] w-full" chrome={false} />
                <div className="mt-2 flex items-center justify-between">
                  <div className="mr-2 h-1 flex-1 overflow-hidden rounded-full bg-edge">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${o.score}%` }} />
                  </div>
                  <span className="font-mono text-[11px] text-fg-muted">{o.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass elev rounded-2xl p-5">
          <SectionTitle>Design Review Workflow</SectionTitle>
          <div className="relative">
            <div className="absolute bottom-3 left-[11px] top-3 w-px bg-edge" />
            <div className="space-y-3">
              {workflow.map((w) => (
                <div key={w.step} className="relative flex items-center gap-3">
                  <span
                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                      w.status === "done"
                        ? "border-positive bg-positive/15 text-positive"
                        : w.status === "active"
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-edge bg-base text-fg-faint"
                    }`}
                  >
                    {w.status === "done" ? "✓" : w.status === "active" ? <span className="live-dot h-2 w-2 rounded-full bg-accent" /> : ""}
                  </span>
                  <div className="min-w-0 flex-1 text-[13px] font-medium text-fg">{w.step}</div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      w.status === "done"
                        ? "bg-positive/10 text-positive"
                        : w.status === "active"
                          ? "bg-accent/10 text-accent"
                          : "border border-edge text-fg-faint"
                    }`}
                  >
                    {w.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── analysis row ────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* space analysis */}
        <div className="glass elev rounded-2xl p-5">
          <SectionTitle right={<span className="rounded-md border border-edge bg-base/50 px-2 py-0.5 text-[11px] text-fg-muted">Floor 12 ▾</span>}>Space Analysis</SectionTitle>
          <div className="flex items-center gap-3">
            <div className="h-40 flex-1">
              <IsoPlan />
            </div>
            <div className="w-24 space-y-2">
              {spaces.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-fg-muted">
                    <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-mono text-fg-faint">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* material optimization */}
        <div className="glass elev rounded-2xl p-5">
          <SectionTitle>Material Optimization</SectionTitle>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Donut />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] text-fg-faint">Total Cost Impact</span>
                <span className="text-lg font-semibold text-positive">-4.8M</span>
                <span className="text-[9px] text-fg-faint">12%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {materials.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-1.5 text-fg-muted">
                    <span className="h-2 w-2 rounded-sm" style={{ background: spaces[i].color }} />
                    {m.name}
                  </span>
                  <span className="font-mono text-positive">-{m.saving}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* collaboration */}
        <div className="glass elev rounded-2xl p-5">
          <SectionTitle
            right={
              <div className="flex items-center">
                {people.map((p, i) => (
                  <span key={i} className="-ml-2 first:ml-0">
                    <Avatar g={p.g} label={p.who.split(" ").map((w) => w[0]).join("").slice(0, 2)} size={24} />
                  </span>
                ))}
                <span className="ml-1.5 text-[11px] text-fg-faint">+12</span>
              </div>
            }
          >
            Design Collaboration
          </SectionTitle>
          <div className="space-y-3">
            {people.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Avatar g={c.g} label={c.who.split(" ").map((w) => w[0]).join("").slice(0, 2)} />
                <div className="min-w-0 flex-1 text-[12px] leading-tight">
                  <span className="font-medium text-fg">{c.who}</span> <span className="text-fg-muted">{c.what}</span>
                </div>
                <span className="shrink-0 text-[11px] text-fg-faint">{c.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── bottom stat bar ─────────────────────────────────────────────── */}
      <div className="glass elev relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl px-6 py-4">
        <div className="blueprint pointer-events-none absolute inset-0 opacity-30" />
        {stats.map((s) => (
          <div key={s.label} className="relative">
            <div className="text-[10px] uppercase tracking-widest text-fg-faint">{s.label}</div>
            <div className="mt-0.5 text-lg font-semibold text-fg">{s.value}</div>
          </div>
        ))}
        <div className="relative flex items-center gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-fg-faint">Design Health Score</div>
            <div className="text-lg font-semibold text-positive">92%</div>
          </div>
          <svg viewBox="0 0 60 28" className="h-8 w-16">
            <polyline points="0,22 10,18 20,20 30,12 40,14 50,7 60,4" fill="none" stroke="var(--color-positive)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>
    </div>
  );
}
