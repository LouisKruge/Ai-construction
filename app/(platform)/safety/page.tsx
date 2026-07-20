import Link from "next/link";
import { projects, safetyItems } from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";

export default function SafetyPage() {
  return (
    <>
      <PageHeader
        title="Safety Studio"
        subtitle="Incidents, permits, observations, and site safety intelligence."
        actions={
          <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">
            + Log entry
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Lost-time injuries (12m)" value="0" sub="LTIFR 0.00 across portfolio" tone="positive" />
        <Kpi label="Near misses (30d)" value="1" sub="1 open investigation" tone="caution" />
        <Kpi label="Active permits" value="1" sub="hot works — N3 interchange" />
        <Kpi label="Toolbox attendance" value="96%" sub="week 29 · all sites" tone="positive" />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Safety log"
          right={<span className="text-xs text-fg-faint">Camera and drone observations feed this register automatically</span>}
        />
        <Table headers={["Type", "Description", "Project", "Date", "Status"]}>
          {safetyItems.map((s) => (
            <tr key={s.id} className="transition hover:bg-raise">
              <td className="px-5 py-4">
                <span
                  className={`text-sm font-medium ${
                    s.type === "Near miss" || s.type === "First aid" ? "text-critical" : "text-fg"
                  }`}
                >
                  {s.type}
                </span>
                <div className="mt-0.5 text-xs text-fg-faint">{s.id}</div>
              </td>
              <td className="px-5 py-4 text-fg-muted">{s.description}</td>
              <td className="px-5 py-4 text-fg-muted">
                <Link href={`/projects/${s.project}`} className="hover:text-accent">
                  {projects.find((p) => p.id === s.project)?.name}
                </Link>
              </td>
              <td className="px-5 py-4 text-fg-muted">{s.date}</td>
              <td className="px-5 py-4">
                <Badge label={s.status === "Active" ? "In production" : s.status === "Closed" ? "Passed" : "Open"} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
