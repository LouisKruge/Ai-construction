import { agents, fmt } from "@/lib/data";
import { Card, Kpi, PageHeader } from "@/components/ui";

const autonomyTone: Record<string, string> = {
  "Autonomous within limits": "text-positive",
  "Requires approval": "text-caution",
  "Recommends only": "text-info",
};

export default function AgentsPage() {
  const totalActions = agents.reduce((s, a) => s + a.actions30d, 0);
  const avgAccept = agents.reduce((s, a) => s + a.acceptRate, 0) / agents.length;
  const departments = [...new Set(agents.map((a) => a.department))];

  return (
    <>
      <PageHeader
        title="AI Workforce"
        subtitle="Specialized agents with defined purpose, permissions, and approval gates. Every action is audited."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Active agents" value={String(agents.filter((a) => a.status === "Active").length)} sub={`${departments.length} departments`} />
        <Kpi label="Actions (30d)" value={totalActions.toLocaleString("en-ZA")} sub="all recorded in audit log" />
        <Kpi label="Recommendation acceptance" value={fmt.pct(avgAccept)} sub="human accept rate, weighted" tone="positive" />
        <Kpi label="Escalations awaiting you" value="4" sub="approval gates triggered" tone="caution" />
      </div>

      <div className="mt-6 space-y-8">
        {departments.map((dept) => (
          <div key={dept}>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
              {dept}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {agents
                .filter((a) => a.department === dept)
                .map((a) => (
                  <Card key={a.name} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-fg">{a.name}</span>
                          <span className="flex items-center gap-1 text-[11px] text-fg-faint">
                            <span className={`h-1.5 w-1.5 rounded-full ${a.status === "Active" ? "bg-positive" : "bg-fg-faint"}`} />
                            {a.status}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{a.purpose}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-lg font-semibold text-fg">{a.actions30d}</div>
                        <div className="text-[10px] uppercase tracking-wider text-fg-faint">actions · 30d</div>
                      </div>
                    </div>
                    <dl className="mt-4 space-y-1.5 border-t border-edge pt-3 text-xs">
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 text-fg-faint">Inputs</dt>
                        <dd className="text-fg-muted">{a.inputs}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 text-fg-faint">Outputs</dt>
                        <dd className="text-fg-muted">{a.outputs}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 text-fg-faint">Autonomy</dt>
                        <dd className={`font-medium ${autonomyTone[a.autonomy]}`}>{a.autonomy}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 text-fg-faint">Gate</dt>
                        <dd className="text-fg-muted">{a.approvalGate}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 text-fg-faint">Accepted</dt>
                        <dd className="text-fg-muted">{fmt.pct(a.acceptRate)} of recommendations</dd>
                      </div>
                    </dl>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
