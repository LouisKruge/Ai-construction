import Link from "next/link";
import { notFound } from "next/navigation";
import { departments, deptAgents, type Autonomy } from "@/lib/workforce";
import { Card, CardHeader, Kpi } from "@/components/ui";

export function generateStaticParams() {
  return departments.map((d) => ({ dept: d.slug }));
}

const autonomyTone: Record<Autonomy, string> = {
  "Autonomous within limits": "text-positive",
  "Requires approval": "text-caution",
  "Recommends only": "text-info",
};

const autonomyShort: Record<Autonomy, string> = {
  "Autonomous within limits": "Autonomous",
  "Requires approval": "Approval",
  "Recommends only": "Advisory",
};

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ dept: string }>;
}) {
  const { dept } = await params;
  const d = departments.find((x) => x.slug === dept);
  if (!d) notFound();

  const roster = deptAgents.filter((a) => a.dept === d.name);
  const chief = roster.find((a) => a.tier === "chief");
  const specialists = roster.filter((a) => a.tier === "specialist");

  const autonomyCount = (a: Autonomy) => specialists.filter((s) => s.autonomy === a).length;

  return (
    <>
      <div className="mb-6">
        <Link href="/agents" className="text-xs font-medium text-accent hover:underline">
          ← AI Workforce
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">{d.name} Department</h1>
        <p className="mt-1 text-sm text-fg-faint">{d.summary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Agents" value={String(roster.length)} sub="1 chief + specialists" />
        <Kpi label="Actions (30d)" value={d.actions30d.toLocaleString("en-ZA")} sub="recorded in audit log" />
        <Kpi label="Autonomous" value={String(autonomyCount("Autonomous within limits"))} sub="within defined limits" tone="positive" />
        <Kpi label="Escalations" value={String(d.escalations)} sub="awaiting human approval" tone="caution" />
      </div>

      {/* Chief deep-dive */}
      {chief && (
        <Card className="mt-6">
          <CardHeader title={chief.name} right={<span className="text-xs text-fg-faint">Department coordinator</span>} />
          <div className="grid gap-6 px-5 py-5 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-fg-faint">Mission</div>
              <p className="mt-1 text-sm text-fg-muted">{chief.mission}</p>
              <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-fg-faint">
                Continuously asks
              </div>
              <p className="mt-1 text-sm italic text-fg-muted">“{d.cadence}”</p>
              <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-fg-faint">
                Approval gate
              </div>
              <p className="mt-1 text-sm text-fg-muted">{chief.gate}</p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-fg-faint">Monitors continuously</div>
              <ul className="mt-1.5 space-y-1 text-sm text-fg-muted">
                {d.monitors.map((m) => (
                  <li key={m} className="flex gap-2">
                    <span className="text-accent">—</span> {m}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-fg-faint">
                Collaborates with
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {d.collaborates.map((c) => (
                  <span key={c} className="rounded-full border border-edge bg-raise/60 px-2.5 py-0.5 text-xs text-fg-muted">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Specialist roster */}
      <Card className="mt-6">
        <CardHeader
          title="Specialist agents"
          right={<span className="text-xs text-fg-faint">Autonomy: green autonomous · amber approval · blue advisory</span>}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge text-left text-[11px] uppercase tracking-widest text-fg-faint">
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Mission</th>
                <th className="px-5 py-3 font-medium">Autonomy</th>
                <th className="px-5 py-3 font-medium">Approval gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {specialists.map((a) => (
                <tr key={a.name} className="transition hover:bg-raise">
                  <td className="px-5 py-3.5 font-medium text-fg">{a.name}</td>
                  <td className="max-w-md px-5 py-3.5 text-fg-muted">{a.mission}</td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <span className={`flex items-center gap-1.5 font-medium ${autonomyTone[a.autonomy]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {autonomyShort[a.autonomy]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-fg-muted">{a.gate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
