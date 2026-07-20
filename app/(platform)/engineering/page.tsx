import { engReviews, projects } from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";

export default function EngineeringPage() {
  const issues = engReviews.reduce((s, r) => s + r.findings, 0);
  return (
    <>
      <PageHeader
        title="Engineering Studio"
        subtitle="Automated drawing review, compliance checks, and revision control."
        actions={
          <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">
            Upload drawings
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Drawings in review" value="2" sub="across 2 projects" />
        <Kpi label="Open findings" value={String(issues)} tone={issues > 0 ? "caution" : "positive"} sub="from automated review" />
        <Kpi label="Compliance checks" value="128" sub="run this week · SANS / Eurocode" />
        <Kpi label="Avg. review time" value="26 min" sub="vs ~3 days manual" tone="positive" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Review queue" right={<span className="text-xs text-fg-faint">Automated first pass · engineer sign-off required</span>} />
        <Table headers={["Drawing", "Project", "Discipline", "Revision", "Findings", "Status"]}>
          {engReviews.map((r) => (
            <tr key={r.id} className="transition hover:bg-raise">
              <td className="px-5 py-4">
                <div className="font-medium text-fg">{r.drawing}</div>
                <div className="mt-0.5 text-xs text-fg-faint">{r.id} · {r.reviewer}</div>
              </td>
              <td className="px-5 py-4 text-fg-muted">
                {projects.find((p) => p.id === r.project)?.name}
              </td>
              <td className="px-5 py-4 text-fg-muted">{r.discipline}</td>
              <td className="px-5 py-4 text-fg-muted">{r.revision}</td>
              <td className="px-5 py-4">
                <span className={r.findings > 0 ? "font-medium text-critical" : "text-fg-faint"}>
                  {r.findings}
                </span>
              </td>
              <td className="px-5 py-4">
                <Badge label={r.status} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
