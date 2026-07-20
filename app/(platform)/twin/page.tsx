import Link from "next/link";
import { projects, sensors, twinCaptures } from "@/lib/data";
import { Card, CardHeader, Kpi, PageHeader } from "@/components/ui";

export default function TwinPage() {
  const alerts = sensors.filter((s) => s.status === "Alert" || s.status === "Warning");
  return (
    <>
      <PageHeader
        title="Digital Twin"
        subtitle="Live sensors, reality capture, and planned-vs-actual across every asset."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Connected sensors" value={String(sensors.length)} sub="5 projects streaming" />
        <Kpi label="Sensor alerts" value={String(alerts.length)} sub={alerts.map((a) => a.type).join(" · ") || "none"} tone={alerts.some((a) => a.status === "Alert") ? "critical" : "caution"} />
        <Kpi label="Reality captures (7d)" value={String(twinCaptures.length)} sub="drone, laser scan, 360°" />
        <Kpi label="Model deviation" value="3 items" sub="flagged L10–L14 scan vs design" tone="caution" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Live sensor network" right={<span className="text-xs text-ink-400">Streaming via IoT gateway</span>} />
          <div className="divide-y divide-ink-100">
            {sensors.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-ink-900">{s.type}</div>
                  <div className="mt-0.5 text-xs text-ink-400">
                    <Link href={`/projects/${s.project}`} className="hover:text-signal-600">
                      {projects.find((p) => p.id === s.project)?.name}
                    </Link>{" "}
                    · {s.location} · {s.updated}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-ink-900">{s.value}</div>
                  <div
                    className={`text-xs font-medium ${
                      s.status === "Alert"
                        ? "text-critical"
                        : s.status === "Warning"
                          ? "text-caution"
                          : s.status === "Offline"
                            ? "text-ink-400"
                            : "text-positive"
                    }`}
                  >
                    {s.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader title="Reality capture" right={<span className="text-xs text-ink-400">Compared against design model automatically</span>} />
          <div className="divide-y divide-ink-100">
            {twinCaptures.map((c) => (
              <div key={c.kind} className="px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-ink-900">{c.kind}</div>
                  <span className="text-xs text-ink-400">{c.date}</span>
                </div>
                <div className="mt-0.5 text-xs text-ink-400">
                  {projects.find((p) => p.id === c.project)?.name} · coverage {c.coverage}
                </div>
                <div className="mt-1 text-sm text-ink-600">{c.delta}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-ink-100 px-5 py-4 text-sm text-ink-400">
            3D model viewer lands here — every project keeps its twin from first design model to
            decades of operation.
          </div>
        </Card>
      </div>
    </>
  );
}
