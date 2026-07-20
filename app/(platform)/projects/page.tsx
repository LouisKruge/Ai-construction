import Link from "next/link";
import { fmt, projects } from "@/lib/data";
import { Badge, Card, PageHeader, Progress, Table } from "@/components/ui";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Every project, from concept to handover, on one model."
        actions={
          <button className="rounded-md bg-signal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-signal-600">
            + New project
          </button>
        }
      />
      <Card>
        <Table
          headers={["Project", "Phase", "Status", "Budget", "Spent", "Progress", "Risk"]}
        >
          {projects.map((p) => (
            <tr key={p.id} className="transition hover:bg-ink-50">
              <td className="px-5 py-4">
                <Link href={`/projects/${p.id}`} className="font-medium text-ink-900 hover:text-signal-600">
                  {p.name}
                </Link>
                <div className="mt-0.5 text-xs text-ink-400">
                  {p.id} · {p.client} · {p.location}
                </div>
              </td>
              <td className="px-5 py-4 text-ink-600">{p.phase}</td>
              <td className="px-5 py-4">
                <Badge label={p.status} />
              </td>
              <td className="px-5 py-4 text-ink-900">{fmt.zar(p.budget)}</td>
              <td className="px-5 py-4 text-ink-600">{fmt.zar(p.spent)}</td>
              <td className="px-5 py-4">
                <div className="flex w-32 items-center gap-2">
                  <Progress
                    value={p.progress}
                    tone={
                      p.plannedProgress - p.progress > 5
                        ? "critical"
                        : p.plannedProgress - p.progress > 2
                          ? "caution"
                          : "neutral"
                    }
                  />
                  <span className="text-xs text-ink-400">{p.progress}%</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <span
                  className={`font-mono text-sm ${
                    p.riskScore >= 60
                      ? "text-critical"
                      : p.riskScore >= 40
                        ? "text-caution"
                        : "text-positive"
                  }`}
                >
                  {p.riskScore}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
