import Link from "next/link";
import { documents, projects, rfis, variations, fmt } from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";

export default function DocumentsPage() {
  const overdueRfis = rfis.filter((r) => r.status === "Overdue").length;
  return (
    <>
      <PageHeader
        title="Documents"
        subtitle="Contracts, drawings, reports, RFIs, and variations — indexed and searchable by every agent."
        actions={
          <button className="rounded-md bg-signal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-signal-600">
            Upload
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Documents indexed" value="4,218" sub="98.7% of repository" />
        <Kpi label="Processing queue" value="2" sub="1 large survey file" />
        <Kpi label="Open RFIs" value={String(rfis.filter((r) => r.status !== "Answered").length)} sub={`${overdueRfis} overdue`} tone={overdueRfis > 0 ? "critical" : "positive"} />
        <Kpi label="Median RFI response" value="2.1 days" sub="vs 7.4 industry" tone="positive" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent documents" />
        <Table headers={["Document", "Project", "Type", "Version", "Size", "AI index"]}>
          {documents.map((d) => (
            <tr key={d.id} className="transition hover:bg-ink-50">
              <td className="px-5 py-4">
                <div className="font-medium text-ink-900">{d.name}</div>
                <div className="mt-0.5 text-xs text-ink-400">{d.id} · uploaded {d.uploaded}</div>
              </td>
              <td className="px-5 py-4 text-ink-600">
                <Link href={`/projects/${d.project}`} className="hover:text-signal-600">
                  {projects.find((p) => p.id === d.project)?.name}
                </Link>
              </td>
              <td className="px-5 py-4 text-ink-600">{d.type}</td>
              <td className="px-5 py-4 text-ink-600">{d.version}</td>
              <td className="px-5 py-4 text-ink-600">{d.size}</td>
              <td className="px-5 py-4">
                <Badge label={d.indexed === "Indexed" ? "Passed" : d.indexed === "Processing" ? "In review" : "Queued"} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="RFIs" right={<span className="text-xs text-ink-400">Ball-in-court tracking</span>} />
          <div className="divide-y divide-ink-100">
            {rfis.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-ink-900">{r.subject}</div>
                  <div className="mt-0.5 text-xs text-ink-400">
                    {r.id} · {projects.find((p) => p.id === r.project)?.name} · with {r.ballInCourt} · due {r.due}
                  </div>
                </div>
                <Badge label={r.status === "Answered" ? "Passed" : r.status === "Overdue" ? "Delayed" : "Open"} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="self-start">
          <CardHeader title="Variation orders" />
          <div className="divide-y divide-ink-100">
            {variations.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-ink-900">{v.description}</div>
                  <div className="mt-0.5 text-xs text-ink-400">
                    {v.id} · {projects.find((p) => p.id === v.project)?.name} · {fmt.zar(v.value)}
                  </div>
                </div>
                <Badge label={v.status === "Approved" ? "Awarded" : v.status === "Submitted" ? "Evaluating" : v.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
