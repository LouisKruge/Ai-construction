"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import BuildingRender from "@/components/BuildingRender";
import ImmersiveStudio from "@/components/ImmersiveStudio";

// Real WebGL model — client-only, lazy-loaded so three.js stays out of the
// initial payload.
const Model3D = dynamic(() => import("@/components/BuildingModel3D"), {
  ssr: false,
  loading: () => (
    <div className="blueprint flex h-full w-full items-center justify-center bg-base">
      <span className="animate-pulse text-xs text-fg-faint">Preparing 3D model…</span>
    </div>
  ),
});

/* ── count-up ─────────────────────────────────────────────────────────────*/
function Count({ to, decimals = 0, prefix = "", suffix = "" }: { to: number; decimals?: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(to * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{prefix}{v.toFixed(decimals)}{suffix}</>;
}

/* ── sparklines (animated) ────────────────────────────────────────────────*/
function Area({ color, up = true }: { color: string; up?: boolean }) {
  const d = up ? "M0 26 L10 22 L20 24 L30 15 L40 17 L50 8 L60 4" : "M0 6 L10 10 L20 8 L30 15 L40 12 L50 20 L60 24";
  const id = `a-${color.slice(1)}-${up ? "u" : "d"}`;
  return (
    <svg viewBox="0 0 60 30" className="h-10 w-24" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.55" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L60 30 L0 30 Z`} fill={`url(#${id})`} opacity="0.9" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" pathLength={1} className="draw" />
    </svg>
  );
}
function Bars({ color }: { color: string }) {
  const hs = [10, 16, 12, 20, 15, 24, 18];
  return (
    <svg viewBox="0 0 60 30" className="h-10 w-24">
      {hs.map((h, i) => (
        <rect key={i} x={i * 8.6 + 1} y={30 - h} width="5" height={h} rx="1.2" fill={color} opacity={0.4 + i * 0.08} className="bar-grow" style={{ animationDelay: `${i * 0.06}s` }} />
      ))}
    </svg>
  );
}
function Line({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 30" className="h-10 w-24" preserveAspectRatio="none">
      <path d="M0 20 L10 14 L20 18 L30 8 L40 12 L50 6 L60 10" fill="none" stroke={color} strokeWidth="1.8" vectorEffect="non-scaling-stroke" pathLength={1} className="draw" />
    </svg>
  );
}

const kpis = [
  { label: "Design Progress", value: <Count to={78} suffix="%" />, trend: "+12%", trendUp: true, meta: "vs last week", tone: "text-fg", icon: "◔", chart: <Area color="#6d7cff" /> },
  { label: "Spaces Optimized", value: <Count to={65} />, trend: "+8", trendUp: true, meta: "new solutions", tone: "text-fg", icon: "▦", chart: <Bars color="#6d7cff" /> },
  { label: "Cost Impact", value: <Count to={4.8} decimals={1} prefix="R -" suffix="M" />, trend: "−12%", trendUp: true, meta: "reduction", tone: "text-positive", icon: "▽", chart: <Area color="#34d399" up={false} /> },
  { label: "AI Suggestions", value: <Count to={14} />, trend: "High", trendUp: true, meta: "impact", tone: "text-accent", icon: "✦", chart: <Line color="#a855f7" /> },
];

const options = [
  { id: "A", label: "Balanced", score: 92, cost: "R268M", dur: "18 mo", carbon: "A", perf: 88, space: 94, active: true },
  { id: "B", label: "Cost Optimized", score: 87, cost: "R241M", dur: "16 mo", carbon: "B+", perf: 82, space: 89, active: false },
  { id: "C", label: "Performance", score: 95, cost: "R289M", dur: "20 mo", carbon: "A", perf: 96, space: 91, active: false },
  { id: "D", label: "Sustainable", score: 90, cost: "R276M", dur: "19 mo", carbon: "A+", perf: 90, space: 93, active: false },
];

const aiInsights = [
  { title: "Space efficiency improved", detail: "Compared to last version", delta: "+8%", tone: "text-positive", icon: "▦", impact: "High", priority: "P1", more: "Reclaimed 640 m² of lettable area by consolidating cores on levels 8–14." },
  { title: "Structural efficiency", detail: "Optimized column layout", delta: "+12%", tone: "text-positive", icon: "⌖", impact: "High", priority: "P1", more: "Column grid retuned to 8.4 m — 11% less rebar tonnage, same drift limits." },
  { title: "Energy performance", detail: "Excellent simulation model", delta: "A++", tone: "text-positive", icon: "⚡", impact: "Med", priority: "P2", more: "Façade shading + heat-recovery push the model to net EUI 78 kWh/m²·yr." },
  { title: "Cost saving opportunity", detail: "Through material optimization", delta: "R4.8M", tone: "text-accent", icon: "◇", impact: "High", priority: "P1", more: "Switching to a hybrid CLT/steel podium trims R4.8M and 6 weeks of programme." },
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
  { name: "Concrete Mix", saving: "R1.2M", trend: "−4%" },
  { name: "Glazing Type", saving: "R1.8M", trend: "−7%" },
  { name: "Steel Sections", saving: "R0.9M", trend: "−3%" },
  { name: "Façade System", saving: "R0.6M", trend: "−2%" },
  { name: "Finishes", saving: "R0.3M", trend: "−1%" },
];

const people = [
  { who: "Sarah M.", what: "updated the façade system", when: "5m ago", g: ["#f472b6", "#f43f5e"], dept: "Architecture", status: "update", preview: "Reworked the unitised curtain-wall module to a 1.5 m grid." },
  { who: "James T.", what: "added a new design option", when: "15m ago", g: ["#38bdf8", "#2563eb"], dept: "Structures", status: "comment", preview: "Option E — braced outrigger at L20 for lateral stiffness.", attach: "OptionE.rvt" },
  { who: "AI Copilot", what: "generated 5 options", when: "20m ago", g: ["#a855f7", "#6d28d9"], dept: "Atlas AI", status: "ai" },
  { who: "Michael R.", what: "approved level 10 layout", when: "1h ago", g: ["#fbbf24", "#f97316"], dept: "Project Lead", status: "approved", attach: "L10-GA.pdf" },
];

const stats = [
  { label: "Project Area", value: "24 560 m²" },
  { label: "Floors", value: "32" },
  { label: "Height", value: "128.4 m" },
  { label: "Est. Cost", value: "R 268.4M" },
  { label: "Est. Duration", value: "18 months" },
];

const statusMeta: Record<string, { dot: string; badge: string; label: string }> = {
  update: { dot: "bg-info", badge: "text-info", label: "Update" },
  comment: { dot: "bg-accent", badge: "text-accent", label: "Comment" },
  ai: { dot: "bg-accent-2", badge: "text-accent-2", label: "AI" },
  approved: { dot: "bg-positive", badge: "text-positive", label: "Approved" },
};

/* isometric floor plan — Space Analysis (with hover tooltips) */
function IsoPlan() {
  const ox = 130, oy = 34, tw = 26, th = 13;
  const c = (gx: number, gy: number): [number, number] => [ox + (gx - gy) * tw, oy + (gx + gy) * th];
  const grid = [
    { col: "#6d7cff", room: "Office" }, { col: "#6d7cff", room: "Office" }, { col: "#6d7cff", room: "Office" }, { col: "#a855f7", room: "Retail" },
    { col: "#6d7cff", room: "Office" }, { col: "#6d7cff", room: "Office" }, { col: "#a855f7", room: "Retail" }, { col: "#a855f7", room: "Retail" },
    { col: "#6d7cff", room: "Office" }, { col: "#38bdf8", room: "Amenities" }, { col: "#38bdf8", room: "Amenities" }, { col: "#34d399", room: "Circulation" },
    { col: "#6d7cff", room: "Office" }, { col: "#6d7cff", room: "Office" }, { col: "#34d399", room: "Circulation" }, { col: "#fbbf24", room: "Services" },
  ];
  const [hover, setHover] = useState<{ x: number; y: number; room: string } | null>(null);
  const tiles: React.ReactNode[] = [];
  for (let gx = 0; gx < 4; gx++) {
    for (let gy = 0; gy < 4; gy++) {
      const g = grid[gx * 4 + gy];
      const a = c(gx, gy), b = c(gx + 1, gy), d = c(gx + 1, gy + 1), e = c(gx, gy + 1);
      const cx = (a[0] + d[0]) / 2, cy = (a[1] + d[1]) / 2;
      tiles.push(
        <polygon
          key={`${gx}-${gy}`}
          points={`${a} ${b} ${d} ${e}`}
          fill={g.col}
          fillOpacity={hover?.room === g.room ? 0.42 : 0.2}
          stroke={g.col}
          strokeOpacity="0.6"
          strokeWidth="0.8"
          className="cursor-pointer transition-[fill-opacity]"
          onMouseEnter={() => setHover({ x: cx, y: cy, room: g.room })}
          onMouseLeave={() => setHover(null)}
        />,
      );
    }
  }
  const wall = 12;
  const bl = c(0, 4), br = c(4, 4), rr = c(4, 0);
  return (
    <svg viewBox="0 0 260 176" className="h-full w-full">
      <polygon points={`${c(0, 0)} ${bl} ${[bl[0], bl[1] + wall]} ${[c(0, 0)[0], c(0, 0)[1] + wall]}`} fill="#141d33" />
      <polygon points={`${bl} ${br} ${[br[0], br[1] + wall]} ${[bl[0], bl[1] + wall]}`} fill="#0e1526" />
      <polygon points={`${br} ${rr} ${[rr[0], rr[1] + wall]} ${[br[0], br[1] + wall]}`} fill="#0e1526" />
      {tiles}
      {[c(0, 0), bl, br, rr].map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.6" fill="#8ea2ff" opacity="0.7" />
      ))}
      {hover && (
        <g pointerEvents="none">
          <rect x={hover.x - 26} y={hover.y - 18} width="52" height="15" rx="3" fill="#0b1220" stroke="#303c54" />
          <text x={hover.x} y={hover.y - 7.5} textAnchor="middle" fontSize="8" fill="#eef2fb">{hover.room}</text>
        </g>
      )}
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
      {spaces.map((s, idx) => {
        const frac = s.pct / total;
        const final = -acc * circ;
        const el = (
          <circle
            key={s.name}
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="10"
            strokeDasharray={`${frac * circ} ${circ}`}
            className="arc"
            style={{ ["--circ" as string]: `${circ}`, ["--final" as string]: `${final}`, animationDelay: `${idx * 0.12}s` } as React.CSSProperties}
          />
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
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-fg-muted">{children}</h3>
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

function Row({ delay = 0, children, className = "" }: { delay?: number; children: React.ReactNode; className?: string }) {
  return (
    <div className={`animate-in ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </div>
  );
}

export default function DesignStudioHero() {
  const [tab, setTab] = useState("3D Model");
  const [expanded, setExpanded] = useState<number | null>(0);
  const [immersive, setImmersive] = useState(false);

  const tabIcon: Record<string, React.ReactNode> = {
    "3D Model": <path d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z M4 7.5 L12 12 L20 7.5 M12 12 L12 21" />,
    Plans: <path d="M4 4 H20 V20 H4 Z M4 10 H20 M10 4 V20 M10 14 H15" />,
    Sections: <path d="M4 6 H20 M4 12 H20 M4 18 H20 M8 6 V18" />,
    Elevations: <path d="M6 21 V7 L12 3 L18 7 V21 M9 12 H11 M13 12 H15 M9 16 H11 M13 16 H15" />,
    Materials: <path d="M4 4 H11 V11 H4 Z M13 4 H20 V11 H13 Z M4 13 H11 V20 H4 Z M13 13 H20 V20 H13 Z" />,
    Lighting: <path d="M12 3 V5 M12 19 V21 M5 12 H3 M21 12 H19 M6 6 L4.5 4.5 M18 6 L19.5 4.5 M9 15 A4 4 0 1 1 15 15 Z" />,
  };
  const viewTabs = Object.keys(tabIcon);

  return (
    <div className="space-y-4">
      {/* ── top row: viewport · kpis · ai assistant ─────────────────────── */}
      <Row delay={0} className="grid gap-4 lg:grid-cols-[1.55fr_0.9fr_1.05fr]">
        {/* viewport */}
        <div className="glass glow sheen relative overflow-hidden rounded-2xl p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-fg">DESIGN STUDIO</h2>
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
            {/* unmount the dashboard canvas while the immersive workspace owns the GPU */}
            {immersive ? (
              <div className="blueprint flex h-full w-full items-center justify-center bg-base">
                <span className="text-xs text-fg-faint">Model open in workspace…</span>
              </div>
            ) : (
              <Model3D modelUrl="/models/littlest-tokyo.glb" background />
            )}
            <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 text-[10px]">
              <span className="rounded border border-edge bg-base/70 px-2 py-0.5 font-mono text-fg-muted backdrop-blur">BIM · Rev D</span>
              <span className="rounded border border-edge bg-base/70 px-2 py-0.5 font-mono text-accent-cyan backdrop-blur">LOD 350</span>
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 rounded border border-edge bg-base/70 px-2 py-0.5 text-[10px] text-fg-faint backdrop-blur">
              drag to orbit · scroll to zoom
            </div>
            <button
              onClick={() => setImmersive(true)}
              className="shine absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-fg backdrop-blur transition hover:bg-accent/25"
            >
              ⛶ Enter Workspace
            </button>
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
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-2.5 text-[11px] transition-all duration-200 ${
                    active ? "border-accent bg-accent/10 text-fg shadow-lg shadow-accent/10" : "border-edge text-fg-faint hover:-translate-y-0.5 hover:border-edge-strong hover:text-fg-muted"
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
            <div key={k.label} className="glass lift group flex-1 rounded-2xl p-4 transition-shadow hover:shadow-[0_0_40px_-14px_var(--color-accent)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge bg-base/50 text-sm text-accent shadow-inner shadow-accent/10">{k.icon}</span>
                  <span className="text-[11px] uppercase tracking-widest text-fg-faint">{k.label}</span>
                </div>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${k.trendUp ? "bg-positive/10 text-positive" : "bg-critical/10 text-critical"}`}>
                  {k.trendUp ? "▲" : "▼"} {k.trend}
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <div className={`text-2xl font-semibold tracking-tight ${k.tone}`}>{k.value}</div>
                  <div className="text-[11px] text-fg-faint">{k.meta}</div>
                </div>
                {k.chart}
              </div>
            </div>
          ))}
        </div>

        {/* ai assistant */}
        <div className="glass glow relative overflow-hidden rounded-2xl">
          {/* gradient header */}
          <div className="relative flex items-center gap-3 border-b border-edge bg-gradient-to-r from-accent/20 via-accent-2/10 to-transparent px-5 py-3.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-white shadow-lg shadow-accent/40">
              ✦
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-positive" />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-fg">
                AI Design Assistant
              </div>
              <div className="flex items-center gap-1 text-[10px] text-fg-faint">
                <span>analysing</span>
                <span className="think-dot" style={{ animationDelay: "0s" }}>•</span>
                <span className="think-dot" style={{ animationDelay: "0.2s" }}>•</span>
                <span className="think-dot" style={{ animationDelay: "0.4s" }}>•</span>
                <span className="ml-auto rounded-full border border-edge px-1.5 text-[9px] text-fg-muted">confidence 96%</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="text-[13px] font-medium text-fg">Good morning, Stefan.</p>
            <p className="text-[12px] text-fg-faint">Here are today&apos;s design insights.</p>

            <div className="mt-4 space-y-2">
              {aiInsights.map((i, idx) => {
                const open = expanded === idx;
                return (
                  <button
                    key={i.title}
                    onClick={() => setExpanded(open ? null : idx)}
                    className="w-full rounded-lg border border-edge bg-base/40 px-3 py-2 text-left transition-colors hover:border-edge-strong"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-[13px] text-accent">{i.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[12px] font-medium text-fg">{i.title}</span>
                          <span className={`rounded px-1 text-[9px] font-semibold ${i.priority === "P1" ? "bg-critical/15 text-critical" : "bg-caution/15 text-caution"}`}>{i.priority}</span>
                        </div>
                        <div className="truncate text-[11px] text-fg-faint">{i.detail}</div>
                      </div>
                      <span className={`shrink-0 text-[13px] font-semibold ${i.tone}`}>{i.delta}</span>
                    </div>
                    <div className={`grid transition-all duration-300 ${open ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="overflow-hidden">
                        <p className="text-[11px] leading-relaxed text-fg-muted">{i.more}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${i.impact === "High" ? "bg-accent/15 text-accent" : "bg-info/15 text-info"}`}>{i.impact} impact</span>
                          <span className="rounded-full border border-edge px-2 py-0.5 text-[9px] text-fg-muted">Apply →</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button className="shine mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 py-2.5 text-[13px] font-medium text-white shadow-lg shadow-accent/25 transition hover:brightness-110">
              ⟳ Generate new options
            </button>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-edge bg-base/40 px-3 py-2.5 text-[12px] text-fg-faint transition focus-within:border-accent">
              <input className="flex-1 bg-transparent text-fg outline-none placeholder:text-fg-faint" placeholder="Ask anything about this project…" />
              <span className="text-accent">➤</span>
            </div>
          </div>
        </div>
      </Row>

      {/* ── options generator · review workflow ─────────────────────────── */}
      <Row delay={0.08} className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass elev rounded-2xl p-5">
          <SectionTitle right={<span className="text-[11px] text-fg-faint">AI-generated · scored 0–100</span>}>Design Options Generator</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {options.map((o) => (
              <div key={o.id} className={`lift group rounded-xl border bg-base/40 p-3 ${o.active ? "border-accent shadow-lg shadow-accent/15 ring-1 ring-accent/40" : "border-edge"}`}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-fg">Option {o.id}</span>
                  <span className="text-[11px] text-fg-faint">{o.label}</span>
                </div>
                <div className="relative overflow-hidden rounded-lg">
                  <BuildingRender className="aspect-[4/3] w-full" chrome={false} />
                  <span className="absolute right-1.5 top-1.5 rounded bg-base/70 px-1.5 py-0.5 font-mono text-[10px] text-fg backdrop-blur">{o.score}/100</span>
                </div>
                {/* metrics */}
                <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
                  <div className="flex justify-between"><span className="text-fg-faint">Cost</span><span className="font-medium text-fg">{o.cost}</span></div>
                  <div className="flex justify-between"><span className="text-fg-faint">Time</span><span className="font-medium text-fg">{o.dur}</span></div>
                  <div className="flex justify-between"><span className="text-fg-faint">Carbon</span><span className="font-medium text-positive">{o.carbon}</span></div>
                  <div className="flex justify-between"><span className="text-fg-faint">Perf</span><span className="font-medium text-fg">{o.perf}</span></div>
                </div>
                {/* space efficiency bar */}
                <div className="mt-2">
                  <div className="mb-1 flex justify-between text-[9px] text-fg-faint"><span>Space efficiency</span><span>{o.space}%</span></div>
                  <div className="h-1 overflow-hidden rounded-full bg-edge">
                    <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${o.space}%` }} />
                  </div>
                </div>
                <button className={`mt-2.5 w-full rounded-lg border py-1.5 text-[11px] font-medium transition ${o.active ? "border-accent bg-accent/10 text-accent" : "border-edge text-fg-muted opacity-0 group-hover:opacity-100 hover:border-edge-strong hover:text-fg"}`}>
                  {o.active ? "Selected" : "Compare"}
                </button>
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
                      w.status === "done" ? "border-positive bg-positive/15 text-positive" : w.status === "active" ? "border-accent bg-accent/15 text-accent" : "border-edge bg-base text-fg-faint"
                    }`}
                  >
                    {w.status === "done" ? "✓" : w.status === "active" ? <span className="live-dot h-2 w-2 rounded-full bg-accent" /> : ""}
                  </span>
                  <div className="min-w-0 flex-1 text-[13px] font-medium text-fg">{w.step}</div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      w.status === "done" ? "bg-positive/10 text-positive" : w.status === "active" ? "bg-accent/10 text-accent" : "border border-edge text-fg-faint"
                    }`}
                  >
                    {w.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Row>

      {/* ── analysis row ────────────────────────────────────────────────── */}
      <Row delay={0.16} className="grid gap-4 lg:grid-cols-3">
        {/* space analysis */}
        <div className="glass elev rounded-2xl p-5">
          <SectionTitle right={<span className="rounded-md border border-edge bg-base/50 px-2 py-0.5 text-[11px] text-fg-muted">Floor 12 ▾</span>}>Space Analysis</SectionTitle>
          <div className="flex items-center gap-3">
            <div className="relative h-40 flex-1 overflow-hidden rounded-lg">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent" />
              <IsoPlan />
            </div>
            <div className="w-24 space-y-2">
              {spaces.map((s) => (
                <div key={s.name} className="text-[11px]">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-fg-muted">
                      <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                      {s.name}
                    </span>
                    <span className="font-mono text-fg-faint">{s.pct}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-edge">
                    <div className="bar-grow h-full origin-left rounded-full" style={{ width: `${s.pct * 2}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* material optimization */}
        <div className="glass elev rounded-2xl p-5">
          <SectionTitle right={<span className="rounded-full bg-positive/10 px-2 py-0.5 text-[10px] font-medium text-positive">▲ 3.2% MoM</span>}>Material Optimization</SectionTitle>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Donut />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] text-fg-faint">Total Cost Impact</span>
                <span className="text-lg font-semibold text-positive"><Count to={4.8} decimals={1} prefix="-" suffix="M" /></span>
                <span className="text-[9px] text-fg-faint">12%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {materials.map((m, i) => (
                <div key={m.name} className="group flex items-center justify-between rounded-md px-1.5 py-1 text-[12px] transition-colors hover:bg-raise">
                  <span className="flex items-center gap-1.5 text-fg-muted">
                    <span className="h-2 w-2 rounded-sm" style={{ background: spaces[i].color }} />
                    {m.name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-mono text-positive">-{m.saving}</span>
                    <span className="rounded bg-positive/10 px-1 text-[9px] text-positive opacity-0 transition-opacity group-hover:opacity-100">{m.trend}</span>
                  </span>
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
          <div className="space-y-1">
            {people.map((c, i) => {
              const sm = statusMeta[c.status];
              return (
                <div key={i} className="group flex gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-raise">
                  <div className="relative">
                    <Avatar g={c.g} label={c.who.split(" ").map((w) => w[0]).join("").slice(0, 2)} />
                    <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface ${sm.dot}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[12px] leading-tight">
                      <span className="font-medium text-fg">{c.who}</span>
                      <span className="truncate text-fg-muted">{c.what}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="rounded border border-edge px-1 text-[9px] text-fg-faint">{c.dept}</span>
                      <span className={`text-[9px] font-medium ${sm.badge}`}>{sm.label}</span>
                      {c.attach && (
                        <span className="flex items-center gap-0.5 rounded bg-base/60 px-1 text-[9px] text-fg-muted">📎 {c.attach}</span>
                      )}
                    </div>
                    {c.preview && (
                      <p className="mt-1 hidden truncate rounded border-l-2 border-edge-strong bg-base/40 px-2 py-1 text-[10px] italic text-fg-faint group-hover:block">
                        {c.preview}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-fg-faint">{c.when}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Row>

      {/* ── bottom stat bar ─────────────────────────────────────────────── */}
      <Row delay={0.24}>
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
              <div className="text-lg font-semibold text-positive"><Count to={92} suffix="%" /></div>
            </div>
            <svg viewBox="0 0 60 28" className="h-8 w-16">
              <polyline points="0,22 10,18 20,20 30,12 40,14 50,7 60,4" fill="none" stroke="var(--color-positive)" strokeWidth="2" vectorEffect="non-scaling-stroke" pathLength={1} className="draw" />
            </svg>
          </div>
        </div>
      </Row>

      <ImmersiveStudio open={immersive} onClose={() => setImmersive(false)} />
    </div>
  );
}
