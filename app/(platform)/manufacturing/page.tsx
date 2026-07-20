import { projects, workOrders } from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, PageHeader, Progress, Table } from "@/components/ui";

export default function ManufacturingPage() {
  return (
    <>
      <PageHeader
        title="Manufacturing Studio"
        subtitle="Fabrication packages, production tracking, and factory intelligence."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Active work orders" value="3" sub="across 3 factories" />
        <Kpi label="Factory utilisation" value="82%" sub="partner network average" />
        <Kpi label="QA pass rate" value="97.4%" sub="last 90 days" tone="positive" />
        <Kpi label="Material waste" value="3.1%" sub="vs 5.5% industry norm" tone="positive" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Work orders" right={<span className="text-xs text-fg-faint">Linked to project programme dates</span>} />
        <Table headers={["Item", "Project", "Factory", "Quantity", "Due", "Progress", "Status"]}>
          {workOrders.map((w) => (
            <tr key={w.id} className="transition hover:bg-raise">
              <td className="px-5 py-4">
                <div className="font-medium text-fg">{w.item}</div>
                <div className="mt-0.5 text-xs text-fg-faint">{w.id}</div>
              </td>
              <td className="px-5 py-4 text-fg-muted">
                {projects.find((p) => p.id === w.project)?.name}
              </td>
              <td className="px-5 py-4 text-fg-muted">{w.factory}</td>
              <td className="px-5 py-4 text-fg-muted">{w.qty}</td>
              <td className="px-5 py-4 text-fg-muted">{w.due}</td>
              <td className="px-5 py-4">
                <div className="flex w-32 items-center gap-2">
                  <Progress value={w.progress} />
                  <span className="text-xs text-fg-faint">{w.progress}%</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <Badge label={w.status} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
