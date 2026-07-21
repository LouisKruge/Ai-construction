"use client";

import { useState } from "react";
import BuildingRender from "@/components/BuildingRender";

const viewTabs = [
  { label: "3D Model", icon: "◨" },
  { label: "Plans", icon: "▤" },
  { label: "Sections", icon: "⊟" },
  { label: "Elevations", icon: "▥" },
  { label: "Materials", icon: "◍" },
  { label: "Lighting", icon: "☀" },
];

const kpis = [
  { label: "Design Progress", value: "78%", sub: "+12% this week", tone: "text-positive", icon: "◔" },
  { label: "Spaces Optimized", value: "65", sub: "+8 new solutions", tone: "text-fg", icon: "▦" },
  { label: "Cost Impact", value: "R -4.8M", sub: "12% reduction", tone: "text-positive", icon: "▽" },
  { label: "AI Suggestions", value: "14", sub: "High impact", tone: "text-accent", icon: "✦" },
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
  { title: "Energy performance", detail: "Excellent insulation model", delta: "A++", tone: "text-positive", icon: "⚡" },
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

const collab = [
  { who: "Sarah M.", what: "updated the façade system", when: "5m ago" },
  { who: "James T.", what: "added a new design option", when: "15m ago" },
  { who: "AI Copilot", what: "generated 5 options", when: "20m ago" },
  { who: "Michael R.", what: "approved level 10 layout", when: "1h ago" },
];

const stats = [
  { label: "Project Area", value: "24 560 m²" },
  { label: "Floors", value: "32" },
  { label: "Height", value: "128.4 m" },
  { label: "Est. Cost", value: "R 268.4M" },
  { label: "Est. Duration", value: "18 months" },
];

function Donut() {
  const total = spaces.reduce((s, x) => s + x.pct, 0);
  let acc = 0;
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className="h-28 w-28 -rotate-90">
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-edge)" strokeWidth="10" />
      {spaces.map((s) => {
        const frac = s.pct / total;
        const dash = `${frac * c} ${c}`;
        const el = (
          <circle
            key={s.name}
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="10"
            strokeDasharray={dash}
            strokeDashoffset={-acc * c}
            strokeLinecap="butt"
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
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-muted">{children}</h3>
      {right}
    </div>
  );
}

export default function DesignStudioHero() {
  const [tab, setTab] = useState("3D Model");

  return (
    <div className="space-y-4">
      {/* ── top row: viewport · kpis · ai assistant ─────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1.55fr_0.85fr_1.05fr]">
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

          <BuildingRender className="aspect-[16/10] w-full" />

          <div className="mt-4 grid grid-cols-6 gap-2">
            {viewTabs.map((t) => {
              const active = t.label === tab;
              return (
                <button
                  key={t.label}
                  onClick={() => setTab(t.label)}
                  className={`flex flex-col items-center gap-1 rounded-lg border py-2 text-[11px] transition ${
                    active
                      ? "border-accent bg-accent/10 text-fg"
                      : "border-edge text-fg-faint hover:border-edge-strong hover:text-fg-muted"
                  }`}
                >
                  <span className={`text-base ${active ? "text-accent" : ""}`}>{t.icon}</span>
                  {t.label}
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
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-edge bg-base/50 text-sm text-accent">
                  {k.icon}
                </span>
                <span className="text-fg-faint">⋮</span>
              </div>
              <div className="mt-3 text-[11px] uppercase tracking-widest text-fg-faint">{k.label}</div>
              <div className={`mt-0.5 text-2xl font-semibold ${k.tone}`}>{k.value}</div>
              <div className="mt-0.5 text-[12px] text-fg-faint">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ai assistant */}
        <div className="glass elev-lg sheen relative overflow-hidden rounded-2xl p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-2/20 blur-3xl" />
          <div className="relative flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm text-white shadow-lg shadow-accent/30">
              ✦
            </span>
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-fg">AI Design Assistant</h3>
          </div>
          <p className="relative mt-3 text-[13px] font-medium text-fg">Good morning, Stefan.</p>
          <p className="relative text-[12px] text-fg-faint">Here are today&apos;s design insights.</p>

          <div className="relative mt-4 space-y-2">
            {aiInsights.map((i) => (
              <div key={i.title} className="flex items-center gap-3 rounded-lg border border-edge bg-base/40 px-3 py-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-[13px] text-accent">
                  {i.icon}
                </span>
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
          <SectionTitle right={<span className="text-[11px] text-fg-faint">AI-generated · scored 0–100</span>}>
            Design Options Generator
          </SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {options.map((o) => (
              <div
                key={o.id}
                className={`lift rounded-xl border bg-base/40 p-3 ${
                  o.active ? "border-accent shadow-lg shadow-accent/10" : "border-edge"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[13px] font-medium text-fg">Option {o.id}</span>
                  <span className="text-[11px] text-fg-faint">{o.label}</span>
                </div>
                <BuildingRender className="aspect-[4/3] w-full" chrome={false} />
                <div className="mt-2 flex items-center justify-between">
                  <div className="mr-2 h-1 flex-1 overflow-hidden rounded-full bg-edge">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                      style={{ width: `${o.score}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-fg-muted">Score {o.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass elev rounded-2xl p-5">
          <SectionTitle>Design Review Workflow</SectionTitle>
          <div className="relative">
            {/* connector line */}
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
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-fg">{w.step}</div>
                  </div>
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
          <SectionTitle
            right={
              <span className="rounded-md border border-edge bg-base/50 px-2 py-0.5 text-[11px] text-fg-muted">
                Floor 12 ▾
              </span>
            }
          >
            Space Analysis
          </SectionTitle>
          <div className="flex gap-4">
            <div className="blueprint grid flex-1 grid-cols-4 grid-rows-3 gap-1 rounded-xl border border-edge bg-base/40 p-2" style={{ height: 150 }}>
              {spaces
                .flatMap((s, si) =>
                  Array.from({ length: Math.max(1, Math.round(s.pct / 8)) }).map((_, i) => (
                    <div
                      key={`${si}-${i}`}
                      className="rounded"
                      style={{ background: `${s.color}22`, border: `1px solid ${s.color}66` }}
                    />
                  )),
                )
                .slice(0, 12)}
            </div>
            <div className="w-28 space-y-2">
              {spaces.map((s) => (
                <div key={s.name} className="text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-fg-muted">
                      <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                      {s.name}
                    </span>
                    <span className="font-mono text-fg-faint">{s.pct}%</span>
                  </div>
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
              {materials.map((m) => (
                <div key={m.name} className="flex items-center justify-between text-[12px]">
                  <span className="text-fg-muted">{m.name}</span>
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
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-surface bg-gradient-to-br from-raise to-surface text-[9px] font-semibold text-fg-muted first:ml-0"
                  >
                    {["SM", "JT", "AI", "MR"][i]}
                  </span>
                ))}
                <span className="ml-1.5 text-[11px] text-fg-faint">+12</span>
              </div>
            }
          >
            Design Collaboration
          </SectionTitle>
          <div className="space-y-3">
            {collab.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-edge bg-gradient-to-br from-raise to-surface text-[10px] font-semibold text-fg-muted">
                  {c.who.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1 text-[12px] leading-tight">
                  <span className="font-medium text-fg">{c.who}</span>{" "}
                  <span className="text-fg-muted">{c.what}</span>
                </div>
                <span className="shrink-0 text-[11px] text-fg-faint">{c.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── bottom stat bar ─────────────────────────────────────────────── */}
      <div className="glass elev flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[10px] uppercase tracking-widest text-fg-faint">{s.label}</div>
            <div className="mt-0.5 text-lg font-semibold text-fg">{s.value}</div>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-fg-faint">Design Health</div>
            <div className="text-lg font-semibold text-positive">92%</div>
          </div>
          <svg viewBox="0 0 60 28" className="h-8 w-16">
            <polyline
              points="0,22 10,18 20,20 30,12 40,14 50,7 60,4"
              fill="none"
              stroke="var(--color-positive)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
