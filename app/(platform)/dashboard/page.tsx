import Link from "next/link";
import { fmt, insights, projects } from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, PageHeader, Progress } from "@/components/ui";

export default function Dashboard() {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const atRisk = projects.filter((p) => p.status === "At risk" || p.status === "Delayed");
  const active = projects.filter((p) => p.status !== "Tender");

  const severityTone = {
    critical: "border-l-critical",
    caution: "border-l-caution",
    info: "border-l-signal-500",
  } as const;

  return (
    <>
      <PageHeader
        title="Command Center"
        subtitle="Portfolio intelligence across every project, department, and agent."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Portfolio value" value={fmt.zar(totalBudget)} sub={`${active.length} active projects`} />
        <Kpi label="Spend to date" value={fmt.zar(totalSpent)} sub={`${Math.round((totalSpent / totalBudget) * 100)}% of budget`} />
        <Kpi label="Projects at risk" value={String(atRisk.length)} sub={atRisk.map((p) => p.id).join(" · ")} tone={atRisk.length > 0 ? "caution" : "positive"} />
        <Kpi label="Forecast margin" value="11.2%" sub="vs 12.0% tendered" tone="caution" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* AI insights */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Agent insights"
            right={<span className="text-xs text-ink-400">4 open · ranked by impact</span>}
          />
          <div className="divide-y divide-ink-100">
            {insights.map((i) => (
              <div key={i.id} className={`border-l-2 px-5 py-4 ${severityTone[i.severity]}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-ink-900">{i.title}</div>
                  <span className="whitespace-nowrap text-xs text-ink-400">
                    {Math.round(i.confidence * 100)}% conf.
                  </span>
                </div>
                <div className="mt-1 text-xs text-ink-400">
                  {i.agent} · {projects.find((p) => p.id === i.project)?.name}
                </div>
                <p className="mt-2 text-sm text-ink-600">{i.detail}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium text-signal-600">Recommended: </span>
                  <span className="text-ink-600">{i.action}</span>
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Project health */}
        <Card className="lg:col-span-2 self-start">
          <CardHeader
            title="Project health"
            right={
              <Link href="/projects" className="text-xs font-medium text-signal-600 hover:underline">
                View all
              </Link>
            }
          />
          <div className="divide-y divide-ink-100">
            {projects.map((p) => {
              const behind = p.plannedProgress - p.progress;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block px-5 py-3.5 transition hover:bg-ink-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-medium text-ink-900">{p.name}</div>
                    <Badge label={p.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress
                      value={p.progress}
                      tone={behind > 5 ? "critical" : behind > 2 ? "caution" : "neutral"}
                    />
                    <span className="whitespace-nowrap text-xs text-ink-400">
                      {p.progress}% / {p.plannedProgress}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="border-t border-ink-100 px-5 py-3 text-xs text-ink-400">
            Actual vs planned progress. Colour indicates schedule variance.
          </div>
        </Card>
      </div>
    </>
  );
}
