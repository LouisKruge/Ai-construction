import Link from "next/link";
import { defects, inspections, projects } from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";

export default function QualityPage() {
  const open = defects.filter((d) => d.status !== "Closed");
  const critical = open.filter((d) => d.severity === "Critical");
  return (
    <>
      <PageHeader
        title="Quality Studio"
        subtitle="Defects, inspections, snagging, and compliance certificates."
        actions={
          <button className="rounded-md bg-signal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-signal-600">
            + Raise defect
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Open defects" value={String(open.length)} sub={`${critical.length} critical`} tone={critical.length > 0 ? "critical" : "caution"} />
        <Kpi label="Avg. time to close" value="5.2 days" sub="last 90 days" />
        <Kpi label="Inspection pass rate" value="88%" sub="last 30 days" tone="caution" />
        <Kpi label="Rework cost (YTD)" value="R9.4m" sub="2.3% of production — vs 5% industry" tone="positive" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Defect register" right={<span className="text-xs text-ink-400">Auto-raised from failed inspections and site capture</span>} />
        <Table headers={["Defect", "Project", "Location · Trade", "Severity", "Due", "Status"]}>
          {defects.map((d) => (
            <tr key={d.id} className="transition hover:bg-ink-50">
              <td className="px-5 py-4">
                <div className="font-medium text-ink-900">{d.description}</div>
                <div className="mt-0.5 text-xs text-ink-400">{d.id}</div>
              </td>
              <td className="px-5 py-4 text-ink-600">
                <Link href={`/projects/${d.project}`} className="hover:text-signal-600">
                  {projects.find((p) => p.id === d.project)?.name}
                </Link>
              </td>
              <td className="px-5 py-4 text-ink-600">{d.location} · {d.trade}</td>
              <td className="px-5 py-4">
                <span
                  className={`text-sm font-medium ${
                    d.severity === "Critical" ? "text-critical" : d.severity === "Major" ? "text-caution" : "text-ink-400"
                  }`}
                >
                  {d.severity}
                </span>
              </td>
              <td className="px-5 py-4 text-ink-600">{d.due}</td>
              <td className="px-5 py-4">
                <Badge
                  label={
                    d.status === "Closed"
                      ? "Passed"
                      : d.status === "Ready for reinspection"
                        ? "In review"
                        : d.status === "In progress"
                          ? "In production"
                          : "Open"
                  }
                />
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Inspections" />
        <Table headers={["Inspection", "Project", "Date", "Inspector", "Result"]}>
          {inspections.map((i) => (
            <tr key={i.id} className="transition hover:bg-ink-50">
              <td className="px-5 py-4">
                <div className="font-medium text-ink-900">{i.type}</div>
                <div className="mt-0.5 text-xs text-ink-400">{i.id} · {i.notes}</div>
              </td>
              <td className="px-5 py-4 text-ink-600">
                <Link href={`/projects/${i.project}`} className="hover:text-signal-600">
                  {projects.find((p) => p.id === i.project)?.name}
                </Link>
              </td>
              <td className="px-5 py-4 text-ink-600">{i.date}</td>
              <td className="px-5 py-4 text-ink-600">{i.inspector}</td>
              <td className="px-5 py-4">
                <Badge label={i.result === "Failed" ? "Issues found" : i.result === "Scheduled" ? "Queued" : "Passed"} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
