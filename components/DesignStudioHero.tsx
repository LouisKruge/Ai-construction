import BuildingRender from "@/components/BuildingRender";

const viewTabs = ["3D Model", "Plans", "Sections", "Elevations", "Materials", "Lighting"];

const kpis = [
  { label: "Design progress", value: "78%", sub: "+12% this week", tone: "text-fg" },
  { label: "Spaces optimised", value: "65", sub: "+8 new solutions", tone: "text-fg" },
  { label: "Cost impact", value: "R −4.8m", sub: "12% reduction", tone: "text-positive" },
  { label: "AI suggestions", value: "14", sub: "high impact", tone: "text-accent" },
];

const options = [
  { id: "A", label: "Balanced", score: 93, tone: "border-accent" },
  { id: "B", label: "Cost optimised", score: 87, tone: "border-edge" },
  { id: "C", label: "Performance", score: 95, tone: "border-edge" },
  { id: "D", label: "Sustainable", score: 90, tone: "border-edge" },
];

const aiInsights = [
  { title: "Space efficiency improved", detail: "vs last version", delta: "+8%", tone: "text-positive" },
  { title: "Structural efficiency", detail: "optimised column layout", delta: "+12%", tone: "text-positive" },
  { title: "Energy performance", detail: "excellent insulation model", delta: "A++", tone: "text-accent-cyan" },
  { title: "Cost saving opportunity", detail: "through material optimisation", delta: "R4.8m", tone: "text-accent" },
];

const spaces = [
  { name: "Office", pct: 45, color: "#6d7cff" },
  { name: "Retail", pct: 20, color: "#a855f7" },
  { name: "Amenities", pct: 15, color: "#38bdf8" },
  { name: "Circulation", pct: 12, color: "#34d399" },
  { name: "Services", pct: 8, color: "#fbbf24" },
];

const materials = [
  { name: "Concrete mix", saving: "R1.2m" },
  { name: "Glazing type", saving: "R1.8m" },
  { name: "Steel sections", saving: "R0.9m" },
  { name: "Façade system", saving: "R0.6m" },
  { name: "Finishes", saving: "R0.3m" },
];

const collab = [
  { who: "Sarah M.", what: "updated the façade system", when: "5m" },
  { who: "James T.", what: "added a new design option", when: "15m" },
  { who: "AI Copilot", what: "generated 3 options", when: "25m" },
  { who: "Michael R.", what: "approved level 10 layout", when: "1h" },
];

const stats = [
  { label: "Project area", value: "24 560 m²" },
  { label: "Floors", value: "32" },
  { label: "Height", value: "128.4 m" },
  { label: "Est. cost", value: "R268.4m" },
  { label: "Est. duration", value: "18 months" },
];

function Donut() {
  const total = spaces.reduce((s, x) => s + x.pct, 0);
  let acc = 0;
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-edge)" strokeWidth="9" />
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
            strokeWidth="9"
            strokeDasharray={dash}
            strokeDashoffset={-acc * c}
          />
        );
        acc += frac;
        return el;
      })}
    </svg>
  );
}

