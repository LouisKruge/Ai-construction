import { clients, fmt } from "@/lib/data";
import { Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";

export default function ClientsPage() {
  const pending = clients.reduce((s, c) => s + c.pendingApprovals, 0);
  return (
    <>
      <PageHeader
        title="Client Success"
        subtitle="Every client, their portal activity, reports, and approvals."
        actions={
          <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">
            Generate progress reports
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Active clients" value={String(clients.length)} sub={fmt.zar(clients.reduce((s, c) => s + c.contracted, 0)) + " contracted"} />
        <Kpi label="Avg. satisfaction" value={(clients.reduce((s, c) => s + c.satisfaction, 0) / clients.length).toFixed(1) + " / 5"} sub="quarterly survey" />
        <Kpi label="Pending approvals" value={String(pending)} sub="waiting on clients in portal" tone={pending > 0 ? "caution" : "positive"} />
        <Kpi label="Reports sent (30d)" value="12" sub="auto-generated · 92% opened" tone="positive" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Clients" right={<span className="text-xs text-fg-faint">Weekly reports assemble automatically from live project data</span>} />
        <Table headers={["Client", "Contact", "Contracted", "Satisfaction", "Last report", "Approvals pending"]}>
          {clients.map((c) => (
            <tr key={c.name} className="transition hover:bg-raise">
              <td className="px-5 py-4 font-medium text-fg">{c.name}</td>
              <td className="px-5 py-4 text-fg-muted">{c.contact}</td>
              <td className="px-5 py-4 text-fg">{fmt.zar(c.contracted)}</td>
              <td className="px-5 py-4">
                <span
                  className={`font-medium ${
                    c.satisfaction >= 4.3 ? "text-positive" : c.satisfaction >= 3.7 ? "text-caution" : "text-critical"
                  }`}
                >
                  {c.satisfaction.toFixed(1)}
                </span>
              </td>
              <td className="px-5 py-4 text-fg-muted">{c.lastReport}</td>
              <td className="px-5 py-4">
                <span className={c.pendingApprovals > 0 ? "font-medium text-caution" : "text-fg-faint"}>
                  {c.pendingApprovals}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
