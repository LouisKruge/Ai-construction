import type { ReactNode } from "react";

// Signature "instrument" banner for the studio pages — a premium glass header
// with a live status, a technical motif, and inline KPI readouts. Gives each
// studio the high-end control-center feel without a bespoke 3D viewport.

export interface HeroKpi {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "caution" | "critical";
}

const motifs: Record<string, ReactNode> = {
  engineering: (
    <g stroke="var(--color-accent)" strokeOpacity="0.5" fill="none" strokeWidth="1">
      {/* moment diagram + beam */}
      <line x1="10" y1="60" x2="190" y2="60" strokeWidth="1.5" />
      <path d="M10 60 Q100 15 190 60" strokeOpacity="0.7" />
      {[30, 70, 110, 150].map((x) => (
        <line key={x} x1={x} y1="60" x2={x} y2={60 - (35 - Math.abs(x - 100) * 0.35)} strokeOpacity="0.3" />
      ))}
    </g>
  ),
  construction: (
    <g stroke="var(--color-accent)" strokeOpacity="0.5" fill="none" strokeWidth="1">
      {/* gantt bars */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={20 + i * 12} y={20 + i * 14} width={90 - i * 8} height="7" rx="2" strokeOpacity="0.4" />
      ))}
    </g>
  ),
  manufacturing: (
    <g stroke="var(--color-accent)" strokeOpacity="0.5" fill="none" strokeWidth="1">
      {/* gears */}
      <circle cx="70" cy="45" r="24" />
      <circle cx="70" cy="45" r="8" />
      <circle cx="120" cy="70" r="16" strokeOpacity="0.4" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <line key={i} x1={70 + Math.cos(a) * 24} y1={45 + Math.sin(a) * 24} x2={70 + Math.cos(a) * 30} y2={45 + Math.sin(a) * 30} />;
      })}
    </g>
  ),
  design: (
    <g stroke="var(--color-accent)" strokeOpacity="0.5" fill="none" strokeWidth="1">
      <polygon points="100,20 150,50 100,80 50,50" strokeOpacity="0.6" />
      <line x1="100" y1="20" x2="100" y2="80" strokeOpacity="0.3" />
      <line x1="50" y1="50" x2="150" y2="50" strokeOpacity="0.3" />
    </g>
  ),
  procurement: (
    <g stroke="var(--color-accent)" strokeOpacity="0.5" fill="none" strokeWidth="1">
      {/* comparative bid bars against a benchmark line */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30 + i * 34} y={70 - [40, 28, 34, 22][i]} width="18" height={[40, 28, 34, 22][i]} rx="2" strokeOpacity="0.45" />
      ))}
      <line x1="18" y1="42" x2="182" y2="42" strokeDasharray="4 3" strokeOpacity="0.7" />
    </g>
  ),
  finance: (
    <g stroke="var(--color-accent)" strokeOpacity="0.5" fill="none" strokeWidth="1">
      {/* cashflow curve with a fill hint */}
      <path d="M15 75 L55 55 L95 62 L135 32 L185 20" strokeOpacity="0.7" strokeWidth="1.5" />
      {[[15, 75], [55, 55], [95, 62], [135, 32], [185, 20]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="var(--color-accent)" fillOpacity="0.5" stroke="none" />
      ))}
      <line x1="15" y1="90" x2="185" y2="90" strokeOpacity="0.25" />
    </g>
  ),
};

export default function StudioHero({
  title,
  subtitle,
  motif = "engineering",
  status = "Live",
  kpis = [],
  actions,
}: {
  title: string;
  subtitle: string;
  motif?: keyof typeof motifs;
  status?: string;
  kpis?: HeroKpi[];
  actions?: ReactNode;
}) {
  const toneCls = {
    neutral: "text-fg",
    positive: "text-positive",
    caution: "text-caution",
    critical: "text-critical",
  };
  return (
    <div className="glass elev-lg sheen blueprint relative mb-6 overflow-hidden rounded-2xl">
      {/* ambient accent wash */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-accent-2/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-base/50 px-2.5 py-0.5 text-[11px] font-medium text-fg-muted">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" />
              {status}
            </span>
            <span className="text-[11px] uppercase tracking-widest text-fg-faint">Sandton Gate · PRJ-0142</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-fg">{title}</h1>
          <p className="mt-1 max-w-xl text-sm text-fg-muted">{subtitle}</p>
          {actions && <div className="mt-4">{actions}</div>}

          {kpis.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-lg border border-edge bg-base/40 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-fg-faint">{k.label}</div>
                  <div className={`mt-0.5 text-lg font-semibold ${toneCls[k.tone ?? "neutral"]}`}>{k.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* motif */}
        <div className="hidden w-52 shrink-0 lg:block">
          <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-edge bg-base/40">
            <svg viewBox="0 0 200 110" className="h-full w-full">
              {motifs[motif]}
            </svg>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/60 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
