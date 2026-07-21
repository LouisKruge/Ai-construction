import Link from "next/link";
import { departments, deptAgents, boardBriefing } from "@/lib/workforce";
import { Card, CardHeader, Kpi, PageHeader } from "@/components/ui";

export default function AgentsHub() {
  const totalAgents = deptAgents.length;
  const totalActions = departments.reduce((s, d) => s + d.actions30d, 0);
  const escalations = departments.reduce((s, d) => s + d.escalations, 0);

  return (
    <>
      <PageHeader
        title="AI Workforce"
        subtitle="Six departments, one org chart. Every agent has a mission, an autonomy class, and an approval gate. Every action is audited."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="AI agents" value={String(totalAgents)} sub="across 6 departments" />
        <Kpi label="Actions (30d)" value={totalActions.toLocaleString("en-ZA")} sub="all recorded in audit log" />
        <Kpi label="Recommendation acceptance" value="84%" sub="human accept rate, weighted" tone="positive" />
        <Kpi label="Escalations awaiting you" value={String(escalations)} sub="approval gates triggered" tone="caution" />
      </div>

      {/* Executive AI meeting + AI Board */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Morning executive AI meeting"
            right={<span className="text-xs text-fg-faint">07:00 · auto-convened</span>}
          />
          <div className="px-5 py-4 text-sm leading-relaxed text-fg-muted">
            The executive agents met before the working day. Each department chief presented status,
            critical risks, and recommendations; the system produced a ranked action list with the
            human approvals required.
          </div>
          <div className="divide-y divide-edge">
            {departments.map((d) => (
              <Link
                key={d.slug}
                href={`/agents/${d.slug}`}
                className="flex items-center justify-between px-5 py-3 transition hover:bg-raise"
              >
                <div>
                  <div className="text-sm font-medium text-fg">{d.chief}</div>
                  <div className="mt-0.5 text-xs text-fg-faint">{d.escalations} items escalated for approval</div>
                </div>
                <span className="text-xs text-accent">Open →</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader
            title="AI Board briefing"
            right={<span className="text-xs text-fg-faint">Governance layer · decides nothing</span>}
          />
          <div className="px-5 py-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-fg-faint">Proposal under review</div>
            <div className="mt-1 text-sm font-medium text-fg">{boardBriefing.proposal}</div>
            <div className="mt-4 space-y-2">
              {boardBriefing.positions.map((p) => (
                <div key={p.agent} className="flex gap-3 text-sm">
                  <span className="w-20 shrink-0 text-xs font-medium text-fg-muted">{p.agent}</span>
                  <span className="text-fg-muted">{p.position}</span>
                </div>
              ))}
            </div>
            <dl className="mt-4 space-y-2 border-t border-edge pt-3 text-xs">
              <div>
                <dt className="font-medium text-positive">Agreement</dt>
                <dd className="mt-0.5 text-fg-muted">{boardBriefing.agreement}</dd>
              </div>
              <div>
                <dt className="font-medium text-caution">Disagreement</dt>
                <dd className="mt-0.5 text-fg-muted">{boardBriefing.disagreement}</dd>
              </div>
              <div>
                <dt className="font-medium text-fg">Questions for the human board</dt>
                <dd className="mt-0.5 text-fg-muted">
                  <ul className="list-inside list-decimal space-y-0.5">
                    {boardBriefing.questions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </Card>
      </div>

      {/* Department org chart */}
      <h2 className="mb-3 mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
        Departments
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => {
          const count = deptAgents.filter((a) => a.dept === d.name).length;
          return (
            <Link key={d.slug} href={`/agents/${d.slug}`}>
              <Card className="h-full p-5 transition hover:border-edge-strong">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-fg">{d.name}</div>
                  <span className="rounded-full border border-edge px-2 py-0.5 text-[10px] text-fg-faint">
                    {count} agents
                  </span>
                </div>
                <div className="mt-1 text-xs text-accent">{d.chief}</div>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{d.summary}</p>
                <div className="mt-3 border-t border-edge pt-2 text-xs italic text-fg-faint">
                  “{d.cadence}”
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}
