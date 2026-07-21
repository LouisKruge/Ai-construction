import { engReviews, projects } from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";
import StructuralCalculator from "@/components/StructuralCalculator";
import StudioHero from "@/components/StudioHero";

export default function EngineeringPage() {
  const issues = engReviews.reduce((s, r) => s + r.findings, 0);
  return (
    <>
      <StudioHero
        title="Engineering Studio"
        subtitle="A digital engineering workstation — live limit-state design, automated drawing review, code compliance, and revision control."
        motif="engineering"
        status="Live · SANS / Eurocode"
        kpis={[
          { label: "Drawings in review", value: "2" },
          { label: "Open findings", value: String(issues), tone: issues > 0 ? "caution" : "positive" },
          { label: "Compliance checks", value: "128" },
          { label: "Avg. review", value: "26 min", tone: "positive" },
        ]}
        actions={
          <button className="rounded-md bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/25 transition hover:brightness-110">
            Upload drawings
          </button>
        }
      />

      <div>
        <StructuralCalculator />
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
