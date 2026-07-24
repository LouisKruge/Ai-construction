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
          <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">
            + New project
          </button>
        }
      />
      <Card>
        <Table
          headers={["Project", "Phase", "Status", "Budget", "Spent", "Progress", "Risk"]}
        >
          {projects.map((p) => (
            <tr key={p.id} className="transition hover:bg-raise">
              <td className="px-5 py-4">
                <Link href={`/projects/${p.id}`} className="font-medium text-fg hover:text-accent">
                  {p.name}
                </Link>
                <div className="mt-0.5 text-xs text-fg-faint">
                  {p.id} · {p.client} · {p.location}
                </div>
              </td>
              <td className="px-5 py-4 text-fg-muted">{p.phase}</td>
              <td className="px-5 py-4">
                <Badge label={p.status} />
              </td>
              <td className="px-5 py-4 text-fg">{fmt.zar(p.budget)}</td>
              <td className="px-5 py-4 text-fg-muted">{fmt.zar(p.spent)}</td>
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
                  <span className="text-xs text-fg-faint">{p.progress}%</span>
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