export default function DesignStudioHero() {
  return (
    <div className="space-y-5">
      {/* main hero row */}
      <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
        {/* viewport + kpis */}
        <div className="glass elev-lg sheen relative overflow-hidden rounded-2xl p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-fg">Design Studio</h2>
              <p className="text-sm text-fg-faint">Intelligent generative design &amp; visualisation</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-base/50 px-2.5 py-0.5 text-[11px] text-fg-muted">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" /> Live
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
            <div>
              <BuildingRender className="aspect-[4/3] w-full" />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {viewTabs.map((t, i) => (
                  <button
                    key={t}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs transition ${
                      i === 0
                        ? "border-accent bg-accent/10 text-fg"
                        : "border-edge text-fg-faint hover:border-edge-strong hover:text-fg"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-xl border border-edge bg-base/40 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-fg-faint">{k.label}</div>
                  <div className={`mt-1 text-xl font-semibold ${k.tone}`}>{k.value}</div>
                  <div className="text-[11px] text-fg-faint">{k.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI design assistant */}
        <div className="glass elev-lg sheen relative overflow-hidden rounded-2xl p-5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-2/20 blur-3xl" />
          <div className="relative flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-xs text-white">✦</span>
            <h3 className="text-sm font-semibold text-fg">AI Design Assistant</h3>
          </div>
          <p className="relative mt-3 text-sm text-fg-muted">Good morning, Stefan. Here are today&apos;s design insights.</p>
          <div className="relative mt-4 space-y-2">
            {aiInsights.map((i) => (
              <div key={i.title} className="flex items-center justify-between rounded-lg border border-edge bg-base/40 px-3 py-2">
                <div>
                  <div className="text-[13px] font-medium text-fg">{i.title}</div>
                  <div className="text-[11px] text-fg-faint">{i.detail}</div>
                </div>
                <span className={`text-sm font-semibold ${i.tone}`}>{i.delta}</span>
              </div>
            ))}
          </div>
          <button className="relative mt-4 w-full rounded-lg bg-gradient-to-r from-accent to-accent-2 py-2.5 text-sm font-medium text-white shadow-lg shadow-accent/25 transition hover:brightness-110">
            ✦ Generate new options
          </button>
          <div className="relative mt-2 flex items-center gap-2 rounded-lg border border-edge bg-base/40 px-3 py-2 text-xs text-fg-faint">
            Ask anything about this project…
            <span className="ml-auto text-accent">➤</span>
          </div>
        </div>
      </div>

      {/* design options generator */}
      <div className="glass elev rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-fg-muted">Design options generator</h3>
          <span className="text-xs text-fg-faint">AI-generated · scored 0–100</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {options.map((o) => (
            <div key={o.id} className={`lift rounded-xl border bg-base/40 p-3 ${o.tone}`}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-fg">Option {o.id}</span>
                <span className="text-[11px] text-fg-faint">{o.label}</span>
              </div>
              <BuildingRender className="aspect-[4/3] w-full" />
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-edge">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${o.score}%` }} />
                </div>
                <span className="font-mono text-xs text-fg">{o.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* analysis row */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* space analysis */}
        <div className="glass elev rounded-2xl p-5">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-fg-muted">Space analysis · Floor 12</h3>
          <div className="blueprint grid grid-cols-4 grid-rows-3 gap-1 rounded-xl border border-edge bg-base/40 p-2" style={{ height: 130 }}>
            {spaces.flatMap((s, si) =>
              Array.from({ length: Math.max(1, Math.round(s.pct / 8)) }).map((_, i) => (
                <div key={`${si}-${i}`} className="rounded" style={{ background: `${s.color}22`, border: `1px solid ${s.color}55` }} />
              )),
            ).slice(0, 12)}
          </div>
          <div className="mt-3 space-y-1.5">
            {spaces.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                <span className="text-fg-muted">{s.name}</span>
                <span className="ml-auto font-mono text-fg-faint">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* material optimization */}
        <div className="glass elev rounded-2xl p-5">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-fg-muted">Material optimisation</h3>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Donut />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-semibold text-positive">−4.8m</span>
                <span className="text-[9px] text-fg-faint">12%</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {materials.map((m) => (
                <div key={m.name} className="flex items-center justify-between text-xs">
                  <span className="text-fg-muted">{m.name}</span>
                  <span className="font-mono text-positive">−{m.saving}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* collaboration */}
        <div className="glass elev rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-fg-muted">Design collaboration</h3>
            <span className="rounded-full border border-edge px-1.5 text-[10px] text-fg-faint">+12</span>
          </div>
          <div className="space-y-2.5">
            {collab.map((c, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-edge bg-gradient-to-br from-raise to-surface text-[10px] font-semibold text-fg-muted">
                  {c.who.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1 text-xs">
                  <span className="font-medium text-fg">{c.who}</span>{" "}
                  <span className="text-fg-muted">{c.what}</span>
                </div>
                <span className="text-[11px] text-fg-faint">{c.when}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom stat bar */}
      <div className="glass elev flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-4">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="text-[10px] uppercase tracking-widest text-fg-faint">{s.label}</div>
            <div className="mt-0.5 text-lg font-semibold text-fg">{s.value}</div>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-fg-faint">Design health</div>
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
