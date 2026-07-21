import Link from "next/link";
import { fmt, insights, projects } from "@/lib/data";
import { warRoom, warRoomStats, warRoomQuestions } from "@/lib/workforce";
import { Badge, Card, CardHeader, Kpi, PageHeader, Progress } from "@/components/ui";

const kindTone: Record<string, string> = {
  Decision: "text-accent",
  Risk: "text-critical",
  Opportunity: "text-positive",
  Completed: "text-fg-faint",
};

export default function Dashboard() {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const atRisk = projects.filter((p) => p.status === "At risk" || p.status === "Delayed");
  const active = projects.filter((p) => p.status !== "Tender");

  const severityTone = {
    critical: "border-l-critical",
    caution: "border-l-caution",
    info: "border-l-accent",
  } as const;

  return (
    <>
      <PageHeader
        title="Command Center"
        subtitle="Portfolio intelligence across every project, department, and agent."
      />

      {/* War Room — the morning briefing */}
      <Card className="mb-6 overflow-hidden">
        <div className="border-b border-edge bg-raise/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
              War Room · morning briefing
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            Good morning, Louis. Since Friday your AI workforce completed{" "}
            <span className="font-medium text-fg">{warRoomStats.analyses} analyses</span>, flagged{" "}
            <span className="font-medium text-fg">{warRoomStats.risksFound} emerging risks</span>, drafted{" "}
            <span className="font-medium text-fg">{warRoomStats.draftsPrepared} documents</span>, updated{" "}
            <span className="font-medium text-fg">{warRoomStats.forecastsUpdated} forecasts</span>, and found{" "}
            <span className="font-medium text-positive">{fmt.zar(warRoomStats.savingsFound)}</span> in potential savings.{" "}
            <span className="font-medium text-caution">{warRoomStats.approvalsWaiting} recommendations</span> await your approval.
          </p>
        </div>
        <div className="divide-y divide-edge">
          {warRoom.map((item) => (
            <div key={item.priority} className="flex gap-4 px-5 py-3.5">
              <span className="mt-0.5 font-mono text-xs text-fg-faint">{String(item.priority).padStart(2, "0")}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${kindTone[item.kind]}`}>
                    {item.kind}
                  </span>
                  <span className="text-sm font-medium text-fg">{item.title}</span>
                </div>
                <p className="mt-1 text-sm text-fg-muted">{item.detail}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-faint">
                  <span>{item.source}</span>
                  <span className="text-accent">{item.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-edge px-5 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-fg-faint">Ask the War Room</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {warRoomQuestions.map((q) => (
              <span key={q} className="rounded-full border border-edge bg-base px-3 py-1 text-xs text-fg-muted">
                {q}
              </span>
            ))}
          </div>
        </div>
      </Card>

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
            right={<span className="text-xs text-fg-faint">4 open · ranked by impact</span>}
          />
          <div className="divide-y divide-edge">
            {insights.map((i) => (
              <div key={i.id} className={`border-l-2 px-5 py-4 ${severityTone[i.severity]}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-fg">{i.title}</div>
                  <span className="whitespace-nowrap text-xs text-fg-faint">
                    {Math.round(i.confidence * 100)}% conf.
                  </span>
                </div>
                <div className="mt-1 text-xs text-fg-faint">
                  {i.agent} · {projects.find((p) => p.id === i.project)?.name}
                </div>
                <p className="mt-2 text-sm text-fg-muted">{i.detail}</p>
                <p className="mt-2 text-sm">
                  <span className="font-medium text-accent">Recommended: </span>
                  <span className="text-fg-muted">{i.action}</span>
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
              <Link href="/projects" className="text-xs font-medium text-accent hover:underline">
                View all
              </Link>
            }
          />
          <div className="divide-y divide-edge">
            {projects.map((p) => {
              const behind = p.plannedProgress - p.progress;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block px-5 py-3.5 transition hover:bg-raise"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="truncate text-sm font-medium text-fg">{p.name}</div>
                    <Badge label={p.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress
                      value={p.progress}
                      tone={behind > 5 ? "critical" : behind > 2 ? "caution" : "neutral"}
                    />
                    <span className="whitespace-nowrap text-xs text-fg-faint">
                      {p.progress}% / {p.plannedProgress}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="border-t border-edge px-5 py-3 text-xs text-fg-faint">
            Actual vs planned progress. Colour indicates schedule variance.
          </div>
        </Card>
      </div>
    </>
  );
}
