import { projects } from "@/lib/data";
import { Card, CardHeader, PageHeader } from "@/components/ui";

// Deterministic pin positions across a stylised map canvas.
const pins = projects.slice(0, 6).map((p, i) => ({
  ...p,
  x: 14 + ((i * 137) % 72),
  y: 20 + ((i * 53) % 60),
}));

export default function LiveMapPage() {
  return (
    <>
      <PageHeader
        title="Live Map"
        subtitle="Every active site across the portfolio, in real time — status, workforce, and alerts by location."
      />

      <Card className="overflow-hidden">
        <CardHeader title="Portfolio map" right={<span className="text-xs text-fg-faint">6 active sites · live telemetry</span>} />
        <div className="relative blueprint aspect-[21/9] w-full bg-base">
          {/* ambient landmasses */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[10%] top-[30%] h-40 w-72 rounded-[40%] bg-surface/70 blur-2xl" />
            <div className="absolute right-[14%] top-[20%] h-48 w-80 rounded-[45%] bg-surface/60 blur-2xl" />
            <div className="absolute bottom-[12%] left-[40%] h-36 w-96 rounded-[50%] bg-surface/50 blur-3xl" />
          </div>
          {pins.map((p) => (
            <div key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <span className="relative flex h-3 w-3">
                <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent ring-2 ring-base" />
              </span>
              <div className="mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-edge bg-overlay/90 px-2 py-1 text-[10px] text-fg-muted backdrop-blur">
                <span className="font-medium text-fg">{p.name}</span> · {p.status}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {projects.slice(0, 6).map((p) => (
          <Card key={p.id} interactive>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-fg">{p.name}</span>
                <span className="live-dot h-2 w-2 rounded-full bg-positive" />
              </div>
              <div className="mt-1 text-xs text-fg-faint">{p.id} · {p.phase}</div>
              <div className="mt-3 text-xs text-fg-muted">{p.status}</div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
