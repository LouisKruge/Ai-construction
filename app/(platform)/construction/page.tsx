import { projects, schedule } from "@/lib/data";
import { Card, CardHeader, Kpi, PageHeader, Progress, Table } from "@/components/ui";

export default function ConstructionPage() {
  const critical = schedule.filter((s) => s.critical);
  return (
    <>
      <PageHeader
        title="Construction Studio"
        subtitle="Programmes, critical path, and live site progress."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Critical activities" value={String(critical.length)} sub="zero float" tone="caution" />
        <Kpi label="Schedule variance" value="-4.2 days" sub="portfolio weighted average" tone="caution" />
        <Kpi label="Workforce on site" value="1,384" sub="across 4 active sites" />
        <Kpi label="Safety incidents (30d)" value="0" sub="LTIFR 0.00" tone="positive" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Programme — key activities" right={<span className="text-xs text-fg-faint">Critical path highlighted</span>} />
        <Table headers={["Activity", "Project", "Window", "Float", "Progress"]}>
          {schedule.map((s) => (
            <tr key={s.activity} className="transition hover:bg-raise">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  {s.critical && <span className="h-2 w-2 rounded-full bg-critical" title="Critical path" />}
                  <span className="font-medium text-fg">{s.activity}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-fg-muted">
                {projects.find((p) => p.id === s.project)?.name}
              </td>
              <td className="px-5 py-4 text-fg-muted">
                {s.start} → {s.end}
              </td>
              <td className="px-5 py-4">
                <span className={s.float === 0 ? "font-medium text-critical" : "text-fg-muted"}>
                  {s.float === 0 ? "0 d" : `${s.float} d`}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex w-40 items-center gap-2">
                  <Progress value={s.progress} tone={s.critical && s.progress < 50 ? "caution" : "neutral"} />
                  <span className="text-xs text-fg-faint">{s.progress}%</span>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
